'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const slides = [
  {
    id: 1,
    image: 'https://picsum.photos/seed/burger1/1200/600',
    title: "HUNGRY? LET'S DOUBLE UP",
    subtitle: "JUST DROPPED, JUST DROPPED"
  },
  {
    id: 2,
    image: 'https://picsum.photos/seed/burger2/1200/600',
    title: "SEA-RIOUSLY GOOD",
    subtitle: "NEW SEAFOOD BURGER"
  }
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full aspect-[21/9] md:aspect-[3/1] overflow-hidden bg-gray-100">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-full h-full"
        >
          <Image
            src={slides[current].image}
            alt={slides[current].title}
            fill
            className="object-cover"
            priority
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent flex flex-col justify-center px-8 md:px-16">
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-white font-black text-2xl md:text-5xl max-w-md leading-tight"
            >
              {slides[current].title}
            </motion.h2>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-white/80 text-xs md:text-sm font-bold mt-2 uppercase tracking-widest"
            >
              {slides[current].subtitle}
            </motion.p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              current === i ? 'bg-white w-6' : 'bg-white/50'
            }`}
          />
        ))}
      </div>

      <button 
        onClick={() => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full text-white hidden md:block"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button 
        onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full text-white hidden md:block"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
}
