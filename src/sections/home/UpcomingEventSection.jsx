import React from 'react';
import { Calendar, MapPin, Music, Sparkles, User, Ticket } from 'lucide-react';

export default function UpcomingEventSection({ lang }) {
  const base = import.meta.env.BASE_URL;

  return (
    <section id="events" className="py-20 bg-gradient-to-b from-heritage-burgundy via-[#24060b] to-[#140206] text-white relative overflow-hidden">
      
      {/* Background Decorative Glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-pink-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-[1300px] mx-auto px-4 sm:px-8 relative z-10">
        
        {/* Header Tag */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-heritage-gold/40 text-heritage-goldLight text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-md animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-heritage-gold" />
            <span>{lang === 'mr' ? 'आगामी भव्य लोकोत्सव' : 'Upcoming Grand Festival'}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-heritage-goldLight via-heritage-gold to-amber-200">
            {lang === 'mr' ? 'आपला दांडिया २०२६' : 'Aapla Dandiya 2026'}
          </h2>
          <p className="text-sm sm:text-base text-gray-300 mt-2 font-medium">
            {lang === 'mr' ? 'शेलारमामा फाऊंडेशन आयोजित • शिवसेना पुरस्कृत' : 'Organized by Shelarmama Foundation • Supported by Shiv Sena'}
          </p>
        </div>

        {/* Event Main Showcase Card */}
        <div className="bg-white/5 border border-heritage-gold/30 rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl grid lg:grid-cols-12 gap-10 items-center">
          
          {/* डावी बाजू: पोस्टर डिस्प्ले */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group max-w-sm rounded-2xl overflow-hidden border-2 border-heritage-gold/50 shadow-2xl">
              <img 
                src={`${base}assets/events/dandiya-2026-poster.jpg`} 
                alt="आपला दांडिया २०२६" 
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  // Fallback जर इमेज नाव वेगळे असेल तर
                  e.target.src = `${base}assets/events/dandiya.jpg`;
                }}
              />
              <div className="absolute top-3 left-3 bg-red-600 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white"></span> LIVE ORCHESTRA
              </div>
            </div>
          </div>

          {/* उजवी बाजू: कार्यक्रमाचे संपूर्ण तपशील */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 4 दिवसांच्या तारखांचे हायलाइट बॉक्सेस */}
            <div>
              <span className="text-xs uppercase tracking-wider text-heritage-goldLight font-bold block mb-2">
                {lang === 'mr' ? 'तारीख' : 'Event Dates'}
              </span>
              <div className="grid grid-cols-4 gap-2.5 sm:gap-4 max-w-md">
                {[
                  { d: '१६', m: 'ऑक्टोबर', bg: 'bg-[#ff5500]' },
                  { d: '१७', m: 'ऑक्टोबर', bg: 'bg-[#0088cc]' },
                  { d: '१८', m: 'ऑक्टोबर', bg: 'bg-[#e6005c]' },
                  { d: '१९', m: 'ऑक्टोबर', bg: 'bg-[#6600cc]' },
                ].map((item, idx) => (
                  <div key={idx} className={`${item.bg} text-white rounded-2xl p-2.5 sm:p-3 text-center shadow-lg border border-white/20`}>
                    <div className="text-2xl sm:text-3xl font-black">{item.d}</div>
                    <div className="text-[10px] sm:text-xs font-semibold">{item.m}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* मुख्य वैशिष्ट्ये (Features) */}
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">LIVE ORCHESTRA</h4>
                  <p className="text-xs text-gray-300">धुंद संगीत आणि प्रसिद्ध वादकांचा लाईव्ह परफॉर्मन्स</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-400 text-sm">प्रवेश विनामूल्य</h4>
                  <p className="text-xs text-gray-300">सर्व नागरिकांसाठी आणि गरबा प्रेमींसाठी खुला प्रवेश</p>
                </div>
              </div>
            </div>

            {/* ठिकाण */}
            <div className="p-4 rounded-2xl bg-white/5 border border-heritage-gold/30 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-heritage-gold/20 text-heritage-gold flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-heritage-goldLight text-sm">कार्यक्रम ठिकाण</h4>
                <p className="text-sm text-gray-200 font-medium">
                  लोअर परळ पश्चिम स्टेशन जवळ, मुंबई - ४०००१३
                </p>
              </div>
            </div>

            {/* आयोजक माहिती */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] uppercase font-bold text-gray-400">आयोजक</span>
                <div className="text-lg font-bold text-heritage-gold">सुशांत अरुण शेलार</div>
                <div className="text-[11px] text-gray-300">शिवसेना सचिव, अध्यक्ष - शिव चित्रपट सेना</div>
              </div>

              <a 
                href="https://maps.google.com/?q=Lower+Parel+Railway+Station+West+Mumbai" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-heritage-gold to-heritage-goldLight text-heritage-burgundy font-bold px-6 py-2.5 rounded-xl text-xs hover:shadow-lg hover:shadow-heritage-gold/30 transition"
              >
                <MapPin className="w-4 h-4" />
                <span>गुगल मॅपवर पहा</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}