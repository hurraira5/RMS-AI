'use client';

import React, { useState } from 'react';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

export default function SmartSearch() {
  const [input, setInput] = useState('');
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSmartSearch = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `The user is hungry and says: "${input}". 
        Based on the menu of "Fuse" (which has Infused Thigh Fillet Burgers, Fire BOM Burgers, Infused Fried Chicken, and various appetizers), 
        suggest 1-2 items they should try. Keep it short, appetizing, and friendly.`,
      });
      setRecommendation(response.text || "I recommend trying our signature Fusion X Burger!");
    } catch (error) {
      console.error(error);
      setRecommendation("How about our classic Fusion X Burger? It's a crowd favorite!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-gradient-to-br from-red-600 to-red-800 rounded-[32px] p-6 text-white shadow-2xl shadow-red-200 overflow-hidden relative">
      <div className="relative z-10 space-y-4">
        <div className="flex items-center gap-2">
          <div className="bg-white/20 p-2 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="font-black text-lg">AI Smart Suggest</h2>
        </div>
        
        <p className="text-xs font-medium text-white/80">Tell me what you&apos;re craving or how you&apos;re feeling!</p>
        
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. I want something spicy and crispy..."
            className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-4 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 placeholder:text-white/40"
            onKeyPress={(e) => e.key === 'Enter' && handleSmartSearch()}
          />
          <button 
            onClick={handleSmartSearch}
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white text-red-600 p-2.5 rounded-xl shadow-lg disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>

        <AnimatePresence>
          {recommendation && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl text-sm leading-relaxed"
            >
              {recommendation}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative elements */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
    </section>
  );
}
