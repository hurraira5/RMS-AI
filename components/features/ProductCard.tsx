'use client';

import React from 'react';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
}

export default function ProductCard({ name, price, originalPrice, image, category }: ProductCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-1">{name}</h3>
        <p className="text-[10px] text-gray-500 uppercase font-semibold mb-3">{category}</p>
        
        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            {originalPrice && (
              <span className="text-[10px] text-gray-400 line-through">Rs. {originalPrice}</span>
            )}
            <span className="font-bold text-red-600 text-sm">Rs. {price}</span>
          </div>
          <button className="bg-red-600 text-white p-2 rounded-xl shadow-lg shadow-red-100 hover:bg-red-700 transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
