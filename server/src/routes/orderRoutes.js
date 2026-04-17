const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  markOrderAsPaid,
  getOrders,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.route('/').post(protect, createOrder).get(protect, admin, getOrders);
router.get('/mine', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/pay', protect, markOrderAsPaid);

module.exports = router;
