'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Printer, RefreshCcw, Phone, Mail, MapPin, Calendar, Clock, ShoppingBag, CreditCard, User } from 'lucide-react';
import Image from 'next/image';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';

interface OrderSuccessProps {
  orderId: string | null;
  onNewOrder: () => void;
}

export default function OrderSuccess({ orderId, onNewOrder }: OrderSuccessProps) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(!!orderId);

  useEffect(() => {
    if (!orderId) return;

    const unsubscribe = onSnapshot(doc(db, 'orders', orderId), (snapshot) => {
      if (snapshot.exists()) {
        setOrder({ id: snapshot.id, ...snapshot.data() });
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `orders/${orderId}`);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-600';
      case 'accepted': return 'bg-blue-100 text-blue-600';
      case 'preparing': return 'bg-orange-100 text-orange-600';
      case 'delivered': return 'bg-emerald-100 text-emerald-600';
      case 'cancelled': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'accepted': return 'bg-blue-500';
      case 'preparing': return 'bg-orange-500';
      case 'delivered': return 'bg-emerald-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'pending': return 0;
      case 'accepted': return 1;
      case 'preparing': return 2;
      case 'delivered': return 3;
      case 'cancelled': return -1;
      default: return 0;
    }
  };

  const steps = [
    { label: 'Pending', icon: Clock },
    { label: 'Accepted', icon: CheckCircle2 },
    { label: 'Preparing', icon: Flame },
    { label: 'Delivered', icon: MapPin },
  ];

  const currentStep = getStatusStep(order?.status || 'pending');

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white p-8 flex flex-col items-center text-center space-y-6">
        <div className="bg-red-600 text-white px-4 py-2 rounded-xl font-black text-3xl tracking-tighter">
          FUSE
        </div>
        
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-emerald-500 text-white px-8 py-6 rounded-[32px] w-full max-w-md shadow-2xl shadow-emerald-100 relative overflow-hidden"
        >
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative z-10 flex flex-col items-center gap-4"
          >
            <div className="bg-white/20 p-2 rounded-full">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-3xl font-black leading-tight">Thank You!</h1>
              <p className="text-sm font-bold opacity-90 mt-1">Your order has been placed successfully</p>
            </div>
          </motion.div>
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full" />
        </motion.div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Real-time Tracking Stepper */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-gray-900 uppercase tracking-tight">Order Tracking</h3>
            <span className={`${getStatusColor(order?.status || 'pending')} px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest`}>
              {order?.status || 'Pending'}
            </span>
          </div>

          <div className="relative flex justify-between">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-100 -z-0">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: currentStep >= 0 ? `${(currentStep / (steps.length - 1)) * 100}%` : '0%' }}
                className="h-full bg-red-600"
              />
            </div>

            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index <= currentStep;
              const isCurrent = index === currentStep;
              const isCancelled = order?.status === 'cancelled';

              return (
                <div key={index} className="relative z-10 flex flex-col items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isCancelled ? 'bg-gray-100 text-gray-400' :
                    isActive ? 'bg-red-600 text-white shadow-lg shadow-red-100' : 'bg-white border-2 border-gray-100 text-gray-300'
                  }`}>
                    <Icon className={`w-5 h-5 ${isCurrent && !isCancelled ? 'animate-pulse' : ''}`} />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    isCancelled ? 'text-gray-400' :
                    isActive ? 'text-red-600' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {order?.status === 'cancelled' && (
            <div className="mt-6 p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3">
              <div className="bg-red-600 p-1.5 rounded-full">
                <Clock className="w-3 h-3 text-white" />
              </div>
              <p className="text-xs font-bold text-red-600">This order has been cancelled.</p>
            </div>
          )}
        </div>

        {/* Order Details Card */}
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order ID:</p>
            <h2 className="text-xl font-black text-gray-900">{orderId?.slice(-6).toUpperCase() || 'N/A'}</h2>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Est. Delivery</p>
            <p className="text-sm font-black text-gray-900">35-45 Mins</p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-red-50 p-2 rounded-xl">
              <User className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="font-bold text-gray-900">Customer Information</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer Name</p>
              <p className="text-sm font-bold text-gray-700">{order?.customerName || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mobile Number</p>
              <p className="text-sm font-bold text-gray-700">{order?.phone || 'N/A'}</p>
            </div>
            <div className="col-span-2 space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</p>
              <p className="text-sm font-bold text-gray-700">{order?.email || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-red-50 p-2 rounded-xl">
              <MapPin className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="font-bold text-gray-900">Delivery Information</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2 space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Delivery Address</p>
              <p className="text-sm font-bold text-gray-700">{order?.address || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Landmark</p>
              <p className="text-sm font-bold text-gray-700">{order?.landmark || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order Type</p>
              <p className="text-sm font-bold text-gray-700 capitalize">{order?.orderType || 'Delivery'}</p>
            </div>
            <div className="col-span-2 space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order Date</p>
              <p className="text-sm font-bold text-gray-700">{formatDate(order?.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-red-50 p-2 rounded-xl">
              <ShoppingBag className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="font-bold text-gray-900">Products</h3>
          </div>
          
          <div className="space-y-4">
            {order?.items?.map((item: any, idx: number) => (
              <div key={idx} className="flex gap-4 border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100">
                  <Image src={`https://picsum.photos/seed/${item.id}/100/100`} alt={item.name} fill className="object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-grow">
                  <h4 className="font-bold text-sm text-gray-900">{item.name}</h4>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  {item.addons?.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Extras</p>
                      {item.addons.map((addon: any, aidx: number) => (
                        <div key={aidx} className="flex items-center gap-2 text-[10px] font-bold text-gray-600">
                          <span className="w-1 h-1 bg-red-600 rounded-full" />
                          <span>{addon.name}</span>
                          <span className="text-red-600 ml-auto">Rs. {addon.price}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">Rs. {item.price * item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-red-50 p-2 rounded-xl">
                <CreditCard className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-bold text-gray-900">Payment Details</h3>
            </div>
            <span className="bg-red-600 text-white px-4 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest capitalize">{order?.paymentMethod || 'COD'}</span>
          </div>
          
          <div className="space-y-3 pt-4 border-t border-gray-50">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Subtotal</span>
              <span className="text-gray-900 font-bold">Rs. {order?.total || 0}</span>
            </div>
            <div className="flex justify-between text-xl pt-4 border-t border-gray-100">
              <span className="text-gray-900 font-black">Total Amount</span>
              <span className="text-red-600 font-black">Rs. {order?.total || 0}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <button className="bg-white border border-gray-200 text-gray-700 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
            <Printer className="w-5 h-5" />
            Print
          </button>
          <button 
            onClick={onNewOrder}
            className="bg-red-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-red-100 hover:bg-red-700 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCcw className="w-5 h-5" />
            New Order
          </button>
        </div>

        <div className="text-center space-y-4 pt-8 pb-12">
          <h4 className="text-lg font-black text-gray-900">Need Support?</h4>
          <p className="text-xs text-gray-500 font-medium">Question regarding your order? Call us:</p>
          <a href="tel:0334-9229122" className="text-2xl font-black text-red-600 hover:underline">0334-9229122</a>
        </div>
      </div>
    </div>
  );
}
