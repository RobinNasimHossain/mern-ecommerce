import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ChevronLeft, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Loader from '../components/Loader';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${idOrSlug}`);
        if (!cancelled) setProduct(data);
      } catch (err) {
        toast.error(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [idOrSlug]);

  if (loading) return <Loader label="Loading product..." />;
  if (!product) {
    return (
      <div className="container-app py-16 text-center text-gray-500">
        Product not found.{' '}
        <Link to="/" className="text-brand-700 underline">
          Back to shop
        </Link>
      </div>
    );
  }

  const handleAdd = () => {
    addItem(product, qty);
    toast.success('Added to cart');
  };

  const handleBuyNow = () => {
    addItem(product, qty);
    navigate('/cart');
  };

  return (
    <div className="container-app py-8">
      <Link to="/" className="btn-ghost mb-4 inline-flex">
        <ChevronLeft className="h-4 w-4" /> Back
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="card overflow-hidden">
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        </div>
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">{product.category}</p>
          <h1 className="text-2xl font-bold sm:text-3xl">{product.name}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {product.rating?.toFixed(1) || '0.0'} · {product.numReviews || 0} reviews
          </div>
          <p className="text-3xl font-bold text-brand-700">${product.price.toFixed(2)}</p>
          <p className="leading-relaxed text-gray-700">{product.description}</p>

          <div className="flex items-center gap-3 pt-2">
            <label className="label mb-0">Qty</label>
            <select
              className="input w-20"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              disabled={product.countInStock === 0}
            >
              {Array.from({ length: Math.max(product.countInStock, 0) }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span className={`text-sm ${product.countInStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.countInStock > 0 ? `${product.countInStock} in stock` : 'Out of stock'}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              className="btn-secondary"
              onClick={handleAdd}
              disabled={product.countInStock === 0}
            >
              <ShoppingCart className="h-4 w-4" /> Add to cart
            </button>
            <button
              className="btn-primary"
              onClick={handleBuyNow}
              disabled={product.countInStock === 0}
            >
              Buy now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
