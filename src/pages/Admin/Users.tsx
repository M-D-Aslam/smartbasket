import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { UserProfile } from '../../types';
import { Users, Mail, MapPin, Calendar, Shield, User as UserIcon, ShieldAlert, ShieldCheck, ChevronRight, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { Logo } from '../../components/Logo';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedUsers = querySnapshot.docs.map(doc => doc.data() as UserProfile);
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleAdminRole = async (user: UserProfile) => {
    const newRole = user.role === 'admin' ? 'customer' : 'admin';
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        role: newRole
      });
      toast.success(`${user.name} is now a ${newRole}`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role. Check permissions.');
    }
  };

  if (loading) return <div className="p-12 text-center font-bold text-gray-400">Loading Customers...</div>;

  const customerCount = users.filter(u => u.role === 'customer').length;

  return (
    <div className="container-wide py-16 space-y-10 bg-[#fcfcfc] min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest mb-4 border border-green-100">
            <Users className="w-3 h-3" />
            <span>Community</span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-black text-gray-900 tracking-tighter leading-none">
            User <span className="text-green-600 stylish-text">Management</span>
          </h1>
          <p className="text-lg text-gray-500 mt-6 font-medium">View and manage all registered users and their roles.</p>
        </div>
        <div className="bg-white border border-gray-100 text-gray-900 px-6 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center shadow-sm">
          <Users className="w-4 h-4 mr-3 text-green-600" />
          {customerCount} Total Customers
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {users.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-200">
            <div className="flex justify-center mb-6">
              <Logo size="md" />
            </div>
            <h3 className="font-display text-2xl font-black text-gray-900 mb-2 tracking-tight">No users found</h3>
            <p className="text-gray-500 font-medium text-sm">There are currently no registered users.</p>
          </div>
        ) : (
          users.map((user) => (
            <div key={user.uid} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 transition-all group relative overflow-hidden">
            {/* Decorative background element */}
            <div className={cn(
              "absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-[0.03] transition-transform group-hover:scale-150 duration-700",
              user.role === 'admin' ? "bg-purple-600" : "bg-green-600"
            )} />

            <div className="flex items-start justify-between mb-8 relative z-10">
              <div className="flex items-center space-x-5">
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm border",
                  user.role === 'admin' 
                    ? "bg-purple-50 text-purple-600 border-purple-100" 
                    : "bg-green-50 text-green-600 border-green-100"
                )}>
                  <UserIcon className="w-8 h-8" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-xl font-black text-gray-900 tracking-tight group-hover:text-green-600 transition-colors">{user.name}</h3>
                  <div className="flex items-center mt-1.5">
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-lg border",
                      user.role === 'admin' 
                        ? "bg-purple-50 text-purple-700 border-purple-100" 
                        : "bg-green-50 text-green-700 border-green-100"
                    )}>
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => toggleAdminRole(user)}
                className={cn(
                  "p-3 rounded-xl transition-all border border-transparent",
                  user.role === 'admin' 
                    ? "text-red-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100" 
                    : "text-purple-400 hover:text-purple-600 hover:bg-purple-50 hover:border-purple-100"
                )}
                title={user.role === 'admin' ? "Remove Admin Access" : "Make Admin"}
              >
                {user.role === 'admin' ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
              </button>
            </div>

            <div className="space-y-5 relative z-10">
              <div className="flex items-center text-xs text-gray-500 font-medium">
                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center mr-3 border border-gray-100">
                  {user.email?.endsWith('@smartbasket.app') ? (
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                  ) : (
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </div>
                <span className="truncate">
                  {user.email?.endsWith('@smartbasket.app') ? user.email.replace('@smartbasket.app', '') : user.email}
                </span>
              </div>
              <div className="flex items-start text-xs text-gray-500 font-medium">
                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center mr-3 border border-gray-100 flex-shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <span className="leading-relaxed line-clamp-2">{user.address || 'No address provided'}</span>
              </div>
              <div className="flex items-center text-xs text-gray-500 font-medium">
                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center mr-3 border border-gray-100">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <span>Joined {format(new Date(user.createdAt), 'MMM dd, yyyy')}</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-50 flex justify-between items-center relative z-10">
              <button className="text-[10px] font-black uppercase tracking-widest text-green-600 hover:text-green-700 transition-colors flex items-center group/btn">
                View Activity
                <ChevronRight className="w-3 h-3 ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
              </button>
              {user.role === 'admin' && (
                <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-purple-600">
                  <Shield className="w-3 h-3 mr-1.5" />
                  Privileged
                </div>
              )}
            </div>
          </div>
        )))}
      </div>
    </div>
  );
};
