export type UserRole = 'customer' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  location?: { lat: number; lng: number };
  role: UserRole;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  category: string;
  image: string;
  stock: number;
  description?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export type OrderStatus = 'Pending' | 'Packed' | 'Delivered';
export type PaymentMethod = 'COD';

export interface Order {
  id: string;
  userId: string;
  userName: string;
  phone?: string;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  totalPrice: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  address: string;
  location?: { lat: number; lng: number };
  deliveryOtp?: string;
  createdAt: string;
}

export interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  dailySales: { date: string; amount: number }[];
}

export interface StoreSettings {
  storeName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  freeDeliveryThreshold?: number;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  isActive: boolean;
  createdAt: string;
}
