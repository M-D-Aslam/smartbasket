import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Product } from '../../types';
import { formatCurrency, cn } from '../../lib/utils';
import { Plus, Search, Edit2, Trash2, X, Image as ImageIcon, Package, Tag, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from '../../components/Logo';

const CATEGORIES = ['Fruits', 'Vegetables', 'Dairy', 'Bakery', 'Snacks', 'Beverages', 'Cosmetics'];

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    discountPrice: '',
    category: 'Fruits',
    image: '',
    stock: '',
    description: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const fetchedProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for base64 in firestore
        toast.error('Image size should be less than 1MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const price = parseFloat(formData.price);
    const stock = parseInt(formData.stock);
    const discountPrice = formData.discountPrice ? parseFloat(formData.discountPrice) : null;

    if (isNaN(price) || price < 0) {
      toast.error('Please enter a valid price');
      return;
    }
    if (isNaN(stock) || stock < 0) {
      toast.error('Please enter a valid stock quantity');
      return;
    }
    if (discountPrice !== null && (isNaN(discountPrice) || discountPrice < 0)) {
      toast.error('Please enter a valid discount price');
      return;
    }

    try {
      const productData = {
        name: formData.name,
        price,
        discountPrice,
        category: formData.category,
        image: formData.image,
        stock,
        description: formData.description,
      };

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
        toast.success('Product updated successfully');
      } else {
        await addDoc(collection(db, 'products'), productData);
        toast.success('Product added successfully');
      }
      
      setIsModalOpen(false);
      setEditingProduct(null);
      setFormData({ name: '', price: '', discountPrice: '', category: 'Fruits', image: '', stock: '', description: '' });
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product. Check your permissions.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Optimistic update
      const previousProducts = [...products];
      setProducts(products.filter(p => p.id !== id));
      setDeleteConfirmId(null);

      await deleteDoc(doc(db, 'products', id));
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
      // Rollback if failed
      fetchProducts();
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      discountPrice: product.discountPrice?.toString() || '',
      category: product.category,
      image: product.image,
      stock: product.stock.toString(),
      description: product.description || '',
    });
    setIsModalOpen(true);
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="container-wide py-8 lg:py-16 space-y-6 lg:space-y-10 bg-[#fcfcfc] min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 lg:gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-green-50 text-green-600 text-[9px] lg:text-[10px] font-black uppercase tracking-widest mb-3 lg:mb-4 border border-green-100">
            <Package className="w-3 h-3" />
            <span>Store Inventory</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-black text-gray-900 tracking-tighter leading-none">
            Inventory <span className="text-green-600 stylish-text">Management</span>
          </h1>
          <p className="text-base lg:text-lg text-gray-500 mt-4 lg:mt-6 font-medium">Add, edit, or remove products from your store.</p>
        </div>
        <button
          onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
          className="bg-green-600 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-2xl lg:rounded-[2rem] font-black text-[10px] lg:text-sm uppercase tracking-widest hover:bg-green-700 transition-all shadow-xl shadow-green-200 flex items-center justify-center group w-full md:w-auto"
        >
          <Plus className="w-4 h-4 lg:w-5 lg:h-5 mr-2 group-hover:rotate-90 transition-transform" />
          Add New Product
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative group max-w-xl flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-green-600 transition-colors" />
          <input
            type="text"
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-6 py-3.5 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all font-medium text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl lg:rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-4 lg:px-8 py-4 lg:py-5 text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Product Info</th>
                <th className="px-4 lg:px-8 py-4 lg:py-5 text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Category</th>
                <th className="px-4 lg:px-8 py-4 lg:py-5 text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Pricing</th>
                <th className="px-4 lg:px-8 py-4 lg:py-5 text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Inventory</th>
                <th className="px-4 lg:px-8 py-4 lg:py-5 text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 lg:px-8 py-16 lg:py-32 text-center">
                    <div className="flex justify-center mb-4 lg:mb-6">
                      <Logo size="md" />
                    </div>
                    <h3 className="font-display text-xl lg:text-2xl font-black text-gray-900 mb-2 tracking-tight">No products found</h3>
                    <p className="text-gray-500 font-medium text-xs lg:text-sm">Add some products to your inventory to see them here.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-all group">
                    <td className="px-4 lg:px-8 py-4 lg:py-6">
                    <div className="flex items-center space-x-3 lg:space-x-5">
                      <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 p-1">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg lg:rounded-xl" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-gray-900 text-xs lg:text-sm tracking-tight group-hover:text-green-600 transition-colors">{product.name}</span>
                        <span className="text-[9px] lg:text-[11px] text-gray-400 font-medium mt-0.5 line-clamp-1 max-w-[150px] lg:max-w-[200px]">{product.description}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 lg:px-8 py-4 lg:py-6">
                    <span className="inline-flex items-center px-2 lg:px-3 py-1 rounded-full bg-green-50 text-green-600 text-[8px] lg:text-[10px] font-black uppercase tracking-widest border border-green-100">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-4 lg:px-8 py-4 lg:py-6">
                    <div className="flex flex-col">
                      <span className="font-black text-gray-900 text-xs lg:text-sm">{formatCurrency(product.discountPrice !== undefined && product.discountPrice !== null ? product.discountPrice : product.price)}</span>
                      {product.discountPrice !== undefined && product.discountPrice !== null && product.discountPrice < product.price && (
                        <span className="text-[9px] lg:text-[10px] text-gray-400 line-through font-bold">{formatCurrency(product.price)}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 lg:px-8 py-4 lg:py-6">
                    <div className="flex flex-col space-y-1 lg:space-y-2">
                      <div className="flex items-center justify-between max-w-[80px] lg:max-w-[100px]">
                        <span className="text-[8px] lg:text-[10px] font-black text-gray-400 uppercase tracking-wider">Stock</span>
                        <span className={cn(
                          "text-[8px] lg:text-[10px] font-black uppercase",
                          product.stock > 10 ? "text-green-600" : product.stock > 0 ? "text-orange-500" : "text-red-500"
                        )}>
                          {product.stock} Units
                        </span>
                      </div>
                      <div className="w-20 lg:w-24 h-1 lg:h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all duration-500",
                            product.stock > 10 ? "bg-green-500" : product.stock > 0 ? "bg-orange-500" : "bg-red-500"
                          )}
                          style={{ width: `${Math.min((product.stock / 50) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 lg:px-8 py-4 lg:py-6 text-right">
                    <div className="flex items-center justify-end space-x-1 lg:space-x-2">
                      <AnimatePresence mode="wait">
                        {deleteConfirmId === product.id ? (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center space-x-1 lg:space-x-2 bg-red-50 p-1 lg:p-1.5 rounded-xl lg:rounded-2xl border border-red-100"
                          >
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="px-2 lg:px-4 py-1.5 lg:py-2 bg-red-600 text-white text-[8px] lg:text-[10px] font-black uppercase tracking-widest rounded-lg lg:rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 lg:px-4 py-1.5 lg:py-2 bg-white text-gray-500 text-[8px] lg:text-[10px] font-black uppercase tracking-widest rounded-lg lg:rounded-xl hover:bg-gray-100 transition-all border border-gray-200"
                            >
                              Cancel
                            </button>
                          </motion.div>
                        ) : (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center space-x-1 lg:space-x-2"
                          >
                            <button
                              onClick={() => openEditModal(product)}
                              className="p-2 lg:p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl lg:rounded-2xl transition-all border border-transparent hover:border-blue-100"
                            >
                              <Edit2 className="w-3 h-3 lg:w-4 lg:h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(product.id)}
                              className="p-2 lg:p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl lg:rounded-2xl transition-all border border-transparent hover:border-red-100"
                            >
                              <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-3xl lg:rounded-[3rem] shadow-2xl overflow-hidden border border-white/20 max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 lg:p-10">
                <div className="flex justify-between items-center mb-8 lg:mb-10">
                  <div>
                    <h2 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">
                      {editingProduct ? 'Edit' : 'Add'} <span className="text-green-600">Product</span>
                    </h2>
                    <p className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                      {editingProduct ? 'Update existing item details' : 'Create a new catalog item'}
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)} 
                    className="p-2 lg:p-3 bg-gray-50 text-gray-400 rounded-xl lg:rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all border border-gray-100"
                  >
                    <X className="w-5 h-5 lg:w-6 lg:h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    <div className="space-y-2 lg:space-y-3">
                      <label className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Product Name</label>
                      <div className="relative group">
                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-green-600 transition-colors" />
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full pl-11 pr-4 py-3 lg:py-4 bg-gray-50 border border-transparent rounded-xl lg:rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white transition-all font-bold text-xs lg:text-sm"
                          placeholder="e.g. Fresh Organic Apples"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 lg:space-y-3">
                      <label className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 lg:py-4 bg-gray-50 border border-transparent rounded-xl lg:rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white transition-all font-bold text-xs lg:text-sm appearance-none cursor-pointer"
                      >
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2 lg:space-y-3">
                      <label className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price (₹)</label>
                      <div className="relative group">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-green-600 transition-colors" />
                        <input
                          type="number"
                          required
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="w-full pl-11 pr-4 py-3 lg:py-4 bg-gray-50 border border-transparent rounded-xl lg:rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white transition-all font-bold text-xs lg:text-sm"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 lg:space-y-3">
                      <label className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Discount Price (₹) - Optional</label>
                      <div className="relative group">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-green-600 transition-colors" />
                        <input
                          type="number"
                          value={formData.discountPrice}
                          onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                          className="w-full pl-11 pr-4 py-3 lg:py-4 bg-gray-50 border border-transparent rounded-xl lg:rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white transition-all font-bold text-xs lg:text-sm"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 lg:space-y-3">
                      <label className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Stock Quantity</label>
                      <div className="relative group">
                        <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-green-600 transition-colors" />
                        <input
                          type="number"
                          required
                          value={formData.stock}
                          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                          className="w-full pl-11 pr-4 py-3 lg:py-4 bg-gray-50 border border-transparent rounded-xl lg:rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white transition-all font-bold text-xs lg:text-sm"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 lg:space-y-3">
                    <label className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Product Image</label>
                    <div className="relative group">
                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-green-600 transition-colors" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full pl-11 pr-4 py-3 lg:py-4 bg-gray-50 border border-transparent rounded-xl lg:rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white transition-all font-bold text-xs lg:text-sm file:mr-4 file:py-1.5 lg:file:py-2 file:px-3 lg:file:px-4 file:rounded-full file:border-0 file:text-[10px] lg:file:text-xs file:font-bold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                      />
                    </div>
                    {formData.image && (
                      <div className="mt-4 w-20 h-20 lg:w-24 lg:h-24 rounded-xl lg:rounded-2xl overflow-hidden border border-gray-100">
                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 lg:space-y-3">
                    <label className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full h-24 lg:h-32 p-4 lg:p-6 bg-gray-50 border border-transparent rounded-2xl lg:rounded-[2rem] outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white transition-all font-medium text-xs lg:text-sm resize-none"
                      placeholder="Enter detailed product description..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-4 lg:py-5 rounded-2xl lg:rounded-[2rem] font-black text-sm lg:text-lg uppercase tracking-widest hover:bg-green-700 transition-all shadow-2xl shadow-green-200 active:scale-[0.98]"
                  >
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
