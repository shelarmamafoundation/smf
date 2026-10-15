// src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Users, Calendar, Wallet, Layers, ArrowUpRight, ShieldCheck, IndianRupee } from 'lucide-react';
import { Link } from 'react-router-dom';
import { INITIATIVES_DATA } from '../../data/initiativesData';
import { userService } from '../../services/userService';
import { financeService } from '../../services/financeService';

export default function AdminDashboard() {
  const [userCount, setUserCount] = useState(0);
  const [netBalance, setNetBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const totalEvents = INITIATIVES_DATA.length;

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
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Title */}
      <div className="pt-2 sm:pt-0">
        <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
          व्यवस्थापन डॅशबोर्ड (Admin Panel)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          शेलारमामा फाऊंडेशन सिस्टीम ओव्हरव्ह्यू आणि चालू स्थिती.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Active Users */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>सक्रिय प्रतिनिधी / युजर्स</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {loading ? '...' : userCount}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
            सर्व भूमिका सक्रिय
          </span>
        </div>

        {/* Total Events */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>एकूण उपक्रम व इव्हेंट्स</span>
            <Calendar className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-emerald-600">
            {totalEvents}
          </div>
          <span className="text-[11px] text-slate-400 font-semibold mt-1 inline-block">
            वार्षिक आणि आगामी
          </span>
        </div>

        {/* Live Finance Balance */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>जमा-खर्च शिल्लक</span>
            <Wallet className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-600">
            {loading ? '...' : `₹ ${Number(netBalance).toLocaleString('en-IN')}`}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
            थेट ताळेबंद सक्रिय
          </span>
        </div>
      </div>

      {/* Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link 
          to="/admin/finance"
          className="bg-white border border-slate-200 hover:border-heritage-burgundy rounded-2xl p-5 shadow-sm transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-heritage-burgundy flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-heritage-burgundy transition">
                हिशोब व वित्त व्यवस्थापन
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">जमा-खर्च लेजर व ॲडव्हान्स ट्रॅकिंग</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-heritage-burgundy transition" />
        </Link>

        <Link 
          to="/admin/initiatives"
          className="bg-white border border-slate-200 hover:border-heritage-burgundy rounded-2xl p-5 shadow-sm transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-heritage-burgundy/10 text-heritage-burgundy flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-heritage-burgundy transition">
                इव्हेंट्स व फोटो गॅलरी
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">वर्षानिहाय फोटो व माहिती अपडेट करा</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-heritage-burgundy transition" />
        </Link>

        <Link 
          to="/admin/users"
          className="bg-white border border-slate-200 hover:border-heritage-burgundy rounded-2xl p-5 shadow-sm transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-heritage-burgundy transition">
                प्रतिनिधी व अधिकार
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">युजर्सच्या परवानग्या नियंत्रित करा</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-heritage-burgundy transition" />
        </Link>
      </div>

    </div>
  );
}