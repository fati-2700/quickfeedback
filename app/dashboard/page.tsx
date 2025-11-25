'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// Dashboard component for managing feedback

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isProUser, setIsProUser] = useState(false);
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [loadingUpgrade, setLoadingUpgrade] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const router = useRouter();
  const lifetimeOfferLink =
    process.env.NEXT_PUBLIC_STRIPE_LIFETIME_LINK ||
    process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ||
    '';
  const promoCodeName = process.env.NEXT_PUBLIC_LAUNCH_COUPON_CODE || 'LAUNCH50';

  useEffect(() => {
    checkUser();
    
    // Check if we returned from a successful payment
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      setShowSuccessMessage(true);
      // Reload user state after successful payment
      setTimeout(() => {
        checkUser();
        // Clean URL
        window.history.replaceState({}, '', '/dashboard');
        // Hide message after 5 seconds
        setTimeout(() => setShowSuccessMessage(false), 5000);
      }, 2000);
    }
  }, []);

  // Clear deletingId if it gets stuck (safety timeout)
  useEffect(() => {
    if (deletingId) {
      const timeout = setTimeout(() => {
        console.warn('DeletingId stuck, resetting...', deletingId);
        setDeletingId(null);
      }, 5000); // 5 seconds maximum

      return () => clearTimeout(timeout);
    }
  }, [deletingId]);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth');
      return;
    }
    setUser(user);
    
    // Check if user is PRO - search in users table
    const { data: userData } = await supabase
      .from('users')
      .select('plan')
      .eq('id', user.id)
      .single();
    
    const planValue = typeof userData?.plan === 'string' ? userData?.plan : 'free';
    setUserPlan(planValue);
    setIsProUser(planValue === 'pro' || planValue === 'lifetime');
    
    // Load feedback
    const { data: feedback } = await supabase
      .from('feedback')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (feedback) {
      setFeedbackList(feedback);
    }
    setLoading(false);
  }

  async function handleUpgrade(planType: 'pro-monthly' | 'lifetime' = 'pro-monthly') {
    console.log('handleUpgrade called', { user: user?.id, email: user?.email });
    
    if (!user || !user.email) {
      console.error('User or email missing', { user, hasEmail: !!user?.email });
      alert('Error: Could not get user information. Please reload the page and try again.');
      return;
    }

    if (!user.id) {
      console.error('User ID missing', { user });
      alert('Error: Could not get user ID. Please reload the page and try again.');
      return;
    }

    setLoadingUpgrade(true);
    try {
      console.log('Sending request to /api/create-checkout-session', {
        userId: user.id,
        email: user.email
      });

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          planType,
          couponCode:
            planType === 'pro-monthly' && promoCode.trim()
              ? promoCode.trim()
              : undefined,
        }),
      });

      console.log('Response status:', response.status, response.statusText);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('Response text (raw):', responseText);
      console.log('Response text length:', responseText.length);
      console.log('Response status:', response.status);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed data:', data);
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        console.error('Raw response:', responseText);
        throw new Error(`Server error: ${responseText.substring(0, 200)}`);
      }

      // Si la respuesta no es OK, lanzar error inmediatamente
      if (!response.ok) {
        const errorMsg = data?.error || data?.message || data?.details || `Error ${response.status}: ${response.statusText}`;
        console.error('Server error response:', {
          status: response.status,
          statusText: response.statusText,
          data: data,
          errorMsg: errorMsg
        });
        
        // Show a more descriptive message
        let userFriendlyMessage = errorMsg;
        if (response.status === 500) {
          if (errorMsg.includes('Stripe is not configured')) {
            userFriendlyMessage = 'Error: Stripe is not configured. Please contact the administrator.';
          } else if (errorMsg.includes('NEXT_PUBLIC_URL')) {
            userFriendlyMessage = 'Error: Incomplete server configuration. Please contact the administrator.';
          } else {
            userFriendlyMessage = `Server error: ${errorMsg}`;
          }
        }
        
        throw new Error(userFriendlyMessage);
      }
      
      // Check if there's an error in the data
      if (data.error) {
        console.error('Error in response data:', data.error);
        throw new Error(data.error);
      }
      
      if (data.url) {
        console.log('Redirecting to Stripe:', data.url);
        // Asegurarse de que el redirect funcione
        setTimeout(() => {
          window.location.href = data.url;
        }, 100);
      } else {
        console.error('No URL in response:', data);
        throw new Error('Stripe payment URL not received. Response: ' + JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error processing payment';
      console.error('Complete error:', {
        message: errorMessage,
        error: error,
        stack: error instanceof Error ? error.stack : undefined
      });
      alert(`Error: ${errorMessage}\n\nPlease check the browser console (F12) for more details.`);
    } finally {
      // Asegurarse de que siempre se resetee el estado de loading
      setLoadingUpgrade(false);
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleCopy = () => {
    const embedCode = `<script src="https://quickfeedback.co/widget.js" data-project-id="${user?.id || ''}"${isProUser ? ' data-pro="true"' : ''}></script>`;
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feedback?')) {
      return;
    }

    const feedbackId = String(id); // Asegurar que sea string
    console.log('Deleting feedback with id:', feedbackId);
    
    setDeletingId(feedbackId);
    
    try {
      const { error } = await supabase
        .from('feedback')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting feedback:', error);
        alert('Error deleting feedback. Please try again.');
        setDeletingId(null); // Reset immediately on error
        return;
      }
      
      // Update list locally
      setFeedbackList(prevList => prevList.filter(f => String(f.id) !== feedbackId));
    } catch (error) {
      console.error('Error deleting feedback:', error);
      alert('Error deleting feedback. Please try again.');
    } finally {
      // Always reset state after a short delay
      setTimeout(() => {
        setDeletingId(null);
      }, 300);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="text-purple-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      {showSuccessMessage && (
        <div className="bg-green-500 text-white px-4 py-3 text-center">
          <p className="font-semibold">Payment successful! Your account has been upgraded to PRO. 🎉</p>
        </div>
      )}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✨</span>
              <span className="text-xl font-bold text-gray-900">QuickFeedback</span>
            </div>
            
            <div className="flex items-center gap-4">
              {isProUser && (
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-medium">
                  ⭐ {userPlan === 'lifetime' ? 'Lifetime' : 'PRO'} User
                </span>
              )}
              
              <span className="text-gray-600">{user?.email}</span>
              <button
                onClick={handleSignOut}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign Out →
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isProUser && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Upgrade Your Plan</h2>
            <p className="text-gray-600">
              Unlock unlimited feedback, remove branding, and access premium features for only $10/month.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto]">
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">
                  Promo Code
                </label>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder={`Enter promo code (${promoCodeName})`}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-600 transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use code {promoCodeName} to get 50% off your first month.
                </p>
              </div>
              <button
                onClick={() => handleUpgrade('pro-monthly')}
                disabled={loadingUpgrade}
                className="h-fit px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loadingUpgrade ? 'Processing...' : 'Upgrade to PRO ($10/month)'}
              </button>
            </div>

            {lifetimeOfferLink && (
              <div className="mt-8 p-4 border border-purple-200 rounded-xl bg-purple-50">
                <h3 className="text-lg font-semibold text-purple-900 mb-1">Secret Launch Offer</h3>
                <p className="text-sm text-purple-800 mb-3">
                  Get lifetime access to QuickFeedback for a one-time payment of $49.
                </p>
                <a
                  href={lifetimeOfferLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-5 py-2 bg-white text-purple-700 border border-purple-300 rounded-lg font-semibold hover:bg-purple-100 transition-colors"
                >
                  🔒 Claim Lifetime Deal ($49)
                </a>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Integration Code</h2>
          <p className="text-gray-600 mb-4">Copy and paste this code into your website where you want the widget to appear:</p>
          
          <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm relative">
            <code className="text-purple-600">
              {`<script src="https://quickfeedback.co/widget.js" data-project-id="${user?.id || ''}"${isProUser ? ' data-pro="true"' : ''}></script>`}
            </code>
            <button
              onClick={handleCopy}
              className="absolute right-4 top-4 px-3 py-1 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-sm"
            >
              {copied ? '✓ Copied' : '📋 Copy'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Received Feedback</h2>
            <span className="text-sm text-gray-500">{feedbackList.length} {feedbackList.length === 1 ? 'response' : 'responses'}</span>
          </div>

          {feedbackList.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No feedback yet. Install the widget on your site to start receiving feedback!
            </p>
          ) : (
            <div className="space-y-4">
              {feedbackList.map((feedback) => (
                <div key={feedback.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{feedback.name || 'Anonymous'}</h3>
                      <p className="text-sm text-gray-500">{feedback.email || 'No email'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-xl ${i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                            ★
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => handleDelete(feedback.id)}
                        disabled={deletingId === String(feedback.id)}
                        className="text-red-500 hover:text-red-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingId === String(feedback.id) ? 'Deleting...' : '🗑️'}
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700">{feedback.message}</p>
                  <p className="text-xs text-gray-400 mt-3">
                    {new Date(feedback.created_at).toLocaleString('en-US')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}



