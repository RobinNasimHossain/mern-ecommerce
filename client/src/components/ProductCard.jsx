import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/products/${product.slug || product._id}`}
      className="card group overflow-hidden transition hover:shadow-md"
    >
      <div className="aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="space-y-1 p-4">
        <p className="text-xs uppercase tracking-wide text-gray-500">{product.category}</p>
        <h3 className="line-clamp-1 font-semibold text-gray-900">{product.name}</h3>
        <div className="flex items-center justify-between pt-1">
          <span className="text-lg font-bold text-brand-700">${product.price.toFixed(2)}</span>
          <span className="flex items-center gap-1 text-xs text-gray-600">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {product.rating?.toFixed(1) || '0.0'} ({product.numReviews || 0})
          </span>
        </div>
      </div>
    </Link>
  );
}
