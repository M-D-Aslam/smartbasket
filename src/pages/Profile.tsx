import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { UserProfile } from '../types';
import { User, Mail, MapPin, Save, Shield, LogOut, ChevronRight, Camera, ShoppingBag, Heart, Bell, CreditCard, Phone, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export const Profile: React.FC = () => {
  const { user, profile, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    address: profile?.address || '',
    phone: profile?.phone || (profile?.email?.endsWith('@smartbasket.app') ? profile.email.replace('@smartbasket.app', '') : ''),
    location: profile?.location || null as {lat: number, lng: number} | null,
  });
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        address: profile.address || '',
        phone: profile.phone || (profile.email?.endsWith('@smartbasket.app') ? profile.email.replace('@smartbasket.app', '') : ''),
        location: profile.location || null,
      });
    }
  }, [profile]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
        }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        location: formData.location,
      });
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Check your permissions.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-12 text-center font-bold text-gray-400">Please log in to view your profile.</div>;

  const isDummyEmail = profile?.email?.endsWith('@smartbasket.app');
  const displayContact = isDummyEmail ? profile?.email?.replace('@smartbasket.app', '') : profile?.email;
  const contactLabel = isDummyEmail ? 'Phone Number' : 'Email Address';

  return (
    <div className="container-wide py-8 lg:py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 lg:gap-10 mb-8 lg:mb-16">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-3 lg:mb-4">
            <div className="w-6 lg:w-8 h-[2px] bg-brand-600" />
            <span className="text-[10px] lg:text-xs font-black text-brand-600 uppercase tracking-[0.3em]">Account Settings</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-none">
            Your <span className="text-brand-600 stylish-text">Profile</span>
          </h1>
          <p className="text-base lg:text-lg text-gray-500 font-medium leading-relaxed mt-4 lg:mt-6">
            Manage your personal information, delivery addresses, and account security in one place.
          </p>
        </div>
        
        <button
          onClick={() => logout()}
          className="group flex items-center justify-center gap-2 lg:gap-3 px-6 py-3 lg:px-8 lg:py-4 bg-red-50 text-red-600 rounded-xl lg:rounded-2xl font-black uppercase tracking-widest text-[10px] lg:text-xs hover:bg-red-600 hover:text-white hover:shadow-xl hover:shadow-red-100 transition-all active:scale-95 w-full md:w-auto"
        >
          <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
        {/* Left Column: Account Info */}
        <div className="lg:col-span-1 space-y-8 lg:space-y-12">
          <div className="bg-white rounded-3xl lg:rounded-[3rem] p-6 lg:p-10 border border-gray-100 shadow-sm text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1.5 lg:h-2 bg-brand-600" />
            <div className="w-24 h-24 lg:w-32 lg:h-32 bg-brand-50 rounded-2xl lg:rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 lg:mb-8 shadow-inner group-hover:scale-110 transition-transform duration-500 mt-4 lg:mt-0">
              <User className="w-12 h-12 lg:w-16 lg:h-16 text-brand-600" />
            </div>
            <h2 className="font-display text-xl lg:text-2xl font-black text-gray-900 mb-1 lg:mb-2 tracking-tight">{profile?.name}</h2>
            <p className="text-gray-400 font-bold text-xs lg:text-sm mb-6 lg:mb-8">{displayContact}</p>
            
            <div className="flex flex-col items-center gap-3 lg:gap-4">
              <div className={cn(
                "inline-flex items-center gap-1.5 lg:gap-2 px-4 py-1.5 lg:px-5 lg:py-2 rounded-lg lg:rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm",
                profile?.role === 'admin' 
                  ? 'bg-purple-50 text-purple-600 border-purple-100' 
                  : 'bg-brand-50 text-brand-600 border-brand-100'
              )}>
                {profile?.role === 'admin' && <Shield className="w-3 h-3 lg:w-3.5 lg:h-3.5" />}
                {profile?.role} Member
              </div>
              
              {profile?.role === 'admin' && (
                <p className="text-[9px] lg:text-[10px] font-black text-purple-400 uppercase tracking-widest">
                  Full Administrative Access
                </p>
              )}
            </div>
          </div>

          <div className="bg-gray-900 rounded-3xl lg:rounded-[3rem] p-6 lg:p-10 text-white relative overflow-hidden hidden lg:block">
            <div className="absolute top-0 right-0 w-24 h-24 lg:w-32 lg:h-32 bg-brand-600 rounded-full -translate-y-12 translate-x-12 lg:-translate-y-16 lg:translate-x-16 blur-2xl lg:blur-3xl opacity-20" />
            <h3 className="font-display text-lg lg:text-xl font-black mb-3 lg:mb-4 tracking-tight">Security Tip</h3>
            <p className="text-gray-400 text-xs lg:text-sm leading-relaxed font-medium">
              Keep your address and contact details up to date to ensure smooth deliveries and faster support response times.
            </p>
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl lg:rounded-[3rem] p-6 lg:p-12 border border-gray-100 shadow-sm space-y-8 lg:space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 lg:w-64 lg:h-64 bg-brand-50 rounded-full -translate-y-24 translate-x-24 lg:-translate-y-32 lg:translate-x-32 blur-2xl lg:blur-3xl opacity-30" />
            
            <div className="space-y-6 lg:space-y-8 relative">
              <div className="space-y-2 lg:space-y-3">
                <label className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5 group-focus-within:text-brand-600 transition-colors" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-12 lg:pl-16 pr-6 lg:pr-8 py-4 lg:py-5 bg-gray-50/50 border border-transparent rounded-xl lg:rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all font-bold text-sm lg:text-base text-gray-700"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              {!isDummyEmail && (
                <div className="space-y-2 lg:space-y-3">
                  <label className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">{contactLabel}</label>
                  <div className="relative">
                    <Mail className="absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4 lg:w-5 lg:h-5" />
                    <input
                      type="email"
                      value={displayContact}
                      disabled
                      className="w-full pl-12 lg:pl-16 pr-6 lg:pr-8 py-4 lg:py-5 bg-gray-50 border border-transparent rounded-xl lg:rounded-2xl outline-none font-bold text-sm lg:text-base text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 lg:gap-2 ml-1">
                    <Shield className="w-3 h-3 text-gray-300" />
                    <p className="text-[9px] lg:text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      {contactLabel} is verified and linked to your account.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2 lg:space-y-3">
                <label className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5 group-focus-within:text-brand-600 transition-colors" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                    className="w-full pl-12 lg:pl-16 pr-6 lg:pr-8 py-4 lg:py-5 bg-gray-50/50 border border-transparent rounded-xl lg:rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all font-bold text-sm lg:text-base text-gray-700"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div className="space-y-2 lg:space-y-3">
                <label className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Default Delivery Address</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 lg:left-6 top-5 lg:top-6 text-gray-400 w-4 h-4 lg:w-5 lg:h-5 group-focus-within:text-brand-600 transition-colors" />
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full pl-12 lg:pl-16 pr-6 lg:pr-8 py-4 lg:py-5 bg-gray-50/50 border border-transparent rounded-xl lg:rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all font-bold text-sm lg:text-base text-gray-700 h-32 lg:h-40 resize-none leading-relaxed"
                    placeholder="Enter your complete delivery address..."
                  />
                </div>
              </div>

              <div className="space-y-2 lg:space-y-3">
                <label className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Live Location</label>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    className={cn(
                      "flex items-center justify-center gap-2 px-6 py-4 rounded-xl lg:rounded-2xl font-black uppercase tracking-widest text-[10px] lg:text-xs transition-all w-full sm:w-auto",
                      formData.location 
                        ? "bg-green-50 text-green-600 border border-green-200" 
                        : "bg-brand-50 text-brand-600 border border-brand-200 hover:bg-brand-100"
                    )}
                  >
                    {isLocating ? (
                      <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Navigation className="w-4 h-4" />
                    )}
                    {formData.location ? "Location Captured ✓" : "Pin Live Location"}
                  </button>
                  {formData.location && (
                    <p className="text-[10px] lg:text-xs font-bold text-gray-400">
                      Lat: {formData.location.lat.toFixed(4)}, Lng: {formData.location.lng.toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 text-white py-4 lg:py-6 rounded-2xl lg:rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs lg:text-sm hover:bg-brand-700 transition-all shadow-xl lg:shadow-2xl shadow-brand-100 flex items-center justify-center group disabled:opacity-50 active:scale-95"
            >
              {loading ? (
                <div className="w-5 h-5 lg:w-6 lg:h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 group-hover:scale-110 transition-transform" />
                  Save Profile Changes
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
