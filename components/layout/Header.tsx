'use client';

import React from 'react';
import { ShoppingCart, User, Bell, MapPin, Menu, LogOut, LogIn, Package } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '@/components/features/FirebaseProvider';

interface HeaderProps {
  onTrackOrder?: () => void;
}

export default function Header({ onTrackOrder }: HeaderProps) {
  const { user, profile, signIn, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <button className="p-2 hover:bg-gray-100 rounded-full lg:hidden">
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
        <div className="flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold text-xl tracking-tighter">
          <span>FUSE</span>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-600 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
        <MapPin className="w-4 h-4 text-red-500" />
        <span>Bahadurabad, Karachi</span>
      </div>

      <div className="flex items-center gap-1 md:gap-3">
        <button 
          onClick={onTrackOrder}
          className="hidden sm:flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-600 transition-all border border-transparent hover:border-gray-100"
        >
          <Package className="w-4 h-4 text-red-600" />
          <span>Track Order</span>
        </button>

        <button className="p-2 hover:bg-gray-100 rounded-full relative">
          <Bell className="w-6 h-6 text-gray-700" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-50 rounded-full border-2 border-white"></span>
        </button>
        
        {user ? (
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-[10px] font-bold text-gray-900 leading-none">{profile?.name || user.displayName}</span>
              <span className="text-[8px] text-gray-400 uppercase tracking-widest">{profile?.role || 'Client'}</span>
            </div>
            <button 
              onClick={logout}
              className="p-2 hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-full transition-all"
              title="Logout"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        ) : (
          <button 
            onClick={signIn}
            className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 transition-all border border-gray-100"
          >
            <LogIn className="w-4 h-4" />
            <span>Login</span>
          </button>
        )}

        <button className="p-2 hover:bg-gray-100 rounded-full relative bg-red-50">
          <ShoppingCart className="w-6 h-6 text-red-600" />
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
            2
          </span>
        </button>
      </div>
    </header>
  );
}
