# Pickle Pop Arcade — web launch and Stripe checklist

**Current state:** The game works on GitHub Pages; the new marketing landing page is `landing.html`. Stripe checkout is **not yet connected**, and no paid web subscription should be sold until server-side access verification works.

## Offer
- Free: two matches on this browser/device plus How to Play.
- Premium: $2.99 USD/month, unlimited matches, Beginner/Club/Pro, challenges and rewards.
- No unannounced trial or signup fees.

## Required secure payment flow
1. Create a separate **Pickle Pop Premium Web** recurring product in the existing Stripe account ($2.99/month); do not reuse GroupReachers' product.
2. Set up Supabase Auth for customer accounts and a Pickle Pop-specific table for subscription entitlements.
3. Create an authenticated server/Edge Function that creates Stripe Checkout sessions using a secret Stripe key **only on the server** and the authenticated user's ID as the reference.
4. Set up a Stripe webhook, verify the signature, and process checkout completion, paid invoices, subscription updates/deletions, and failed payments. Store event IDs for idempotency. Treat Stripe as the source of truth for paid access.
5. On every premium-gated action, verify the signed-in user's current entitlement from the backend. **Never** use localStorage as proof of payment.
6. Add an authenticated Manage Billing action that creates a Stripe Customer Portal session server-side for the customer's own Stripe customer ID.
7. Test checkout, returning user, canceled subscription, expired subscription, failed renewal, refunds, and duplicate webhook events using Stripe test mode before switching to live.
8. Update the privacy policy and terms to accurately disclose Stripe/Supabase processing, recurring billing, cancellation, and support contact before accepting payments.

## Hosting
GitHub Pages is a static host: it cannot safely hold a Stripe secret key or receive/verify Stripe webhooks. Keep the public game and landing page on GitHub Pages; run payment and entitlement endpoints on Supabase Edge Functions (or a comparable secure backend). Never commit secret keys to GitHub.

## Release checklist
- Landing page is public and readable on phone and desktop.
- Free game works and premium is not incorrectly granted.
- Live Stripe checkout creates the correct $2.99 recurring subscription.
- Webhook reliably unlocks and revokes access.
- Customer can sign in again on another device and restore web Premium.
- Customer can manage/cancel their subscription.
- Terms, privacy, support and contact links are accurate.
- Only after these pass: replace landing page's 'Try the game first' CTA with a live subscribe action and promote the paid site.
