'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingCart, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '@/components/features/CartProvider';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export default function CartDrawer({ isOpen, onClose, onCheckout }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, total } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex justify-end">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-50 p-2 rounded-xl">
              <ShoppingCart className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-black text-gray-900">Your Cart</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-all"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-6 no-scrollbar">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="bg-gray-50 p-8 rounded-full">
                <ShoppingCart className="w-16 h-16 text-gray-200" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Your cart is empty</h3>
                <p className="text-sm text-gray-500 mt-1">Add some delicious items to get started!</p>
              </div>
              <button 
                onClick={onClose}
                className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-red-100"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="space-y-4">
                <div className="flex gap-4">
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-sm text-gray-900 leading-tight">{item.name}</h3>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-gray-300 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs font-bold text-red-600 mt-1">Rs. {item.price}</p>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center bg-gray-50 rounded-xl p-0.5 border border-gray-100">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1.5 hover:bg-white rounded-lg transition-all text-gray-400"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-gray-900">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1.5 hover:bg-white rounded-lg transition-all text-gray-900"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {item.addons && item.addons.length > 0 && (
                  <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Add-ons</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.addons.map((addon: any, i: number) => (
                        <span key={i} className="text-[10px] bg-white border border-gray-100 px-2 py-1 rounded-lg text-gray-600 font-medium">
                          {addon}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          {items.length > 0 && (
            <button 
              onClick={onClose}
              className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold text-sm hover:border-red-200 hover:text-red-500 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add more items
            </button>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Subtotal</span>
              <span className="text-gray-900 font-bold">Rs. {total}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Delivery Fee</span>
              <span className="text-green-600 font-bold">FREE</span>
            </div>
            <div className="flex justify-between text-lg pt-3 border-t border-gray-200">
              <span className="text-gray-900 font-black">Grand Total</span>
              <span className="text-red-600 font-black">Rs. {total}</span>
            </div>

            <button 
              onClick={onCheckout}
              className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold shadow-2xl shadow-red-200 hover:bg-red-700 transition-all flex items-center justify-between px-8 mt-4"
            >
              <div className="flex flex-col items-start">
                <span className="text-[10px] opacity-80 uppercase tracking-widest">Grand Total</span>
                <span className="text-lg">Rs. {total}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Checkout</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </button>
            
            <p className="text-[10px] text-gray-400 text-center mt-4">
              Your order will be delivered approximately in 60 minutes
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
