# Shoply — MERN E-commerce

A production-ready MVP e-commerce store built with the **MERN** stack.

- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT auth, Stripe Checkout + webhooks
- **Frontend**: React 18, Vite, Tailwind CSS, React Router, React Context + Reducer state
- **Payments**: Stripe (test mode)

## Features

- JWT auth (register, login, persisted session, protected routes)
- Product catalog with search, category filter, pagination
- Persistent cart (localStorage) with per-item stock limits
- Server-side price recalculation on order creation (tamper-proof)
- Stripe Checkout session + webhook to mark orders paid
- Order history and order detail pages
- Admin-ready product/order endpoints (role-based middleware)
- Seed script with demo users and products
- Helmet, CORS, centralized error handling, async handler

## Quick start (local)

### 1. Prerequisites

- Node.js 18+
- A running MongoDB (local `mongod`, `docker run -p 27017:27017 mongo`, or Atlas)
- Optional: [Stripe CLI](https://stripe.com/docs/stripe-cli) for webhook testing

### 2. Clone & install

```bash
git clone https://github.com/RobinNasimHossain/mern-ecommerce.git
cd mern-ecommerce

# Backend
cd server
cp .env.example .env           # fill in MONGO_URI, JWT_SECRET, STRIPE_SECRET_KEY
npm install
npm run seed                   # optional: populate demo data
npm run dev                    # http://localhost:5000

# Frontend (new terminal)
cd ../client
cp .env.example .env
npm install
npm run dev                    # http://localhost:5173
```

### 3. Demo accounts (after seeding)

| Role  | Email               | Password  |
| ----- | ------------------- | --------- |
| Admin | admin@example.com   | admin123  |
| User  | user@example.com    | user123   |

### 4. Stripe test mode

1. Grab test keys from https://dashboard.stripe.com/test/apikeys and set them in `server/.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
2. Forward webhooks locally:
   ```bash
   stripe listen --forward-to localhost:5000/api/stripe/webhook
   ```
3. Use [test cards](https://stripe.com/docs/testing) (e.g. `4242 4242 4242 4242`, any future date, any CVC).

## API reference

| Method | Path                                    | Auth         | Description                      |
| ------ | --------------------------------------- | ------------ | -------------------------------- |
| POST   | `/api/auth/register`                    | Public       | Create account                   |
| POST   | `/api/auth/login`                       | Public       | Sign in                          |
| GET    | `/api/auth/me`                          | Bearer       | Current user profile             |
| GET    | `/api/products`                         | Public       | List products (search/paginate)  |
| GET    | `/api/products/:idOrSlug`               | Public       | Product by id or slug            |
| POST   | `/api/products`                         | Admin        | Create product                   |
| PUT    | `/api/products/:id`                     | Admin        | Update product                   |
| DELETE | `/api/products/:id`                     | Admin        | Delete product                   |
| POST   | `/api/products/:id/reviews`             | Bearer       | Add a review                     |
| POST   | `/api/orders`                           | Bearer       | Create order (server recalc)     |
| GET    | `/api/orders/mine`                      | Bearer       | List my orders                   |
| GET    | `/api/orders/:id`                       | Bearer/Owner | Order detail                     |
| PUT    | `/api/orders/:id/pay`                   | Bearer/Owner | Mark paid (COD / manual)         |
| GET    | `/api/orders`                           | Admin        | All orders                       |
| POST   | `/api/stripe/create-checkout-session`   | Bearer       | Start Stripe Checkout            |
| POST   | `/api/stripe/webhook`                   | Stripe sig   | Webhook → mark order paid        |

## Project layout

```
mern-ecommerce/
├── client/            # Vite + React + Tailwind
│   └── src/
│       ├── api/       # axios instance with token injection
│       ├── components/
│       ├── context/   # AuthContext, CartContext (useReducer)
│       └── pages/
└── server/            # Express + Mongoose
    └── src/
        ├── config/
        ├── controllers/
        ├── middleware/
        ├── models/
        ├── routes/
        ├── seed/
        └── utils/
```

## Deployment notes

- **Backend**: deploy to Render, Railway, Fly.io, or any Node host. Set env vars from `.env.example`. For MongoDB, use MongoDB Atlas.
- **Frontend**: `npm run build` in `client/` and deploy `client/dist` to Vercel, Netlify, or Cloudflare Pages. Set `VITE_API_URL` to your backend public URL.
- **Stripe webhooks** in production: register the endpoint in the Stripe dashboard and copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

## Scripts

```bash
# server/
npm run dev            # nodemon
npm start              # production
npm run seed           # seed demo data
npm run seed -- --destroy

# client/
npm run dev
npm run build
npm run preview
npm run lint
```

## License

MIT
