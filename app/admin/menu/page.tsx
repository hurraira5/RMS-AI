'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/hooks/useAuth';
import { collection, query, getDocs, addDoc, doc, deleteDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Plus, Edit2, Trash2, Tag, Utensils, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MenuCategory {
  id: string;
  restaurantId: string;
  name: string;
}

interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

interface Restaurant {
  id: string;
  name: string;
  branchId: string;
}

export default function MenuManagement() {
  const { profile } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '' });
  const [newItem, setNewItem] = useState({ categoryId: '', name: '', description: '', price: 0, imageUrl: '' });

  useEffect(() => {
    const fetchRestaurants = async () => {
      if (!profile) return;
      let q;
      if (profile.role === 'super_admin') {
        q = collection(db, 'restaurants');
      } else if (profile.role === 'branch_manager') {
        q = query(collection(db, 'restaurants'), where('branchId', '==', profile.branchId));
      } else if (profile.role === 'restaurant_admin') {
        q = query(collection(db, 'restaurants'), where('id', '==', profile.restaurantId));
      } else {
        return;
      }

      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Restaurant));
      setRestaurants(data);
      if (data.length > 0) {
        setSelectedRestaurantId(data[0].id);
      }
      setLoading(false);
    };

    fetchRestaurants();
  }, [profile]);

  useEffect(() => {
    if (!selectedRestaurantId) return;

    const fetchMenuData = async () => {
      const catSnap = await getDocs(collection(db, 'restaurants', selectedRestaurantId, 'categories'));
      setCategories(catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuCategory)));

      const itemSnap = await getDocs(collection(db, 'restaurants', selectedRestaurantId, 'items'));
      setItems(itemSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem)));
    };

    fetchMenuData();
  }, [selectedRestaurantId]);

  const handleAddCategory = async () => {
    if (!selectedRestaurantId) return;
    const docRef = await addDoc(collection(db, 'restaurants', selectedRestaurantId, 'categories'), {
      restaurantId: selectedRestaurantId,
      ...newCategory
    });
    setCategories([...categories, { id: docRef.id, restaurantId: selectedRestaurantId, ...newCategory }]);
    setIsAddingCategory(false);
    setNewCategory({ name: '' });
  };

  const handleAddItem = async () => {
    if (!selectedRestaurantId) return;
    const docRef = await addDoc(collection(db, 'restaurants', selectedRestaurantId, 'items'), {
      restaurantId: selectedRestaurantId,
      ...newItem
    });
    setItems([...items, { id: docRef.id, restaurantId: selectedRestaurantId, ...newItem }]);
    setIsAddingItem(false);
    setNewItem({ categoryId: '', name: '', description: '', price: 0, imageUrl: '' });
  };

  const handleDeleteItem = async (id: string) => {
    if (!selectedRestaurantId) return;
    await deleteDoc(doc(db, 'restaurants', selectedRestaurantId, 'items', id));
    setItems(items.filter(i => i.id !== id));
  };

  if (loading || !profile) return null;

  return (
    <AdminLayout title="Menu Management">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 max-w-xs">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Selected Restaurant</label>
          <select
            value={selectedRestaurantId}
            onChange={(e) => setSelectedRestaurantId(e.target.value)}
            className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
          >
            {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsAddingCategory(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-zinc-700 text-sm font-medium rounded-lg hover:bg-zinc-50 transition-colors"
          >
            <Tag className="w-4 h-4" />
            Add Category
          </button>
          <button
            onClick={() => setIsAddingItem(true)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {categories.map((category) => (
          <section key={category.id} className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
            <div className="p-6 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
              <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-zinc-400" />
                {category.name}
              </h3>
              <span className="text-xs font-medium text-zinc-500 bg-white px-2 py-1 rounded border border-zinc-200">
                {items.filter(i => i.categoryId === category.id).length} Items
              </span>
            </div>
            
            <div className="divide-y divide-zinc-100">
              {items.filter(i => i.categoryId === category.id).map((item) => (
                <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-zinc-50 transition-colors">
                  <div className="w-16 h-16 rounded-lg bg-zinc-100 flex-shrink-0 overflow-hidden">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-300">
                        <Utensils className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-zinc-900">{item.name}</p>
                      <p className="font-bold text-zinc-900">${item.price.toFixed(2)}</p>
                    </div>
                    <p className="text-sm text-zinc-500 line-clamp-1">{item.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-all">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {items.filter(i => i.categoryId === category.id).length === 0 && (
                <div className="p-8 text-center text-zinc-400 text-sm italic">
                  No items in this category yet.
                </div>
              )}
            </div>
          </section>
        ))}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isAddingCategory && (
          <Modal title="Add Menu Category" onClose={() => setIsAddingCategory(false)}>
            <div className="space-y-4">
              <Input label="Category Name" value={newCategory.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCategory({ name: e.target.value })} placeholder="e.g. Main Course, Desserts" />
              <button
                onClick={handleAddCategory}
                className="w-full py-2 bg-zinc-900 text-white font-medium rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Create Category
              </button>
            </div>
          </Modal>
        )}

        {isAddingItem && (
          <Modal title="Add Menu Item" onClose={() => setIsAddingItem(false)}>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Category</label>
                <select
                  value={newItem.categoryId}
                  onChange={(e) => setNewItem({ ...newItem, categoryId: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
                >
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <Input label="Item Name" value={newItem.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItem({ ...newItem, name: e.target.value })} />
              <Input label="Description" value={newItem.description} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItem({ ...newItem, description: e.target.value })} />
              <Input label="Price ($)" type="number" value={newItem.price} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })} />
              <Input label="Image URL" value={newItem.imageUrl} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItem({ ...newItem, imageUrl: e.target.value })} />
              <button
                onClick={handleAddItem}
                className="w-full py-2 bg-zinc-900 text-white font-medium rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Add to Menu
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900">{title}</h3>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600"><XCircle className="w-5 h-5" /></button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

function Input({ label, ...props }: InputProps) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{label}</label>
      <input
        {...props}
        className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
      />
    </div>
  );
}
