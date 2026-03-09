'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Share2, Plus, Minus, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '@/components/features/CartProvider';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    description?: string;
  } | null;
}

export default function ProductDetailModal({ isOpen, onClose, product }: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const { addItem } = useCart();

  if (!isOpen || !product) return null;

  const addons = [
    { id: 'cheese', name: 'Cheese Slice', price: 60 },
    { id: 'garlic-dip', name: 'Fuse Garlic Mayo Dip', price: 100 },
    { id: 'spicy-dip', name: 'Fuse Spicy Mayo Dip', price: 100 },
  ];

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.image,
      addons: selectedAddons
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative bg-white w-full max-w-2xl md:rounded-[32px] rounded-t-[32px] overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
      >
        <div className="relative aspect-video w-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-4 right-4 flex gap-2">
            <button className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/40 transition-all">
              <Share2 className="w-5 h-5" />
            </button>
            <button 
              onClick={onClose}
              className="bg-red-600 p-2 rounded-full text-white hover:bg-red-700 transition-all shadow-lg shadow-red-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-grow space-y-6 no-scrollbar">
          <div>
            <h2 className="text-2xl font-black text-gray-900 leading-tight">{product.name}</h2>
            <p className="text-sm text-gray-500 mt-2 font-medium">Infused Thigh Fillet Burger</p>
            <p className="text-xl font-bold text-red-600 mt-4">Rs. {product.price}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Add Ons</h3>
              <span className="text-[10px] bg-red-50 text-red-600 px-2 py-1 rounded-full font-bold uppercase tracking-wider">Optional</span>
            </div>
            
            <div className="space-y-3">
              {addons.map((addon) => (
                <div 
                  key={addon.id}
                  onClick={() => toggleAddon(addon.id)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedAddons.includes(addon.id)
                      ? 'border-red-600 bg-red-50/50'
                      : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      selectedAddons.includes(addon.id) ? 'bg-red-600 border-red-600' : 'border-gray-300'
                    }`}>
                      {selectedAddons.includes(addon.id) && <Plus className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm font-bold text-gray-700">{addon.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-red-600">Rs. {addon.price}</span>
                    <button className="bg-white border border-gray-200 text-red-600 px-3 py-1 rounded-lg text-[10px] font-bold shadow-sm">
                      Add +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-gray-900">Special Instructions</h3>
            <textarea 
              placeholder="E.g. No onions, extra spicy etc."
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 min-h-[100px] resize-none"
            />
          </div>
        </div>

        <div className="p-6 bg-white border-t border-gray-100 flex items-center gap-4">
          <div className="flex items-center bg-gray-100 rounded-2xl p-1">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-3 hover:bg-white rounded-xl transition-all text-gray-500"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-bold text-gray-900">{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="p-3 hover:bg-white rounded-xl transition-all text-gray-900"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={handleAddToCart}
            className="flex-grow bg-red-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-red-100 hover:bg-red-700 transition-all flex items-center justify-center gap-3"
          >
            <span>Add to Cart</span>
            <span className="w-1.5 h-1.5 bg-white/40 rounded-full"></span>
            <span>Rs. {product.price * quantity}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
