import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, updateDoc, doc, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase';
import { Order, OrderStatus } from '../../types';
import { formatCurrency, cn } from '../../lib/utils';
import { Package, Clock, CheckCircle2, Truck, Search, ChevronRight, MapPin, CreditCard, X, FileText, Phone, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { BillModal } from '../../components/BillModal';
import { Logo } from '../../components/Logo';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);

  const [otpInput, setOtpInput] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(fetchedOrders);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching orders:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    if (newStatus === 'Delivered') {
      const order = orders.find(o => o.id === orderId);
      if (order?.deliveryOtp && otpInput !== order.deliveryOtp) {
        toast.error('Invalid Delivery OTP');
        return;
      }
    }

    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      setOtpInput('');
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const filteredOrders = orders.filter(o => 
    o.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="container-wide py-16 space-y-10 bg-[#fcfcfc] min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest mb-4 border border-green-100">
            <div className="w-1 h-1 rounded-full bg-green-600 animate-pulse" />
            <span>Live Fulfillment</span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-black text-gray-900 tracking-tighter leading-none">
            Order <span className="text-green-600 stylish-text">Fulfillment</span>
          </h1>
          <p className="text-lg text-gray-500 mt-6 font-medium">Track and manage customer orders in real-time.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-green-600 transition-colors" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-6 py-3.5 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all w-64 md:w-80 font-medium text-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Order List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Order ID</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Customer</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Amount</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredOrders.map((order) => (
                    <tr 
                      key={order.id} 
                      onClick={() => setSelectedOrder(order)}
                      className={cn(
                        "hover:bg-gray-50/80 transition-all cursor-pointer group relative",
                        selectedOrder?.id === order.id && "bg-green-50/40"
                      )}
                    >
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-black text-gray-900 text-sm tracking-tight">#{order.id.slice(0, 8).toUpperCase()}</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">{format(new Date(order.createdAt), 'MMM dd, hh:mm a')}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 text-sm">{order.userName}</span>
                          <span className="text-[11px] text-gray-400 truncate max-w-[180px] font-medium mt-0.5">{order.address}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="font-black text-gray-900">{formatCurrency(order.totalPrice)}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className={cn(
                          "inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider",
                          getStatusColor(order.status)
                        )}>
                          {React.cloneElement(getStatusIcon(order.status) as React.ReactElement, { className: "w-3 h-3" })}
                          <span>{order.status}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all ml-auto">
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Order Details Panel */}
        <div className="lg:col-span-4">
          <AnimatePresence mode="wait">
            {selectedOrder ? (
              <motion.div
                key={selectedOrder.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-2xl shadow-gray-200/50 sticky top-24"
              >
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Order <span className="text-green-600">Summary</span></h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">ID: {selectedOrder.id.toUpperCase()}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setIsBillModalOpen(true)}
                      className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-green-50 hover:text-green-600 transition-all border border-gray-100"
                      title="View Invoice"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setSelectedOrder(null)} 
                      className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all border border-gray-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Status Update */}
                  <div className="p-6 bg-gray-50/50 rounded-3xl border border-gray-100">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Update Fulfillment</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Pending', 'Packed', 'Delivered'] as OrderStatus[]).map(status => (
                        <button
                          key={status}
                          onClick={() => updateStatus(selectedOrder.id, status)}
                          className={cn(
                            "py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border-2",
                            selectedOrder.status === status 
                              ? "bg-green-600 border-green-600 text-white shadow-lg shadow-green-200" 
                              : "bg-white border-gray-100 text-gray-400 hover:border-green-200 hover:text-green-600"
                          )}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                    {selectedOrder.status !== 'Delivered' && (
                      <div className="mt-6 space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block px-1">Delivery Verification OTP</label>
                        <input
                          type="text"
                          maxLength={6}
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                          placeholder="0 0 0 0 0 0"
                          className="w-full px-4 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all font-mono text-center text-xl tracking-[0.5em] font-black"
                        />
                      </div>
                    )}
                  </div>

                  {/* Delivery Info */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center">
                        <MapPin className="w-3 h-3 mr-2 text-green-600" /> Delivery Address
                      </h4>
                    </div>
                    <div className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-3">
                      <div>
                        <p className="text-xs text-gray-700 font-bold leading-relaxed">
                          {selectedOrder.userName}
                        </p>
                        <p className="text-[11px] text-gray-500 font-medium mt-1 leading-relaxed">
                          {selectedOrder.address}
                        </p>
                      </div>
                      
                      {selectedOrder.phone && (
                        <div className="flex items-center gap-2 text-gray-600 pt-2 border-t border-gray-100">
                          <Phone className="w-3 h-3" />
                          <a href={`tel:${selectedOrder.phone}`} className="text-[11px] font-bold hover:text-green-600 transition-colors">
                            {selectedOrder.phone}
                          </a>
                        </div>
                      )}

                      {selectedOrder.location && (
                        <div className="flex items-center gap-2 text-gray-600 pt-2 border-t border-gray-100">
                          <Navigation className="w-3 h-3" />
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${selectedOrder.location.lat},${selectedOrder.location.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
                          >
                            View on Google Maps
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Order Items</h4>
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-gray-50/30 rounded-xl border border-gray-50">
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-800 font-bold">{item.name}</span>
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Qty: {item.quantity}</span>
                          </div>
                          <span className="text-xs font-black text-gray-900">{formatCurrency((item.discountPrice !== undefined && item.discountPrice !== null ? item.discountPrice : item.price) * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="pt-6 border-t border-gray-100 space-y-3">
                    <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      <span>Subtotal</span>
                      <span className="text-gray-900">{formatCurrency(selectedOrder.subtotal || selectedOrder.totalPrice - (selectedOrder.deliveryFee || 0) + (selectedOrder.discountAmount || 0))}</span>
                    </div>
                    {selectedOrder.discountAmount > 0 && (
                      <div className="flex justify-between text-[11px] font-bold text-orange-500 uppercase tracking-wider">
                        <span>Discount</span>
                        <span>-{formatCurrency(selectedOrder.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      <span>Delivery</span>
                      <span className={cn((selectedOrder.deliveryFee || 0) === 0 ? "text-green-600" : "text-gray-900")}>
                        {(selectedOrder.deliveryFee || 0) === 0 ? 'FREE' : formatCurrency(selectedOrder.deliveryFee || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-end pt-4">
                      <span className="text-gray-900 font-black text-xs uppercase tracking-widest">Total Amount</span>
                      <span className="text-4xl font-black text-green-600 tracking-tighter">{formatCurrency(selectedOrder.totalPrice)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white rounded-[2.5rem] p-12 border border-gray-100 shadow-sm text-center sticky top-24 flex flex-col items-center justify-center min-h-[400px]">
                <div className="flex justify-center mb-6">
                  <Logo size="md" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">Select an Order</h3>
                <p className="text-xs text-gray-400 font-medium max-w-[200px] leading-relaxed">
                  Click on any order from the list to view full details and manage fulfillment.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {selectedOrder && (
        <BillModal
          order={selectedOrder}
          isOpen={isBillModalOpen}
          onClose={() => setIsBillModalOpen(false)}
        />
      )}
    </div>
  );
};
