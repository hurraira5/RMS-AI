'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { LayoutDashboard, Store, MapPin, Users, FileText, Settings, LogOut } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const { profile, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !profile) {
      router.push('/login');
    }
  }, [profile, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zinc-900"></div>
      </div>
    );
  }

  if (!profile) return null;

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin', roles: ['super_admin', 'branch_manager', 'restaurant_admin'] },
    { icon: MapPin, label: 'Branches', href: '/admin/branches', roles: ['super_admin'] },
    { icon: Store, label: 'Restaurants', href: '/admin/restaurants', roles: ['super_admin', 'branch_manager'] },
    { icon: FileText, label: 'Menu', href: '/admin/menu', roles: ['restaurant_admin', 'branch_manager'] },
    { icon: Store, label: 'Deals', href: '/admin/deals', roles: ['super_admin', 'branch_manager'] },
    { icon: Users, label: 'Users', href: '/admin/users', roles: ['super_admin'] },
    { icon: FileText, label: 'Invoices', href: '/admin/invoices', roles: ['super_admin'] },
    { icon: Settings, label: 'Settings', href: '/admin/settings', roles: ['super_admin', 'branch_manager', 'restaurant_admin'] },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col">
        <div className="p-6 border-b border-zinc-200">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">Admin Panel</h1>
          <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">{profile.role.replace('_', ' ')}</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.filter(item => item.roles.includes(profile.role)).map((item) => (
            <button
              key={item.label}
              onClick={() => router.push(item.href)}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-zinc-600 rounded-lg hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-8">
          <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-zinc-900">{profile.displayName || profile.email}</p>
              <p className="text-xs text-zinc-500">{profile.email}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 font-bold">
              {(profile.displayName || profile.email)[0].toUpperCase()}
            </div>
          </div>
        </header>

        <div className="p-8 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
