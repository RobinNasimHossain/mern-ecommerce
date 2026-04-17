import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const { items, itemsPrice, shippingPrice, taxPrice, totalPrice, updateQty, removeItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) return navigate('/login', { state: { from: '/checkout' } });
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="container-app py-16 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-gray-300" />
        <h2 className="mt-4 text-xl font-semibold">Your cart is empty</h2>
        <Link to="/" className="btn-primary mt-4 inline-flex">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <h1 className="mb-6 text-2xl font-bold">Shopping cart</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {items.map((item) => (
            <div key={item.product} className="card flex gap-4 p-4">
              <img
                src={item.image}
                alt={item.name}
                className="h-24 w-24 rounded-lg object-cover"
              />
              <div className="flex-1">
                <Link
                  to={`/products/${item.product}`}
                  className="font-medium hover:text-brand-700"
                >
                  {item.name}
                </Link>
                <p className="mt-1 text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                <div className="mt-3 flex items-center gap-3">
                  <select
                    className="input w-20"
                    value={item.qty}
                    onChange={(e) => updateQty(item.product, Number(e.target.value))}
                  >
                    {Array.from({ length: Math.max(item.countInStock || 20, 1) }, (_, i) => i + 1).map(
                      (n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      )
                    )}
                  </select>
                  <button
                    className="btn-ghost text-red-600"
                    onClick={() => removeItem(item.product)}
                  >
                    <Trash2 className="h-4 w-4" /> Remove
                  </button>
                </div>
              </div>
              <div className="text-right font-semibold">
                ${(item.price * item.qty).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div className="card h-fit space-y-3 p-5">
          <h2 className="text-lg font-semibold">Order summary</h2>
          <Row label="Items" value={`$${itemsPrice.toFixed(2)}`} />
          <Row label="Shipping" value={shippingPrice === 0 ? 'Free' : `$${shippingPrice.toFixed(2)}`} />
          <Row label="Tax" value={`$${taxPrice.toFixed(2)}`} />
          <div className="border-t pt-3">
            <Row label="Total" value={`$${totalPrice.toFixed(2)}`} bold />
          </div>
          <button className="btn-primary mt-2 w-full" onClick={handleCheckout}>
            Proceed to checkout
          </button>
        </div>
      </div>
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
