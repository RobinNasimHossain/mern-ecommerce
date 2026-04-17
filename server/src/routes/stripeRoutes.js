const express = require('express');
const { createCheckoutSession, stripeWebhook } = require('../controllers/stripeController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/create-checkout-session', protect, createCheckoutSession);
// Note: webhook route body parsing is handled in server.js (raw body)
router.post('/webhook', stripeWebhook);

module.exports = router;
