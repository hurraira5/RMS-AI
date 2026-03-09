'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Users, MapPin, Store, Edit2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: 'super_admin' | 'branch_manager' | 'restaurant_admin' | 'user';
  branchId?: string;
  restaurantId?: string;
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

export default function UsersManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const usersSnap = await getDocs(collection(db, 'users'));
      const usersData = usersSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
      setUsers(usersData);

      const branchesSnap = await getDocs(collection(db, 'branches'));
      const branchesData = branchesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Branch));
      setBranches(branchesData);

      const restaurantsSnap = await getDocs(collection(db, 'restaurants'));
      const restaurantsData = restaurantsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Restaurant));
      setRestaurants(restaurantsData);
      
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleUpdateRole = async (uid: string, updates: Partial<UserProfile>) => {
    await updateDoc(doc(db, 'users', uid), updates);
    setUsers(users.map(u => u.uid === uid ? { ...u, ...updates } : u));
    setEditingUser(null);
  };

  if (loading) return null;

  return (
    <AdminLayout title="User & Role Management">
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-900">System Users</h3>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Users className="w-4 h-4" />
            {users.length} Total Users
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Assignment</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {users.map((user) => (
                <tr key={user.uid} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-bold">
                        {(user.displayName || user.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-900">{user.displayName || 'No Name'}</p>
                        <p className="text-xs text-zinc-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      user.role === 'super_admin' ? 'bg-zinc-900 text-white' :
                      user.role === 'branch_manager' ? 'bg-blue-50 text-blue-700' :
                      user.role === 'restaurant_admin' ? 'bg-emerald-50 text-emerald-700' :
                      'bg-zinc-100 text-zinc-600'
                    }`}>
                      {user.role.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.role === 'branch_manager' && (
                      <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                        <MapPin className="w-3 h-3" />
                        {branches.find(b => b.id === user.branchId)?.name || 'Unassigned'}
                      </div>
                    )}
                    {user.role === 'restaurant_admin' && (
                      <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                        <Store className="w-3 h-3" />
                        {restaurants.find(r => r.id === user.restaurantId)?.name || 'Unassigned'}
                      </div>
                    )}
                    {user.role === 'user' && <span className="text-xs text-zinc-400">Regular User</span>}
                    {user.role === 'super_admin' && <span className="text-xs text-zinc-400">Global Access</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setEditingUser(user)}
                      className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
                <h3 className="text-lg font-bold text-zinc-900">Edit User Role</h3>
                <button onClick={() => setEditingUser(null)} className="p-2 text-zinc-400 hover:text-zinc-600"><XCircle className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Select Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as 'super_admin' | 'branch_manager' | 'restaurant_admin' | 'user' })}
                    className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
                  >
                    <option value="user">User</option>
                    <option value="branch_manager">Branch Manager</option>
                    <option value="restaurant_admin">Restaurant Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                {editingUser.role === 'branch_manager' && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Assign Branch</label>
                    <select
                      value={editingUser.branchId || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, branchId: e.target.value })}
                      className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
                    >
                      <option value="">Select Branch</option>
                      {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                )}

                {editingUser.role === 'restaurant_admin' && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Assign Restaurant</label>
                    <select
                      value={editingUser.restaurantId || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, restaurantId: e.target.value })}
                      className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
                    >
                      <option value="">Select Restaurant</option>
                      {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </div>
                )}

                <button
                  onClick={() => handleUpdateRole(editingUser.uid, {
                    role: editingUser.role,
                    branchId: editingUser.branchId || undefined,
                    restaurantId: editingUser.restaurantId || undefined
                  })}
                  className="w-full py-2 bg-zinc-900 text-white font-medium rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
