// src/layouts/AdminLayout.jsx
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
  ShieldAlert,
  Trophy,
  Layers,
  ChevronUp
} from 'lucide-react';
import { authService } from '../services/authService';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deskDrawerOpen, setDeskDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const base = import.meta.env.BASE_URL;

  const currentUser = authService.getCurrentUser();

  // लॉगिन नसेल तर लॉगिन पानावर पाठवणे
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const isSuperAdmin = Boolean(currentUser.isSuperAdmin || currentUser.role === 'super_admin');
  const perms = currentUser.permissions || {};

  const canEvents = isSuperAdmin || Boolean(perms.events?.canView || perms.events?.canEdit);
  const canFinance = isSuperAdmin || Boolean(perms.finance?.canView || perms.finance?.canEdit);
  const canDandiya = isSuperAdmin || Boolean(perms.dandiyaDesk?.canAccess);
  const canUsers = isSuperAdmin; // User Management फक्त आणि फक्त Super Admin साठी

  // Route Level Security
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

  // Saapshidi permission
  const canSaapshidi = isSuperAdmin || currentUser?.permissions?.saapshidi || canEvents;

  // केवळ दांडिया डेस्क परवानगी असल्यास
  const isOnlyDandiya = !isSuperAdmin && canDandiya && !canEvents && !canFinance && !canSaapshidi;
  if (isOnlyDandiya && currentPath === '/admin') {
    return <Navigate to="/admin/dandiya-desk" replace />;
  }

  // केवळ सापशिडी डेस्क परवानगी असल्यास
  const isOnlySaapshidi = !isSuperAdmin && canSaapshidi && !canDandiya && !canEvents && !canFinance;
  if (isOnlySaapshidi && currentPath === '/admin') {
    return <Navigate to="/admin/saapshidi-desk" replace />;
  }

  // साइडबारसाठी सर्व नव आयटम्स (डेस्कटॉप आणि मोबाईल ड्रॉवरसाठी पूर्ण यादी)
  const navItems = [
    ...(!isOnlyDandiya && !isOnlySaapshidi ? [{
      to: '/admin',
      end: true,
      labelMr: 'डॅशबोर्ड',
      icon: LayoutDashboard,
    }] : []),

    ...(canSaapshidi ? [{
      to: '/admin/saapshidi-desk',
      labelMr: 'सापशिडी डेस्क',
      icon: Trophy,
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

  const handleDeskSelect = (targetPath) => {
    setDeskDrawerOpen(false);
    navigate(targetPath);
  };

  const isDeskActive = currentPath.includes('/admin/dandiya-desk') || currentPath.includes('/admin/saapshidi-desk');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans pb-20 md:pb-0">
      
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
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-slate-300 hover:text-white rounded-lg bg-slate-800/80 active:scale-95 transition cursor-pointer"
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

            <button 
              type="button"
              onClick={() => setSidebarOpen(false)} 
              className="md:hidden text-slate-400 hover:text-white p-1 cursor-pointer"
            >
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

          {/* Nav Items (सर्व मेन्यू यादी साइडबारमध्ये कायम राहील) */}
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
            type="button"
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>वेबसाईटवर जा</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/10 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>लॉगआउट</span>
          </button>
        </div>
      </aside>

      {/* 4. Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <Outlet />
      </main>

      {/* 5. Mobile Event Desk Select Popup Drawer */}
      {deskDrawerOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
          onClick={() => setDeskDrawerOpen(false)}
        >
          <div 
            className="absolute bottom-16 left-3 right-3 bg-[#0F172A] border border-amber-400/30 rounded-3xl p-4 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>इव्हेंट डेस्क निवडा</span>
              </span>
              <button 
                type="button" 
                onClick={() => setDeskDrawerOpen(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {/* दांडिया डेस्क */}
              {canDandiya && (
                <button
                  type="button"
                  onClick={() => handleDeskSelect('/admin/dandiya-desk')}
                  className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-amber-400 transition active:scale-95 cursor-pointer"
                >
                  <Ticket className="w-6 h-6 text-amber-400 mb-1" />
                  <span className="text-xs font-black text-white">दांडिया डेस्क</span>
                  <span className="text-[9px] text-slate-400">पास व नोंदणी</span>
                </button>
              )}

              {/* सापशिडी डेस्क */}
              {canSaapshidi && (
                <button
                  type="button"
                  onClick={() => handleDeskSelect('/admin/saapshidi-desk')}
                  className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-amber-400 transition active:scale-95 cursor-pointer"
                >
                  <Trophy className="w-6 h-6 text-emerald-400 mb-1" />
                  <span className="text-xs font-black text-white">सापशिडी डेस्क</span>
                  <span className="text-[9px] text-slate-400">स्पर्धा व स्कोअर</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. Mobile Bottom Navigation (फक्त ४ मुख्य पर्याय) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0F172A]/95 backdrop-blur-xl border-t border-slate-800 flex items-center justify-around py-2 px-2 shadow-2xl safe-area-pb">
        
        {/* १. डॅशबोर्ड */}
        <NavLink
          to="/admin"
          end
          onClick={() => setDeskDrawerOpen(false)}
          className={({ isActive }) => `flex flex-col items-center justify-center py-0.5 px-2 rounded-lg text-[9px] font-bold transition ${
            isActive ? 'text-amber-400' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>डॅशबोर्ड</span>
        </NavLink>

        {/* २. संयुक्त इव्हेंट डेस्क (दांडिया + सापशिडी) */}
        {(canDandiya || canSaapshidi) && (
          <button
            type="button"
            onClick={() => setDeskDrawerOpen(prev => !prev)}
            className={`flex flex-col items-center justify-center py-0.5 px-2 rounded-lg text-[9px] font-bold transition cursor-pointer ${
              isDeskActive || deskDrawerOpen ? 'text-amber-400 font-black' : 'text-slate-400'
            }`}
          >
            <Layers className="w-5 h-5 mb-0.5" />
            <span className="flex items-center gap-0.5">
              डेस्क <ChevronUp className={`w-2.5 h-2.5 transition-transform ${deskDrawerOpen ? 'rotate-180' : ''}`} />
            </span>
          </button>
        )}

        {/* ३. इव्हेंट्स व फोटो */}
        {canEvents && (
          <NavLink
            to="/admin/initiatives"
            onClick={() => setDeskDrawerOpen(false)}
            className={({ isActive }) => `flex flex-col items-center justify-center py-0.5 px-2 rounded-lg text-[9px] font-bold transition ${
              isActive ? 'text-amber-400' : 'text-slate-400'
            }`}
          >
            <ImageIcon className="w-5 h-5 mb-0.5" />
            <span>इव्हेंट्स व फोटो</span>
          </NavLink>
        )}

        {/* ४. जमा-खर्च */}
        {canFinance && (
          <NavLink
            to="/admin/finance"
            onClick={() => setDeskDrawerOpen(false)}
            className={({ isActive }) => `flex flex-col items-center justify-center py-0.5 px-2 rounded-lg text-[9px] font-bold transition ${
              isActive ? 'text-amber-400' : 'text-slate-400'
            }`}
          >
            <Wallet className="w-5 h-5 mb-0.5" />
            <span>जमा-खर्च</span>
          </NavLink>
        )}

      </nav>

    </div>
  );
}