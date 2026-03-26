import React from 'react';
import { Order } from '../types';
import { formatCurrency } from '../lib/utils';
import { format } from 'date-fns';
import { X, Download, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BillModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

export const BillModal: React.FC<BillModalProps> = ({ order, isOpen, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 print:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm print:hidden"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden print:shadow-none print:rounded-none print:max-w-none print:h-screen"
          >
            {/* Header - Hidden in Print */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center print:hidden">
              <h2 className="text-xl font-black text-gray-900">Order <span className="text-green-600">Invoice</span></h2>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handlePrint}
                  className="p-3 bg-gray-100 text-gray-600 rounded-2xl hover:bg-green-50 hover:text-green-600 transition-all"
                  title="Print Bill"
                >
                  <Printer className="w-5 h-5" />
                </button>
                <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-2xl transition-all">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Bill Content */}
            <div className="p-10 md:p-16 overflow-y-auto max-h-[80vh] print:max-h-none print:overflow-visible print:p-8" id="printable-bill">
              <div className="flex justify-between items-start mb-8 print:mb-6">
                <div>
                  <h1 className="text-3xl print:text-2xl font-black text-gray-900 mb-1 tracking-tighter">
                    Smart<span className="text-green-600">Basket</span>
                  </h1>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Freshness Delivered</p>
                </div>
                <div className="text-right">
                  <h3 className="text-lg font-black text-gray-900 uppercase">Invoice</h3>
                  <p className="text-xs font-bold text-gray-500">#{order.id.toUpperCase()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-100 print:gap-4 print:mb-6 print:pb-6">
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Billed To</p>
                  <p className="font-black text-gray-900 text-sm mb-1">{order.userName}</p>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-[200px]">
                    {order.address}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Order Details</p>
                  <p className="text-xs font-bold text-gray-900 mb-1">Date: {format(new Date(order.createdAt), 'MMM dd, yyyy')}</p>
                  <p className="text-xs font-bold text-gray-900 mb-1">Payment: {order.paymentMethod}</p>
                  <p className="text-xs font-bold text-green-600">Status: {order.status}</p>
                </div>
              </div>

              <table className="w-full mb-8 print:mb-6">
                <thead>
                  <tr className="border-b-2 border-gray-900">
                    <th className="text-left py-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest">Item Description</th>
                    <th className="text-center py-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest">Qty</th>
                    <th className="text-right py-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest">Price</th>
                    <th className="text-right py-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-4 print:py-2">
                        <p className="font-bold text-sm text-gray-900">{item.name}</p>
                        <p className="text-[10px] text-gray-400">{item.category}</p>
                      </td>
                      <td className="py-4 print:py-2 text-center text-sm font-bold text-gray-700">{item.quantity}</td>
                      <td className="py-4 print:py-2 text-right text-sm font-bold text-gray-700">{formatCurrency(item.discountPrice !== undefined && item.discountPrice !== null ? item.discountPrice : item.price)}</td>
                      <td className="py-4 print:py-2 text-right text-sm font-black text-gray-900">{formatCurrency((item.discountPrice !== undefined && item.discountPrice !== null ? item.discountPrice : item.price) * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end">
                <div className="w-full max-w-xs space-y-3">
                  <div className="flex justify-between text-xs font-medium text-gray-500">
                    <span>Subtotal</span>
                    <span>{formatCurrency(order.subtotal || order.totalPrice - (order.deliveryFee || 0) + (order.discountAmount || 0))}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-xs font-medium text-orange-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(order.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs font-medium text-gray-500">
                    <span>Delivery Fee</span>
                    <span>{order.deliveryFee === 0 ? 'Free' : formatCurrency(order.deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between items-end pt-4 border-t-2 border-gray-900">
                    <span className="text-sm font-black text-gray-900 uppercase tracking-tighter">Grand Total</span>
                    <span className="text-xl font-black text-green-600">{formatCurrency(order.totalPrice)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-gray-100 text-center print:mt-8 print:pt-6">
                <p className="text-xs font-bold text-gray-900 mb-1">Thank you for shopping with SmartBasket!</p>
                <p className="text-[10px] text-gray-400 font-medium">For any queries, please contact support@smartbasket.com</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
