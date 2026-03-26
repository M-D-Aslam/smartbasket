import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Plus, Star } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  const { addToCart, items, updateQuantity } = useCart();
  const cartItem = items.find(item => item.id === product.id);
  const quantity = cartItem?.quantity || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn("group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden", className)}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {product.discountPrice !== undefined && product.discountPrice !== null && product.discountPrice < product.price && (
          <div className="absolute top-4 left-4 bg-brand-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-xl uppercase tracking-wider">
            {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
          </div>
        )}
        
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-full shadow-lg transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[9px] sm:text-[10px] font-black text-brand-600 uppercase tracking-[0.2em] bg-brand-50 px-2 py-0.5 rounded-md">
            {product.category}
          </span>
        </div>
        
        <h3 className="font-display text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-1 group-hover:text-brand-600 transition-colors duration-300">
          {product.name}
        </h3>

        <div className="flex items-end justify-between mt-auto">
          <div className="flex flex-col">
            {product.discountPrice !== undefined && product.discountPrice !== null && product.discountPrice < product.price ? (
              <>
                <span className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-none">
                  {formatCurrency(product.discountPrice)}
                </span>
                <span className="text-xs sm:text-sm text-gray-400 line-through mt-1">
                  {formatCurrency(product.price)}
                </span>
              </>
            ) : (
              <span className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-none">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
          
          <div className="relative">
            {quantity > 0 ? (
              <div className="flex items-center bg-gray-50 p-1 rounded-xl sm:rounded-2xl border border-gray-100 shadow-inner">
                <button
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-white rounded-lg sm:rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm active:scale-90"
                >
                  <span className="font-black text-base sm:text-lg">-</span>
                </button>
                <span className="w-6 sm:w-8 text-center font-black text-gray-900 text-xs sm:text-sm">{quantity}</span>
                <button
                  onClick={() => addToCart(product)}
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-brand-600 rounded-lg sm:rounded-xl text-white hover:bg-brand-700 transition-all shadow-md active:scale-90"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 stroke-[3]" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => addToCart(product)}
                disabled={product.stock <= 0}
                className={cn(
                  "w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl sm:rounded-2xl transition-all duration-500 shadow-xl group/btn",
                  product.stock > 0 
                    ? "bg-brand-600 text-white hover:bg-brand-700 hover:shadow-brand-200 hover:scale-110 active:scale-95" 
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                )}
              >
                <Plus className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3] group-hover/btn:rotate-90 transition-transform duration-500" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
          {product.stock <= 5 && product.stock > 0 ? (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <p className="text-[9px] sm:text-[10px] text-red-500 font-black uppercase tracking-wider">Only {product.stock} left</p>
            </div>
          ) : product.stock === 0 ? (
            <p className="text-[9px] sm:text-[10px] text-gray-400 font-black uppercase tracking-wider">Out of stock</p>
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
              <p className="text-[9px] sm:text-[10px] text-brand-600 font-black uppercase tracking-wider">In Stock</p>
            </div>
          )}
          
          <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-wider">
            <ShoppingCart className="w-3 h-3" />
            <span>Fast Delivery</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
