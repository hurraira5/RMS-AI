'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Package, ArrowRight } from 'lucide-react';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrack: (orderId: string) => void;
}

export default function TrackOrderModal({ isOpen, onClose, onTrack }: TrackOrderModalProps) {
  const [orderId, setOrderId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim()) {
      onTrack(orderId.trim());
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="bg-red-600 p-2 rounded-xl">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 leading-none">Track Order</h2>
                    <p className="text-xs text-gray-500 font-medium mt-1">Enter your Order ID to track status</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-600 transition-colors" />
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="Enter Order ID (e.g. y4jWTX)"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-5 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={!orderId.trim()}
                  className="w-full bg-red-600 text-white py-5 rounded-2xl font-bold shadow-xl shadow-red-100 hover:bg-red-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <span>Track Now</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              <div className="mt-8 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Where to find Order ID?</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  You can find your Order ID in the confirmation screen after placing an order or in your order history.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
