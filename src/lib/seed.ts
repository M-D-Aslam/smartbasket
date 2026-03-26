import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

const INITIAL_PRODUCTS = [
  {
    name: "Organic Red Apples",
    price: 120,
    discountPrice: 99,
    category: "Fruits",
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6bcd6?auto=format&fit=crop&q=80&w=800",
    stock: 50,
    description: "Fresh and juicy organic red apples from local farms."
  },
  {
    name: "Fresh Broccoli",
    price: 60,
    discountPrice: 45,
    category: "Vegetables",
    image: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&q=80&w=800",
    stock: 30,
    description: "Nutrient-rich fresh green broccoli."
  },
  {
    name: "Whole Milk (1L)",
    price: 80,
    category: "Dairy",
    image: "https://images.unsplash.com/photo-1563636619-e9107da5a1bb?auto=format&fit=crop&q=80&w=800",
    stock: 100,
    description: "Pure and fresh whole milk from local dairies."
  },
  {
    name: "Artisan Sourdough",
    price: 150,
    discountPrice: 120,
    category: "Bakery",
    image: "https://images.unsplash.com/photo-1585478259715-876acc5be8eb?auto=format&fit=crop&q=80&w=800",
    stock: 15,
    description: "Freshly baked artisan sourdough bread."
  },
  {
    name: "Mixed Nuts Pack",
    price: 450,
    discountPrice: 399,
    category: "Snacks",
    image: "https://images.unsplash.com/photo-1536591375315-1b8e9415477f?auto=format&fit=crop&q=80&w=800",
    stock: 40,
    description: "A healthy mix of almonds, cashews, and walnuts."
  },
  {
    name: "Fresh Orange Juice",
    price: 180,
    category: "Beverages",
    image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&q=80&w=800",
    stock: 25,
    description: "100% pure squeezed orange juice."
  },
  {
    name: "Herbal Face Wash",
    price: 250,
    discountPrice: 199,
    category: "Cosmetics",
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800",
    stock: 60,
    description: "Natural herbal face wash for glowing skin."
  }
];

export const seedProducts = async () => {
  const productsSnap = await getDocs(collection(db, 'products'));
  if (productsSnap.empty) {
    console.log("Seeding initial products...");
    for (const product of INITIAL_PRODUCTS) {
      await addDoc(collection(db, 'products'), product);
    }
    console.log("Seeding complete.");
  }
};
