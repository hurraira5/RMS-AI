'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';

const categories = [
  { id: 'infused-fish', label: 'INFUSED FISH' },
  { id: 'appetisers', label: 'APPETISERS' },
  { id: 'burgers', label: 'BURGERS' },
  { id: 'infused-fried-chick', label: 'INFUSED FRIED CHICK' },
];

export default function CategoryTabs() {
  const [activeTab, setActiveTab] = useState('burgers');

  return (
    <div className="flex overflow-x-auto no-scrollbar gap-2 px-4 py-4 bg-white sticky top-[65px] z-40 border-b border-gray-50">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => setActiveTab(category.id)}
          className={`whitespace-nowrap px-6 py-2.5 rounded-full text-xs font-bold transition-all duration-200 border ${
            activeTab === category.id
              ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-100'
              : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}
