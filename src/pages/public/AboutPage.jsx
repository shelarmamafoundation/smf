// src/pages/public/AboutPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, ShieldCheck, MapPin, 
  Sparkles, CheckCircle2, Camera,
  Users, Calendar, Loader2, Heart
} from 'lucide-react';
import { INITIATIVES_DATA } from '../../data/initiativesData';
import { committeeService } from '../../services/committeeService';

export default function AboutPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const stats = [
    { label: 'आयोजित भव्य उपक्रम', value: '१५+' },
    { label: 'रक्तदान व आरोग्य लाभार्थी', value: '२,५००+' },
    { label: 'सहभागी नागरिक व भाविक', value: '५०,०००+' },
    { label: 'सक्रिय कार्यकर्ते व स्वयंसेवक', value: '१००+' },
  ];

  // Core Trustees / Board
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
      image: '/assets/team/sandesh_mahadik.jpg',
      bio: 'संस्थेचे डिजिटल व्यवस्थापन, ताळेबंद आणि पारदर्शक आर्थिक कारभार.'
    }
  ];

  // Dynamic Event-wise Committee States
  const [selectedEventId, setSelectedEventId] = useState(INITIATIVES_DATA[0]?.id || 'aapla-dandiya');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [eventMembers, setEventMembers] = useState([]);
  const [committeeLoading, setCommitteeLoading] = useState(false);
  const [activeGenderTab, setActiveGenderTab] = useState('ALL'); // 'ALL' | 'FEMALE' | 'MALE'

  // Load Event Committee Data from Firestore
  useEffect(() => {
    async function loadEventCommittee() {
      setCommitteeLoading(true);
      try {
        const data = await committeeService.getMembers(selectedEventId, selectedYear);
        setEventMembers(data || []);
      } catch (err) {
        console.error('Committee load error on About page:', err);
      } finally {
        setCommitteeLoading(false);
      }
    }

    loadEventCommittee();
  }, [selectedEventId, selectedYear]);

  const filteredEventMembers = activeGenderTab === 'ALL'
    ? eventMembers
    : eventMembers.filter(m => m.gender === activeGenderTab);

  const maleCount = eventMembers.filter(m => m.gender === 'MALE').length;
  const femaleCount = eventMembers.filter(m => m.gender === 'FEMALE').length;

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
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-heritage-gold/20 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-heritage-burgundy">आमचे ध्येय (Our Mission)</h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
              पारंपरिक सण-उत्सव आणि क्रीडा स्पर्धांच्या माध्यमातून तरुणांना एकत्र आणणे, गरजू नागरिकांना वेळेवर सामाजिक व वैद्यकीय साहाय्य मिळवून देणे आणि स्थानिक संस्कृती जपणे हे संस्थेचे मुख्य ध्येय आहे.
            </p>
          </div>

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

      {/* 4. Leadership & Core Trustees */}
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
                      e.target.src = 'https://png.pngtree.com/png-vector/20190223/ourmid/pngtree-profile-glyph-black-icon-png-image_691589.jpg';
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

            {/* Trust, 80G & CSR Badges Section */}
<section className="max-w-5xl mx-auto px-4 sm:px-8 mt-16">
  <div className="bg-gradient-to-br from-heritage-burgundy to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-heritage-gold/30 shadow-xl space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
      <div>
        <span className="text-[10px] font-black uppercase tracking-widest text-heritage-gold">
          अधिकृत व नोंदणीकृत सामाजिक संस्था
        </span>
        <h3 className="text-xl sm:text-2xl font-black mt-1">
          शेलारमामा फाऊंडेशन, मुंबई
        </h3>
        <p className="text-xs text-gray-300 mt-1">
          सार्वजनिक विश्वस्त व्यवस्था नोंदणी अधिनियम अंतर्गत अधिकृत नोंदणीकृत.
        </p>
      </div>

      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 border border-white/20 text-xs font-bold text-heritage-gold shrink-0">
        <span>नोंदणी क्र.: E-32858 (Mumbai)</span>
      </div>
    </div>

    {/* 80G & CSR Highlights Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* 80G Tax Exemption */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-amber-400">80G आयकर सवलत (Tax Benefit)</span>
          <span className="text-[9px] font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">सक्रिय</span>
        </div>
        <p className="text-[11px] text-gray-300 leading-relaxed font-medium">
          शेलारमामा फाऊंडेशनला दिलेल्या देणग्यांवर आयकर कायदा कलम 80G अंतर्गत कर सवलत (Tax Exemption) उपलब्ध आहे.
        </p>
      </div>

      {/* CSR 1 & Corporate Funding */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-sky-400">CSR निधीसाठी पात्र (Eligible for CSR)</span>
          <span className="text-[9px] font-black px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">CSR-1 Registered</span>
        </div>
        <p className="text-[11px] text-gray-300 leading-relaxed font-medium">
          कंपन्या व उद्योग समूह त्यांच्या सामाजिक उत्तरदायित्व (CSR Funding) अंतर्गत शैक्षणिक, क्रीडा व समाजकल्याण उपक्रमांसाठी थेट सहयोग करू शकतात.
        </p>
      </div>
    </div>
  </div>
</section>

      {/* 5. Dynamic Event-wise Committee Section (उत्सव संयोजन समिती) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 mt-20 space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[10px] uppercase font-black tracking-widest text-amber-700">
            मैदानी कार्यकर्ते व उत्सव समिती
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-heritage-burgundy">
            वार्षिक उत्सव संयोजन समिती
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            प्रत्येक उपक्रमाचे प्रत्यक्ष आयोजन आणि संचालन करणाऱ्या कार्यकर्त्यांची अधिकृत नामावली.
          </p>
        </div>

        {/* Event Chips & Year Selector Filter Box */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-heritage-gold/30 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            
            {/* Event Selection Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <span className="text-[11px] font-bold text-gray-400 shrink-0 mr-1 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-heritage-burgundy" /> उपक्रम:
            </span>
            {INITIATIVES_DATA.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedEventId(item.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border shrink-0 ${
                  selectedEventId === item.id
                    ? 'bg-heritage-burgundy text-white border-heritage-burgundy shadow-xs'
                    : 'bg-heritage-cream/50 text-gray-700 border-gray-200 hover:bg-heritage-cream'
                }`}
              >
                {item.titleMr}
              </button>
            ))}
          </div>

            {/* Year Selector */}
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-[11px] font-bold text-gray-600">वर्ष:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="h-8 px-2.5 rounded-xl border border-gray-300 font-black text-xs bg-amber-50 text-amber-950 outline-none cursor-pointer"
              >
                {['2026', '2025', '2024'].map(yr => (
                  <option key={yr} value={yr}>वर्ष {yr}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Gender Filter Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setActiveGenderTab('ALL')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeGenderTab === 'ALL'
                  ? 'bg-heritage-burgundy text-white shadow-2xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              सर्व सदस्य ({eventMembers.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveGenderTab('FEMALE')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                activeGenderTab === 'FEMALE'
                  ? 'bg-pink-600 text-white shadow-2xs'
                  : 'bg-pink-50 text-pink-700 border border-pink-200'
              }`}
            >
              <Heart className="w-3 h-3" />
              <span>महिला समिती ({femaleCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveGenderTab('MALE')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeGenderTab === 'MALE'
                  ? 'bg-sky-700 text-white shadow-2xs'
                  : 'bg-sky-50 text-sky-800 border border-sky-200'
              }`}
            >
              पुरुष प्रतिनिधी ({maleCount})
            </button>
          </div>
        </div>

        

        {/* Dynamic Members Grid */}
        <div>
          {committeeLoading ? (
            <div className="py-16 text-center text-gray-400 text-xs flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-heritage-burgundy" />
              <span>समिती माहिती लोड होत आहे...</span>
            </div>
          ) : filteredEventMembers.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3.5">
              {filteredEventMembers.map((m) => (
                <div 
                  key={m.id}
                  className={`bg-white rounded-2xl p-3 text-center border shadow-2xs flex flex-col items-center justify-between hover:shadow-md transition ${
                    m.gender === 'FEMALE' ? 'border-pink-200 bg-pink-50/10' : 'border-heritage-gold/20'
                  }`}
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 border-2 border-heritage-gold/40 shadow-inner mb-2">
                    <img 
                      src={m.photoUrl} 
                      alt={m.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://png.pngtree.com/png-vector/20190223/ourmid/pngtree-profile-glyph-black-icon-png-image_691589.jpg';
                      }}
                    />
                  </div>
                  <div className="w-full">
                    <h4 className="text-xs font-black text-heritage-burgundy leading-snug truncate" title={m.name}>
                      {m.name}
                    </h4>
                    <span className="text-[10px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-full inline-block mt-0.5 truncate max-w-full">
                      {m.role}
                    </span>
                    <span className={`block mt-1 text-[8px] font-black tracking-wider uppercase ${
                      m.gender === 'FEMALE' ? 'text-pink-600' : 'text-sky-700'
                    }`}>
                      {m.gender === 'FEMALE' ? 'महिला' : 'पुरुष'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300">
              <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-gray-500">
                या उपक्रमासाठी आणि {selectedYear} वर्षासाठी अद्याप समिती जोडलेली नाही.
              </p>
            </div>
          )}
        </div>
      </section>



      {/* 6. Contact & Social Media Box */}
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

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <a
              href="https://www.instagram.com/shelarmamafoundation"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-bold text-xs shadow-md hover:opacity-90 transition active:scale-95 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Instagram वर फॉलो करा</span>
            </a>

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