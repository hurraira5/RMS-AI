'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/hooks/useAuth';
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Plus, FileText, CheckCircle2, XCircle, DollarSign, Calendar, Store, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Invoice {
  id: string;
  restaurantId: string;
  branchId: string;
  amount: number;
  date: { toDate?: () => Date } | string | Date;
  status: 'paid' | 'pending';
}

interface Branch {
  id: string;
  name: string;
}

interface Restaurant {
  id: string;
  name: string;
  branchId: string;
}

export default function InvoiceManagement() {
  const { profile } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAddingInvoice, setIsAddingInvoice] = useState(false);
  const [newInvoice, setNewInvoice] = useState({ restaurantId: '', branchId: '', amount: 0, status: 'pending' as const });

  useEffect(() => {
    const fetchData = async () => {
      if (!profile || profile.role !== 'super_admin') return;

      const invSnap = await getDocs(collection(db, 'invoices'));
      setInvoices(invSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice)));

      const branchSnap = await getDocs(collection(db, 'branches'));
      setBranches(branchSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Branch)));

      const restSnap = await getDocs(collection(db, 'restaurants'));
      setRestaurants(restSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Restaurant)));

      setLoading(false);
    };

    fetchData();
  }, [profile]);

  const handleAddInvoice = async () => {
    const docRef = await addDoc(collection(db, 'invoices'), {
      ...newInvoice,
      date: serverTimestamp()
    });
    setInvoices([...invoices, { id: docRef.id, ...newInvoice, date: new Date() }]);
    setIsAddingInvoice(false);
    setNewInvoice({ restaurantId: '', branchId: '', amount: 0, status: 'pending' });
  };

  const toggleInvoiceStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'pending' ? 'paid' : 'pending';
    await updateDoc(doc(db, 'invoices', id), { status: newStatus });
    setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status: newStatus as 'paid' | 'pending' } : inv));
  };

  if (loading || !profile) return null;

  return (
    <AdminLayout title="System Invoices">
      <div className="mb-8 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="bg-white p-4 rounded-xl border border-zinc-200 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Total Revenue</p>
              <p className="text-xl font-bold text-zinc-900">${invoices.reduce((acc, inv) => acc + inv.amount, 0).toFixed(2)}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-zinc-200 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Pending</p>
              <p className="text-xl font-bold text-zinc-900">{invoices.filter(inv => inv.status === 'pending').length}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsAddingInvoice(true)}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Generate Invoice
        </button>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200">
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Entity</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500">
                      {inv.restaurantId ? <Store className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900">
                        {inv.restaurantId 
                          ? restaurants.find(r => r.id === inv.restaurantId)?.name 
                          : branches.find(b => b.id === inv.branchId)?.name}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {inv.restaurantId ? 'Restaurant Invoice' : 'Branch Invoice'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-zinc-600">
                    <Calendar className="w-4 h-4" />
                    {inv.date && (typeof inv.date === 'object' && 'toDate' in inv.date 
                      ? (inv.date as { toDate: () => Date }).toDate().toLocaleDateString() 
                      : new Date(inv.date as string | Date).toLocaleDateString())}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-zinc-900">${inv.amount.toFixed(2)}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    inv.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'
                  }`}>
                    {inv.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => toggleInvoiceStatus(inv.id, inv.status)}
                    className="p-2 text-zinc-400 hover:text-zinc-900 transition-all"
                  >
                    {inv.status === 'pending' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isAddingInvoice && (
          <Modal title="Generate New Invoice" onClose={() => setIsAddingInvoice(false)}>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Invoice Type</label>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setNewInvoice({ ...newInvoice, restaurantId: '', branchId: '' })}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border ${!newInvoice.restaurantId && !newInvoice.branchId ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-500 border-zinc-200'}`}
                  >
                    SELECT ENTITY
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Target Branch</label>
                <select
                  value={newInvoice.branchId}
                  onChange={(e) => setNewInvoice({ ...newInvoice, branchId: e.target.value, restaurantId: '' })}
                  className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
                >
                  <option value="">Select Branch</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Target Restaurant (Optional)</label>
                <select
                  value={newInvoice.restaurantId}
                  onChange={(e) => setNewInvoice({ ...newInvoice, restaurantId: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
                  disabled={!newInvoice.branchId}
                >
                  <option value="">Select Restaurant</option>
                  {restaurants.filter(r => r.branchId === newInvoice.branchId).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>

              <Input label="Invoice Amount ($)" type="number" value={newInvoice.amount} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewInvoice({ ...newInvoice, amount: parseFloat(e.target.value) })} />
              
              <button
                onClick={handleAddInvoice}
                className="w-full py-2 bg-zinc-900 text-white font-medium rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Create Invoice
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
