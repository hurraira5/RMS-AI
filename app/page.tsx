'use client';

import React from 'react';
import EstimatedDelivery from '@/components/features/EstimatedDelivery';
import { motion } from 'motion/react';
import { ShoppingBag, ChevronLeft } from 'lucide-react';

export default function OrderTrackingPage() {
  // Simulate an order placed 5 minutes ago
  const orderTime = new Date(Date.now() - 5 * 60000);

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-12">
      {/* Header */}
      <header className="bg-white border-bottom border-black/5 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-lg">Track Order</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </header>

      <div className="max-w-md mx-auto px-6 mt-8">
        {/* Order Info Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black text-white rounded-2xl p-6 mb-6 shadow-xl"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-white/60 text-xs uppercase tracking-widest font-bold">Order #88291</p>
              <p className="text-xl font-bold">Burger King • 3 items</p>
            </div>
          </div>
          <div className="h-px bg-white/10 w-full mb-4" />
          <div className="flex justify-between items-center">
            <p className="text-sm text-white/80">Total Amount</p>
            <p className="text-xl font-bold">$42.50</p>
          </div>
        </motion.div>

        {/* Estimated Delivery Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <EstimatedDelivery 
            orderTime={orderTime}
            basePrepTime={12}
            distanceKm={2.8}
          />
        </motion.div>

        {/* Delivery Address */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 mt-6 shadow-sm border border-black/5"
        >
          <div className="flex items-start gap-4">
            <div className="bg-gray-50 p-3 rounded-xl">
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Delivery Address</p>
              <p className="font-bold text-sm">4521 Maple Avenue</p>
              <p className="text-xs text-gray-500">Apt 4B, Los Angeles, CA 90001</p>
            </div>
          </div>
        </motion.div>

        {/* Support Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full mt-8 py-4 text-gray-500 text-sm font-medium hover:text-black transition-colors"
        >
          Need help with your order?
        </motion.button>
      </div>
    </main>
  );
}
