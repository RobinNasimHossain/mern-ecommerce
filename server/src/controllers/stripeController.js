const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  // Lazily require so tests/dev without Stripe keys don't crash at import time.
  // eslint-disable-next-line global-require
  return require('stripe')(process.env.STRIPE_SECRET_KEY);
};

// @desc    Create a Stripe Checkout Session for an order
// @route   POST /api/stripe/create-checkout-session
// @access  Private
const createCheckoutSession = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const stripe = getStripe();
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: req.user.email,
    line_items: order.orderItems.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: { name: item.name, images: [item.image] },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.qty,
    })),
    success_url: `${clientUrl}/orders/${order._id}?success=true`,
    cancel_url: `${clientUrl}/orders/${order._id}?canceled=true`,
    metadata: { orderId: order._id.toString(), userId: req.user._id.toString() },
  });

  res.json({ url: session.url, id: session.id });
});

// @desc    Stripe webhook handler
// @route   POST /api/stripe/webhook
// @access  Public (verified via Stripe signature)
const stripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    res.status(500);
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }

  const stripe = getStripe();
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata && session.metadata.orderId;
    if (orderId) {
      const order = await Order.findById(orderId);
      if (order && !order.isPaid) {
        order.isPaid = true;
        order.paidAt = new Date();
        order.paymentResult = {
          id: session.payment_intent,
          status: session.payment_status,
          email_address: session.customer_details && session.customer_details.email,
        };
        await order.save();
      }
    }
  }

  res.json({ received: true });
});

module.exports = { createCheckoutSession, stripeWebhook };
