const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(getProducts).post(protect, admin, createProduct);
router.post('/:id/reviews', protect, createProductReview);
router
  .route('/:idOrSlug')
  .get(getProductById);
router
  .route('/:id')
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

module.exports = router;
