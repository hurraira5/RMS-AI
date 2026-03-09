'use client';

import React from 'react';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import HeroCarousel from '@/components/features/HeroCarousel';
import CategoryTabs from '@/components/features/CategoryTabs';
import ProductCard from '@/components/features/ProductCard';
import { Search, History, Flame, ShoppingCart } from 'lucide-react';
import { motion } from 'motion/react';

import OrderTypeModal from '@/components/features/OrderTypeModal';
import ProductDetailModal from '@/components/features/ProductDetailModal';
import CartDrawer from '@/components/features/CartDrawer';
import CheckoutForm from '@/components/features/CheckoutForm';
import OrderSuccess from '@/components/features/OrderSuccess';
import SmartSearch from '@/components/features/SmartSearch';
import TrackOrderModal from '@/components/features/TrackOrderModal';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';

type AppView = 'home' | 'checkout' | 'success';

const MOCK_ITEMS = [
  {
    id: '1',
    name: 'Fusion X (Infused Thigh Fillet Burger)',
    price: 751,
    originalPrice: 863,
    image: 'https://picsum.photos/seed/burger-fusion/400/300',
    category: 'Infused Thigh Fillet Burger'
  },
  {
    id: '2',
    name: 'Fire BOM (6 infused Burger)',
    price: 900,
    originalPrice: 1034,
    image: 'https://picsum.photos/seed/burger-fire/400/300',
    category: '6 Infused Burger'
  },
  {
    id: '3',
    name: 'Infused Fried Chicken (2 Pcs)',
    price: 851,
    originalPrice: 978,
    image: 'https://picsum.photos/seed/chicken-2/400/300',
    category: 'Infused Fried Chicken'
  },
  {
    id: '4',
    name: 'Infused Fried Chicken (4 Pcs)',
    price: 1651,
    originalPrice: 1898,
    image: 'https://picsum.photos/seed/chicken-4/400/300',
    category: 'Infused Fried Chicken'
  }
];

export default function Home() {
  const [view, setView] = useState<AppView>('home');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  useEffect(() => {
    // Show modal on first load
    const hasSelected = localStorage.getItem('orderTypeSelected');
    if (!hasSelected) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsOrderModalOpen(true);
    }

    // Fetch products
    const q = query(collection(db, 'products'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(items.length > 0 ? items : MOCK_ITEMS);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
    });

    return () => unsubscribe();
  }, []);

  const handleOrderTypeSelect = () => {
    localStorage.setItem('orderTypeSelected', 'true');
    setIsOrderModalOpen(false);
  };

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleTrackOrder = (orderId: string) => {
    setLastOrderId(orderId);
    setView('success');
  };

  if (view === 'checkout') {
    return (
      <CheckoutView 
        onBack={() => setView('home')} 
        onPlaceOrder={(id) => {
          setLastOrderId(id);
          setView('success');
        }} 
      />
    );
  }

  if (view === 'success') {
    return (
      <SuccessView 
        orderId={lastOrderId}
        onNewOrder={() => setView('home')} 
      />
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      <Header onTrackOrder={() => setIsTrackModalOpen(true)} />
      <OrderTypeModal isOpen={isOrderModalOpen} onClose={handleOrderTypeSelect} />
      <TrackOrderModal 
        isOpen={isTrackModalOpen} 
        onClose={() => setIsTrackModalOpen(false)} 
        onTrack={handleTrackOrder} 
      />
      <ProductDetailModal 
        isOpen={isProductModalOpen} 
        onClose={() => setIsProductModalOpen(false)} 
        product={selectedProduct} 
      />
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        onCheckout={() => {
          setIsCartOpen(false);
          setView('checkout');
        }}
      />
      
      <div className="max-w-7xl mx-auto">
        <HeroCarousel />
        <CategoryTabs />

        <div className="px-4 py-6 space-y-8">
          {/* Previously Ordered */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-red-100 p-2 rounded-lg">
                <History className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 leading-none">Previously Ordered</h2>
                <p className="text-[10px] text-gray-500 font-medium mt-1 uppercase tracking-wider">Quick reorder your favorites</p>
              </div>
            </div>
            
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 max-w-sm"
            >
              <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                <Image
                  src="https://picsum.photos/seed/prev-order/100/100"
                  alt="Previous Order"
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-grow">
                <h3 className="font-bold text-sm text-gray-900">Fusion X (Infuse...</h3>
                <p className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span> 1 Item
                </p>
                <p className="text-[10px] text-gray-400 mt-1">Feb 13</p>
              </div>
            </motion.div>
          </section>

          {/* Search Bar */}
          <section className="relative">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search for Double Bom..."
                className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all shadow-sm"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-600 text-white p-2.5 rounded-xl shadow-lg shadow-red-100">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </section>

          {/* AI Smart Suggest */}
          <SmartSearch />

          {/* Popular Items */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
              <div>
                <h2 className="font-bold text-xl text-gray-900 leading-none">Popular Items</h2>
                <p className="text-xs text-gray-500 font-medium mt-1">Most ordered right now</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((item) => (
                <div key={item.id} onClick={() => handleProductClick(item)} className="cursor-pointer">
                  <ProductCard {...item} />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Floating Cart Button (Mobile) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4 md:hidden z-50">
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsCartOpen(true)}
          className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold shadow-2xl shadow-red-200 flex items-center justify-between px-6"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <span>View Cart</span>
          </div>
          <span className="bg-white/20 px-3 py-1 rounded-lg text-sm">Rs. 1261</span>
        </motion.button>
      </div>
    </main>
  );
}

function CheckoutView({ onBack, onPlaceOrder }: { onBack: () => void, onPlaceOrder: (id: string) => void }) {
  return (
    <CheckoutForm 
      onBack={onBack} 
      onPlaceOrder={onPlaceOrder} 
    />
  );
}

function SuccessView({ orderId, onNewOrder }: { orderId: string | null, onNewOrder: () => void }) {
  return (
    <OrderSuccess 
      orderId={orderId}
      onNewOrder={onNewOrder} 
    />
  );
}
