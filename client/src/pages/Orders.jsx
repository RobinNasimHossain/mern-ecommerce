import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Loader from '../components/Loader';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/orders/mine');
        setOrders(data);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Loader label="Loading orders..." />;

  return (
    <div className="container-app py-8">
      <h1 className="mb-6 text-2xl font-bold">My orders</h1>
      {orders.length === 0 ? (
        <div className="card p-8 text-center text-gray-500">
          You haven't placed any orders yet.{' '}
          <Link to="/" className="text-brand-700 underline">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Order</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Paid</th>
                <th className="px-4 py-3 text-left">Delivered</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((o) => (
                <tr key={o._id}>
                  <td className="px-4 py-3 font-mono text-xs">{o._id.slice(-8)}</td>
                  <td className="px-4 py-3">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">${o.totalPrice.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <Badge ok={o.isPaid} labelOk="Paid" labelNo="Unpaid" />
                  </td>
                  <td className="px-4 py-3">
                    <Badge ok={o.isDelivered} labelOk="Delivered" labelNo="Pending" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/orders/${o._id}`} className="text-brand-700 hover:underline">
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Badge({ ok, labelOk, labelNo }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        ok ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
      }`}
    >
      {ok ? labelOk : labelNo}
    </span>
  );
}
