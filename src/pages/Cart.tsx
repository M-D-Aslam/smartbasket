import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ChevronLeft, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from '../components/Logo';

export const Cart: React.FC = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, totalItems, deliveryFee, discountAmount, firstOrderDiscount, isFirstOrder, finalTotal, freeDeliveryThreshold } = useCart();
  const navigate = useNavigate();

  const progress = Math.min(((totalPrice - discountAmount) / freeDeliveryThreshold) * 100, 100);
  const remainingForFree = Math.max(0, freeDeliveryThreshold - (totalPrice - discountAmount));

  if (items.length === 0) {
    return (
      <div className="container-wide py-32 text-center">
        <div className="flex justify-center mb-10">
          <Logo size="lg" />
        </div>
        <h2 className="text-5xl font-black text-gray-900 mb-6 tracking-tight">Your cart is <span className="text-brand-600 stylish-text">empty</span></h2>
        <p className="text-gray-500 mb-10 max-w-md mx-auto leading-relaxed">
          Looks like you haven't added anything to your cart yet. Start exploring our fresh groceries!
        </p>
        <Link 
          to="/products" 
          className="bg-brand-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-brand-700 transition-all shadow-xl shadow-brand-100 inline-flex items-center group"
        >
          Start Shopping
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container-wide py-8 lg:py-16">
      <div className="flex items-center gap-4 lg:gap-6 mb-8 lg:mb-16">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center bg-white border border-gray-100 rounded-xl lg:rounded-2xl hover:bg-gray-50 hover:scale-110 transition-all shadow-sm"
        >
          <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600" />
        </button>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 lg:w-6 h-[2px] bg-brand-600" />
            <span className="text-[9px] lg:text-[10px] font-black text-brand-600 uppercase tracking-[0.3em]">Your Selection</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-6xl font-black text-gray-900 tracking-tight">
            Shopping <span className="text-brand-600 stylish-text">Cart</span>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 lg:p-8 bg-white rounded-3xl lg:rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="w-32 h-32 lg:w-40 lg:h-40 bg-gray-50 rounded-2xl lg:rounded-3xl overflow-hidden flex-shrink-0 shadow-inner">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                    referrerPolicy="no-referrer"
                  />
                </div>
                
                <div className="flex-grow text-center sm:text-left w-full sm:w-auto">
                  <span className="text-[9px] lg:text-[10px] font-black text-brand-600 uppercase tracking-widest bg-brand-50 px-2.5 py-1 rounded-lg mb-2 lg:mb-3 inline-block">
                    {item.category}
                  </span>
                  <h3 className="font-display text-xl lg:text-2xl font-bold text-gray-900 mb-1 lg:mb-2 group-hover:text-brand-600 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xl lg:text-2xl font-black text-gray-900 tracking-tight">
                    {formatCurrency(item.discountPrice !== undefined && item.discountPrice !== null ? item.discountPrice : item.price)}
                  </p>
                  
                  <div className="flex items-center justify-between sm:justify-start gap-4 mt-6 sm:mt-4">
                    <div className="flex items-center bg-gray-50 p-1 lg:p-1.5 rounded-xl lg:rounded-2xl border border-gray-100 shadow-inner">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center bg-white rounded-lg lg:rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm active:scale-90"
                      >
                        <Minus className="w-4 h-4 lg:w-5 lg:h-5" />
                      </button>
                      <span className="w-8 lg:w-10 text-center font-black text-gray-900 text-base lg:text-lg">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center bg-brand-600 rounded-lg lg:rounded-xl text-white hover:bg-brand-700 transition-all shadow-md active:scale-90"
                      >
                        <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-3 lg:p-5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl lg:rounded-[2rem] transition-all active:scale-90"
                    >
                      <Trash2 className="w-5 h-5 lg:w-6 lg:h-6" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-10 border border-gray-100 shadow-xl lg:shadow-2xl sticky top-24 overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 lg:w-32 lg:h-32 bg-brand-50 rounded-full -translate-y-12 translate-x-12 lg:-translate-y-16 lg:translate-x-16 blur-2xl lg:blur-3xl opacity-50" />
            
            <h3 className="font-display text-xl lg:text-2xl font-black text-gray-900 mb-6 lg:mb-10 tracking-tight">Order Summary</h3>
            
            {isFirstOrder && (
              <div className="mb-6 lg:mb-10 p-4 lg:p-6 bg-orange-50 rounded-2xl lg:rounded-[2rem] border border-orange-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-110 transition-transform">
                  <Zap className="w-8 h-8 lg:w-12 lg:h-12 text-orange-600" />
                </div>
                <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
                  <Zap className="w-4 h-4 lg:w-5 lg:h-5 text-orange-600 fill-orange-600" />
                  <span className="text-[9px] lg:text-[10px] font-black text-orange-700 uppercase tracking-[0.2em]">First Order Bonus!</span>
                </div>
                <p className="text-[10px] lg:text-xs text-orange-600 font-bold uppercase tracking-widest leading-relaxed">
                  You're getting a 20% discount on your first order. Welcome to SmartBasket!
                </p>
              </div>
            )}

            {(totalPrice - discountAmount) < freeDeliveryThreshold && (
              <div className="mb-6 lg:mb-10 p-4 lg:p-6 bg-brand-50/50 rounded-2xl lg:rounded-[2rem] border border-brand-100">
                <div className="flex justify-between text-[9px] lg:text-[10px] font-black text-brand-700 uppercase tracking-[0.2em] mb-2 lg:mb-3">
                  <span>Free Delivery Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 lg:h-2.5 bg-brand-100 rounded-full overflow-hidden shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-brand-600 rounded-full shadow-lg"
                  />
                </div>
                <p className="text-[9px] lg:text-[10px] text-brand-600 font-black mt-3 lg:mt-4 uppercase tracking-[0.2em]">
                  Add {formatCurrency(remainingForFree)} more for free delivery!
                </p>
              </div>
            )}

            <div className="space-y-4 lg:space-y-6 mb-8 lg:mb-10">
              <div className="flex justify-between text-gray-500 font-bold uppercase tracking-widest text-[9px] lg:text-[10px]">
                <span>Items ({totalItems})</span>
                <span className="text-gray-900 text-xs lg:text-sm">{formatCurrency(totalPrice)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="space-y-2">
                  {firstOrderDiscount > 0 && (
                    <div className="flex justify-between text-orange-600 font-bold uppercase tracking-widest text-[9px] lg:text-[10px]">
                      <span>First Order (20% OFF)</span>
                      <span className="text-xs lg:text-sm">-{formatCurrency(firstOrderDiscount)}</span>
                    </div>
                  )}
                </div>
              )}
              <div className="flex justify-between text-gray-500 font-bold uppercase tracking-widest text-[9px] lg:text-[10px]">
                <span>Delivery Fee</span>
                <span className={cn("text-xs lg:text-sm", deliveryFee === 0 ? "text-brand-600" : "text-gray-900")}>
                  {deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee)}
                </span>
              </div>
              <div className="border-t border-gray-100 pt-6 lg:pt-8 flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">Total Amount</span>
                  <span className="text-3xl lg:text-4xl font-black text-brand-600 tracking-tighter">{formatCurrency(finalTotal)}</span>
                </div>
              </div>
            </div>

            <Link
              to="/checkout"
              className="w-full bg-brand-600 text-white py-4 lg:py-6 rounded-2xl lg:rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs lg:text-sm hover:bg-brand-700 transition-all shadow-xl lg:shadow-2xl shadow-brand-100 flex items-center justify-center group active:scale-95"
            >
              Proceed to Checkout
              <ArrowRight className="ml-2 lg:ml-3 w-4 h-4 lg:w-5 lg:h-5 group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
            
            <div className="mt-6 lg:mt-8 flex items-center justify-center gap-2 text-gray-400">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
              <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest">
                Secure checkout powered by SmartBasket
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
