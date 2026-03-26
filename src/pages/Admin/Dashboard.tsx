import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { Order, Product, UserProfile } from '../../types';
import { formatCurrency, cn } from '../../lib/utils';
import { 
  TrendingUp, Users, ShoppingCart, DollarSign, 
  ArrowUpRight, ArrowDownRight, Package, Clock, CheckCircle2,
  Download, Store, ChevronRight, FileText, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Logo } from '../../components/Logo';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalProducts: 0,
  });
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [dailySales, setDailySales] = useState<{ date: string; amount: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStat, setSelectedStat] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersSnap, usersSnap, productsSnap] = await Promise.all([
          getDocs(collection(db, 'orders')),
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'products')),
        ]);

        const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        setAllOrders(orders);
        const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
        const totalCustomers = usersSnap.docs.filter(doc => (doc.data() as UserProfile).role === 'customer').length;

        setStats({
          totalOrders: orders.length,
          totalRevenue,
          totalUsers: totalCustomers,
          totalProducts: productsSnap.size,
        });

        setRecentOrders(orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5));

        // Generate last 7 days sales data
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = subDays(new Date(), i);
          const dateStr = format(date, 'MMM dd');
          const dayTotal = orders
            .filter(o => format(new Date(o.createdAt), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
            .reduce((sum, o) => sum + o.totalPrice, 0);
          return { date: dateStr, amount: dayTotal };
        }).reverse();
        setDailySales(last7Days);

      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleDownloadReport = () => {
    if (allOrders.length === 0) {
      toast.error('No orders available to export');
      return;
    }

    const headers = ['Order ID', 'Customer', 'Items', 'Total Price', 'Status', 'Payment Method', 'Date'];
    const csvContent = [
      headers.join(','),
      ...allOrders.map(o => [
        o.id,
        `"${o.userName}"`,
        o.items.length,
        o.totalPrice,
        o.status,
        o.paymentMethod,
        format(new Date(o.createdAt), 'yyyy-MM-dd HH:mm:ss')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sales_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report downloaded successfully');
  };

  const StatCard = ({ title, value, icon: Icon, trend, color, id }: any) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setSelectedStat(id)}
      className="bg-white p-6 lg:p-8 rounded-3xl lg:rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl hover:border-green-100 transition-all cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-4 lg:mb-6">
        <div className={cn("p-3 lg:p-4 rounded-xl lg:rounded-2xl transition-transform group-hover:scale-110", color)}>
          <Icon className="w-5 h-5 lg:w-6 lg:h-6" />
        </div>
        {trend && (
          <div className={cn("flex items-center text-xs lg:text-sm font-bold px-2 lg:px-3 py-1 rounded-full", trend > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600")}>
            {trend > 0 ? <ArrowUpRight className="w-3 h-3 lg:w-4 lg:h-4 mr-1" /> : <ArrowDownRight className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-gray-500 font-bold text-[10px] lg:text-sm uppercase tracking-widest mb-1 lg:mb-2 group-hover:text-green-600 transition-colors">{title}</p>
      <h3 className="text-2xl lg:text-3xl font-black text-gray-900">{value}</h3>
      <div className="mt-3 lg:mt-4 flex items-center text-[10px] lg:text-xs font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
        View Details <ChevronRight className="w-3 h-3 ml-1" />
      </div>
    </motion.div>
  );

  if (loading) return <div className="p-12 text-center font-bold text-gray-400">Loading Dashboard...</div>;

  return (
    <div className="container-wide py-8 lg:py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 lg:gap-10 mb-10 lg:mb-16">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-3 lg:mb-4">
            <div className="w-6 lg:w-8 h-[2px] bg-brand-600" />
            <span className="text-[10px] lg:text-xs font-black text-brand-600 uppercase tracking-[0.3em]">Control Center</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-none">
            Admin <span className="text-brand-600 stylish-text">Dashboard</span>
          </h1>
          <p className="text-base lg:text-lg text-gray-500 font-medium leading-relaxed mt-4 lg:mt-6">
            Welcome back! Here's a real-time overview of your store's performance and recent activities.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 lg:gap-4">
          <button 
            onClick={handleDownloadReport}
            className="group flex items-center gap-2 lg:gap-3 px-6 lg:px-8 py-3 lg:py-4 bg-white border-2 border-gray-100 text-gray-600 rounded-xl lg:rounded-2xl font-black uppercase tracking-widest text-[10px] lg:text-xs hover:border-brand-600 hover:text-brand-600 hover:shadow-xl hover:shadow-brand-900/5 transition-all active:scale-95"
          >
            <Download className="w-3 h-3 lg:w-4 lg:h-4 group-hover:translate-y-1 transition-transform" />
            Export Data
          </button>
          <button 
            onClick={() => navigate('/admin/products')}
            className="group flex items-center gap-2 lg:gap-3 px-6 lg:px-8 py-3 lg:py-4 bg-brand-600 text-white rounded-xl lg:rounded-2xl font-black uppercase tracking-widest text-[10px] lg:text-xs hover:bg-brand-700 hover:shadow-xl hover:shadow-brand-600/20 transition-all active:scale-95 shadow-2xl shadow-brand-600/10"
          >
            <Store className="w-3 h-3 lg:w-4 lg:h-4 group-hover:scale-110 transition-transform" />
            Manage Store
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-10 lg:mb-16">
        <StatCard id="revenue" title="Total Revenue" value={formatCurrency(stats.totalRevenue)} icon={DollarSign} color="bg-brand-50 text-brand-600" />
        <StatCard id="orders" title="Total Orders" value={stats.totalOrders} icon={ShoppingCart} color="bg-blue-50 text-blue-600" />
        <StatCard id="users" title="Total Customers" value={stats.totalUsers} icon={Users} color="bg-purple-50 text-purple-600" />
        <StatCard id="products" title="Total Products" value={stats.totalProducts} icon={Package} color="bg-orange-50 text-orange-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white p-6 lg:p-12 rounded-3xl lg:rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 lg:w-64 h-48 lg:h-64 bg-brand-50 rounded-full -translate-y-24 lg:-translate-y-32 translate-x-24 lg:translate-x-32 blur-3xl opacity-30" />
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 lg:gap-6 mb-8 lg:mb-12 relative">
            <div>
              <h3 className="font-display text-xl lg:text-2xl font-black text-gray-900 tracking-tight">Sales <span className="text-brand-600 italic">Overview</span></h3>
              <p className="text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Revenue performance over time</p>
            </div>
            <select className="bg-gray-50 border-2 border-transparent focus:border-brand-600 focus:bg-white rounded-xl px-4 lg:px-6 py-2 lg:py-3 text-[10px] lg:text-xs font-black uppercase tracking-widest outline-none transition-all cursor-pointer">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          
          <div className="h-[300px] lg:h-[400px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailySales}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }} 
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 800 }} 
                  tickFormatter={(value) => `₹${value}`}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '24px', 
                    border: '1px solid #f3f4f6', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '16px'
                  }}
                  itemStyle={{ color: '#16a34a', fontWeight: 900, fontSize: '14px' }}
                  labelStyle={{ fontWeight: 900, marginBottom: '8px', color: '#111827', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#16a34a" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorAmount)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-1 bg-white p-6 lg:p-12 rounded-3xl lg:rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-50 rounded-full translate-y-16 -translate-x-16 blur-3xl opacity-50" />
          
          <div className="mb-8 lg:mb-12 relative">
            <h3 className="font-display text-xl lg:text-2xl font-black text-gray-900 tracking-tight">Recent <span className="text-brand-600 italic">Orders</span></h3>
            <p className="text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Latest customer activity</p>
          </div>
          
          <div className="space-y-6 lg:space-y-10 relative">
            {recentOrders.length === 0 ? (
              <div className="text-center py-10">
                <div className="flex justify-center mb-4">
                  <Logo size="sm" />
                </div>
                <p className="text-gray-500 font-medium text-sm">No recent orders found.</p>
              </div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3 lg:gap-5">
                    <div className={cn(
                      "w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl flex items-center justify-center transition-all group-hover:scale-110",
                      order.status === 'Delivered' ? "bg-brand-50 text-brand-600" : "bg-yellow-50 text-yellow-600"
                    )}>
                      {order.status === 'Delivered' ? <CheckCircle2 className="w-5 h-5 lg:w-7 lg:h-7" /> : <Clock className="w-5 h-5 lg:w-7 lg:h-7" />}
                    </div>
                    <div>
                      <p className="font-display text-base lg:text-lg font-black text-gray-900 group-hover:text-brand-600 transition-colors tracking-tight line-clamp-1">{order.userName}</p>
                      <p className="text-[9px] lg:text-[10px] text-gray-400 font-black uppercase tracking-widest">{format(new Date(order.createdAt), 'MMM dd, hh:mm a')}</p>
                    </div>
                  </div>
                  <div className="text-right pl-2">
                    <p className="font-black text-gray-900 text-sm lg:text-base">{formatCurrency(order.totalPrice)}</p>
                    <div className={cn(
                      "inline-block px-2 lg:px-3 py-1 rounded-lg text-[8px] lg:text-[9px] font-black uppercase tracking-widest mt-1",
                      order.status === 'Delivered' ? "bg-brand-50 text-brand-600" : "bg-yellow-50 text-yellow-600"
                    )}>
                      {order.status}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <button 
            onClick={() => navigate('/admin/orders')}
            className="w-full mt-8 lg:mt-12 py-4 lg:py-6 rounded-2xl lg:rounded-[2rem] border-2 border-dashed border-gray-100 text-gray-400 font-black uppercase tracking-[0.2em] text-[9px] lg:text-[10px] hover:border-brand-600 hover:text-brand-600 hover:bg-brand-50/30 transition-all flex items-center justify-center group relative"
          >
            View All Orders
            <ChevronRight className="w-3 h-3 lg:w-4 lg:h-4 ml-2 lg:ml-3 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedStat && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStat(null)}
              className="absolute inset-0 bg-gray-900/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-white w-full max-w-xl rounded-[4rem] shadow-2xl overflow-hidden p-12"
            >
              <div className="flex justify-between items-center mb-10">
                <div className="space-y-1">
                  <h2 className="font-display text-3xl font-black text-gray-900 tracking-tight">
                    {selectedStat === 'revenue' && 'Revenue Insights'}
                    {selectedStat === 'orders' && 'Order Performance'}
                    {selectedStat === 'users' && 'Customer Base'}
                    {selectedStat === 'products' && 'Inventory Status'}
                  </h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Detailed metric analysis</p>
                </div>
                <button onClick={() => setSelectedStat(null)} className="p-4 bg-gray-50 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6 lg:space-y-10">
                <div className="p-8 lg:p-10 bg-brand-50/50 rounded-3xl lg:rounded-[2.5rem] border border-brand-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 lg:w-32 h-24 lg:h-32 bg-brand-600 rounded-full -translate-y-12 lg:-translate-y-16 translate-x-12 lg:translate-x-16 blur-2xl lg:blur-3xl opacity-10" />
                  <p className="text-[9px] lg:text-[10px] font-black text-brand-600 uppercase tracking-[0.3em] mb-2 lg:mb-4">Current Value</p>
                  <p className="font-display text-4xl lg:text-6xl font-black text-brand-600 italic tracking-tighter">
                    {selectedStat === 'revenue' && formatCurrency(stats.totalRevenue)}
                    {selectedStat === 'orders' && stats.totalOrders}
                    {selectedStat === 'users' && stats.totalUsers}
                    {selectedStat === 'products' && stats.totalProducts}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 lg:gap-6">
                  <div className="p-4 lg:p-6 bg-gray-50 rounded-2xl lg:rounded-3xl border border-gray-100">
                    <p className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 lg:mb-2">Growth</p>
                    <p className="text-lg lg:text-xl font-black text-gray-900">+12.5%</p>
                  </div>
                  <div className="p-4 lg:p-6 bg-gray-50 rounded-2xl lg:rounded-3xl border border-gray-100">
                    <p className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 lg:mb-2">Target</p>
                    <p className="text-lg lg:text-xl font-black text-gray-900">On Track</p>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    if (selectedStat === 'products') navigate('/admin/products');
                    if (selectedStat === 'orders') navigate('/admin/orders');
                    if (selectedStat === 'users') navigate('/admin/users');
                    setSelectedStat(null);
                  }}
                  className="w-full bg-gray-900 text-white py-4 lg:py-6 rounded-2xl lg:rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs lg:text-sm hover:bg-brand-600 transition-all shadow-2xl shadow-gray-900/10 flex items-center justify-center group"
                >
                  Go to Management
                  <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5 ml-2 lg:ml-3 group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
