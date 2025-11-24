import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// No inicializar Stripe aquí, hacerlo después de validar las variables
let stripe: Stripe | null = null;

function getStripeClient(): Stripe {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover',
    });
  }
  return stripe;
}

export async function POST(request: Request) {
  try {
    // Validar que Stripe esté configurado
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not configured');
      return NextResponse.json(
        { error: 'Stripe no está configurado correctamente. Verifica que STRIPE_SECRET_KEY esté configurada en Vercel.' },
        { status: 500 }
      );
    }

    if (!process.env.NEXT_PUBLIC_URL) {
      console.error('NEXT_PUBLIC_URL is not configured');
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_URL no está configurado' },
        { status: 500 }
      );
    }

    const { userId, email } = await request.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'userId y email son requeridos' },
        { status: 400 }
      );
    }

    console.log('Creating Stripe checkout session', {
      userId,
      email,
      success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/dashboard`,
    });

    const stripeClient = getStripeClient();
    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'QuickFeedback PRO',
              description: 'Elimina el branding y obtén funciones premium',
            },
            unit_amount: 900, // €9.00 en centavos
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/dashboard`,
      customer_email: email,
      metadata: {
        userId,
      },
    });

    console.log('Stripe session created:', {
      sessionId: session.id,
      url: session.url,
      hasUrl: !!session.url,
    });

    if (!session.url) {
      console.error('Stripe session created but no URL returned');
      return NextResponse.json(
        { error: 'No se pudo generar la URL de pago. Por favor intenta de nuevo.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error: any) {
    console.error('Stripe error:', error);
    console.error('Error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode,
      raw: error.raw,
    });
    
    // Mensaje de error más descriptivo
    let errorMessage = 'Error al procesar el pago';
    if (error.type === 'StripeAuthenticationError') {
      errorMessage = 'Error de autenticación con Stripe. Verifica que STRIPE_SECRET_KEY esté configurada correctamente.';
    } else if (error.type === 'StripeAPIError') {
      errorMessage = `Error de la API de Stripe: ${error.message}`;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}