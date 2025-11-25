import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Don't initialize Stripe here, do it after validating variables
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
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not configured');
      return NextResponse.json(
        { error: 'Stripe is not configured correctly. Please verify that STRIPE_SECRET_KEY is set in Vercel.' },
        { status: 500 }
      );
    }

    if (!process.env.NEXT_PUBLIC_URL) {
      console.error('NEXT_PUBLIC_URL is not configured');
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_URL is not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      userId,
      email,
      planType = 'pro-monthly',
      couponCode,
    }: {
      userId: string;
      email: string;
      planType?: 'pro-monthly' | 'lifetime';
      couponCode?: string;
    } = body;

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'userId and email are required' },
        { status: 400 }
      );
    }

    const normalizedPlan = planType === 'lifetime' ? 'lifetime' : 'pro-monthly';
    const successUrl = `${process.env.NEXT_PUBLIC_URL}/dashboard?success=true`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_URL}/dashboard`;
    const metadata: Record<string, string> = {
      userId,
      planType: normalizedPlan,
    };

    const stripeClient = getStripeClient();
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      customer_email: email,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    };

    if (normalizedPlan === 'lifetime') {
      sessionParams.mode = 'payment';
      sessionParams.line_items = [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'QuickFeedback Lifetime Deal',
              description: 'One-time payment for lifetime access',
            },
            unit_amount: 4900,
          },
          quantity: 1,
        },
      ];
    } else {
      sessionParams.mode = 'subscription';
      sessionParams.line_items = [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'QuickFeedback PRO',
              description: 'Monthly subscription with premium features',
            },
            unit_amount: 1000,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ];

      const launchCouponCode =
        (process.env.NEXT_PUBLIC_LAUNCH_COUPON_CODE || 'LAUNCH50').toUpperCase();
      const launchCouponId = process.env.STRIPE_LAUNCH_COUPON_ID;
      if (
        couponCode &&
        launchCouponId &&
        couponCode.trim().toUpperCase() === launchCouponCode
      ) {
        sessionParams.discounts = [{ coupon: launchCouponId }];
        metadata.couponCode = couponCode.trim();
      }
    }

    const session = await stripeClient.checkout.sessions.create(sessionParams);

    console.log('Stripe session created:', {
      sessionId: session.id,
      url: session.url,
      hasUrl: !!session.url,
    });

    if (!session.url) {
      console.error('Stripe session created but no URL returned');
      return NextResponse.json(
        { error: 'Could not generate the payment URL. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
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

    let errorMessage = 'Error processing payment';
    if (error.type === 'StripeAuthenticationError') {
      errorMessage =
        'Stripe authentication error. Please verify that STRIPE_SECRET_KEY is configured correctly.';
    } else if (error.type === 'StripeAPIError') {
      errorMessage = `Stripe API error: ${error.message}`;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}