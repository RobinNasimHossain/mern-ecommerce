import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

export default function Checkout() {
  const navigate = useNavigate();
  const {
    items,
    shippingAddress,
    setShippingAddress,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    clearCart,
  } = useCart();

  const [address, setAddress] = useState(
    shippingAddress || {
      fullName: '',
      address: '',
      city: '',
      postalCode: '',
      country: '',
      phone: '',
    }
  );
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return navigate('/');
    }
    setShippingAddress(address);
    setSubmitting(true);
    try {
      const { data: order } = await api.post('/orders', {
        orderItems: items.map((i) => ({ product: i.product, qty: i.qty })),
        shippingAddress: address,
        paymentMethod: 'stripe',
        shippingPrice,
        taxPrice,
      });

      try {
        const { data } = await api.post('/stripe/create-checkout-session', {
          orderId: order._id,
        });
        clearCart();
        window.location.href = data.url;
      } catch (err) {
        // Stripe not configured — fall back to showing the order page
        toast(
          'Order placed. Stripe is not configured on the server; please contact support to pay.',
          { icon: '⚠️' }
        );
        clearCart();
        navigate(`/orders/${order._id}`);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const update = (k) => (e) => setAddress({ ...address, [k]: e.target.value });

  return (
    <div className="container-app grid gap-6 py-8 lg:grid-cols-3">
      <form onSubmit={onSubmit} className="card space-y-4 p-6 lg:col-span-2">
        <h1 className="text-xl font-bold">Shipping address</h1>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Full name" value={address.fullName} onChange={update('fullName')} required />
          <Field label="Phone" value={address.phone} onChange={update('phone')} />
          <Field label="Address" value={address.address} onChange={update('address')} required className="sm:col-span-2" />
          <Field label="City" value={address.city} onChange={update('city')} required />
          <Field label="Postal code" value={address.postalCode} onChange={update('postalCode')} required />
          <Field label="Country" value={address.country} onChange={update('country')} required className="sm:col-span-2" />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? 'Processing...' : 'Pay with Stripe'}
        </button>
      </form>

      <aside className="card h-fit space-y-3 p-5">
        <h2 className="text-lg font-semibold">Order summary</h2>
        <ul className="divide-y">
          {items.map((i) => (
            <li key={i.product} className="flex items-center justify-between py-2 text-sm">
              <span className="truncate pr-2">
                {i.name} × {i.qty}
              </span>
              <span>${(i.price * i.qty).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <Row label="Items" value={`$${itemsPrice.toFixed(2)}`} />
        <Row label="Shipping" value={shippingPrice === 0 ? 'Free' : `$${shippingPrice.toFixed(2)}`} />
        <Row label="Tax" value={`$${taxPrice.toFixed(2)}`} />
        <div className="border-t pt-3">
          <Row label="Total" value={`$${totalPrice.toFixed(2)}`} bold />
        </div>
      </aside>
    </div>
  );
}

function Field({ label, className = '', ...rest }) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      <input className="input" {...rest} />
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className={`flex items-center justify-between text-sm ${bold ? 'text-base font-semibold' : ''}`}>
      <span className="text-gray-600">{label}</span>
      <span>{value}</span>
    </div>
  );
}
