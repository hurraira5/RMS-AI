'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Phone, ChevronDown } from 'lucide-react';

export default function OrderTypeModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [orderType, setOrderType] = useState('Delivery');
  const [location, setLocation] = useState('Bahadurabad');
  const [phone, setPhone] = useState('0313-3553345');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl"
      >
        <div className="bg-red-600 p-8 flex justify-center">
          <div className="bg-white text-red-600 px-4 py-2 rounded-xl font-black text-3xl tracking-tighter">
            FUSE
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900">Select Your Order Type</h2>
          </div>

          <div className="flex p-1 bg-gray-100 rounded-2xl">
            {['Delivery', 'Pick-Up', 'Car hop'].map((type) => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
                  orderType === type 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-100' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Please select your location</label>
              <div className="relative">
                <select 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-4 text-sm font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                >
                  <option>Bahadurabad</option>
                  <option>DHA Phase 6</option>
                  <option>Askari 4</option>
                  <option>Gulshan-e-Iqbal</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Phone Number</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-red-100 hover:bg-red-700 transition-all active:scale-[0.98]"
          >
            Select
          </button>
        </div>
      </motion.div>
    </div>
  );
}
