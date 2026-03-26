import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, limit, getDocs, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Product, StoreSettings } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ArrowRight, Truck, ShieldCheck, Zap, Sparkles, ShoppingBag, Megaphone } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { Logo } from '../components/Logo';
import { useCart } from '../context/CartContext';

export const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { freeDeliveryThreshold } = useCart();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(collection(db, 'products'), limit(4));
        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setFeaturedProducts(products);
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div className="pb-20 lg:pb-32">
      <div className="bg-brand-50">
      {/* Modern Full-Width Hero Section */}
      <section className="relative min-h-[80vh] lg:min-h-[90vh] flex items-center justify-center overflow-hidden pt-20 lg:pt-0 bg-gradient-to-br from-brand-50 via-white to-orange-50">
        {/* Aesthetic Colorful Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-brand-300/60 to-purple-300/60 blur-[120px] mix-blend-multiply animate-blob" />
          <div className="absolute top-[10%] right-[-10%] w-[50%] h-[70%] rounded-full bg-gradient-to-bl from-orange-300/60 to-brand-300/60 blur-[120px] mix-blend-multiply animate-blob animation-delay-2000" />
          <div className="absolute bottom-[-20%] left-[10%] w-[70%] h-[60%] rounded-full bg-gradient-to-tr from-blue-300/60 to-brand-300/60 blur-[120px] mix-blend-multiply animate-blob animation-delay-4000" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/noise-pattern-with-subtle-cross-lines.png')] opacity-[0.04] mix-blend-overlay"></div>
        </div>

        <div className="container-wide w-full relative z-10 flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center space-x-2 lg:space-x-3 bg-white/80 backdrop-blur-md text-brand-700 px-5 py-2.5 lg:px-8 lg:py-4 rounded-full text-sm lg:text-base font-bold mb-8 lg:mb-12 border border-brand-100 shadow-xl shadow-brand-500/10">
              <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 fill-brand-700" />
              <span className="stylish-text">Freshness Delivered. Smartly.</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[90px] font-black text-gray-900 leading-[1.1] lg:leading-[0.9] tracking-tighter mb-8 lg:mb-12">
              Fresh <span className="text-brand-500 stylish-text">Groceries</span><br />
              at your <span className="relative inline-block stylish-text">
                Doorstep
                <svg className="absolute -bottom-2 lg:-bottom-4 left-0 w-full h-3 lg:h-5 text-brand-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 25 0, 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-10 lg:mb-14 leading-relaxed max-w-2xl font-medium mx-auto">
              Experience the smartest way to shop for your daily essentials. High-quality produce delivered with speed and care.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 w-full sm:w-auto justify-center">
              <Link 
                to="/products" 
                className="bg-brand-600 text-white px-8 py-4 lg:px-12 lg:py-5 rounded-2xl lg:rounded-3xl font-bold text-lg lg:text-xl hover:bg-brand-700 transition-all shadow-2xl shadow-brand-500/30 flex items-center justify-center group"
              >
                Start Shopping
                <ArrowRight className="ml-2 w-5 h-5 lg:w-6 lg:h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/orders" 
                className="bg-white/80 backdrop-blur-md text-gray-900 border-2 border-gray-200/50 px-8 py-4 lg:px-12 lg:py-5 rounded-2xl lg:rounded-3xl font-bold text-lg lg:text-xl hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all flex items-center justify-center"
              >
                Track Order
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      </div>

      <div className="space-y-20 lg:space-y-32 mt-20 lg:mt-32">
      {/* Features - Bento Grid Style */}
      <section className="container-wide">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Truck, title: "Free Delivery", desc: `On orders above ₹${freeDeliveryThreshold}`, color: "bg-blue-50 text-blue-600", border: "border-blue-100" },
            { icon: Zap, title: "20% Off First Order", desc: "Special discount for you", color: "bg-orange-50 text-orange-600", border: "border-orange-100" },
            { icon: ShieldCheck, title: "Quality Assured", desc: "Freshness guaranteed", color: "bg-brand-50 text-brand-600", border: "border-brand-100" },
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "group p-10 bg-white rounded-5xl border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500",
                feature.border
              )}
            >
              <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500", feature.color)}>
                <feature.icon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-500 font-medium">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container-wide">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 lg:mb-16">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 text-brand-600 font-black uppercase tracking-[0.2em] text-[10px] lg:text-xs mb-3 lg:mb-4">
              <div className="w-8 lg:w-10 h-[2px] bg-brand-600" />
              Our Selection
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight">
              Fresh <span className="text-brand-500">Picks</span> for You
            </h2>
          </div>
          <Link to="/products" className="group flex items-center gap-2 lg:gap-3 bg-gray-900 text-white px-6 py-3 lg:px-8 lg:py-4 rounded-xl lg:rounded-2xl font-bold hover:bg-brand-600 transition-all shadow-xl text-sm lg:text-base">
            View All Products
            <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-10">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-100 animate-pulse rounded-3xl lg:rounded-5xl h-[250px] lg:h-[400px]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-10">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Modern CTA Banner */}
      <section className="container-wide">
        <div className="bg-gray-900 rounded-[2rem] lg:rounded-6xl p-8 md:p-16 lg:p-24 relative overflow-hidden shadow-2xl lg:shadow-6xl shadow-gray-200">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-brand-500/10 text-brand-400 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full text-[10px] lg:text-xs font-black uppercase tracking-widest mb-6 lg:mb-8 border border-brand-500/20">
              <ShoppingBag className="w-3 h-3 lg:w-4 lg:h-4" />
              Shop Smart
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-6 lg:mb-8 leading-[1.1] lg:leading-[0.9] tracking-tighter">
              Ready to <br className="hidden sm:block" />
              <span className="text-brand-500">Shop Smart?</span>
            </h2>
            <p className="text-gray-400 text-base lg:text-xl mb-8 lg:mb-12 leading-relaxed font-medium">
              Join thousands of happy customers getting fresh groceries delivered daily. Your first order comes with a special 20% discount.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 lg:gap-6">
              <Link to="/products" className="bg-brand-500 text-white px-8 py-4 lg:px-12 lg:py-5 rounded-2xl lg:rounded-3xl font-bold text-base lg:text-xl hover:bg-brand-600 transition-all shadow-xl lg:shadow-2xl shadow-brand-500/20 text-center">
                Get Started Now
              </Link>
            </div>
          </div>
          
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:block opacity-20">
            <div className="absolute inset-0 bg-gradient-to-l from-gray-900 via-gray-900/80 to-transparent z-10" />
          </div>
          
          <div className="absolute -bottom-12 -right-12 lg:-bottom-24 lg:-right-24 w-64 h-64 lg:w-96 lg:h-96 bg-brand-500/10 rounded-full blur-3xl" />
          <div className="absolute -top-12 -left-12 lg:-top-24 lg:-left-24 w-64 h-64 lg:w-96 lg:h-96 bg-brand-500/5 rounded-full blur-3xl" />
        </div>
      </section>
      </div>
    </div>
  );
};
