//src\pages\public\AboutPage.jsx
import React, { useEffect } from 'react';
import { 
  HeartHandshake, ShieldCheck, MapPin, 
  Sparkles, CheckCircle2, Camera 
} from 'lucide-react';

export default function AboutPage() {
  // Page load zhalyaver thet top var scroll karne
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const stats = [
    { label: 'आयोजित भव्य उपक्रम', value: '१५+' },
    { label: 'रक्तदान व आरोग्य लाभार्थी', value: '२,५००+' },
    { label: 'सहभागी नागरिक व भाविक', value: '५०,०००+' },
    { label: 'सक्रिय कार्यकर्ते व स्वयंसेवक', value: '१००+' },
  ];

  const committeeMembers = [
    {
      name: 'श्री. सुशांत शेलार',
      role: 'संस्थापक / अध्यक्ष - प्रमुख मार्गदर्शक',
      image: '/assets/team/sushant_shelar.jpg',
      bio: 'संस्थेचे प्रेरणास्थान, सामाजिक आणि सांस्कृतिक क्षेत्रातील दूरदर्शी नेतृत्व.'
    },
    {
      name: 'सौ. साक्षी सुशांत शेलार',
      role: 'विश्वस्त (Trustee)',
      image: '/assets/team/sakshi_shelar.jpg',
      bio: 'महिला सबलीकरण व सामाजिक कल्याण उपक्रमांमधील सक्रिय सहभाग व मार्गदर्शन.'
    },
    {
      name: 'श्री. मनीष दळवी',
      role: 'सरचिटणीस',
      image: '/assets/team/manish_dalvi.jpg',
      bio: 'सर्व उपक्रमांचे अचूक नियोजन, संघटन आणि प्रत्यक्ष मैदानी व्यवस्थापन.'
    },
    {
      name: 'श्री. संदेश महाडिक',
      role: 'खजिनदार',
      image: '/assets/team/sandesh_mahadik.JPG',
      bio: 'संस्थेचे डिजिटल व्यवस्थापन, ताळेबंद आणि पारदर्शक आर्थिक कारभार.'
    }
  ];

  return (
    <div className="min-h-screen bg-heritage-cream font-sans pb-24">
      
      {/* 1. Hero Section */}
      <section className="relative pt-28 pb-16 px-4 sm:px-8 bg-gradient-to-b from-heritage-burgundy to-heritage-crimson text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-400/10 via-transparent to-transparent"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-heritage-gold text-xs font-black tracking-widest uppercase border border-heritage-gold/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>आमची ओळख</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            संस्कृती, समाजसेवा आणि क्रीडा संवर्धन
          </h1>
          <p className="text-sm sm:text-base text-gray-200 max-w-2xl mx-auto leading-relaxed">
            शेलारमामा फाऊंडेशन ही समाजातील सर्व घटकांना एकत्र आणून कला, संस्कृती, सण-उत्सव आणि समाजोपयोगी उपक्रम राबवणारी एक अग्रगण्य सामाजिक संस्था आहे.
          </p>
        </div>
      </section>

      {/* 2. Impact Counter Cards */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((st, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-2xl p-4 sm:p-5 text-center shadow-lg border border-heritage-gold/20 hover:-translate-y-1 transition duration-300"
            >
              <div className="text-2xl sm:text-3xl font-black text-heritage-burgundy">
                {st.value}
              </div>
              <div className="text-[11px] sm:text-xs font-bold text-gray-600 mt-1">
                {st.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Mission & Vision */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 mt-16 space-y-8">
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Dhyey */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-heritage-gold/20 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-heritage-burgundy">आमचे ध्येय (Our Mission)</h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
              पारंपरिक सण-उत्सव आणि क्रीडा स्पर्धांच्या माध्यमातून तरुणांना एकत्र आणणे, गरजू नागरिकांना वेळेवर सामाजिक व वैद्यकीय साहाय्य मिळवून देणे आणि स्थानिक संस्कृती जपणे हे संस्थेचे मुख्य ध्येय आहे.
            </p>
          </div>

          {/* Uddishte */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-heritage-gold/20 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-heritage-burgundy">कामाचे स्वरूप (Key Values)</h2>
            <ul className="text-xs sm:text-sm text-gray-600 space-y-2 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>१००% पारदर्शक कारभार आणि काटेकोर आर्थिक हिशोब</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>महिला, तरुण आणि बालकांसाठी हक्काचे व्यासपीठ</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>उत्सवांसोबतच नियमित रक्तदान व आरोग्य शिबिरे</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* 4. Leadership & Committee Team */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 mt-16 space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[10px] uppercase font-black tracking-widest text-heritage-crimson">
            मार्गदर्शक मंडळ
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-heritage-burgundy">
            संस्थेची मुख्य कार्यकारणी व विश्वस्त
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 pt-2">
          {committeeMembers.map((m, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-3xl p-5 text-center border border-heritage-gold/20 shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-slate-100 border-2 border-heritage-gold/40 shadow-inner">
                  <img 
                    src={m.image} 
                    alt={m.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-sm font-black text-heritage-burgundy leading-snug">{m.name}</h3>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full inline-block mt-1">
                    {m.role}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed font-medium pt-1 border-t border-gray-100">
                {m.bio}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Contact & Social Media Box (No Email, Direct Instagram & Facebook) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 mt-16">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-heritage-gold/30 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-lg font-black text-heritage-burgundy">
              शेलारमामा फाऊंडेशन, मुंबई
            </h3>
            <p className="text-xs text-gray-500 font-medium max-w-md">
              सार्वजनिक सेवा, सांस्कृतिक जतन आणि समाजोपयोगी उपक्रमांसाठी निरंतर कार्यरत.
            </p>
            <div className="pt-2 flex items-center justify-center md:justify-start gap-2 text-xs font-bold text-gray-700">
              <MapPin className="w-4 h-4 text-heritage-crimson" />
              <span>मुंबई, महाराष्ट्र</span>
            </div>
          </div>

          {/* Social Media Connect Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            {/* Instagram Button */}
            <a
              href="https://www.instagram.com/shelarmamafoundation"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-bold text-xs shadow-md hover:opacity-90 transition active:scale-95 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Instagram वर फॉलो करा</span>
            </a>

            {/* Facebook Button */}
            <a
              href="https://www.facebook.com/shelarmamafoundation"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Facebook पेज</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}