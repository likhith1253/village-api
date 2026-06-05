import Stripe from 'stripe';
import prisma from '../config/prisma.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'mock_key');

/**
 * Creates a Stripe Checkout Session for subscribing to the PRO plan.
 */
export const createCheckoutSession = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized access' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user.id.toString() }
      });
      customerId = customer.id;
      // Store customerId
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId }
      });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'CensusGrid PRO Developer Plan',
              description: 'Access to 10,000 requests/day, advanced analytics, and custom API usage charts.',
            },
            unit_amount: 4900, // $49.00
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${frontendUrl}/dashboard?checkout=success`,
      cancel_url: `${frontendUrl}/pricing?checkout=cancel`,
      metadata: {
        userId: user.id.toString(),
        plan: 'PRO'
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        checkoutUrl: session.url
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handles Stripe webhook events.
 */
export const handleWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      console.warn('⚠️ Stripe webhook signature verification skipped. Parsing request body directly.');
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    console.error(`❌ Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    const session = event.data.object;

    switch (event.type) {
      case 'checkout.session.completed':
      case 'customer.subscription.updated': {
        const userId = parseInt(session.metadata?.userId, 10);
        const stripeCustomerId = session.customer;
        
        let subscriptionStatus = 'active';
        let subscriptionEndDate = new Date();
        subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30); // 30 days default

        if (session.subscription) {
          try {
            const subscription = await stripe.subscriptions.retrieve(session.subscription);
            subscriptionStatus = subscription.status;
            subscriptionEndDate = new Date(subscription.current_period_end * 1000);
          } catch (subErr) {
            console.error('Failed to retrieve subscription details:', subErr.message);
          }
        }

        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              plan: 'PRO',
              stripeCustomerId,
              subscriptionStatus,
              subscriptionEndDate
            }
          });
          console.log(`✅ Subscription finalized for user ${userId}. Plan updated to PRO.`);
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const stripeCustomerId = session.customer;
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId }
        });
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              plan: 'FREE',
              subscriptionStatus: 'canceled',
              subscriptionEndDate: new Date()
            }
          });
          console.log(`⚠️ Subscription canceled/deleted. Reverted user ${user.id} to FREE.`);
        }
        break;
      }
      default:
        console.log(`Stripe Webhook: Unhandled event type ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook event handler processing failed:', error);
    return res.status(500).json({ success: false, message: 'Webhook event processing error' });
  }
};
