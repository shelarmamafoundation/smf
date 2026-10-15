// src/components/layout/MobileBottomNav.jsx
import React from 'react';
import { Home, Calendar, Grid, Award } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  const handleNav = (e, targetId) => {
    e.preventDefault();

    if (targetId === 'top') {
      if (isHome) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        navigate('/');
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
      }
      return;
    }

    if (isHome) {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1A0308]/95 backdrop-blur-xl border-t border-heritage-gold/30 px-6 py-2.5 flex justify-between items-center z-50 text-white shadow-2xl">
      
      {/* 1. मुख्य */}
      <button 
        type="button"
        onClick={(e) => handleNav(e, 'top')} 
        className="flex flex-col items-center gap-1 text-heritage-gold hover:text-white transition cursor-pointer"
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-bold">मुख्य</span>
      </button>

      {/* 2. कार्यक्रम */}
      <button 
        type="button"
        onClick={(e) => handleNav(e, 'events')} 
        className="flex flex-col items-center gap-1 text-gray-300 hover:text-heritage-gold transition cursor-pointer"
      >
        <Calendar className="w-5 h-5" />
        <span className="text-[10px] font-medium">कार्यक्रम</span>
      </button>

      {/* 3. उपक्रम */}
      <button 
        type="button"
        onClick={(e) => handleNav(e, 'initiatives')} 
        className="flex flex-col items-center gap-1 text-gray-300 hover:text-heritage-gold transition cursor-pointer"
      >
        <Grid className="w-5 h-5" />
        <span className="text-[10px] font-medium">उपक्रम</span>
      </button>

      {/* 4. ओळख */}
      <button 
        type="button"
        onClick={(e) => handleNav(e, 'about')} 
        className="flex flex-col items-center gap-1 text-gray-300 hover:text-heritage-gold transition cursor-pointer"
      >
        <Award className="w-5 h-5" />
        <span className="text-[10px] font-medium">ओळख</span>
      </button>

    </div>
  );
}