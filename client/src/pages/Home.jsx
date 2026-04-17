import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    let cancelled = false;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/products', {
          params: { keyword: keyword || undefined, category: category || undefined, pageSize: 24 },
        });
        if (!cancelled) setProducts(data.products);
      } catch (err) {
        toast.error(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    const t = setTimeout(fetchProducts, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [keyword, category]);

  const categories = Array.from(new Set(products.map((p) => p.category)));

  return (
    <div className="container-app py-8">
      <section className="mb-8 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-900 px-6 py-12 text-white">
        <h1 className="text-3xl font-bold sm:text-4xl">Find what you love.</h1>
        <p className="mt-2 max-w-xl text-brand-100">
          Thoughtfully curated essentials — electronics, apparel, and home goods.
        </p>
      </section>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Search products..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
        <select
          className="input sm:w-56"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loader label="Loading products..." />
      ) : products.length === 0 ? (
        <div className="py-16 text-center text-gray-500">No products match your search.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
