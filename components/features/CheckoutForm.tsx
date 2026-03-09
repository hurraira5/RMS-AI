'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, MapPin, Phone, Mail, CreditCard, Banknote, Landmark, Plus, ShoppingCart } from 'lucide-react';
import { useCart } from '@/components/features/CartProvider';
import { useAuth } from '@/components/features/FirebaseProvider';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';

interface CheckoutFormProps {
  onBack: () => void;
  onPlaceOrder: (orderId: string) => void;
}

export default function CheckoutForm({ onBack, onPlaceOrder }: CheckoutFormProps) {
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isPlacing, setIsPlacing] = useState(false);
  const { items, total, clearCart } = useCart();
  const { user, profile } = useAuth();

  const [formData, setFormData] = useState({
    title: 'Mr.',
    fullName: profile?.name || user?.displayName || '',
    mobile: profile?.phone || '',
    altMobile: '',
    address: 'Bahadurabad, Karachi',
    landmark: '',
    email: user?.email || '',
    instructions: '',
    changeRequest: ''
  });

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    
    setIsPlacing(true);
    try {
      const orderData = {
        uid: user?.uid || 'anonymous',
        customerName: formData.fullName,
        email: formData.email,
        phone: formData.mobile,
        address: formData.address,
        landmark: formData.landmark,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          addons: item.addons || []
        })),
        total: total,
        paymentMethod: paymentMethod,
        orderType: 'Delivery',
        status: 'pending',
        createdAt: serverTimestamp(),
        instructions: formData.instructions,
        changeRequest: formData.changeRequest
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      clearCart();
      onPlaceOrder(docRef.id);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'orders');
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-black text-gray-900">Checkout</h1>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-8">
        <div className="bg-red-50 p-4 rounded-2xl flex items-center gap-4">
          <div className="bg-red-600 p-2 rounded-xl">
            <motion.div 
              animate={{ x: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Landmark className="w-5 h-5 text-white" />
            </motion.div>
          </div>
          <div>
            <p className="text-xs font-bold text-red-600 uppercase tracking-widest">Delivery Order</p>
            <p className="text-[10px] text-red-400 font-medium">Just a last step, please enter your details:</p>
          </div>
        </div>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Title</label>
              <select 
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              >
                <option>Mr.</option>
                <option>Ms.</option>
                <option>Mrs.</option>
              </select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
              <input 
                type="text" 
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Full Name" 
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Mobile Number</label>
              <input 
                type="text" 
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="03xx-xxxxxxx" 
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Alternate Mobile</label>
              <input 
                type="text" 
                value={formData.altMobile}
                onChange={(e) => setFormData({ ...formData, altMobile: e.target.value })}
                placeholder="03xx-xxxxxxx" 
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" 
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Select Address</label>
              <button className="text-[10px] font-bold text-red-600 flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add New Address
              </button>
            </div>
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
              <div className="bg-red-600 p-1.5 rounded-full">
                <MapPin className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-bold text-gray-700">{formData.address}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Nearest Landmark</label>
            <input 
              type="text" 
              value={formData.landmark}
              onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
              placeholder="any famous place nearby" 
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Email" 
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Delivery Instructions</label>
            <textarea 
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="Delivery Instructions" 
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 min-h-[80px] resize-none" 
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Payment Information</label>
            <div className="grid grid-cols-2 gap-4">
              <button 
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                  paymentMethod === 'cod' ? 'border-red-600 bg-red-50' : 'border-gray-100 bg-gray-50'
                }`}
              >
                <Banknote className={`w-8 h-8 ${paymentMethod === 'cod' ? 'text-red-600' : 'text-gray-400'}`} />
                <span className={`text-xs font-bold ${paymentMethod === 'cod' ? 'text-red-600' : 'text-gray-500'}`}>Cash on Delivery</span>
              </button>
              <button 
                type="button"
                onClick={() => setPaymentMethod('bank')}
                className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                  paymentMethod === 'bank' ? 'border-red-600 bg-red-50' : 'border-gray-100 bg-gray-50'
                }`}
              >
                <Landmark className={`w-8 h-8 ${paymentMethod === 'bank' ? 'text-red-600' : 'text-gray-400'}`} />
                <span className={`text-xs font-bold ${paymentMethod === 'bank' ? 'text-red-600' : 'text-gray-500'}`}>Bank Transfer</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Change Request</label>
            <input 
              type="text" 
              value={formData.changeRequest}
              onChange={(e) => setFormData({ ...formData, changeRequest: e.target.value })}
              placeholder="Rs. 500" 
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" 
            />
          </div>
        </form>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 z-50">
        <button 
          onClick={handlePlaceOrder}
          disabled={isPlacing || items.length === 0}
          className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold shadow-2xl shadow-red-200 hover:bg-red-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPlacing ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <ShoppingCart className="w-5 h-5" />
          )}
          <span>{isPlacing ? 'Placing Order...' : `Place Order - Rs. ${total}`}</span>
        </button>
      </div>
    </div>
  );
}
