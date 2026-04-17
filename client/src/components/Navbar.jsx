import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Package, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalQty } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="container-app flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-brand-700">
          <Store className="h-6 w-6" />
          Shoply
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `btn-ghost ${isActive ? 'text-brand-700' : ''}`
            }
          >
            Shop
          </NavLink>
          {user && (
            <NavLink
              to="/orders"
              className={({ isActive }) =>
                `btn-ghost ${isActive ? 'text-brand-700' : ''}`
              }
            >
              <Package className="h-4 w-4" /> Orders
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/cart" className="btn-ghost relative">
            <ShoppingCart className="h-5 w-5" />
            {totalQty > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-brand-600 px-1 text-xs font-semibold text-white">
                {totalQty}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-gray-600 sm:inline">Hi, {user.name.split(' ')[0]}</span>
              <button onClick={handleLogout} className="btn-secondary">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-primary">
              <User className="h-4 w-4" /> Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
