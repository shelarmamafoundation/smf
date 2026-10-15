// src/layouts/PublicLayout.jsx
import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Lock, Heart } from 'lucide-react';
import PublicHeader from '../components/layout/PublicHeader';
import MobileBottomNav from '../components/layout/MobileBottomNav';

export default function PublicLayout() {
  const [lang, setLang] = useState('mr');

  return (
    <div className="min-h-screen bg-heritage-cream text-heritage-charcoal flex flex-col justify-between selection:bg-heritage-gold selection:text-heritage-burgundy">
      <PublicHeader lang={lang} setLang={setLang} />
      
      <main className="flex-grow">
        <Outlet context={{ lang }} />
      </main>

      {/* ========================================== */}
      {/* PROFESSIONAL & SECURE FOOTER               */}
      {/* ========================================== */}
      <footer className="bg-[#1A0308] text-white pt-10 pb-20 md:pb-8 text-center text-xs border-t border-heritage-gold/20">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          
          {/* Foundation Tagline */}
          <p className="text-heritage-gold font-bold text-base tracking-wide">
            शेलारमामा फाऊंडेशन
          </p>
          <p className="text-gray-400 text-xs italic">
            "समाजासाठी कार्यरत • संस्कृतीसाठी समर्पित"
          </p>

          {/* Copyright & Your Credits */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-gray-400 text-[11px]">
            
            {/* 1. Copyright */}
            <span>
              © {new Date().getFullYear()} Shelarmama Foundation. सर्व हक्क राखीव.
            </span>

            {/* 2. Your Signature (Initiative and Developed by Sandesh Mahadik) */}
            <div className="flex items-center gap-1.5 text-gray-300 font-medium">
              <span>Initiative & Developed with</span>
              <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
              <span>by</span>
              <span className="text-heritage-gold font-bold hover:underline cursor-pointer">
                Sandesh Mahadik
              </span>
            </div>

            {/* 3. Subtle & Discreet Admin Panel Access */}
            <div>
              <Link 
                to="/login"
                title="अधिकृत प्रतिनिधी कक्ष (Admin Login)"
                className="inline-flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-heritage-gold transition px-2 py-1 rounded border border-transparent hover:border-heritage-gold/30"
              >
                <Lock className="w-3 h-3 text-gray-500 hover:text-heritage-gold" />
                <span>कार्यकर्ता कक्ष</span>
              </Link>
            </div>

          </div>

        </div>
      </footer>

      <MobileBottomNav />
    </div>
  );
}