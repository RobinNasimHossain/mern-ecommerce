import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CheckCircle2, Clock, Truck } from 'lucide-react';
import api from '../api/axios';
import Loader from '../components/Loader';

export default function OrderDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('Payment received. Thank you!');
    } else if (searchParams.get('canceled') === 'true') {
      toast('Payment canceled.', { icon: '⚠️' });
    }
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        if (!cancelled) setOrder(data);
      } catch (err) {
        toast.error(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    // Poll briefly after Stripe redirect so the webhook-updated status shows up quickly.
    if (searchParams.get('success') === 'true') {
      const interval = setInterval(load, 2000);
      setTimeout(() => clearInterval(interval), 10000);
      return () => {
        cancelled = true;
        clearInterval(interval);
      };
    }
    return () => {
      cancelled = true;
    };
  }, [id, searchParams]);

  if (loading) return <Loader label="Loading order..." />;
  if (!order) return <div className="container-app py-16 text-center">Order not found.</div>;

  return (
    <div className="container-app grid gap-6 py-8 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div className="card p-5">
          <h1 className="text-xl font-bold">Order #{order._id.slice(-8)}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Placed {new Date(order.createdAt).toLocaleString()}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Status
              ok={order.isPaid}
              okLabel={`Paid ${order.paidAt ? new Date(order.paidAt).toLocaleDateString() : ''}`}
              pendingLabel="Awaiting payment"
              Icon={order.isPaid ? CheckCircle2 : Clock}
            />
            <Status
              ok={order.isDelivered}
              okLabel="Delivered"
              pendingLabel="Not yet delivered"
              Icon={Truck}
            />
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-3 font-semibold">Items</h2>
          <ul className="divide-y">
            {order.orderItems.map((i) => (
              <li key={i.product} className="flex items-center gap-4 py-3">
                <img src={i.image} alt={i.name} className="h-14 w-14 rounded object-cover" />
                <div className="flex-1">
                  <p className="font-medium">{i.name}</p>
                  <p className="text-sm text-gray-500">
                    ${i.price.toFixed(2)} × {i.qty}
                  </p>
                </div>
                <div className="font-semibold">${(i.price * i.qty).toFixed(2)}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-5">
          <h2 className="mb-2 font-semibold">Shipping to</h2>
          <address className="not-italic text-sm text-gray-700">
            {order.shippingAddress.fullName}
            <br />
            {order.shippingAddress.address}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.postalCode}
            <br />
            {order.shippingAddress.country}
          </address>
        </div>
      </div>

      <aside className="card h-fit space-y-2 p-5">
        <h2 className="text-lg font-semibold">Summary</h2>
        <Row label="Items" value={`$${order.itemsPrice.toFixed(2)}`} />
        <Row label="Shipping" value={`$${order.shippingPrice.toFixed(2)}`} />
        <Row label="Tax" value={`$${order.taxPrice.toFixed(2)}`} />
        <div className="border-t pt-3">
          <Row label="Total" value={`$${order.totalPrice.toFixed(2)}`} bold />
        </div>
      </aside>
    </div>
  );
}

function Status({ ok, okLabel, pendingLabel, Icon }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
        ok ? 'border-green-200 bg-green-50 text-green-800' : 'border-gray-200 bg-gray-50 text-gray-700'
      }`}
    >
      <Icon className="h-4 w-4" />
      {ok ? okLabel : pendingLabel}
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
