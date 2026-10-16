import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Image as ImageIcon, 
  Wallet, 
  Ticket,
  Menu, 
  X, 
  LogOut, 
  ArrowLeft,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { authService } from '../services/authService';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const base = import.meta.env.BASE_URL;

  const currentUser = authService.getCurrentUser();

  // Jar login ch nasel tar login page var pathva
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const isSuperAdmin = Boolean(currentUser.isSuperAdmin || currentUser.role === 'super_admin');
  const perms = currentUser.permissions || {};

  const canEvents = isSuperAdmin || Boolean(perms.events?.canView || perms.events?.canEdit);
  const canFinance = isSuperAdmin || Boolean(perms.finance?.canView || perms.finance?.canEdit);
  const canDandiya = isSuperAdmin || Boolean(perms.dandiyaDesk?.canAccess);
  const canUsers = isSuperAdmin; // User Management fakt aani fakt Super Admin sathi!

  // Route Level Security (Jar user direct URL type karun aala tar block karne)
  const currentPath = location.pathname;
  if (currentPath.includes('/admin/users') && !canUsers) {
    return <Navigate to="/admin" replace />;
  }
  if (currentPath.includes('/admin/finance') && !canFinance) {
    return <Navigate to="/admin" replace />;
  }
  if (currentPath.includes('/admin/initiatives') && !canEvents) {
    return <Navigate to="/admin" replace />;
  }
  if (currentPath.includes('/admin/dandiya-desk') && !canDandiya) {
    return <Navigate to="/admin" replace />;
  }

  // Fakt Dandiya Desk permission aslyas direct Dandiya Desk var pathva
  const isOnlyDandiya = !isSuperAdmin && canDandiya && !canEvents && !canFinance;
  if (isOnlyDandiya && currentPath === '/admin') {
    return <Navigate to="/admin/dandiya-desk" replace />;
  }

  // Dynamic Nav Items (Jya module chi permission ahe tech menu madhe distil)
  const navItems = [
    ...(!isOnlyDandiya ? [{
      to: '/admin',
      end: true,
      labelMr: 'डॅशबोर्ड',
      icon: LayoutDashboard,
    }] : []),

    ...(canDandiya ? [{
      to: '/admin/dandiya-desk',
      labelMr: 'दांडिया डेस्क',
      icon: Ticket,
    }] : []),

    ...(canUsers ? [{
      to: '/admin/users',
      labelMr: 'युजर मॅनेजमेंट',
      icon: Users,
    }] : []),

    ...(canEvents ? [{
      to: '/admin/initiatives',
      labelMr: 'इव्हेंट्स व फोटो',
      icon: ImageIcon,
    }] : []),

    ...(canFinance ? [{
      to: '/admin/finance',
      labelMr: 'जमा-खर्च',
      icon: Wallet,
    }] : []),
  ];

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans pb-16 md:pb-0">
      
      {/* 1. Mobile Top Bar */}
      <header className="md:hidden sticky top-0 z-40 bg-[#0F172A] text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 p-0.5 border border-amber-400/40">
            <img 
              src={`${base}logo.jpg`} 
              alt="Logo" 
              className="w-full h-full object-cover rounded-full"
              onError={(e) => { e.target.src = `${base}logo.png`; }}
            />
          </div>
          <span className="font-bold text-sm tracking-wide text-amber-400">SMF Management</span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-slate-300 hover:text-white rounded-lg bg-slate-800/80 active:scale-95 transition"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* 2. Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 3. Sidebar (Desktop Fixed + Mobile Drawer) */}
      <aside className={`
        fixed md:sticky top-0 h-screen z-50 w-64 bg-[#0F172A] text-slate-200 flex flex-col justify-between
        transition-transform duration-300 ease-in-out border-r border-slate-800
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div>
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 p-0.5 border border-amber-400/50">
                <img 
                  src={`${base}logo.jpg`} 
                  alt="Logo" 
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => { e.target.src = `${base}logo.png`; }}
                />
              </div>
              <div>
                <h2 className="font-extrabold text-xs text-white">शेलारमामा फाऊंडेशन</h2>
                <div className="flex items-center gap-1 text-[10px] text-amber-400 font-semibold">
                  <ShieldCheck className="w-3 h-3" />
                  <span>व्यवस्थापन कक्ष</span>
                </div>
              </div>
            </div>

            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Badge */}
          <div className="mx-3 my-3 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-xs border border-amber-500/30">
              {currentUser.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
              <p className="text-[9px] text-amber-400 font-semibold tracking-wide uppercase">
                {isSuperAdmin ? 'सुपर ॲडमिन' : isOnlyDandiya ? 'दांडिया कार्यकर्ता' : 'प्रतिनिधी'}
              </p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="px-2.5 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition
                    ${isActive 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}
                  `}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.labelMr}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800 space-y-1.5">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>वेबसाईटवर जा</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/10 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>लॉगआउट</span>
          </button>
        </div>
      </aside>

      {/* 4. Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <Outlet />
      </main>

      {/* 5. Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0F172A]/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-around py-1 px-1 shadow-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.end 
            ? location.pathname === item.to || location.pathname === `${item.to}/`
            : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-lg text-[9px] font-bold transition ${
                isActive ? 'text-amber-400' : 'text-slate-400'
              }`}
            >
              <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'scale-110 text-amber-400' : ''}`} />
              <span className="truncate max-w-[70px]">{item.labelMr}</span>
            </NavLink>
          );
        })}
      </nav>

    </div>
  );
}