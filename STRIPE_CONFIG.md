# Stripe Configuration Guide

## Payment Links

### Monthly PRO Plan ($10/month)
- **Stripe Payment Link**: `https://buy.stripe.com/5kQ7sNcan0V22aRaQs6EU00`
- **Environment Variable**: `NEXT_PUBLIC_STRIPE_PAYMENT_LINK`
- **Usage**: This link is used for the $10/month recurring subscription plan

### Lifetime Deal ($49 one-time)
- **Stripe Payment Link**: `https://buy.stripe.com/8x228t1vJdHO02J7Eg6EU01`
- **Environment Variable**: `NEXT_PUBLIC_STRIPE_LIFETIME_LINK`
- **Usage**: This link is used for the $49 one-time lifetime access offer

## Required Environment Variables (Vercel)

Set these in **Vercel → Settings → Environment Variables** for Production, Preview, and Development:

| Variable | Value | Description |
|----------|-------|-------------|
| `STRIPE_SECRET_KEY` | `sk_live_...` | Your Stripe secret key from the new account |
| `STRIPE_WEBHOOK_SECRET` | `whsec_A5uBY48F3ax0dt2l0D0j6KRDYimMJA4f` | Webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` | `https://buy.stripe.com/5kQ7sNcan0V22aRaQs6EU00` | Monthly $10 plan link |
| `NEXT_PUBLIC_STRIPE_LIFETIME_LINK` | `https://buy.stripe.com/8x228t1vJdHO02J7Eg6EU01` | Lifetime $49 deal link |
| `NEXT_PUBLIC_URL` | `https://quickfeedback.co` | Your production domain |
| `STRIPE_LAUNCH_COUPON_ID` | `coupon_...` | Stripe coupon ID for LAUNCH50 (50% off first month) |
| `NEXT_PUBLIC_LAUNCH_COUPON_CODE` | `LAUNCH50` | (Optional) Promo code name, defaults to LAUNCH50 |

## Stripe Products Configuration

### 1. QuickFeedback PRO (Monthly Subscription)
- **Product Name**: "QuickFeedback PRO"
- **Price**: $10 USD/month (recurring)
- **Type**: Subscription
- **Payment Link**: `https://buy.stripe.com/5kQ7sNcan0V22aRaQs6EU00`

### 2. QuickFeedback Lifetime Deal
- **Product Name**: "QuickFeedback Lifetime Deal"
- **Price**: $49 USD (one-time)
- **Type**: One-time payment
- **Payment Link**: `https://buy.stripe.com/8x228t1vJdHO02J7Eg6EU01`

### 3. Launch Coupon (LAUNCH50)
- **Coupon Code**: `LAUNCH50`
- **Discount**: 50% off
- **Duration**: First month only (applies to monthly subscription)
- **Result**: User pays $5 for first month, then $10/month thereafter

## Webhook Configuration

1. **Webhook Endpoint URL**: `https://quickfeedback.co/api/stripe/webhook`
2. **Webhook Secret**: `whsec_A5uBY48F3ax0dt2l0D0j6KRDYimMJA4f`
3. **Events to Listen For**:
   - `checkout.session.completed` - When a payment is completed
   - `customer.subscription.deleted` - When a subscription is cancelled
   - `customer.subscription.updated` - When subscription status changes

## How It Works

### Monthly Plan Upgrade (via Dashboard)
1. User clicks "Upgrade to PRO" in dashboard
2. Optionally enters promo code `LAUNCH50`
3. System creates Stripe Checkout session via `/api/create-checkout-session`
4. User completes payment on Stripe
5. Stripe sends webhook to `/api/stripe/webhook`
6. System updates user's plan to `pro` in Supabase

### Lifetime Deal (via Payment Link)
1. User clicks lifetime deal link (from marketing page or dashboard)
2. User completes $49 payment directly on Stripe
3. Stripe sends webhook with `mode: 'payment'`
4. System detects one-time payment and sets plan to `lifetime`
5. User account is upgraded automatically

## Testing Checklist

- [ ] Monthly plan upgrade works with promo code
- [ ] Monthly plan upgrade works without promo code
- [ ] Lifetime deal link upgrades user correctly
- [ ] Webhook receives events from Stripe
- [ ] User plan updates in Supabase after payment
- [ ] Dashboard shows correct plan status (PRO/Lifetime)
- [ ] Embed code includes `data-pro="true"` for paid users

## Google Analytics Configuration

### Setup Instructions

1. **Create a Google Analytics 4 (GA4) property**:
   - Go to [Google Analytics](https://analytics.google.com/)
   - Create a new property or use an existing one
   - Get your Measurement ID (format: `G-XXXXXXXXXX`)

2. **Add Environment Variable in Vercel**:
   - Go to **Vercel → Settings → Environment Variables**
   - Add: `NEXT_PUBLIC_GA_ID` = `G-XXXXXXXXXX` (your GA4 Measurement ID)
   - Apply to: Production, Preview, and Development environments

3. **Verify Installation**:
   - After deploying, visit your site
   - Check Google Analytics Real-Time reports to confirm data is being received
   - The analytics script loads automatically on all pages

### How It Works

- The `GoogleAnalytics` component is added to the root layout
- It uses Next.js `Script` component with `strategy="afterInteractive"` for optimal performance
- Tracks page views automatically
- Only loads if `NEXT_PUBLIC_GA_ID` is configured (won't break if missing)

### Environment Variable

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_GA_ID` | `G-XXXXXXXXXX` | Your Google Analytics 4 Measurement ID |

