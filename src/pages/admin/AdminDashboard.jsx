// src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Users, Calendar, Wallet, Layers, ArrowUpRight, ShieldCheck, IndianRupee } from 'lucide-react';
import { Link } from 'react-router-dom';
import { INITIATIVES_DATA } from '../../data/initiativesData';
import { userService } from '../../services/userService';
import { financeService } from '../../services/financeService';
import { authService } from '../../services/authService';
import FormControllerCard from '../../components/admin/FormControllerCard';

export default function AdminDashboard() {
  const [userCount, setUserCount] = useState(0);
  const [netBalance, setNetBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const totalEvents = INITIATIVES_DATA.length;

  const currentUser = authService.getCurrentUser();
  const isSuperAdmin = Boolean(currentUser?.isSuperAdmin || currentUser?.role === 'super_admin');

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const [usersData, financeRecords] = await Promise.all([
          userService.getUsers ? userService.getUsers() : [],
          financeService.getRecords ? financeService.getRecords() : []
        ]);

        const safeUsers = Array.isArray(usersData) ? usersData : [];
        setUserCount(safeUsers.length);

        const totals = financeService.calculateTotals(financeRecords || []);
        setNetBalance(totals.netBalance || 0);
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  return (
    <div className="p-3 sm:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6 font-sans">
      
      {/* Title */}
      <div className="pt-1 sm:pt-0">
        <h1 className="text-lg sm:text-3xl font-black text-slate-900 tracking-tight">
          व्यवस्थापन डॅशबोर्ड (Admin Panel)
        </h1>
        <p className="text-[11px] sm:text-sm text-slate-500 mt-0.5">
          शेलारमामा फाऊंडेशन सिस्टीम ओव्हरव्ह्यू आणि चालू स्थिती.
        </p>
      </div>

      {/* KPI Cards: Mobile var ekach line madhe (grid-cols-3) aani Desktop var same grid-cols-3 */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        
        {/* 1. Active Users */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">
            <span className="truncate">युजर्स</span>
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0 ml-1" />
          </div>
          <div className="text-lg sm:text-3xl font-black text-slate-900 tracking-tight">
            {loading ? '...' : userCount}
          </div>
          <span className="text-[9px] sm:text-[11px] text-emerald-600 font-semibold mt-1 truncate block">
            सर्व सक्रिय
          </span>
        </div>

        {/* 2. Total Events */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">
            <span className="truncate">उपक्रम</span>
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0 ml-1" />
          </div>
          <div className="text-lg sm:text-3xl font-black text-emerald-600 tracking-tight">
            {totalEvents}
          </div>
          <span className="text-[9px] sm:text-[11px] text-slate-400 font-semibold mt-1 truncate block">
            इव्हेंट्स
          </span>
        </div>

        {/* 3. Live Finance Balance */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">
            <span className="truncate">शिल्लक</span>
            <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0 ml-1" />
          </div>
          <div className="text-sm sm:text-3xl font-black text-amber-600 tracking-tight truncate">
            {loading ? '...' : `₹${Number(netBalance).toLocaleString('en-IN')}`}
          </div>
          <span className="text-[9px] sm:text-[11px] text-emerald-600 font-semibold mt-1 truncate block">
            थेट ताळेबंद
          </span>
        </div>

      </div>

      {/* Form On/Off Controller Panel */}
      <FormControllerCard isSuperAdmin={isSuperAdmin} />

      {/* Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
        <Link 
          to="/admin/finance"
          className="bg-white border border-slate-200 hover:border-heritage-burgundy rounded-2xl p-3.5 sm:p-5 shadow-2xs transition flex items-center justify-between group active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-50 text-heritage-burgundy flex items-center justify-center shrink-0">
              <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-heritage-burgundy transition">
                हिशोब व वित्त व्यवस्थापन
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">जमा-खर्च लेजर व ॲडव्हान्स ट्रॅकिंग</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-heritage-burgundy transition shrink-0 ml-2" />
        </Link>

        <Link 
          to="/admin/initiatives"
          className="bg-white border border-slate-200 hover:border-heritage-burgundy rounded-2xl p-3.5 sm:p-5 shadow-2xs transition flex items-center justify-between group active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-heritage-burgundy/10 text-heritage-burgundy flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-heritage-burgundy transition">
                इव्हेंट्स व फोटो गॅलरी
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">वर्षानिहाय फोटो व माहिती अपडेट करा</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-heritage-burgundy transition shrink-0 ml-2" />
        </Link>

        <Link 
          to="/admin/users"
          className="bg-white border border-slate-200 hover:border-heritage-burgundy rounded-2xl p-3.5 sm:p-5 shadow-2xs transition flex items-center justify-between group active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-heritage-burgundy transition">
                प्रतिनिधी व अधिकार
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">युजर्सच्या परवानग्या नियंत्रित करा</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-heritage-burgundy transition shrink-0 ml-2" />
        </Link>
      </div>

    </div>
  );
}