import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-slate-900 text-slate-200 p-5">
        <div className="font-bold text-lg text-heritage-gold mb-6">SMF Management</div>
        <nav className="space-y-2 text-sm">
          <Link to="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800 text-white">
            <LayoutDashboard className="w-4 h-4 text-heritage-gold" /> Dashboard
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}