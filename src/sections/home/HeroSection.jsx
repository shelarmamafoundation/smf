import React from 'react';
import { ChevronRight, Sparkles, ShieldCheck, Flame } from 'lucide-react';

export default function HeroSection({ lang }) {
  // Base URL (Local var '/' ani GitHub Pages var '/smf/')
  const base = import.meta.env.BASE_URL;

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center bg-heritage-burgundy overflow-hidden pt-28 pb-16">
      
      {/* Background Ambience Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-heritage-crimson/50 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-heritage-gold/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:32px_32px] opacity-15 pointer-events-none"></div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 w-full relative z-10 grid lg:grid-cols-12 gap-12 items-center">
        
        {/* Dabi Baju: Damdar Typography aani CTAs */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-heritage-gold/40 text-heritage-goldLight text-xs tracking-wider uppercase font-semibold backdrop-blur-md">
            <Flame className="w-3.5 h-3.5 text-heritage-gold" />
            <span>॥ कुलस्वामिनी श्री भैरी भवानी प्रसन्न ॥</span>
          </div>

          <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black text-white leading-[1.1] tracking-tight">
            संस्कृतीचे अधिष्ठान, <br />
            <span className="bg-gradient-to-r from-heritage-goldLight via-heritage-gold to-amber-200 bg-clip-text text-transparent">
              समाजसेवेचा ध्यास.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-300/90 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
            {lang === 'mr' 
              ? "शेलारमामा फाऊंडेशन — सामाजिक बांधिलकी, कला, क्रीडा आणि सांस्कृतिक परंपरेला एकत्र जोडून परिवर्तनाची नवी दिशा देणारी संस्था."
              : "Shelarmama Foundation — Driving societal transformation by uniting social welfare, cultural heritage, arts, and sports."}
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
            <a href="#initiatives" className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-heritage-gold to-heritage-goldLight text-heritage-burgundy font-bold px-7 py-3.5 rounded-xl text-sm shadow-xl shadow-heritage-gold/20 hover:shadow-heritage-gold/40 hover:-translate-y-0.5 transition duration-200">
              <span>{lang === 'mr' ? 'आमचे प्रमुख उपक्रम' : 'Explore Initiatives'}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </a>

            <a href="#events" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/20 font-semibold px-6 py-3.5 rounded-xl text-sm backdrop-blur-md transition hover:-translate-y-0.5">
              <span>{lang === 'mr' ? 'आगामी कार्यक्रम' : 'Upcoming Events'}</span>
            </a>
          </div>

          {/* Trust Highlights */}
          <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 text-left">
            <div>
              <div className="text-2xl font-black text-heritage-gold">१०+</div>
              <div className="text-[11px] text-gray-400 font-medium">वर्षे अविरत कार्य</div>
            </div>
            <div>
              <div className="text-2xl font-black text-heritage-gold">५०+</div>
              <div className="text-[11px] text-gray-400 font-medium">भव्य महोत्सव</div>
            </div>
            <div>
              <div className="text-2xl font-black text-heritage-gold">१०,०००+</div>
              <div className="text-[11px] text-gray-400 font-medium">सहभागी नागरिक</div>
            </div>
          </div>

        </div>

        {/* Ujvi Baju: Kulswamini Shri Bhairi Bhavani Card */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-sm sm:max-w-md">
            
            {/* Halki Soneri Chamak (Aura Glow) */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-b from-heritage-gold/30 via-heritage-crimson/20 to-transparent opacity-60 blur-xl"></div>

            {/* Mukhya Aavaran (Card Frame) */}
            <div className="relative rounded-3xl p-3 bg-white/5 backdrop-blur-xl border border-heritage-gold/30 shadow-2xl">
              
              {/* Photo Container */}
              <div className="relative h-[480px] sm:h-[520px] rounded-2xl overflow-hidden bg-black/40">
                <img 
                  src={`${base}assets/kuldevi.JPG`} 
                  alt="कुलस्वामिनी श्री भैरी भवानी" 
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-heritage-burgundy/80 to-transparent pointer-events-none"></div>
              </div>

              {/* Text Box */}
              <div className="mt-3 p-3.5 rounded-xl bg-heritage-burgundy/80 border border-heritage-gold/20 text-center">
                <div className="flex items-center justify-center gap-1.5 text-heritage-goldLight text-[11px] font-semibold tracking-wider uppercase mb-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-heritage-gold" />
                  <span>श्रद्धास्थान</span>
                </div>
                <h3 className="text-white font-bold text-base sm:text-lg tracking-wide">
                  कुलस्वामिनी श्री भैरी भवानी
                </h3>
                <p className="text-[11px] text-gray-300">
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