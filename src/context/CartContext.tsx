import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, StoreSettings } from '../types';
import { toast } from 'sonner';
import { collection, query, where, getDocs, limit, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  deliveryFee: number;
  discountAmount: number;
  firstOrderDiscount: number;
  bannerDiscount: number;
  isFirstOrder: boolean;
  finalTotal: number;
  freeDeliveryThreshold: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isFirstOrder, setIsFirstOrder] = useState(false);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(100);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    const docRef = doc(db, 'settings', 'store');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as StoreSettings;
        if (data.freeDeliveryThreshold !== undefined) {
          setFreeDeliveryThreshold(data.freeDeliveryThreshold);
        }
      }
    }, (error) => {
      console.error('Error fetching store settings:', error);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const checkFirstOrder = async () => {
      if (!user) {
        setIsFirstOrder(false);
        return;
      }
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          limit(1)
        );
        const querySnapshot = await getDocs(q);
        setIsFirstOrder(querySnapshot.empty);
      } catch (error) {
        console.error('Error checking first order:', error);
        setIsFirstOrder(false);
      }
    };
    checkFirstOrder();
  }, [user]);

  const addToCart = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        toast.success(`Increased ${product.name} quantity in cart`);
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      toast.success(`Added ${product.name} to cart`);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    const item = items.find(i => i.id === productId);
    if (item) {
      toast.error(`Removed ${item.name} from cart`);
    }
    setItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
    toast.info('Cart cleared');
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => {
    const priceToUse = item.discountPrice !== undefined && item.discountPrice !== null ? item.discountPrice : item.price;
    return sum + priceToUse * item.quantity;
  }, 0);

  const firstOrderDiscount = isFirstOrder ? totalPrice * 0.2 : 0;
  const discountAmount = firstOrderDiscount;
  
  const deliveryFee = (totalPrice - discountAmount) >= freeDeliveryThreshold || totalPrice === 0 ? 0 : 30;
  const finalTotal = Math.max(0, totalPrice - discountAmount + deliveryFee);

  return (
    <CartContext.Provider
      value={{ 
        items, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart, 
        totalItems, 
        totalPrice,
        deliveryFee,
        discountAmount,
        firstOrderDiscount,
        bannerDiscount: 0,
        isFirstOrder,
        finalTotal,
        freeDeliveryThreshold
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
