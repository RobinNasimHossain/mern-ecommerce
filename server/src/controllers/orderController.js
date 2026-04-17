const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, shippingPrice = 0, taxPrice = 0 } =
    req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // Server-side price calculation to avoid tampering
  const productIds = orderItems.map((i) => i.product);
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  const verifiedItems = orderItems.map((item) => {
    const product = productMap.get(item.product);
    if (!product) {
      res.status(400);
      throw new Error(`Product not found: ${item.product}`);
    }
    if (product.countInStock < item.qty) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.name}`);
    }
    return {
      product: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      qty: item.qty,
    };
  });

  const itemsPrice = verifiedItems.reduce((acc, i) => acc + i.price * i.qty, 0);
  const totalPrice = itemsPrice + Number(shippingPrice) + Number(taxPrice);

  const order = await Order.create({
    user: req.user._id,
    orderItems: verifiedItems,
    shippingAddress,
    paymentMethod: paymentMethod || 'stripe',
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  });

  res.status(201).json(order);
});

// @desc    Get logged-in user's orders
// @route   GET /api/orders/mine
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Get order by id
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (
    order.user._id.toString() !== req.user._id.toString() &&
    !req.user.isAdmin
  ) {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }
  res.json(order);
});

// @desc    Mark order as paid (manual / COD fallback)
// @route   PUT /api/orders/:id/pay
// @access  Private
const markOrderAsPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(403);
    throw new Error('Not authorized');
  }
  order.isPaid = true;
  order.paidAt = new Date();
  order.paymentResult = {
    id: req.body.id || 'manual',
    status: req.body.status || 'completed',
    email_address: req.body.email_address || req.user.email,
  };
  const updated = await order.save();
  res.json(updated);
});

// @desc    List all orders (admin)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate('user', 'id name email')
    .sort({ createdAt: -1 });
  res.json(orders);
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  markOrderAsPaid,
  getOrders,
};
