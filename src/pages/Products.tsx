import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Search, Filter, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from '../components/Logo';

const CATEGORIES = ['All', 'Fruits', 'Vegetables', 'Dairy', 'Bakery', 'Snacks', 'Beverages', 'Cosmetics'];

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high'>('newest');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const allProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(allProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const price = p.discountPrice !== undefined && p.discountPrice !== null ? p.discountPrice : p.price;
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
      return matchesSearch && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      const priceA = a.discountPrice !== undefined && a.discountPrice !== null ? a.discountPrice : a.price;
      const priceB = b.discountPrice !== undefined && b.discountPrice !== null ? b.discountPrice : b.price;
      if (sortBy === 'price-low') return priceA - priceB;
      if (sortBy === 'price-high') return priceB - priceA;
      return 0; // newest logic would need createdAt
    });

  return (
    <div className="container-wide py-8 lg:py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 lg:gap-10 mb-8 lg:mb-16">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-3 lg:mb-4">
            <div className="w-6 lg:w-8 h-[2px] bg-brand-600" />
            <span className="text-[10px] lg:text-xs font-black text-brand-600 uppercase tracking-[0.3em]">Premium Selection</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-black text-gray-900 mb-4 lg:mb-6 tracking-tight leading-none">
            Our <span className="text-brand-600 stylish-text">Store</span>
          </h1>
          <p className="text-base lg:text-lg text-gray-500 font-medium leading-relaxed">
            Discover our curated collection of fresh, organic, and premium groceries delivered straight to your doorstep.
          </p>
        </div>
        
        <div className="relative flex-grow max-w-xl group w-full">
          <Search className="absolute left-5 lg:left-6 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5 group-focus-within:text-brand-600 transition-colors" />
          <input
            type="text"
            placeholder="Search for items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-5 py-4 lg:pl-14 lg:pr-6 lg:py-5 bg-white border border-gray-100 rounded-2xl lg:rounded-[2rem] shadow-sm focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none text-base lg:text-lg font-medium placeholder:text-gray-300"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-72 space-y-6 lg:space-y-12">
          <div className="bg-gray-50/50 p-6 lg:p-8 rounded-3xl lg:rounded-[2.5rem] border border-gray-100">
            <h3 className="font-display text-lg lg:text-xl font-bold text-gray-900 mb-6 lg:mb-8 flex items-center gap-3">
              <Filter className="w-4 h-4 lg:w-5 lg:h-5 text-brand-600" />
              Categories
            </h3>
            <div className="flex overflow-x-auto lg:flex-col gap-2 pb-2 lg:pb-0 hide-scrollbar">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "whitespace-nowrap lg:w-full text-left px-4 py-3 lg:px-5 lg:py-4 rounded-xl lg:rounded-2xl transition-all font-bold text-xs lg:text-sm tracking-wide uppercase flex-shrink-0",
                    selectedCategory === cat 
                      ? "bg-brand-600 text-white shadow-lg lg:shadow-xl shadow-brand-200 lg:translate-x-2" 
                      : "bg-white lg:bg-transparent text-gray-500 hover:bg-white hover:text-brand-600 lg:hover:translate-x-1 border border-gray-100 lg:border-none"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-50/50 p-6 lg:p-8 rounded-3xl lg:rounded-[2.5rem] border border-gray-100">
            <h3 className="font-display text-lg lg:text-xl font-bold text-gray-900 mb-6 lg:mb-8 flex items-center gap-3">
              <SlidersHorizontal className="w-4 h-4 lg:w-5 lg:h-5 text-brand-600" />
              Price Range
            </h3>
            <div className="px-2">
              <input
                type="range"
                min="0"
                max="2000"
                step="50"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
              <div className="flex justify-between mt-4 lg:mt-6">
                <div className="flex flex-col">
                  <span className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Min</span>
                  <span className="text-base lg:text-lg font-black text-gray-900">₹0</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Max</span>
                  <span className="text-base lg:text-lg font-black text-brand-600">₹{priceRange[1]}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50/50 p-6 lg:p-8 rounded-3xl lg:rounded-[2.5rem] border border-gray-100">
            <h3 className="font-display text-lg lg:text-xl font-bold text-gray-900 mb-4 lg:mb-8">Sort By</h3>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full appearance-none px-4 py-3 lg:px-6 lg:py-4 bg-white border border-gray-100 rounded-xl lg:rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 font-bold text-gray-700 text-xs lg:text-sm cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <ChevronDown className="absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-grow">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="bg-gray-50 animate-pulse rounded-2xl lg:rounded-[2.5rem] aspect-[4/5]" />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-8">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-32 bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-200">
              <div className="flex justify-center mb-8">
                <Logo size="md" />
              </div>
              <h3 className="font-display text-3xl font-black text-gray-900 mb-4 tracking-tight">No products found</h3>
              <p className="text-gray-500 font-medium max-w-xs mx-auto mb-10">
                We couldn't find any items matching your current filters. Try adjusting them!
              </p>
              <button 
                onClick={() => { setSearchTerm(''); setSelectedCategory('All'); setPriceRange([0, 2000]); }}
                className="px-8 py-4 bg-brand-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-700 transition-all shadow-xl shadow-brand-100 active:scale-95"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
