'use client';

import { useState, useEffect } from 'react';

interface Feedback {
  id: string;
  name: string;
  email: string;
  message: string;
  site_url: string | null;
  created_at: string;
}

interface User {
  id: string;
  email: string;
  plan: 'free' | 'pro';
  created_at: string;
}

export default function DashboardPage() {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [emailInput, setEmailInput] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const embedCode = '<script src="http://localhost:3000/widget.js"></script>';

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/feedback');
      if (!response.ok) {
        throw new Error('Failed to fetch feedback');
      }
      const data = await response.json();
      setFeedback(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      setUserLoading(true);
      const savedEmail = localStorage.getItem('userEmail');
      
      if (!savedEmail) {
        setUserLoading(false);
        setShowEmailInput(true);
        return;
      }

      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: savedEmail }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
        }
      }
    } catch (err) {
      console.error('Error checking user:', err);
    } finally {
      setUserLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailInput.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem('userEmail', data.user.email);
          setShowEmailInput(false);
          setEmailInput('');
        }
      }
    } catch (err) {
      console.error('Error creating user:', err);
    }
  };

  const handleUpgrade = () => {
    const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK || '';
    if (paymentLink) {
      window.open(paymentLink, '_blank');
    } else {
      alert('Payment link not configured. Please set NEXT_PUBLIC_STRIPE_PAYMENT_LINK in your environment variables.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feedback?')) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await fetch(`/api/feedback/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete feedback');
      }

      // Remove from local state
      setFeedback(feedback.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete feedback');
    } finally {
      setDeletingId(null);
    }
  };

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-10 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Feedback Dashboard</h1>
        <div className="flex items-center gap-4">
          {userLoading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : user ? (
            <>
              <div className="text-sm">
                <span className="text-gray-600">Plan: </span>
                <span className={`font-semibold ${user.plan === 'pro' ? 'text-purple-600' : 'text-gray-800'}`}>
                  {user.plan === 'pro' ? 'Pro' : 'Free'}
                </span>
              </div>
              {user.plan === 'free' && (
                <button
                  onClick={handleUpgrade}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm font-semibold"
                >
                  Upgrade to Pro - €9/month
                </button>
              )}
            </>
          ) : (
            showEmailInput && (
              <form onSubmit={handleEmailSubmit} className="flex items-center gap-2">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your email"
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-semibold"
                >
                  Sign In
                </button>
              </form>
            )
          )}
        </div>
      </div>

      {/* Upgrade to Pro Section */}
      {user && user.plan === 'free' && (
        <div className="bg-blue-500 rounded-lg p-6 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Current Plan: Free</h2>
          <p className="mb-4 text-blue-50">Remove "Powered by QuickFeedback" branding</p>
          <a
            href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK || '#'}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="bg-white text-blue-600 px-8 py-3 rounded-md font-bold text-lg hover:bg-blue-50 transition-colors">
              Upgrade to Pro - €9/month
            </button>
          </a>
        </div>
      )}

      {/* Embed Code Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Embed Code</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-4 font-mono text-sm text-gray-700 break-all">
          {embedCode}
        </div>
        <button
          onClick={copyEmbedCode}
          className={`px-5 py-2 rounded-md text-sm font-semibold text-white transition-colors ${
            copied
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {copied ? 'Copied!' : 'Copy Embed Code'}
        </button>
      </div>

      {/* Feedback Table Section */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Feedback</h2>
        </div>

        {loading && (
          <div className="p-8 text-center text-gray-500">Loading feedback...</div>
        )}

        {error && (
          <div className="p-4 mx-6 mt-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
            <button
              onClick={fetchFeedback}
              className="ml-4 text-red-600 underline hover:text-red-800"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && feedback.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No feedback yet. Feedback will appear here once submitted.
          </div>
        )}

        {!loading && !error && feedback.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {feedback.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-md">
                      <div className="truncate" title={item.message}>
                        {item.message}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        {deletingId === item.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

