'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/hooks/useAuth';
import { collection, query, getDocs, addDoc, updateDoc, doc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Plus, Edit2, MapPin, Store, Users, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Branch {
  id: string;
  name: string;
  location: string;
  status: 'enabled' | 'disabled';
}

interface Restaurant {
  id: string;
  branchId: string;
  name: string;
  address: string;
  status: 'enabled' | 'disabled';
}

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingBranch, setIsAddingBranch] = useState(false);
  const [isAddingRestaurant, setIsAddingRestaurant] = useState(false);
  const [newBranch, setNewBranch] = useState({ name: '', location: '', status: 'enabled' as const });
  const [newRestaurant, setNewRestaurant] = useState({ branchId: '', name: '', address: '', status: 'enabled' as const });

  useEffect(() => {
    const fetchData = async () => {
      if (!profile) return;

      if (profile.role === 'super_admin') {
        const branchesSnap = await getDocs(collection(db, 'branches'));
        setBranches(branchesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Branch)));

        const restaurantsSnap = await getDocs(collection(db, 'restaurants'));
        setRestaurants(restaurantsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Restaurant)));
      } else if (profile.role === 'branch_manager') {
        const branchesSnap = await getDocs(query(collection(db, 'branches'), where('id', '==', profile.branchId)));
        setBranches(branchesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Branch)));

        const restaurantsSnap = await getDocs(query(collection(db, 'restaurants'), where('branchId', '==', profile.branchId)));
        setRestaurants(restaurantsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Restaurant)));
      } else if (profile.role === 'restaurant_admin') {
        const restaurantsSnap = await getDocs(query(collection(db, 'restaurants'), where('id', '==', profile.restaurantId)));
        setRestaurants(restaurantsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Restaurant)));
      }
      
      setLoading(false);
    };

    fetchData();
  }, [profile]);

  const handleAddBranch = async () => {
    const docRef = await addDoc(collection(db, 'branches'), newBranch);
    setBranches([...branches, { id: docRef.id, ...newBranch }]);
    setIsAddingBranch(false);
    setNewBranch({ name: '', location: '', status: 'enabled' });
  };

  const handleAddRestaurant = async () => {
    const docRef = await addDoc(collection(db, 'restaurants'), newRestaurant);
    setRestaurants([...restaurants, { id: docRef.id, ...newRestaurant }]);
    setIsAddingRestaurant(false);
    setNewRestaurant({ branchId: '', name: '', address: '', status: 'enabled' });
  };

  const toggleStatus = async (type: 'branches' | 'restaurants', id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'enabled' ? 'disabled' : 'enabled';
    await updateDoc(doc(db, type, id), { status: newStatus });
    
    if (type === 'branches') {
      setBranches(branches.map(b => b.id === id ? { ...b, status: newStatus as 'enabled' | 'disabled' } : b));
    } else {
      setRestaurants(restaurants.map(r => r.id === id ? { ...r, status: newStatus as 'enabled' | 'disabled' } : r));
    }
  };

  if (loading || !profile) return null;

  return (
    <AdminLayout title={`${profile.role.replace('_', ' ').toUpperCase()} Dashboard`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {profile.role === 'super_admin' && (
          <>
            <StatCard icon={MapPin} label="Total Branches" value={branches.length} color="blue" />
            <StatCard icon={Store} label="Total Restaurants" value={restaurants.length} color="emerald" />
            <StatCard icon={Users} label="Total Users" value="24" color="violet" />
            <StatCard icon={FileText} label="Total Invoices" value="12" color="orange" />
          </>
        )}
        {profile.role === 'branch_manager' && (
          <>
            <StatCard icon={Store} label="Branch Restaurants" value={restaurants.length} color="emerald" />
            <StatCard icon={Users} label="Branch Staff" value="8" color="violet" />
            <StatCard icon={FileText} label="Branch Invoices" value="4" color="orange" />
          </>
        )}
        {profile.role === 'restaurant_admin' && (
          <>
            <StatCard icon={Store} label="Restaurant Status" value={restaurants[0]?.status.toUpperCase()} color="emerald" />
            <StatCard icon={Users} label="Daily Orders" value="15" color="violet" />
            <StatCard icon={FileText} label="Daily Revenue" value="$450.00" color="orange" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Branches Section (Super Admin only) */}
        {profile.role === 'super_admin' && (
          <section className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
            <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900">Branches</h3>
              <button
                onClick={() => setIsAddingBranch(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Branch
              </button>
            </div>
            <div className="divide-y divide-zinc-100">
              {branches.map((branch) => (
                <div key={branch.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                  <div>
                    <p className="font-medium text-zinc-900">{branch.name}</p>
                    <p className="text-sm text-zinc-500">{branch.location}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={branch.status} onClick={() => toggleStatus('branches', branch.id, branch.status)} />
                    <button className="p-2 text-zinc-400 hover:text-zinc-600"><Edit2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Restaurants Section (Super Admin & Branch Manager) */}
        {(profile.role === 'super_admin' || profile.role === 'branch_manager') && (
          <section className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
            <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900">
                {profile.role === 'super_admin' ? 'All Restaurants' : 'Branch Restaurants'}
              </h3>
              {profile.role === 'super_admin' && (
                <button
                  onClick={() => setIsAddingRestaurant(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Restaurant
                </button>
              )}
            </div>
            <div className="divide-y divide-zinc-100">
              {restaurants.map((restaurant) => (
                <div key={restaurant.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                  <div>
                    <p className="font-medium text-zinc-900">{restaurant.name}</p>
                    <p className="text-xs text-zinc-400 uppercase tracking-wider mb-1">
                      {branches.find(b => b.id === restaurant.branchId)?.name || 'Branch Assigned'}
                    </p>
                    <p className="text-sm text-zinc-500">{restaurant.address}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={restaurant.status} onClick={() => profile.role === 'super_admin' ? toggleStatus('restaurants', restaurant.id, restaurant.status) : null} />
                    <button className="p-2 text-zinc-400 hover:text-zinc-600"><Edit2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Restaurant Admin View */}
        {profile.role === 'restaurant_admin' && (
          <section className="bg-white rounded-xl border border-zinc-200 overflow-hidden lg:col-span-2">
            <div className="p-6 border-b border-zinc-200">
              <h3 className="text-lg font-semibold text-zinc-900">My Restaurant: {restaurants[0]?.name}</h3>
              <p className="text-sm text-zinc-500 mt-1">{restaurants[0]?.address}</p>
            </div>
            <div className="p-12 text-center">
              <Store className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-zinc-900">Menu Management</h4>
              <p className="text-zinc-500 max-w-sm mx-auto mt-2">
                As a Restaurant Admin, you can manage your menu items, categories, and track daily orders.
              </p>
              <button className="mt-6 px-6 py-2 bg-zinc-900 text-white font-medium rounded-lg hover:bg-zinc-800 transition-colors">
                Manage Menu
              </button>
            </div>
          </section>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isAddingBranch && (
          <Modal title="Add New Branch" onClose={() => setIsAddingBranch(false)}>
            <div className="space-y-4">
              <Input label="Branch Name" value={newBranch.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewBranch({ ...newBranch, name: e.target.value })} />
              <Input label="Location" value={newBranch.location} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewBranch({ ...newBranch, location: e.target.value })} />
              <button
                onClick={handleAddBranch}
                className="w-full py-2 bg-zinc-900 text-white font-medium rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Create Branch
              </button>
            </div>
          </Modal>
        )}

        {isAddingRestaurant && (
          <Modal title="Add New Restaurant" onClose={() => setIsAddingRestaurant(false)}>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Select Branch</label>
                <select
                  value={newRestaurant.branchId}
                  onChange={(e) => setNewRestaurant({ ...newRestaurant, branchId: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
                >
                  <option value="">Select a branch</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <Input label="Restaurant Name" value={newRestaurant.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRestaurant({ ...newRestaurant, name: e.target.value })} />
              <Input label="Address" value={newRestaurant.address} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRestaurant({ ...newRestaurant, address: e.target.value })} />
              <button
                onClick={handleAddRestaurant}
                className="w-full py-2 bg-zinc-900 text-white font-medium rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Create Restaurant
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    violet: 'bg-violet-50 text-violet-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-zinc-200">
      <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center mb-4`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-sm font-medium text-zinc-500">{label}</p>
      <p className="text-2xl font-bold text-zinc-900 mt-1">{value}</p>
    </div>
  );
}

function StatusBadge({ status, onClick }: { status: string; onClick: () => void }) {
  const isEnabled = status === 'enabled';
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
        isEnabled ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-red-50 text-red-700 hover:bg-red-100'
      }`}
    >
      {isEnabled ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {status.toUpperCase()}
    </button>
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
