require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

const users = [
  { name: 'Admin', email: 'admin@example.com', password: 'admin123', isAdmin: true },
  { name: 'Demo User', email: 'user@example.com', password: 'user123', isAdmin: false },
];

const products = [
  {
    name: 'Classic Leather Backpack',
    slug: 'classic-leather-backpack',
    description: 'Full-grain leather backpack with padded laptop compartment.',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',
    category: 'Accessories',
    brand: 'Nomad',
    countInStock: 25,
  },
  {
    name: 'Wireless Noise-Cancelling Headphones',
    slug: 'wireless-noise-cancelling-headphones',
    description: '40h battery, ANC, Hi-Res audio, plush memory-foam ear cups.',
    price: 249.0,
    image: 'https://images.unsplash.com/photo-1518441902113-c1d3d2e3b6c1?w=600',
    category: 'Electronics',
    brand: 'SoundCore',
    countInStock: 18,
  },
  {
    name: 'Minimalist Smart Watch',
    slug: 'minimalist-smart-watch',
    description: 'AMOLED display, heart-rate & SpO2 tracking, 14-day battery.',
    price: 189.5,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
    category: 'Electronics',
    brand: 'TimeCo',
    countInStock: 40,
  },
  {
    name: 'Ceramic Pour-Over Coffee Set',
    slug: 'ceramic-pour-over-coffee-set',
    description: 'Handcrafted ceramic dripper + server for the perfect pour-over.',
    price: 54.0,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600',
    category: 'Home',
    brand: 'BrewCraft',
    countInStock: 60,
  },
  {
    name: 'Organic Cotton T-Shirt',
    slug: 'organic-cotton-t-shirt',
    description: 'GOTS-certified organic cotton, relaxed fit, pre-shrunk.',
    price: 28.0,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
    category: 'Apparel',
    brand: 'GreenThread',
    countInStock: 120,
  },
  {
    name: 'Mechanical Keyboard (Hot-Swap)',
    slug: 'mechanical-keyboard-hot-swap',
    description: '75% layout, hot-swappable switches, per-key RGB, USB-C.',
    price: 159.0,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600',
    category: 'Electronics',
    brand: 'KeyLab',
    countInStock: 15,
  },
];

const run = async () => {
  await connectDB();
  const destroy = process.argv.includes('--destroy');

  try {
    await Promise.all([Order.deleteMany(), Product.deleteMany(), User.deleteMany()]);
    if (destroy) {
      console.log('Data destroyed');
      process.exit(0);
    }
    const createdUsers = await User.create(users);
    const adminId = createdUsers.find((u) => u.isAdmin)._id;
    await Product.create(products.map((p) => ({ ...p, user: adminId })));
    console.log('Data seeded: users + products');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
};

run();
