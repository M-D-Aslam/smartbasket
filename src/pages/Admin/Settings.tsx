import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { StoreSettings } from '../../types';
import { Settings, Save, CreditCard, Mail, Phone, MapPin, Store, Image as ImageIcon, Truck, Megaphone } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export const AdminSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: 'SmartBasket',
    contactEmail: 'support@smartbasket.com',
    contactPhone: '+1 (555) 000-0000',
    address: '123 Grocery Lane, Fresh City',
    freeDeliveryThreshold: 100,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'store');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data() as StoreSettings);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'store'), settings);
      toast.success('Settings updated successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings. Check your permissions.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center font-bold text-gray-400">Loading Settings...</div>;

  return (
    <div className="container-wide py-16 space-y-10 bg-[#fcfcfc] min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest mb-4 border border-green-100">
            <Settings className="w-3 h-3" />
            <span>Configuration</span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-black text-gray-900 tracking-tighter leading-none">
            Store <span className="text-green-600 stylish-text">Settings</span>
          </h1>
          <p className="text-lg text-gray-500 mt-6 font-medium">Configure your store's identity and payment details.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* General Settings */}
        <section className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16 opacity-50" />
          
          <div className="flex items-center space-x-4 mb-4 relative z-10">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center border border-green-100">
              <Store className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">General Info</h2>
          </div>

          <div className="space-y-6 relative z-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Store Name</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white transition-all font-bold text-sm"
                required
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Contact Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-green-600 transition-colors" />
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  className="w-full pl-11 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white transition-all font-bold text-sm"
                  required
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Contact Phone</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-green-600 transition-colors" />
                <input
                  type="text"
                  value={settings.contactPhone}
                  onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                  className="w-full pl-11 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white transition-all font-bold text-sm"
                  required
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Store Address</label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-6 text-gray-400 w-4 h-4 group-focus-within:text-green-600 transition-colors" />
                <textarea
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full pl-11 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white transition-all font-bold text-sm h-32 resize-none"
                  required
                />
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-10">
          {/* Store Offers & Policies */}
          <section className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16 opacity-50" />
            
            <div className="flex items-center space-x-4 mb-4 relative z-10">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center border border-orange-100">
                <Megaphone className="w-6 h-6 text-orange-600" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Offers & Policies</h2>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Free Delivery Threshold (₹)</label>
                <div className="relative group">
                  <Truck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-orange-600 transition-colors" />
                  <input
                    type="number"
                    value={settings.freeDeliveryThreshold || 0}
                    onChange={(e) => setSettings({ ...settings, freeDeliveryThreshold: Number(e.target.value) })}
                    className="w-full pl-11 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 focus:bg-white transition-all font-bold text-sm"
                    required
                    min="0"
                  />
                </div>
                <p className="text-[10px] text-gray-400 ml-1">Orders above this amount will get free delivery.</p>
              </div>
            </div>
          </section>

          {/* Payment Settings */}
          <section className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -mr-16 -mt-16 opacity-50" />

            <div className="flex items-center space-x-4 mb-4 relative z-10">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center border border-purple-100">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Payment Details</h2>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="p-8 bg-gray-50/50 rounded-[2rem] border border-gray-100 text-center">
                <p className="text-gray-500 font-medium">Currently, only Cash on Delivery (COD) is supported.</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-black text-lg uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-gray-200 flex items-center justify-center group disabled:opacity-50 active:scale-[0.98]"
            >
              {saving ? (
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                  Save Store Settings
                </>
              )}
            </button>
          </section>
        </div>
      </form>
    </div>
  );
};
