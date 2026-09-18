import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
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

      <footer className="bg-heritage-burgundy text-white py-8 text-center text-xs border-t border-heritage-gold/20">
        <p className="text-heritage-gold font-bold text-sm tracking-wide">Shelarmama Foundation</p>
        <p className="text-gray-400 mt-1">"समाजासाठी कार्यरत • संस्कृतीसाठी समर्पित"</p>
        <p className="text-[10px] text-gray-500 mt-3">© {new Date().getFullYear()} सर्व हक्क राखीव.</p>
      </footer>

      <MobileBottomNav />
    </div>
  );
}