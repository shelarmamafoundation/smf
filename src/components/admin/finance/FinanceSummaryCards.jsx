// src/components/admin/finance/FinanceSummaryCards.jsx
import React from 'react';
import { 
  TrendingUp, TrendingDown, HandCoins, Wallet, 
  Banknote, Landmark, Sparkles, ShieldCheck 
} from 'lucide-react';

export default function FinanceSummaryCards({ totals }) {
  const safeTotals = {
    totalIncome: totals?.totalIncome || 0,
    totalExpense: totals?.totalExpense || 0,
    totalAdvanceGiven: totals?.totalAdvanceGiven || 0,
    advanceSpent: totals?.advanceSpent || 0,
    remainingAdvanceInMarket: totals?.remainingAdvanceInMarket || 0,
    netBalance: totals?.netBalance || 0,
    cashInHand: totals?.cashInHand || 0,
    onlineBalance: totals?.onlineBalance || 0
  };

  return (
    <div className="w-full">
      {/* ======================================================== */}
      {/* 1. MOBILE ONLY VIEW: Luxury Single Passbook Card         */}
      {/* ======================================================== */}
      <div className="block lg:hidden">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1C060D] via-[#2F0913] to-[#120206] text-white p-3.5 shadow-lg border border-heritage-gold/30">
          
          {/* Card Top Header */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-5 rounded-[4px] bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 p-[1px]">
                <div className="w-full h-full bg-[#1C060D]/80 rounded-[3px] grid grid-cols-2 gap-0.5 p-0.5">
                  <div className="border-r border-b border-amber-300/40"></div>
                  <div className="border-b border-amber-300/40"></div>
                  <div className="border-r border-amber-300/40"></div>
                  <div></div>
                </div>
              </div>
              <span className="text-[10px] font-black text-amber-200 tracking-wide uppercase flex items-center gap-1">
                SMF तिजोरी पासबुक <Sparkles className="w-2.5 h-2.5 text-amber-300" />
              </span>
            </div>

            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 flex items-center gap-1">
              <ShieldCheck className="w-2.5 h-2.5" /> सुरक्षित
            </span>
          </div>

          {/* Center: Net Balance */}
          <div className="py-2.5 text-center">
            <span className="text-[9px] uppercase font-bold text-gray-300 tracking-wider">
              संस्था निव्वळ शिल्लक निधी (NET BALANCE)
            </span>
            <div className={`text-2xl font-black tracking-tight mt-0.5 ${
              safeTotals.netBalance >= 0 ? 'text-white' : 'text-rose-400'
            }`}>
              ₹ {safeTotals.netBalance.toLocaleString('en-IN')}
            </div>
          </div>

          {/* 3 Columns: जमा | खर्च | ॲडव्हान्स */}
          <div className="grid grid-cols-3 gap-1.5 py-2 px-2 rounded-xl bg-white/[0.06] border border-white/10 text-center">
            <div className="border-r border-white/10 pr-1">
              <span className="text-[9px] font-bold text-emerald-400 uppercase block">जमा</span>
              <div className="text-xs font-black text-white mt-0.5 truncate">
                ₹ {safeTotals.totalIncome.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="border-r border-white/10 px-1">
              <span className="text-[9px] font-bold text-rose-400 uppercase block">खर्च</span>
              <div className="text-xs font-black text-white mt-0.5 truncate">
                ₹ {safeTotals.totalExpense.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="pl-1">
              <span className="text-[9px] font-bold text-amber-300 uppercase block">ॲडव्हान्स</span>
              <div className="text-xs font-black text-amber-300 mt-0.5 truncate">
                ₹ {safeTotals.remainingAdvanceInMarket.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Footer: Cash vs Bank */}
          <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-gray-300">
            <div>कॅश: <span className="font-black text-white">₹ {safeTotals.cashInHand.toLocaleString('en-IN')}</span></div>
            <div>ऑनलाइन: <span className="font-black text-white">₹ {safeTotals.onlineBalance.toLocaleString('en-IN')}</span></div>
          </div>

        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. DESKTOP ONLY VIEW: 4 Fluid Elegant KPI Cards          */}
      {/* ======================================================== */}
      <div className="hidden lg:grid grid-cols-4 gap-4">
        
        {/* Card 1: Net Balance */}
        <div className="rounded-2xl p-4 bg-gradient-to-br from-[#1C060D] via-[#2F0913] to-[#120206] text-white border border-heritage-gold/30 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-amber-300">
            <span>निव्वळ शिल्लक (Net)</span>
            <Wallet className="w-4 h-4 text-heritage-gold" />
          </div>
          <div className={`text-2xl font-black mt-2 ${safeTotals.netBalance >= 0 ? 'text-white' : 'text-rose-400'}`}>
            ₹ {safeTotals.netBalance.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-300 pt-2 border-t border-white/10 mt-2">
            <span>कॅश: ₹{safeTotals.cashInHand.toLocaleString('en-IN')}</span>
            <span>बँक: ₹{safeTotals.onlineBalance.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Card 2: Income */}
        <div className="rounded-2xl p-4 bg-white border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-700">
            <span>एकूण जमा (Income)</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            ₹ {safeTotals.totalIncome.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-gray-400 mt-2 block">
            देणग्या व इतर जमा
          </span>
        </div>

        {/* Card 3: Expense */}
        <div className="rounded-2xl p-4 bg-white border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-rose-700">
            <span>एकूण प्रत्यक्ष खर्च</span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            ₹ {safeTotals.totalExpense.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-gray-400 mt-2 block">
            इव्हेंट्स व व्यवस्थापन
          </span>
        </div>

        {/* Card 4: Advance with team */}
        <div className="rounded-2xl p-4 bg-white border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-amber-700">
            <span>शिल्लक ॲडव्हान्स</span>
            <HandCoins className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">
            ₹ {safeTotals.remainingAdvanceInMarket.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-gray-400 mt-2 block">
            कार्यकर्त्यांकडे शिल्लक
          </span>
        </div>

      </div>

    </div>
  );
}