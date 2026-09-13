import Stripe from 'stripe';

import { stripeAdmin } from '@/libs/stripe/stripe-admin';
import { getEnvVar } from '@/utils/get-env-var';

// 1. Listen ONLY to events relevant to metered billing and invoices
const relevantEvents = new Set([
  'invoice.paid',
  'invoice.payment_failed',
  'customer.subscription.created',
  'customer.subscription.deleted',
]);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;
  const webhookSecret = getEnvVar(process.env.STRIPE_WEBHOOK_SECRET, 'STRIPE_WEBHOOK_SECRET');
  
  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret) return Response.json('Missing signature or secret', { status: 400 });
    event = stripeAdmin.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (error) {
    return Response.json(`Webhook Error: ${(error as any).message}`, { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        
        // --- INVOICE EVENTS (Metered Billing) ---
        case 'invoice.paid':
          const paidInvoice = event.data.object as Stripe.Invoice;
          // TODO: Update the artist's internal ledger in Supabase to clear any pending fee warnings.
          console.log(`Invoice paid for customer: ${paidInvoice.customer}`);
          break;

        case 'invoice.payment_failed':
          const failedInvoice = event.data.object as Stripe.Invoice;
          // TODO: Update Supabase to flag the artist's account for the "Grace Period" dashboard warning.
          console.log(`Invoice failed for customer: ${failedInvoice.customer}`);
          break;

        // --- SUBSCRIPTION LIFECYCLE ---
        case 'customer.subscription.created':
          const newSub = event.data.object as Stripe.Subscription;
          // TODO: Save newSub.id to the 'artists' table so you can report metered usage against it.
          break;

        case 'customer.subscription.deleted':
          const deletedSub = event.data.object as Stripe.Subscription;
          // TODO: Handle artist churn or hard cancellations here.
          break;

        default:
          throw new Error('Unhandled relevant event!');
      }
    } catch (error) {
      console.error(error);
      return Response.json('Webhook handler failed. View your nextjs function logs.', {
        status: 400,
      });
    }
  }
  
  return Response.json({ received: true });
}