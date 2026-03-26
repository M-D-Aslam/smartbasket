import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, 
  Settings, LogOut, ChevronRight, Menu, X, Home 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from 'sonner';
import { Logo } from './Logo';

export const AdminLayout: React.FC = () => {
  const { isAdmin, loading } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-gray-400">Verifying Admin Access...</div>;
  if (!isAdmin) return <Navigate to="/" replace />;

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Package, label: 'Products', path: '/admin/products' },
    { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
    { icon: Users, label: 'Customers', path: '/admin/users' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-50">
        <Link to="/admin" className="flex items-center">
          <Logo size="sm" />
        </Link>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-gray-50 rounded-xl transition-all text-gray-400 hover:text-brand-600"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "bg-white border-r border-gray-100 transition-all duration-300 z-50 flex flex-col",
        "fixed lg:relative h-[calc(100vh-73px)] lg:h-screen top-[73px] lg:top-0",
        isMobile ? (isSidebarOpen ? "translate-x-0 w-72" : "-translate-x-full w-72") : (isSidebarOpen ? "w-80" : "w-24")
      )}>
        <div className="p-8 hidden lg:flex items-center justify-between">
          <Link to="/" className={cn("flex items-center transition-all", !isSidebarOpen && "opacity-0 invisible w-0")}>
            <Logo size="md" />
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-3 hover:bg-gray-50 rounded-2xl transition-all text-gray-400 hover:text-brand-600"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 lg:py-8 space-y-2 lg:space-y-3 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center p-3 lg:p-4 rounded-2xl lg:rounded-3xl transition-all group relative",
                  isActive 
                    ? "bg-brand-600 text-white shadow-xl shadow-brand-100" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-brand-600"
                )}
              >
                <item.icon className={cn("w-5 h-5 lg:w-6 lg:h-6 transition-all", isActive ? "scale-110" : "group-hover:scale-110")} />
                <span className={cn(
                  "ml-3 lg:ml-4 font-bold transition-all duration-300 text-sm lg:text-base",
                  (!isSidebarOpen && !isMobile) && "opacity-0 invisible w-0"
                )}>
                  {item.label}
                </span>
                {isActive && (isSidebarOpen || isMobile) && (
                  <motion.div layoutId="active" className="absolute right-4 w-1.5 h-1.5 lg:w-2 lg:h-2 bg-white rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-50">
          <Link
            to="/"
            className={cn(
              "flex items-center p-3 lg:p-4 rounded-2xl lg:rounded-3xl text-gray-400 hover:text-brand-600 hover:bg-gray-50 transition-all",
              (!isSidebarOpen && !isMobile) && "justify-center"
            )}
          >
            <Home className="w-5 h-5 lg:w-6 lg:h-6" />
            <span className={cn("ml-3 lg:ml-4 font-bold text-sm lg:text-base", (!isSidebarOpen && !isMobile) && "hidden")}>Back to Store</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-73px)] lg:h-screen custom-scrollbar relative z-0">
        <div className="max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
      <Toaster position="top-center" richColors duration={1000} />
    </div>
  );
};
