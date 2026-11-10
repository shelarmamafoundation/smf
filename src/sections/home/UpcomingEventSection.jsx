import React from 'react';
import { Calendar, MapPin, Sparkles, Trophy, Gift, Clock, ArrowRight ,Award} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function UpcomingEventSection({ lang }) {
  const base = import.meta.env.BASE_URL;

  return (
    <section id="events" className="py-16 sm:py-20 bg-gradient-to-b from-heritage-burgundy via-[#24060b] to-[#140206] text-white relative overflow-hidden font-sans">
      
      {/* Background Decorative Glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-[1300px] mx-auto px-4 sm:px-8 relative z-10">
        
        {/* Header Tag */}
<div className="text-center mb-8 sm:mb-12">
  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-heritage-gold/40 text-amber-200 text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-md">
    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
    <span>{lang === 'mr' ? 'दिवाळी विशेष आगामी स्पर्धा' : 'Diwali Special Upcoming Competition'}</span>
  </div>

  {/* Clip-text kadhun clean text color dila jyamule Devanagari matra cut honar nahi */}
  <h2 className="text-3xl sm:text-5xl font-black text-amber-300 tracking-normal drop-shadow-md leading-tight">
    {lang === 'mr' ? 'भव्य सापशिडी स्पर्धा २०२६' : 'Grand Saapshidi Competition 2026'}
  </h2>

  <p className="text-sm sm:text-base text-gray-200 mt-2 font-medium">
    {lang === 'mr' 
      ? '२० × २० फुटांच्या भव्य पटावर महिला होणार सोंगट्या! • फक्त महिलांसाठी' 
      : 'Women will become tokens on a giant 20x20 ft board! • Exclusively for Women'}
  </p>
</div>

        {/* Event Main Showcase Card */}
        <div className="bg-white/5 border border-heritage-gold/30 rounded-3xl p-5 sm:p-8 lg:p-10 backdrop-blur-xl shadow-2xl grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* डावी बाजू: पोस्टर डिस्प्ले */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group max-w-sm rounded-2xl overflow-hidden border-2 border-heritage-gold/50 shadow-2xl">
              <img 
                src={`${base}images/saapshidi-banner.jpg`} 
                alt="भव्य सापशिडी स्पर्धा २०२६" 
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.target.src = `${base}assets/events/saapshidi-banner.jpg`;
                }}
              />
              <div className="absolute top-3 left-3 bg-gradient-to-r from-red-600 to-amber-600 text-white font-black text-[11px] px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white"></span>
                <span>फक्त १०० खेळाडू</span>
              </div>
            </div>
          </div>

          {/* उजवी बाजू: कार्यक्रमाचे संपूर्ण तपशील */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* तारीख आणि वेळ बॉक्स */}
            <div>
              <span className="text-xs uppercase tracking-wider text-heritage-goldLight font-bold block mb-2">
                {lang === 'mr' ? 'स्पर्धा वेळ व तारीख' : 'Event Schedule'}
              </span>
              <div className="grid grid-cols-2 gap-3 max-w-md">
                <div className="bg-gradient-to-br from-amber-600 to-amber-700 text-white rounded-2xl p-3 text-center shadow-lg border border-white/20">
                  <div className="text-2xl sm:text-3xl font-black">२२</div>
                  <div className="text-xs font-bold tracking-wide">नोव्हेंबर २०२६</div>
                </div>
                <div className="bg-gradient-to-br from-[#2a0815] to-[#420d22] text-amber-200 rounded-2xl p-3 text-center shadow-lg border border-amber-500/30 flex flex-col justify-center items-center">
                  <div className="flex items-center gap-1 text-xs font-medium text-gray-300">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>सायंकाळी</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5">७:०० वाजता</div>
                </div>
              </div>
            </div>

            {/* मुख्य वैशिष्ट्ये (Prizes & Special Highlights) */}
          <div className="space-y-3 pt-1">
            <div className="grid sm:grid-cols-3 gap-3">
              
              {/* प्रथम क्रमांक */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-amber-500/30 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-300 text-sm">मानाची पैठणी! 👑</h4>
                  <p className="text-xs text-gray-300 mt-0.5 leading-snug">
                    प्रथम क्रमांकाच्या विजेत्या महिलेला मानाची पैठणी!
                  </p>
                </div>
              </div>

              {/* द्वितीय व तृतीय क्रमांक */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-sky-500/30 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sky-300 text-sm">बहुमान 🎁</h4>
                  <p className="text-xs text-gray-300 mt-0.5 leading-snug">
                    द्वितीय व तृतीय विजेत्या महिलांना एक आकर्षक बक्षीस
                  </p>
                </div>
              </div>

              {/* सहभागी स्पर्धक */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-emerald-500/30 flex items-start gap-3 sm:col-span-1">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-300 text-sm">गिफ्ट व्हाउचर्स 🎟️</h4>
                  <p className="text-xs text-gray-300 mt-0.5 leading-snug">
                    भाग घेणाऱ्या स्पर्धकांना सुद्धा गिफ्ट व्हाउचर्स मिळणार !
                  </p>
                </div>
              </div>

            </div>

            {/* आकर्षक टॅगलाईन बॅनर */}
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-heritage-burgundy/30 to-amber-500/10 border border-amber-500/20 text-center">
              <p className="text-xs sm:text-sm font-bold text-amber-200 tracking-wide">
                ✨ खेळ, मनोरंजन आणि उत्साहाची अनोखी पर्वणी! ✨
              </p>
            </div>
          </div>

            {/* ठिकाण */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-heritage-gold/30 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-heritage-gold/20 text-heritage-gold flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-heritage-goldLight text-sm">स्पर्धेचे ठिकाण</h4>
                <p className="text-xs sm:text-sm text-gray-200 font-medium">
                  लोअर परळ, मुंबई - ४०००१३
                </p>
              </div>
            </div>

            {/* नोंदणी बटण आणि आयोजक माहिती */}
            <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">आयोजक</span>
                <div className="text-base font-bold text-heritage-gold">शेलारमामा फाऊंडेशन आणि आँरा यूनिसेक्स सलोन</div>
                
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                <Link 
                  to="/saapshidi" 
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition"
                >
                  <span>मोफत नोंदणी करा</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a 
                  href="https://maps.google.com/?q=Lower+Parel+Railway+Station+West+Mumbai" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/15 text-gray-200 border border-white/15 font-bold px-3.5 py-2.5 rounded-xl text-xs transition"
                >
                  <MapPin className="w-4 h-4 text-heritage-gold" />
                  <span className="hidden sm:inline">मॅप</span>
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}