// src/sections/home/HeroSection.jsx
import React from 'react';
import { ChevronRight, ShieldCheck, Flame } from 'lucide-react';

export default function HeroSection({ lang }) {
  const base = import.meta.env.BASE_URL;

  // तुम्ही दिलेल्या ट्रान्सपरंट पीएनजी इमेजेस
const transparentLogo = `${base}assets/SHELARMAMA-HORIZONTAL01-trans.PNG`;
  const deviPhoto = `${base}assets/IMG_7257.jpg`;

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-heritage-burgundy overflow-hidden pt-24 sm:pt-28 pb-14 sm:pb-16">
      
      {/* Background Ambience Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-heritage-crimson/40 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-10 w-80 h-80 bg-heritage-gold/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:32px_32px] opacity-15 pointer-events-none"></div>

      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 w-full relative z-10 grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        
        {/* ======================================================== */}
        {/* 1. TYPOGRAPHY, LOGO & CTAs (Mobile: 1st | Desktop: डावीकडे) */}
        {/* ======================================================== */}
        <div className="order-1 lg:col-span-7 space-y-4 sm:space-y-5 text-center lg:text-left">
          
          {/* Top Row: देवीचे नमन */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-heritage-gold/40 text-heritage-goldLight text-xs tracking-wider uppercase font-semibold backdrop-blur-md shadow-xs">
              <Flame className="w-3.5 h-3.5 text-heritage-gold" />
              <span>॥ कुलस्वामिनी श्री भैरी भवानी प्रसन्न ॥</span>
            </div>
          </div>

          {/* मुख्य संस्था अधिकृत लोगो (Transparent PNG सह ऑप्टिमाइझ केलेला) */}
          <div className="flex justify-center lg:justify-start pt-0.5">
            <div className="relative inline-block max-w-[250px] sm:max-w-[300px]">
              {/* पाठीमागे हलका सोनेरी प्रकाश ज्यामुळे 'फाउंडेशन' शब्द स्पष्ट वाचता येईल */}
              <div className="absolute -inset-1.5 bg-heritage-gold/20 blur-md rounded-2xl pointer-events-none"></div>

              <img 
                src={transparentLogo} 
                alt="शेलारमामा फाऊंडेशन" 
                className="relative z-10 w-full h-auto object-contain select-none filter drop-shadow-[0_2px_12px_rgba(212,175,55,0.45)]"
              />
            </div>
          </div>

          {/* मुख्य टॅगलाईन */}
          <h1 className="text-3xl sm:text-5xl xl:text-6xl font-black text-white leading-[1.15] sm:leading-[1.12] tracking-tight">
            संस्कृतीचे अधिष्ठान, <br />
            <span className="bg-gradient-to-r from-heritage-goldLight via-heritage-gold to-amber-200 bg-clip-text text-transparent">
              समाजसेवेचा ध्यास.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-gray-300/90 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
            {lang === 'mr' 
              ? "शेलारमामा फाऊंडेशन — सामाजिक बांधिलकी, कला, क्रीडा आणि सांस्कृतिक परंपरेला एकत्र जोडून परिवर्तनाची नवी दिशा देणारी संस्था."
              : "Shelarmama Foundation — Driving societal transformation by uniting social welfare, cultural heritage, arts, and sports."}
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-1 sm:pt-2">
            <a 
              href="#initiatives" 
              className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-heritage-gold to-heritage-goldLight text-heritage-burgundy font-bold px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm shadow-xl shadow-heritage-gold/20 hover:shadow-heritage-gold/40 hover:-translate-y-0.5 transition duration-200"
            >
              <span>{lang === 'mr' ? 'आमचे प्रमुख उपक्रम' : 'Explore Initiatives'}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </a>

            <a 
              href="#events" 
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/20 font-semibold px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm backdrop-blur-md transition hover:-translate-y-0.5"
            >
              <span>{lang === 'mr' ? 'आगामी कार्यक्रम' : 'Upcoming Events'}</span>
            </a>
          </div>

          {/* Trust Highlights */}
          <div className="pt-4 border-t border-white/10 grid grid-cols-3 gap-3 sm:gap-4 max-w-lg mx-auto lg:mx-0 text-left">
            <div>
              <div className="text-xl sm:text-2xl font-black text-heritage-gold">१०+</div>
              <div className="text-[10px] sm:text-[11px] text-gray-400 font-medium">वर्षे अविरत कार्य</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-heritage-gold">५०+</div>
              <div className="text-[10px] sm:text-[11px] text-gray-400 font-medium">भव्य महोत्सव</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-heritage-gold">१०,०००+</div>
              <div className="text-[10px] sm:text-[11px] text-gray-400 font-medium">सहभागी नागरिक</div>
            </div>
          </div>

        </div>

        {/* ======================================================== */}
        {/* 2. PHOTO CARD (Balanced Width, Sharp Proportions)       */}
        {/* ======================================================== */}
        <div className="order-2 lg:col-span-5 flex justify-center lg:justify-end w-full">
          {/* कार्डची रुंदी समतोल ठेवली आहे ज्यामुळे उजवीकडील गॅप भरून निघेल */}
          <div className="relative w-full max-w-[310px] sm:max-w-[350px] lg:max-w-[380px]">
            
            {/* हलकी सोनेरी चमक */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-b from-heritage-gold/25 via-heritage-crimson/20 to-transparent opacity-60 blur-xl"></div>

            {/* मुख्य कार्ड आवरण */}
            <div className="relative rounded-3xl p-2 sm:p-2.5 bg-white/5 backdrop-blur-xl border border-heritage-gold/30 shadow-2xl">
              
              {/* Photo Container: aspect-[3/4] मुळे वर-खाली रिकामी जागा राहणार नाही */}
              <div className="relative aspect-[3/4] sm:h-[460px] lg:h-[490px] rounded-2xl overflow-hidden bg-black">
                <img 
                  src={deviPhoto} 
                  alt="कुलस्वामिनी श्री भैरी भवानी - शेलारमामा फाऊंडेशन" 
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none"></div>
              </div>

              {/* Text Box */}
              <div className="mt-2 p-2.5 rounded-xl bg-heritage-burgundy/90 border border-heritage-gold/20 text-center">
                <div className="flex items-center justify-center gap-1.5 text-heritage-goldLight text-[10px] font-semibold tracking-wider uppercase mb-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-heritage-gold" />
                  <span>श्रद्धास्थान</span>
                </div>
                <h3 className="text-white font-bold text-sm sm:text-base tracking-wide">
                  कुलस्वामिनी श्री भैरी भवानी
                </h3>
                <p className="text-[10px] text-gray-300">
                  शेलारमामा फाऊंडेशनचे मुख्य प्रेरणास्थान
                </p>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}