import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Globe, ArrowUpRight, Sparkles } from 'lucide-react';

export default function PublicHeader({ lang, setLang }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-heritage-burgundy/90 backdrop-blur-xl border-b border-heritage-gold/20 py-3 shadow-2xl' 
        : 'bg-gradient-to-b from-heritage-burgundy/90 via-heritage-burgundy/40 to-transparent py-5'
    }`}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3.5 group">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-heritage-goldLight via-heritage-gold to-heritage-crimson p-[1.5px] shadow-lg shadow-heritage-gold/20 transition-transform duration-300 group-hover:scale-105">
              <div className="w-full h-full bg-heritage-burgundy rounded-[14px] flex items-center justify-center font-bold text-heritage-gold text-xl tracking-wider">
                श
              </div>
            </div>
            <Sparkles className="w-3.5 h-3.5 text-heritage-goldLight absolute -top-1 -right-1 animate-pulse" />
          </div>

          <div>
            <span className="block font-black text-xl tracking-tight text-white group-hover:text-heritage-goldLight transition">
              शेलारमामा <span className="text-heritage-gold font-light">फाऊंडेशन</span>
            </span>
            <span className="block text-[9px] uppercase tracking-[0.25em] text-heritage-goldLight/70 font-semibold">
              Shelarmama Foundation
            </span>
          </div>
        </Link>

        {/* Floating Capsule Navigation (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 bg-white/5 backdrop-blur-lg border border-white/10 px-4 py-1.5 rounded-full shadow-inner">
          <Link to="/" className="px-4 py-2 text-xs font-semibold text-heritage-goldLight hover:text-white transition rounded-full">
            {lang === 'mr' ? 'मुख्य' : 'Home'}
          </Link>
          <a href="#about" className="px-4 py-2 text-xs font-medium text-gray-300 hover:text-white transition rounded-full">
            {lang === 'mr' ? 'ओळख' : 'About'}
          </a>
          <a href="#initiatives" className="px-4 py-2 text-xs font-medium text-gray-300 hover:text-white transition rounded-full">
            {lang === 'mr' ? 'उपक्रम' : 'Initiatives'}
          </a>
          <a href="#events" className="px-4 py-2 text-xs font-medium text-gray-300 hover:text-white transition rounded-full">
            {lang === 'mr' ? 'कार्यक्रम' : 'Events'}
          </a>
          <a href="#gallery" className="px-4 py-2 text-xs font-medium text-gray-300 hover:text-white transition rounded-full">
            {lang === 'mr' ? 'गॅलरी' : 'Gallery'}
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setLang(l => l === 'mr' ? 'en' : 'mr')}
            className="flex items-center gap-1.5 text-xs font-semibold text-heritage-goldLight border border-heritage-gold/30 px-3.5 py-1.5 rounded-full hover:bg-heritage-gold/10 transition">
            <Globe className="w-3.5 h-3.5 text-heritage-gold" />
            <span>{lang === 'mr' ? 'English' : 'मराठी'}</span>
          </button>

          <a href="#events" className="hidden sm:inline-flex items-center gap-1.5 bg-gradient-to-r from-heritage-gold to-heritage-goldLight text-heritage-burgundy font-bold px-4 py-2 rounded-full text-xs shadow-lg shadow-heritage-gold/20 hover:scale-105 transition active:scale-95">
            <span>{lang === 'mr' ? 'सहभागी व्हा' : 'Get Involved'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </header>
  );
}