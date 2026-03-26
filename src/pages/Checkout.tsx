import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../lib/utils';
import { toast } from 'sonner';
import { MapPin, CreditCard, Truck, CheckCircle2, ArrowRight, ChevronLeft, Shield, Phone, Navigation } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export const Checkout: React.FC = () => {
  const { user, profile } = useAuth();
  const { items, totalPrice, deliveryFee, discountAmount, firstOrderDiscount, isFirstOrder, finalTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState(profile?.address || '');
  const [phone, setPhone] = useState(profile?.phone || (profile?.email?.endsWith('@smartbasket.app') ? profile.email.replace('@smartbasket.app', '') : ''));
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(profile?.location || null);
  const [isLocating, setIsLocating] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'COD'>('COD');

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        toast.success('Location captured successfully!');
        setIsLocating(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error('Failed to get location. Please allow location access.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }

    if (!address.trim()) {
      toast.error('Please enter your delivery address');
      return;
    }

    if (!phone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }

    if (!location) {
      toast.error('Please share your live location for delivery');
      return;
    }

    setLoading(true);
    try {
      const deliveryOtp = Math.floor(100000 + Math.random() * 900000).toString();

      const orderData = {
        userId: user.uid,
        userName: profile?.name || user.displayName || 'User',
        phone: phone,
        items: items,
        subtotal: totalPrice,
        discountAmount: discountAmount,
        deliveryFee: deliveryFee,
        totalPrice: finalTotal,
        status: 'Pending',
        paymentMethod: paymentMethod,
        address: address,
        location: location,
        deliveryOtp: deliveryOtp,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'orders'), orderData);
      clearCart();
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-wide py-8 lg:py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 lg:gap-10 mb-8 lg:mb-16">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-3 lg:mb-4">
            <div className="w-6 lg:w-8 h-[2px] bg-brand-600" />
            <span className="text-[10px] lg:text-xs font-black text-brand-600 uppercase tracking-[0.3em]">Final Step</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-black text-gray-900 tracking-tight leading-none">
            Check<span className="text-brand-600 stylish-text">out</span>
          </h1>
          <p className="text-base lg:text-lg text-gray-500 font-medium leading-relaxed mt-4 lg:mt-6">
            Review your items, choose your delivery address, and select a secure payment method to complete your order.
          </p>
        </div>
        
        <button 
          onClick={() => navigate(-1)} 
          className="group flex items-center justify-center gap-2 lg:gap-3 px-6 py-3 lg:px-8 lg:py-4 bg-gray-50 text-gray-600 rounded-xl lg:rounded-2xl font-black uppercase tracking-widest text-[10px] lg:text-xs hover:bg-gray-100 transition-all active:scale-95 w-full md:w-auto"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
        <div className="lg:col-span-2 space-y-8 lg:space-y-12">
          {/* Delivery Details */}
          <section className="bg-white rounded-3xl lg:rounded-[3rem] p-6 lg:p-10 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 lg:w-32 lg:h-32 bg-brand-50 rounded-full -translate-y-12 translate-x-12 lg:-translate-y-16 lg:translate-x-16 blur-2xl lg:blur-3xl opacity-50" />
            <div className="flex items-center gap-4 lg:gap-5 mb-6 lg:mb-10 relative">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-brand-50 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-inner flex-shrink-0">
                <MapPin className="w-6 h-6 lg:w-7 lg:h-7 text-brand-600" />
              </div>
              <div>
                <h2 className="font-display text-xl lg:text-2xl font-black text-gray-900 tracking-tight">Delivery Details</h2>
                <p className="text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Where should we send your groceries?</p>
              </div>
            </div>

            <div className="space-y-6 relative">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block px-1 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter your phone number"
                    className="w-full pl-12 lg:pl-16 pr-6 lg:pr-8 py-4 lg:py-5 bg-gray-50/50 border border-transparent rounded-xl lg:rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all font-bold text-sm lg:text-base text-gray-700"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block px-1 mb-2">Complete Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your complete delivery address (House No, Street, Landmark, City, Pincode)..."
                  className="w-full h-32 lg:h-40 p-6 lg:p-8 bg-gray-50/50 border border-transparent rounded-2xl lg:rounded-[2rem] outline-none focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all resize-none font-bold text-sm lg:text-base text-gray-700 leading-relaxed"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block px-1 mb-2">Live Location (Required for Delivery)</label>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    className={cn(
                      "flex items-center justify-center gap-2 px-6 py-4 rounded-xl lg:rounded-2xl font-black uppercase tracking-widest text-[10px] lg:text-xs transition-all w-full sm:w-auto",
                      location 
                        ? "bg-green-50 text-green-600 border border-green-200" 
                        : "bg-brand-50 text-brand-600 border border-brand-200 hover:bg-brand-100"
                    )}
                  >
                    {isLocating ? (
                      <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Navigation className="w-4 h-4" />
                    )}
                    {location ? "Location Captured ✓" : "Pin Live Location"}
                  </button>
                  {location && (
                    <p className="text-[10px] lg:text-xs font-bold text-gray-400">
                      Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Payment Method */}
          <section className="bg-white rounded-3xl lg:rounded-[3rem] p-6 lg:p-10 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 lg:w-32 lg:h-32 bg-brand-50 rounded-full -translate-y-12 translate-x-12 lg:-translate-y-16 lg:translate-x-16 blur-2xl lg:blur-3xl opacity-50" />
            <div className="flex items-center gap-4 lg:gap-5 mb-6 lg:mb-10 relative">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-brand-50 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-inner flex-shrink-0">
                <CreditCard className="w-6 h-6 lg:w-7 lg:h-7 text-brand-600" />
              </div>
              <div>
                <h2 className="font-display text-xl lg:text-2xl font-black text-gray-900 tracking-tight">Payment Method</h2>
                <p className="text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Choose your preferred way to pay</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-8 mb-6 lg:mb-10 relative">
              {[
                { id: 'COD', label: 'Cash on Delivery', desc: 'Pay when you receive', icon: Truck },
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => {
                    setPaymentMethod(method.id as any);
                  }}
                  className={cn(
                    "group flex flex-col items-start p-6 lg:p-8 rounded-2xl lg:rounded-[2.5rem] border-2 transition-all text-left relative overflow-hidden",
                    paymentMethod === method.id 
                      ? 'border-brand-600 bg-brand-50/30 shadow-xl lg:shadow-2xl shadow-brand-900/5' 
                      : 'border-gray-100 hover:border-brand-200 hover:bg-gray-50/50'
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center mb-4 lg:mb-6 transition-all",
                    paymentMethod === method.id ? 'bg-brand-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400 group-hover:bg-brand-50 group-hover:text-brand-600'
                  )}>
                    <method.icon className="w-5 h-5 lg:w-6 lg:h-6" />
                  </div>
                  
                  <div className="space-y-1">
                    <p className={cn(
                      "font-display text-base lg:text-lg font-black tracking-tight",
                      paymentMethod === method.id ? 'text-brand-700' : 'text-gray-900'
                    )}>
                      {method.label}
                    </p>
                    <p className="text-[10px] lg:text-xs text-gray-400 font-bold uppercase tracking-widest">{method.desc}</p>
                  </div>
                  
                  {paymentMethod === method.id && (
                    <div className="absolute top-4 right-4 lg:top-6 lg:right-6">
                      <CheckCircle2 className="w-5 h-5 lg:w-6 h-6 text-brand-600" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Order Review */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl lg:rounded-[3rem] p-6 lg:p-10 border border-gray-100 shadow-xl lg:shadow-2xl shadow-brand-900/5 sticky top-24 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 lg:h-2 bg-brand-600" />
            
            <h3 className="font-display text-xl lg:text-2xl font-black text-gray-900 mb-6 lg:mb-10 tracking-tight">Order Summary</h3>
            
            <div className="space-y-4 lg:space-y-6 mb-6 lg:mb-10 max-h-48 lg:max-h-60 overflow-y-auto pr-2 lg:pr-4 custom-scrollbar">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center group">
                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-50 rounded-lg lg:rounded-xl flex items-center justify-center text-[10px] lg:text-xs font-black text-brand-600 border border-gray-100 group-hover:bg-brand-50 transition-colors">
                      {item.quantity}x
                    </div>
                    <span className="text-xs lg:text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors truncate max-w-[100px] lg:max-w-[120px]">{item.name}</span>
                  </div>
                  <span className="text-xs lg:text-sm font-black text-gray-900">{formatCurrency((item.discountPrice !== undefined && item.discountPrice !== null ? item.discountPrice : item.price) * item.quantity)}</span>
                </div>
              ))}
            </div>
            
            <div className="space-y-4 lg:space-y-5 border-t border-gray-100 pt-6 lg:pt-8 mb-8 lg:mb-10">
              <div className="flex justify-between text-xs lg:text-sm font-bold text-gray-400 uppercase tracking-widest">
                <span>Subtotal</span>
                <span className="text-gray-900">{formatCurrency(totalPrice)}</span>
              </div>
              
              {discountAmount > 0 && (
                <div className="space-y-2">
                  {firstOrderDiscount > 0 && (
                    <div className="flex justify-between text-xs lg:text-sm font-bold text-orange-500 uppercase tracking-widest">
                      <span>First Order (20% OFF)</span>
                      <span>-{formatCurrency(firstOrderDiscount)}</span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex justify-between text-xs lg:text-sm font-bold text-gray-400 uppercase tracking-widest">
                <span>Delivery</span>
                <span className={cn(
                  "font-black",
                  deliveryFee === 0 ? "text-brand-600" : "text-gray-900"
                )}>
                  {deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee)}
                </span>
              </div>
              
              <div className="flex justify-between items-end pt-4 lg:pt-6 border-t border-gray-50">
                <span className="text-[10px] lg:text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Total Amount</span>
                <span className="font-display text-3xl lg:text-4xl font-black text-brand-600 italic tracking-tight">{formatCurrency(finalTotal)}</span>
              </div>
            </div>
            
            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full bg-brand-600 text-white py-4 lg:py-6 rounded-2xl lg:rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs lg:text-sm hover:bg-brand-700 transition-all shadow-xl lg:shadow-2xl shadow-brand-100 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              {loading ? (
                <div className="w-5 h-5 lg:w-6 lg:h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Confirm Order
                  <ArrowRight className="ml-2 lg:ml-3 w-4 h-4 lg:w-5 lg:h-5 group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </button>
            
            <div className="mt-6 lg:mt-8 flex items-center justify-center gap-2 text-[9px] lg:text-[10px] font-black text-gray-300 uppercase tracking-widest">
              <Shield className="w-3 h-3" />
              Secure Checkout Guaranteed
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
