import React from 'react';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">व्यवस्थापन डॅशबोर्ड (Admin Panel)</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 uppercase font-semibold">एकूण नोंदणी</p>
          <p className="text-3xl font-bold text-heritage-burgundy mt-2">0</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 uppercase font-semibold">आगामी कार्यक्रम</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">3</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 uppercase font-semibold">जमा-खर्च शिल्लक</p>
          <p className="text-3xl font-bold text-heritage-gold mt-2">₹ 0</p>
        </div>
      </div>
    </div>
  );
}