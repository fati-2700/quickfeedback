'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isProUser, setIsProUser] = useState(false);
  const [loadingUpgrade, setLoadingUpgrade] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setUser(user);
    
    // Verificar si es usuario PRO
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', user.id)
      .single();
    
    setIsProUser(profile?.subscription_status === 'pro');
    
    // Cargar feedback
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

  async function handleUpgrade() {
    setLoadingUpgrade(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
        }),
      });

      const { sessionId, url } = await response.json();
      
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar el pago. Por favor intenta de nuevo.');
    } finally {
      setLoadingUpgrade(false);
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleCopy = () => {
    const embedCode = `<script src="https://quickfeedback.co/widget.js" data-project-id="${user?.id || ''}"></script>`;
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase
      .from('feedback')
      .delete()
      .eq('id', id);
    
    if (!error) {
      setFeedbackList(feedbackList.filter(f => f.id !== id));
    }
    setDeletingId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="text-purple-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✨</span>
              <span className="text-xl font-bold text-gray-900">QuickFeedback</span>
            </div>
            
            <div className="flex items-center gap-4">
              {!isProUser && (
                <button
                  onClick={handleUpgrade}
                  disabled={loadingUpgrade}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                >
                  💳 {loadingUpgrade ? 'Procesando...' : 'Upgrade a PRO (€9/mes)'}
                </button>
              )}
              
              {isProUser && (
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-medium">
                  ⭐ Usuario PRO
                </span>
              )}
              
              <span className="text-gray-600">{user?.email}</span>
              <button
                onClick={handleSignOut}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Salir →
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tu código de integración</h2>
          <p className="text-gray-600 mb-4">Copia y pega este código en tu sitio web donde quieras que aparezca el widget:</p>
          
          <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm relative">
            <code className="text-purple-600">
              {`<script src="https://quickfeedback.co/widget.js" data-project-id="${user?.id || ''}"></script>`}
            </code>
            <button
              onClick={handleCopy}
              className="absolute right-4 top-4 px-3 py-1 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-sm"
            >
              {copied ? '✓ Copiado' : '📋 Copiar'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Feedback recibido</h2>
            <span className="text-sm text-gray-500">{feedbackList.length} respuestas</span>
          </div>

          {feedbackList.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No hay feedback todavía. ¡Instala el widget en tu sitio para empezar a recibir opiniones!
            </p>
          ) : (
            <div className="space-y-4">
              {feedbackList.map((feedback) => (
                <div key={feedback.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{feedback.name || 'Anónimo'}</h3>
                      <p className="text-sm text-gray-500">{feedback.email || 'Sin email'}</p>
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
                        disabled={deletingId === feedback.id}
                        className="text-red-500 hover:text-red-700 transition-colors text-sm"
                      >
                        {deletingId === feedback.id ? 'Eliminando...' : '🗑️'}
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700">{feedback.message}</p>
                  <p className="text-xs text-gray-400 mt-3">
                    {new Date(feedback.created_at).toLocaleString('es-ES')}
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



