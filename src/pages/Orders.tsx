import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { Package, Truck, CheckCircle2, Clock, ChevronRight, ShoppingBag, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { BillModal } from '../components/BillModal';
import { Logo } from '../components/Logo';

export const Orders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBillOrder, setSelectedBillOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(fetchedOrders);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching orders:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock className="w-5 h-5" />;
      case 'Packed': return <Package className="w-5 h-5" />;
      case 'Delivered': return <CheckCircle2 className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
      case 'Packed': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Delivered': return 'bg-green-50 text-green-600 border-green-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-[40px]" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container-wide py-32 text-center">
        <div className="flex justify-center mb-10">
          <Logo size="lg" />
        </div>
        <h2 className="text-5xl font-black text-gray-900 mb-6 tracking-tight">No orders <span className="text-brand-600 stylish-text">yet</span></h2>
        <p className="text-gray-500 mb-10 max-w-md mx-auto leading-relaxed">
          You haven't placed any orders yet. Start shopping and get fresh groceries delivered!
        </p>
      </div>
    );
  }

  return (
    <div className="container-wide py-8 lg:py-16">
      <div className="mb-8 lg:mb-16">
        <div className="flex items-center gap-2 mb-3 lg:mb-4">
          <div className="w-6 lg:w-8 h-[2px] bg-brand-600" />
          <span className="text-[10px] lg:text-xs font-black text-brand-600 uppercase tracking-[0.3em]">Order History</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-none">
          My <span className="text-brand-600 stylish-text">Orders</span>
        </h1>
      </div>
      
      <div className="space-y-8 lg:space-y-12">
        {orders.map((order) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl lg:rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-500 group"
          >
            <div className="p-6 lg:p-10 md:p-12">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-10 mb-8 lg:mb-12 pb-8 lg:pb-12 border-b border-gray-50">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-10 flex-grow">
                  <div className="space-y-1 lg:space-y-2">
                    <p className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Order ID</p>
                    <p className="text-sm lg:text-lg font-black text-gray-900 tracking-tight">#{order.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div className="space-y-1 lg:space-y-2">
                    <p className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Placed On</p>
                    <p className="text-sm lg:text-lg font-bold text-gray-700">{format(new Date(order.createdAt), 'MMM dd, yyyy')}</p>
                  </div>
                  <div className="space-y-1 lg:space-y-2">
                    <p className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Total Amount</p>
                    <p className="text-lg lg:text-2xl font-black text-brand-600 tracking-tight">{formatCurrency(order.totalPrice)}</p>
                  </div>
                  <div className="space-y-1 lg:space-y-2">
                    <p className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</p>
                    <div className={cn(
                      "inline-flex items-center gap-1.5 lg:gap-2 px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg lg:rounded-xl border text-[10px] lg:text-xs font-black uppercase tracking-widest",
                      getStatusColor(order.status)
                    )}>
                      {getStatusIcon(order.status)}
                      <span>{order.status}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 mt-4 lg:mt-0">
                  <button
                    onClick={() => setSelectedBillOrder(order)}
                    className="flex items-center justify-center gap-2 lg:gap-3 px-6 py-3 lg:px-8 lg:py-4 rounded-xl lg:rounded-2xl bg-gray-50 text-gray-600 font-black uppercase tracking-widest text-[9px] lg:text-[10px] hover:bg-brand-600 hover:text-white hover:shadow-xl hover:shadow-brand-100 transition-all active:scale-95 w-full sm:w-auto"
                  >
                    <FileText className="w-3 h-3 lg:w-4 lg:h-4" />
                    <span>Download Invoice</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
                <div>
                  <h3 className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 lg:mb-8 flex items-center gap-2 lg:gap-3">
                    <ShoppingBag className="w-3 h-3 lg:w-4 lg:h-4 text-brand-600" />
                    Items Ordered
                  </h3>
                  <div className="space-y-4 lg:space-y-6">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 lg:gap-6 group/item">
                        <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gray-50 rounded-xl lg:rounded-2xl overflow-hidden flex-shrink-0 shadow-inner">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-grow">
                          <p className="font-display text-base lg:text-lg font-bold text-gray-900 group-hover/item:text-brand-600 transition-colors">{item.name}</p>
                          <p className="text-xs lg:text-sm text-gray-500 font-medium">{item.quantity} x {formatCurrency(item.discountPrice !== undefined && item.discountPrice !== null ? item.discountPrice : item.price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gray-50/50 rounded-2xl lg:rounded-[2.5rem] p-6 lg:p-10 border border-gray-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 lg:w-32 lg:h-32 bg-brand-50 rounded-full -translate-y-12 translate-x-12 lg:-translate-y-16 lg:translate-x-16 blur-2xl lg:blur-3xl opacity-50" />
                  
                  <h3 className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 lg:mb-8 flex items-center gap-2 lg:gap-3">
                    <Truck className="w-3 h-3 lg:w-4 lg:h-4 text-brand-600" />
                    Delivery Details
                  </h3>
                  
                  <div className="space-y-6 lg:space-y-8">
                    <div>
                      <p className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 lg:mb-2">Shipping Address</p>
                      <p className="text-gray-700 font-medium leading-relaxed text-xs lg:text-sm">{order.address}</p>
                    </div>
                    
                    <div className="pt-6 lg:pt-8 border-t border-gray-100 space-y-3 lg:space-y-4">
                      <div className="flex justify-between items-center text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <span>Subtotal</span>
                        <span className="text-gray-900 text-xs lg:text-sm">{formatCurrency(order.subtotal || order.totalPrice - (order.deliveryFee || 0) + (order.discountAmount || 0))}</span>
                      </div>
                      
                      {order.discountAmount > 0 && (
                        <div className="flex justify-between items-center text-[9px] lg:text-[10px] font-black text-orange-600 uppercase tracking-widest">
                          <span>Discount Applied</span>
                          <span className="text-xs lg:text-sm">-{formatCurrency(order.discountAmount)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <span>Delivery Fee</span>
                        <span className={cn("text-xs lg:text-sm", (order.deliveryFee || 0) === 0 ? "text-brand-600" : "text-gray-900")}>
                          {(order.deliveryFee || 0) === 0 ? 'FREE' : formatCurrency(order.deliveryFee || 0)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center pt-4 lg:pt-6 border-t border-gray-100">
                        <span className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Total Paid</span>
                        <span className="text-2xl lg:text-3xl font-black text-brand-600 tracking-tighter">{formatCurrency(order.totalPrice)}</span>
                      </div>
                    </div>

                    {order.status !== 'Delivered' && order.deliveryOtp && (
                      <div className="mt-8 lg:mt-10 p-6 lg:p-8 bg-brand-600 rounded-2xl lg:rounded-[2rem] text-center shadow-xl shadow-brand-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                          <CheckCircle2 className="w-12 h-12 lg:w-16 lg:h-16 text-white" />
                        </div>
                        <p className="text-[9px] lg:text-[10px] font-black text-brand-100 uppercase tracking-[0.3em] mb-2 lg:mb-3">Delivery OTP</p>
                        <p className="text-3xl lg:text-4xl font-black text-white tracking-[0.4em] mb-3 lg:mb-4">{order.deliveryOtp}</p>
                        <p className="text-[9px] lg:text-[10px] text-brand-100 font-bold uppercase tracking-widest leading-relaxed max-w-[200px] mx-auto">
                          Share this code with the delivery partner only at the time of delivery.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {selectedBillOrder && (
        <BillModal
          order={selectedBillOrder}
          isOpen={!!selectedBillOrder}
          onClose={() => setSelectedBillOrder(null)}
        />
      )}
    </div>
  );
};
