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
  const [loadingUpgrade, setLoadingUpgrade] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkUser();
    
    // Verificar si volvimos de un pago exitoso
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      setShowSuccessMessage(true);
      // Recargar el estado del usuario después de un pago exitoso
      setTimeout(() => {
        checkUser();
        // Limpiar la URL
        window.history.replaceState({}, '', '/dashboard');
        // Ocultar mensaje después de 5 segundos
        setTimeout(() => setShowSuccessMessage(false), 5000);
      }, 2000);
    }
  }, []);

  // Limpiar deletingId si se queda atascado (timeout de seguridad)
  useEffect(() => {
    if (deletingId) {
      const timeout = setTimeout(() => {
        console.warn('DeletingId stuck, resetting...');
        setDeletingId(null);
      }, 10000); // 10 segundos máximo

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
    
    // Verificar si es usuario PRO - buscar en tabla users
    const { data: userData } = await supabase
      .from('users')
      .select('plan')
      .eq('id', user.id)
      .single();
    
    setIsProUser(userData?.plan === 'pro');
    
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
    console.log('handleUpgrade called', { user: user?.id, email: user?.email });
    
    if (!user || !user.email) {
      console.error('User or email missing', { user, hasEmail: !!user?.email });
      alert('Error: No se pudo obtener la información del usuario. Por favor, recarga la página e intenta de nuevo.');
      return;
    }

    if (!user.id) {
      console.error('User ID missing', { user });
      alert('Error: No se pudo obtener el ID del usuario. Por favor, recarga la página e intenta de nuevo.');
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
        throw new Error(`Error del servidor: ${responseText.substring(0, 200)}`);
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
        
        // Mostrar un mensaje más descriptivo
        let userFriendlyMessage = errorMsg;
        if (response.status === 500) {
          if (errorMsg.includes('Stripe no está configurado')) {
            userFriendlyMessage = 'Error: Stripe no está configurado. Por favor contacta al administrador.';
          } else if (errorMsg.includes('NEXT_PUBLIC_URL')) {
            userFriendlyMessage = 'Error: Configuración del servidor incompleta. Por favor contacta al administrador.';
          } else {
            userFriendlyMessage = `Error del servidor: ${errorMsg}`;
          }
        }
        
        throw new Error(userFriendlyMessage);
      }
      
      // Verificar si hay error en los datos
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
        throw new Error('No se recibió la URL de pago de Stripe. Respuesta: ' + JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al procesar el pago';
      console.error('Error completo:', {
        message: errorMessage,
        error: error,
        stack: error instanceof Error ? error.stack : undefined
      });
      alert(`Error: ${errorMessage}\n\nPor favor, verifica la consola del navegador (F12) para más detalles.`);
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
    const embedCode = `<script src="https://quickfeedback.co/widget.js" data-project-id="${user?.id || ''}"></script>`;
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este feedback?')) {
      return;
    }

    console.log('Deleting feedback with id:', id);
    console.log('Current deletingId:', deletingId);
    
    setDeletingId(id);
    
    try {
      console.log('Calling Supabase delete for id:', id);
      const { error, data } = await supabase
        .from('feedback')
        .delete()
        .eq('id', id)
        .select();
      
      console.log('Delete response:', { error, data });
      
      if (error) {
        console.error('Error deleting feedback:', error);
        alert('Error al eliminar el feedback. Por favor intenta de nuevo.');
      } else {
        console.log('Feedback deleted successfully, updating list');
        // Actualizar la lista localmente
        setFeedbackList(prevList => prevList.filter(f => f.id !== id));
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
      alert('Error al eliminar el feedback. Por favor intenta de nuevo.');
    } finally {
      // Siempre resetear el estado, incluso si hay error
      console.log('Resetting deletingId to null');
      setDeletingId(null);
      // Forzar un re-render después de un pequeño delay para asegurar que el estado se actualice
      setTimeout(() => {
        setDeletingId(null);
      }, 100);
    }
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
      {showSuccessMessage && (
        <div className="bg-green-500 text-white px-4 py-3 text-center">
          <p className="font-semibold">¡Pago exitoso! Tu cuenta ha sido actualizada a PRO. 🎉</p>
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
                        disabled={deletingId === feedback.id || deletingId === String(feedback.id)}
                        className="text-red-500 hover:text-red-700 transition-colors text-sm disabled:opacity-50"
                      >
                        {(deletingId === feedback.id || deletingId === String(feedback.id)) ? 'Eliminando...' : '🗑️'}
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



