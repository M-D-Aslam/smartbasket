import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, LayoutDashboard, Search, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { cn } from '../lib/utils';
import { Logo } from './Logo';

export const Navbar: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
      <div className="container-wide">
        <div className="flex justify-between h-24 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <Logo size="md" className="group-hover:scale-105 transition-transform duration-300" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/products" className="text-gray-600 hover:text-green-600 font-medium transition-colors">
              Shop
            </Link>
            {isAdmin && (
              <Link to="/admin" className="flex items-center text-gray-600 hover:text-green-600 font-medium transition-colors">
                <LayoutDashboard className="w-4 h-4 mr-1" />
                Admin
              </Link>
            )}
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/orders" className="text-gray-600 hover:text-green-600 font-medium transition-colors">
                  My Orders
                </Link>
                <Link to="/profile" className="p-2 text-gray-600 hover:text-green-600 transition-colors" title="Profile">
                  <User className="w-6 h-6" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-6 h-6" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-green-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-700 transition-all shadow-lg hover:shadow-green-200"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Actions & Menu Button */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-green-600 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-green-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-md">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-green-600 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn("md:hidden bg-white border-t border-gray-100 transition-all duration-300 overflow-hidden", isMenuOpen ? "max-h-96" : "max-h-0")}>
        <div className="px-4 pt-2 pb-6 space-y-4">
          <Link to="/products" className="block text-gray-600 font-medium py-2" onClick={() => setIsMenuOpen(false)}>Shop</Link>
          {isAdmin && (
            <Link to="/admin" className="block text-gray-600 font-medium py-2" onClick={() => setIsMenuOpen(false)}>Admin Dashboard</Link>
          )}
          <Link to="/cart" className="block text-gray-600 font-medium py-2" onClick={() => setIsMenuOpen(false)}>Cart ({totalItems})</Link>
          {user ? (
            <>
              <Link to="/orders" className="block text-gray-600 font-medium py-2" onClick={() => setIsMenuOpen(false)}>My Orders</Link>
              <Link to="/profile" className="block text-gray-600 font-medium py-2" onClick={() => setIsMenuOpen(false)}>Profile</Link>
              <button onClick={handleLogout} className="block text-red-600 font-medium py-2 w-full text-left">Logout</button>
            </>
          ) : (
            <Link to="/login" className="block bg-green-600 text-white px-6 py-2 rounded-full font-semibold text-center" onClick={() => setIsMenuOpen(false)}>Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-20 pb-10">
      <div className="container-wide">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">
          <div className="col-span-1 md:col-span-1 flex flex-col items-start">
            <Link to="/" className="flex items-center mb-6">
              <Logo size="lg" variant="light" showSlogan={true} />
            </Link>
            <p className="text-sm leading-relaxed text-gray-400 mt-2">
              Your neighborhood grocery store, now online. Fresh produce, dairy, and essentials delivered to your doorstep.
            </p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-6">Quick Links</h3>
            <ul className="space-y-4 text-sm">
              <li><Link to="/products" className="hover:text-green-500 transition-colors">Shop All</Link></li>
              <li><Link to="/cart" className="hover:text-green-500 transition-colors">Shopping Cart</Link></li>
              <li><Link to="/orders" className="hover:text-green-500 transition-colors">Order Tracking</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-6">Categories</h3>
            <ul className="space-y-4 text-sm">
              <li><Link to="/products?category=Fruits" className="hover:text-green-500 transition-colors">Fruits & Vegetables</Link></li>
              <li><Link to="/products?category=Dairy" className="hover:text-green-500 transition-colors">Dairy & Eggs</Link></li>
              <li><Link to="/products?category=Bakery" className="hover:text-green-500 transition-colors">Bakery</Link></li>
              <li><Link to="/products?category=Cosmetics" className="hover:text-green-500 transition-colors">Cosmetics</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-6">Contact Us</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li>NEW RAJ NAGAR BASTI BAWA KHEL JALANDHAR PUNJAB , 144021</li>
              <li>0409aslam@gmail.com</li>
              <li>+91 8699941511</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-xs text-gray-500">
          <p>© 2026 SmartBasket. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
