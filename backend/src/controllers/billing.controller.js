import Stripe from 'stripe';
import prisma from '../config/prisma.js';

// Created lazily so the app boots (and tests run) without Stripe credentials.
let stripeClient = null;
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    const err = new Error('Billing is not configured');
    err.statusCode = 503;
    throw err;
  }
  if (!stripeClient) stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  return stripeClient;
};

/**
 * Creates a Stripe Checkout Session for subscribing to the PRO plan.
 */
export const createCheckoutSession = async (req, res, next) => {
  try {
    // For demo users, return a mock checkout URL
    if (req.user?.isDemo) {
      return res.status(200).json({
        success: true,
        data: {
          checkoutUrl: 'https://stripe.com/checkout/demo'
        }
      });
    }

    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized access' });
    }

    const stripe = getStripe();
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
const ACTIVE_STATUSES = new Set(['active', 'trialing']);

export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // Never process unsigned events: without a secret the endpoint is closed,
  // otherwise anyone could POST a fake event and upgrade an account to PRO.
  if (!webhookSecret) {
    return res.status(503).json({ success: false, message: 'Webhook not configured' });
  }
  if (!sig) {
    return res.status(400).json({ success: false, message: 'Missing Stripe signature' });
  }

  let event;
  try {
    event = Stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
  }

  try {
    const object = event.data.object;

    switch (event.type) {
      case 'checkout.session.completed': {
        const userId = parseInt(object.metadata?.userId, 10);
        if (!userId) break;

        let subscriptionStatus = 'active';
        let subscriptionEndDate = new Date();
        subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30); // fallback

        if (object.subscription) {
          try {
            const subscription = await getStripe().subscriptions.retrieve(object.subscription);
            subscriptionStatus = subscription.status;
            subscriptionEndDate = new Date(subscription.current_period_end * 1000);
          } catch (subErr) {
            console.error('Failed to retrieve subscription details:', subErr.message);
          }
        }

        await prisma.user.updateMany({
          where: { id: userId },
          data: {
            plan: 'PRO',
            stripeCustomerId: object.customer,
            subscriptionStatus,
            subscriptionEndDate
          }
        });
        break;
      }
      case 'customer.subscription.updated': {
        // Subscription objects carry no checkout metadata; match on the Stripe customer.
        const user = await prisma.user.findFirst({ where: { stripeCustomerId: object.customer } });
        if (user) {
          const data = {
            plan: ACTIVE_STATUSES.has(object.status) ? 'PRO' : 'FREE',
            subscriptionStatus: object.status
          };
          if (object.current_period_end) {
            data.subscriptionEndDate = new Date(object.current_period_end * 1000);
          }
          await prisma.user.update({ where: { id: user.id }, data });
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const user = await prisma.user.findFirst({ where: { stripeCustomerId: object.customer } });
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              plan: 'FREE',
              subscriptionStatus: 'canceled',
              subscriptionEndDate: new Date()
            }
          });
        }
        break;
      }
      default:
        break;
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook event handler processing failed:', error);
    return res.status(500).json({ success: false, message: 'Webhook event processing error' });
  }
};
