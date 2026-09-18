import React from 'react';
import { ArrowUpRight, Sparkles, Award, Trophy } from 'lucide-react';
import { INITIATIVES_DATA } from '../../data/initiativesData';

export default function InitiativesSection({ lang }) {
  const base = import.meta.env.BASE_URL;

  return (
    <section id="initiatives" className="py-24 bg-heritage-cream relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-heritage-gold/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-heritage-crimson/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-heritage-burgundy/5 border border-heritage-gold/30 text-heritage-crimson text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-heritage-gold" />
              <span>{lang === 'mr' ? 'प्रमुख उपक्रम' : 'Our Initiatives'}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-heritage-burgundy tracking-tight">
              {lang === 'mr' ? 'आमचे प्रमुख उपक्रम' : 'Major Foundation Pillars'}
            </h2>
          </div>
          <p className="text-sm sm:text-base text-heritage-muted max-w-lg font-medium leading-relaxed">
            {lang === 'mr' 
              ? 'संस्कृतीचे संवर्धन, समाजकल्याण, कलाकारांचा गौरव आणि क्रीडा क्षेत्राला प्रोत्साहन देणारे विविधांगी कार्य.' 
              : 'Empowering communities through culture, sports, healthcare, social support, and artist recognition.'}
          </p>
        </div>

        {/* 8-Card Modern Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {INITIATIVES_DATA.map((item) => {
            const isChirayu = item.isChirayu;
            const isUpcoming = item.isUpcomingSport;
            
            // Path ko GitHub Pages / smf base ke anusaar joda
            const cleanPath = item.image.startsWith('/') ? item.image.slice(1) : item.image;
            const fullImageSrc = `${base}${cleanPath}`;

            return (
              <div 
                key={item.id}
                className={`group relative rounded-3xl overflow-hidden border transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col justify-between ${
                  isChirayu 
                    ? 'bg-gradient-to-b from-[#1C060D] via-[#100307] to-black border-heritage-gold/40 shadow-xl' 
                    : isUpcoming
                    ? 'bg-white border-amber-400/50 shadow-md'
                    : 'bg-white border-heritage-gold/25 shadow-sm'
                }`}
              >
                {/* Image Container */}
                <div className="relative h-60 overflow-hidden bg-slate-100">
                  <img 
                    src={fullImageSrc} 
                    alt={lang === 'mr' ? item.titleMr : item.titleEn}
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700" 
                  />

                  {/* Dark Overlay */}
                  <div className={`absolute inset-0 ${
                    isChirayu 
                      ? 'bg-gradient-to-t from-black via-black/40 to-transparent' 
                      : 'bg-gradient-to-t from-black/80 via-black/20 to-transparent'
                  }`}></div>

                  {/* Badges */}
                  <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-md border ${
                      isChirayu 
                        ? 'bg-heritage-gold/20 text-heritage-goldLight border-heritage-gold/40'
                        : isUpcoming
                        ? 'bg-amber-500 text-heritage-burgundy font-extrabold border-amber-300 shadow-md animate-pulse'
                        : item.isHeroic
                        ? 'bg-heritage-burgundy/85 text-heritage-goldLight border-heritage-gold/40'
                        : 'bg-black/60 text-white border-white/20'
                    }`}>
                      {lang === 'mr' ? item.badgeMr : item.badgeEn}
                    </span>
                  </div>

                  {/* Right Icons */}
                  <div className="absolute top-3.5 right-3.5">
                    {isChirayu && (
                      <div className="w-8 h-8 rounded-full bg-heritage-gold/20 border border-heritage-gold/50 flex items-center justify-center text-heritage-gold shadow-md">
                        <Award className="w-4 h-4" />
                      </div>
                    )}
                    {(item.isSports || isUpcoming) && (
                      <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center text-heritage-goldLight">
                        <Trophy className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className={`text-lg font-bold tracking-tight mb-1 transition ${
                      isChirayu 
                        ? 'text-heritage-goldLight' 
                        : 'text-heritage-burgundy group-hover:text-heritage-crimson'
                    }`}>
                      {lang === 'mr' ? item.titleMr : item.titleEn}
                    </h3>
                    <p className={`text-xs font-medium leading-relaxed ${isChirayu ? 'text-gray-300' : 'text-heritage-muted'}`}>
                      {lang === 'mr' ? item.categoryMr : item.categoryEn}
                    </p>
                  </div>

                  {/* Action Link */}
                  <div className="pt-4 mt-4 border-t border-heritage-gold/15 flex items-center justify-between">
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${isChirayu ? 'text-heritage-gold' : 'text-heritage-crimson'}`}>
                      {lang === 'mr' ? 'माहिती पहा' : 'Explore'}
                    </span>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
                      isChirayu 
                        ? 'bg-heritage-gold/20 text-heritage-gold group-hover:bg-heritage-gold group-hover:text-heritage-burgundy' 
                        : 'bg-heritage-burgundy/5 text-heritage-burgundy group-hover:bg-heritage-burgundy group-hover:text-white'
                    }`}>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}