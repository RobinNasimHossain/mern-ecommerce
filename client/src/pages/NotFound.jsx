import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container-app py-24 text-center">
      <p className="text-7xl font-black text-brand-600">404</p>
      <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-gray-500">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link to="/" className="btn-primary mt-6 inline-flex">
        Back to shop
      </Link>
    </div>
  );
}
