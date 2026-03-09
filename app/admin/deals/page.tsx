'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/hooks/useAuth';
import { collection, query, getDocs, addDoc, updateDoc, doc, deleteDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Plus, Edit2, Trash2, Tag, Percent, XCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Deal {
  id: string;
  branchId: string;
  name: string;
  description: string;
  discount: number;
  status: 'active' | 'expired';
}

interface Branch {
  id: string;
  name: string;
}

export default function DealsManagement() {
  const { profile } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAddingDeal, setIsAddingDeal] = useState(false);
  const [newDeal, setNewDeal] = useState({ name: '', description: '', discount: 0, status: 'active' as const });

  useEffect(() => {
    const fetchBranches = async () => {
      if (!profile) return;
      let q;
      if (profile.role === 'super_admin') {
        q = collection(db, 'branches');
      } else if (profile.role === 'branch_manager') {
        q = query(collection(db, 'branches'), where('id', '==', profile.branchId));
      } else {
        return;
      }

      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Branch));
      setBranches(data);
      if (data.length > 0) {
        setSelectedBranchId(data[0].id);
      }
      setLoading(false);
    };

    fetchBranches();
  }, [profile]);

  useEffect(() => {
    if (!selectedBranchId) return;

    const fetchDeals = async () => {
      const snap = await getDocs(collection(db, 'branches', selectedBranchId, 'deals'));
      setDeals(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Deal)));
    };

    fetchDeals();
  }, [selectedBranchId]);

  const handleAddDeal = async () => {
    if (!selectedBranchId) return;
    const docRef = await addDoc(collection(db, 'branches', selectedBranchId, 'deals'), {
      branchId: selectedBranchId,
      ...newDeal
    });
    setDeals([...deals, { id: docRef.id, branchId: selectedBranchId, ...newDeal }]);
    setIsAddingDeal(false);
    setNewDeal({ name: '', description: '', discount: 0, status: 'active' });
  };

  const toggleDealStatus = async (id: string, currentStatus: string) => {
    if (!selectedBranchId) return;
    const newStatus = currentStatus === 'active' ? 'expired' : 'active';
    await updateDoc(doc(db, 'branches', selectedBranchId, 'deals', id), { status: newStatus });
    setDeals(deals.map(d => d.id === id ? { ...d, status: newStatus as 'active' | 'expired' } : d));
  };

  const handleDeleteDeal = async (id: string) => {
    if (!selectedBranchId) return;
    await deleteDoc(doc(db, 'branches', selectedBranchId, 'deals', id));
    setDeals(deals.filter(d => d.id !== id));
  };

  if (loading || !profile) return null;

  return (
    <AdminLayout title="Branch Deals">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 max-w-xs">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Selected Branch</label>
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
          >
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <button
          onClick={() => setIsAddingDeal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create New Deal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deals.map((deal) => (
          <motion.div
            key={deal.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4">
              <button 
                onClick={() => toggleDealStatus(deal.id, deal.status)}
                className={`p-2 rounded-lg transition-colors ${deal.status === 'active' ? 'text-emerald-600 bg-emerald-50' : 'text-zinc-400 bg-zinc-50'}`}
              >
                {deal.status === 'active' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              </button>
            </div>

            <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center mb-4">
              <Percent className="w-6 h-6 text-white" />
            </div>

            <h3 className="text-lg font-bold text-zinc-900 mb-1">{deal.name}</h3>
            <p className="text-sm text-zinc-500 mb-4 line-clamp-2">{deal.description}</p>
            
            <div className="flex items-center justify-between mt-auto">
              <div className="px-3 py-1 bg-zinc-100 rounded-full text-xs font-bold text-zinc-900">
                {deal.discount}% OFF
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-zinc-400 hover:text-zinc-600"><Edit2 className="w-4 h-4" /></button>
                <button 
                  onClick={() => handleDeleteDeal(deal.id)}
                  className="p-2 text-zinc-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </motion.div>
        ))}
        {deals.length === 0 && (
          <div className="col-span-full py-20 text-center bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200">
            <Tag className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <p className="text-zinc-500 font-medium">No active deals for this branch.</p>
            <button 
              onClick={() => setIsAddingDeal(true)}
              className="mt-4 text-sm font-bold text-zinc-900 hover:underline"
            >
              Create your first deal
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isAddingDeal && (
          <Modal title="Create Branch Deal" onClose={() => setIsAddingDeal(false)}>
            <div className="space-y-4">
              <Input label="Deal Name" value={newDeal.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDeal({ ...newDeal, name: e.target.value })} placeholder="e.g. Weekend Special" />
              <Input label="Description" value={newDeal.description} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDeal({ ...newDeal, description: e.target.value })} />
              <Input label="Discount Percentage (%)" type="number" value={newDeal.discount} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDeal({ ...newDeal, discount: parseFloat(e.target.value) })} />
              <button
                onClick={handleAddDeal}
                className="w-full py-2 bg-zinc-900 text-white font-medium rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Launch Deal
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
