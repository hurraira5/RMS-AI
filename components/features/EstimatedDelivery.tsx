'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, Truck, CheckCircle2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface EstimatedDeliveryProps {
  orderTime?: Date;
  basePrepTime?: number; // in minutes
  distanceKm?: number;
  className?: string;
}

export default function EstimatedDelivery({
  orderTime = new Date(),
  basePrepTime = 15,
  distanceKm = 3.5,
  className,
}: EstimatedDeliveryProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [status, setStatus] = useState<'preparing' | 'delivering' | 'arrived'>('preparing');
  const [progress, setProgress] = useState(0);

  // Calculate total estimated time
  const deliverySpeed = 5; // minutes per km
  const totalEstimatedMinutes = basePrepTime + Math.ceil(distanceKm * deliverySpeed);
  const arrivalTime = new Date(orderTime.getTime() + totalEstimatedMinutes * 60000);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diff = arrivalTime.getTime() - now.getTime();
      const minutesLeft = Math.max(0, Math.ceil(diff / 60000));
      
      setTimeLeft(minutesLeft);

      // Simple status logic based on time left
      const totalSeconds = totalEstimatedMinutes * 60;
      const currentSeconds = Math.max(0, diff / 1000);
      const elapsedPercent = 100 - (currentSeconds / totalSeconds) * 100;
      setProgress(elapsedPercent);

      if (minutesLeft === 0) {
        setStatus('arrived');
      } else if (minutesLeft < (distanceKm * deliverySpeed)) {
        setStatus('delivering');
      } else {
        setStatus('preparing');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [arrivalTime, distanceKm, totalEstimatedMinutes]);

  const statusConfig = {
    preparing: {
      label: 'Preparing your meal',
      icon: <Clock className="w-5 h-5 text-orange-500" />,
      color: 'bg-orange-500',
      description: 'The kitchen is working its magic.',
    },
    delivering: {
      label: 'Out for delivery',
      icon: <Truck className="w-5 h-5 text-blue-500" />,
      color: 'bg-blue-500',
      description: 'Your rider is on the way to you.',
    },
    arrived: {
      label: 'Arrived!',
      icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
      color: 'bg-green-500',
      description: 'Enjoy your delicious meal!',
    },
  };

  const currentStatus = statusConfig[status];

  return (
    <div id="estimated-delivery-container" className={cn("bg-white rounded-2xl p-6 shadow-sm border border-black/5", className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Estimated Arrival</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold tracking-tight">
              {status === 'arrived' ? '0' : timeLeft}
            </span>
            <span className="text-lg font-medium text-gray-500">mins</span>
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded-full">
          {currentStatus.icon}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-8">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("absolute top-0 left-0 h-full rounded-full", currentStatus.color)}
        />
      </div>

      {/* Status Steps */}
      <div className="space-y-6">
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={cn(
              "w-3 h-3 rounded-full ring-4 ring-white",
              progress >= 0 ? "bg-orange-500" : "bg-gray-200"
            )} />
            <div className="w-0.5 h-full bg-gray-100 mt-1" />
          </div>
          <div>
            <p className={cn("text-sm font-semibold", status === 'preparing' ? "text-black" : "text-gray-400")}>
              Order Confirmed
            </p>
            <p className="text-xs text-gray-400">Kitchen is preparing</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={cn(
              "w-3 h-3 rounded-full ring-4 ring-white",
              status === 'delivering' || status === 'arrived' ? "bg-blue-500" : "bg-gray-200"
            )} />
            <div className="w-0.5 h-full bg-gray-100 mt-1" />
          </div>
          <div>
            <p className={cn("text-sm font-semibold", status === 'delivering' ? "text-black" : "text-gray-400")}>
              On the Way
            </p>
            <p className="text-xs text-gray-400">Rider picked up your order</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={cn(
              "w-3 h-3 rounded-full ring-4 ring-white",
              status === 'arrived' ? "bg-green-500" : "bg-gray-200"
            )} />
          </div>
          <div>
            <p className={cn("text-sm font-semibold", status === 'arrived' ? "text-black" : "text-gray-400")}>
              Delivered
            </p>
            <p className="text-xs text-gray-400">Enjoy your food</p>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
          <img 
            src="https://picsum.photos/seed/rider/100/100" 
            alt="Rider" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold">Alex Johnson</p>
          <p className="text-xs text-gray-500">Your Delivery Hero</p>
        </div>
        <button className="px-4 py-2 bg-black text-white text-xs font-bold rounded-full hover:bg-gray-800 transition-colors">
          Call
        </button>
      </div>
    </div>
  );
}
