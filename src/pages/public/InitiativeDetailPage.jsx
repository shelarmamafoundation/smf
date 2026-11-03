// src/pages/public/InitiativeDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Image as ImageIcon, Sparkles, X, 
  ChevronLeft, ChevronRight, Filter, Users, ShieldAlert 
} from 'lucide-react';
import { INITIATIVES_DATA } from '../../data/initiativesData';
import { initiativeService } from '../../services/initiativeService';
import EventCommitteeModal from '../../components/common/EventCommitteeModal';

export default function InitiativeDetailPage({ lang = 'mr' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const base = import.meta.env.BASE_URL;

  const initiative = INITIATIVES_DATA.find((item) => item.id === id);

  // Dynamic States
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [yearData, setYearData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Committee Modal State
  const [showCommitteeModal, setShowCommitteeModal] = useState(false);

  // Lightbox Slider States
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Day Filter State
  const [selectedDayFilter, setSelectedDayFilter] = useState('ALL');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // 1. Photo Protection: Right Click, Inspect & Keyboard Shortcut Restriction
  useEffect(() => {
    const handleContextMenu = (e) => {
      // Photo gallery kiva Lightbox var right click block karne
      if (e.target.tagName === 'IMG' || e.target.closest('.protected-gallery')) {
        e.preventDefault();
      }
    };

    const handleKeyDown = (e) => {
      // PrintScreen (PrtScn) kiva save command (Ctrl+S / Cmd+S)
      if (e.key === 'PrintScreen' || (e.ctrlKey && e.key === 's') || (e.metaKey && e.key === 's')) {
        e.preventDefault();
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // 2. Upkramache Dynamic Years Shodhne
  useEffect(() => {
    if (!initiative) return;

    async function loadYears() {
      const yrs = await initiativeService.getAvailableYears(initiative.id);
      setAvailableYears(yrs);
      if (yrs.length > 0) {
        setSelectedYear(yrs[0]);
      }
    }

    loadYears();
  }, [initiative]);

  // 3. Selected Year cha data load karne
  useEffect(() => {
    if (!initiative || !selectedYear) return;

    async function loadYearContent() {
      setLoading(true);
      try {
        const data = await initiativeService.getYearGallery(initiative.id, selectedYear);
        setYearData(data);
        setSelectedDayFilter('ALL');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadYearContent();
  }, [initiative, selectedYear]);

  const allSlots = yearData?.slots || [];

  // 2. फोटोंमधून सर्व युनिक दिवस आपोआप शोधणे (Auto-Detect from slots)
  const uniqueDaysFromSlots = Array.from(
    new Set(allSlots.map(s => s.dayTag).filter(Boolean))
  ).map(tag => ({ id: tag, title: tag }));

  const rawDays = (yearData?.eventDays && yearData.eventDays.length > 0)
    ? yearData.eventDays
    : uniqueDaysFromSlots;

    // ३. दिवसांमधील क्रमांक (इंग्रजी किंवा देवनागरी अंक) शोधून अचूक क्रमाने (१, २, ३, ४...) लावणे
  const getDayNumber = (str) => {
    if (!str) return 999;
    // देवनागरी अंक असल्यास इंग्रजीत रूपांतरित करणे
    const devanagariMap = {'०':'0','१':'1','२':'2','३':'3','४':'4','५':'5','६':'6','७':'7','८':'8','९':'9'};
    const normalized = String(str).replace(/[०-९]/g, d => devanagariMap[d]);
    const match = normalized.match(/\d+/);
    return match ? parseInt(match[0], 10) : 999;
  };

  // डेटाबेसमध्ये eventDays असेल तर ते, नाहीतर थेट फोटोंमधील दिवस वापरा
 const displayDays = [...rawDays].sort((a, b) => {
    const titleA = a.title || a;
    const titleB = b.title || b;
    return getDayNumber(titleA) - getDayNumber(titleB);
  });

  // Filter slots by selected date / day chip
  const visibleSlots = selectedDayFilter === 'ALL' 
    ? allSlots 
    : allSlots.filter(s => s.dayTag === selectedDayFilter);

  // Lightbox Navigation Functions
  const openLightbox = (slot) => {
    const idx = visibleSlots.findIndex(s => s.slotNo === slot.slotNo);
    setCurrentIndex(idx >= 0 ? idx : 0);
    setLightboxOpen(true);
  };

  const handlePrev = (e) => {
    e?.stopPropagation();
    setCurrentIndex(prev => (prev === 0 ? visibleSlots.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    setCurrentIndex(prev => (prev === visibleSlots.length - 1 ? 0 : prev + 1));
  };

  // Keyboard Navigation for Lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, visibleSlots.length]);

  if (!initiative) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-heritage-cream">
        <h2 className="text-2xl font-bold text-heritage-burgundy">उपक्रम सापडला नाही!</h2>
        <button 
          onClick={() => navigate('/')} 
          className="mt-4 px-5 py-2.5 bg-heritage-burgundy text-white rounded-xl text-sm font-semibold hover:bg-heritage-crimson transition"
        >
          मुख्य पानावर परत जा
        </button>
      </div>
    );
  }

  const cleanPath = initiative.image?.startsWith('/') ? initiative.image.slice(1) : initiative.image;
  const fullCoverSrc = `${base}${cleanPath}`;
  const currentPhoto = visibleSlots[currentIndex];

  // Dynamic Days List: jar 1 peksha jasti divas astil tarach chips dakhvayche
  const hasMultipleDays = yearData?.eventDays && yearData.eventDays.length > 1;

  return (
    <div className="min-h-screen bg-heritage-cream font-sans pb-24 select-none">
      
      {/* Hero Banner */}
      <div className="relative h-72 sm:h-[400px] w-full overflow-hidden bg-slate-900 pt-20">
        <img 
          src={fullCoverSrc} 
          alt={initiative.titleMr} 
          className="w-full h-full object-cover object-center opacity-40 scale-105 pointer-events-none"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-heritage-cream via-black/40 to-black/80"></div>

        <div className="absolute inset-x-0 bottom-6 sm:bottom-8 max-w-5xl mx-auto px-4 sm:px-8 z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-heritage-gold/30 backdrop-blur-md text-heritage-burgundy text-xs font-extrabold uppercase tracking-wider mb-2 border border-heritage-gold/40">
              {lang === 'mr' ? initiative.badgeMr : initiative.badgeEn}
            </span>
            <h1 className="text-2xl sm:text-5xl font-black text-heritage-burgundy tracking-tight drop-shadow-sm">
              {lang === 'mr' ? initiative.titleMr : initiative.titleEn}
            </h1>
            <p className="text-xs sm:text-sm text-heritage-burgundy/80 font-semibold mt-0.5">
              {lang === 'mr' ? initiative.categoryMr : initiative.categoryEn}
            </p>
          </div>

          <button 
            type="button"
            onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/')}
            className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-white/90 hover:bg-white text-heritage-burgundy font-bold text-xs shadow-lg transition cursor-pointer self-start sm:self-end border border-heritage-gold/30"
          >
            <ArrowLeft className="w-4 h-4 text-heritage-crimson" />
            <span>{lang === 'mr' ? 'मागे जा' : 'Back'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 mt-6 sm:mt-8 space-y-8">
        
        {/* Dynamic Year Tabs & Committee Button Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-heritage-gold/20 pb-3">
          
          {/* Year Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-heritage-burgundy uppercase tracking-wider shrink-0">
              वर्ष निवडा:
            </span>
            {availableYears.length > 0 ? (
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-heritage-gold/30 shadow-xs overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {availableYears.map((yr) => (
                  <button
                    key={yr}
                    onClick={() => setSelectedYear(yr)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                      selectedYear === yr
                        ? 'bg-heritage-burgundy text-white shadow-sm'
                        : 'text-gray-600 hover:text-heritage-burgundy'
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            ) : (
              <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1 rounded-xl border border-gray-200">
                चालू वर्ष
              </span>
            )}
          </div>

          {/* Committee Popup Button */}
          <button
            type="button"
            onClick={() => setShowCommitteeModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-700 to-heritage-burgundy hover:opacity-95 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer self-start sm:self-auto border border-amber-400/40"
          >
            <Users className="w-4 h-4 text-amber-300" />
            <span>उत्सव संयोजन समिती ({selectedYear || 'चालू वर्ष'})</span>
          </button>

        </div>

        {/* Narrative & Highlights Section */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-heritage-gold/20 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-base sm:text-lg font-black text-heritage-burgundy flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-heritage-gold" />
              <span>{yearData?.headlineMr || (lang === 'mr' ? 'उपक्रमाविषयी माहिती' : 'About Initiative')}</span>
            </h2>
            {(yearData?.startDate || yearData?.eventDate) && (
              <span className="text-[11px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full self-start sm:self-auto">
                कालावधी: {yearData.startDate || yearData.eventDate} {yearData.endDate && yearData.endDate !== yearData.startDate ? `ते ${yearData.endDate}` : ''}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
            {yearData?.descriptionMr || initiative.descMr || 'शेलारमामा फाऊंडेशनच्या माध्यमातून या उपक्रमाचे आयोजन दरवर्षी भव्य स्वरूपात केले जाते.'}
          </p>
        </div>

        {/* Photo Gallery Section with Date / Day Chips */}
        <div className="space-y-4 protected-gallery">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200/60 pb-3">
            <h2 className="text-lg sm:text-2xl font-black text-heritage-burgundy flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-heritage-crimson" />
              <span>छायाचित्रे ({selectedYear})</span>
            </h2>

            {/* Date / Day Chips Bar (किमान १ दिवस टॅग असला तरीही आपोआप दिसेल) */}
            {displayDays.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 shrink-0 mr-1">
                  <Filter className="w-3.5 h-3.5 text-amber-700" /> तारीख / दिवस:
                </span>

                {/* सर्व फोटो चिप */}
                <button
                  type="button"
                  onClick={() => setSelectedDayFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 border ${
                    selectedDayFilter === 'ALL'
                      ? 'bg-heritage-burgundy text-white border-heritage-burgundy shadow-xs'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  सर्व फोटो ({allSlots.length})
                </button>

                {/* तारीख/दिवसनिहाय चिप्स */}
                {displayDays.map((day) => {
                  const dayTitle = day.title || day;
                  const dayId = day.id || dayTitle;
                  const count = allSlots.filter(s => s.dayTag === dayTitle).length;

                  return (
                    <button
                      key={dayId}
                      type="button"
                      onClick={() => setSelectedDayFilter(dayTitle)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 border ${
                        selectedDayFilter === dayTitle
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-white text-amber-950 border-amber-200 hover:bg-amber-50/70'
                      }`}
                    >
                      <span>{dayTitle}</span>
                      <span className="ml-1 text-[10px] opacity-80 font-bold">({count})</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Photo Grid with Copy Protection */}
          {loading ? (
            <div className="py-16 text-center text-gray-400 text-xs">फोटो लोड होत आहेत...</div>
          ) : visibleSlots.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {visibleSlots.map((slot) => (
                <div 
                  key={slot.slotNo}
                  onClick={() => openLightbox(slot)}
                  onContextMenu={(e) => e.preventDefault()}
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-heritage-gold/20 shadow-2xs cursor-pointer hover:shadow-lg transition select-none"
                >
                  {/* Transparent Protection Overlay to Prevent Direct Image Drag/Save */}
                  <div className="absolute inset-0 z-10 bg-transparent pointer-events-auto"></div>

                  <img 
                    src={slot.thumbUrl || slot.url} 
                    alt={slot.caption || `Photo ${slot.slotNo}`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500 pointer-events-none select-none"
                    loading="lazy"
                    draggable="false"
                  />

                  {slot.dayTag && (
                    <span className="absolute top-2 left-2 z-20 text-[9px] font-black px-2 py-0.5 rounded-md bg-amber-600 text-white shadow-xs">
                      {slot.dayTag}
                    </span>
                  )}

                  {slot.caption && (
                    <div className="absolute inset-x-0 bottom-0 z-20 p-2 sm:p-2.5 bg-gradient-to-t from-black/85 via-black/40 to-transparent text-[11px] text-white font-medium truncate">
                      {slot.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-gray-300">
              <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs sm:text-sm font-semibold text-gray-500">
                {selectedDayFilter !== 'ALL' 
                  ? `"${selectedDayFilter}" साठी फोटो उपलब्ध नाहीत.` 
                  : `वर्ष ${selectedYear} चे फोटो अद्याप अपलोड केलेले नाहीत.`}
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Lightbox Slider Modal with Copy-Protection Overlay */}
      {lightboxOpen && currentPhoto && (
        <div 
          onClick={() => setLightboxOpen(false)}
          onContextMenu={(e) => e.preventDefault()}
          className="fixed inset-0 z-50 bg-black/92 backdrop-blur-md flex items-center justify-center p-3 select-none"
        >
          {/* Close Button */}
          <button 
            type="button" 
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition cursor-pointer z-50"
            title="बंद करा (Esc)"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Photo Counter */}
          <div className="absolute top-4 left-4 sm:top-5 sm:left-5 z-50 px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-bold">
            {currentIndex + 1} / {visibleSlots.length}
          </div>

          {/* Previous Button */}
          {visibleSlots.length > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2 sm:left-6 z-50 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition active:scale-90 cursor-pointer"
              title="मागील फोटो (←)"
            >
              <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          )}

          {/* Active Image Box with Invisible Protection Shield */}
          <div 
            className="relative max-w-5xl max-h-[85vh] p-2 flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Transparent protection shield layer */}
            <div className="absolute inset-0 z-20 bg-transparent pointer-events-auto" onContextMenu={(e) => e.preventDefault()}></div>

            <img 
              src={currentPhoto.url || currentPhoto.thumbUrl} 
              alt={currentPhoto.caption || `Photo ${currentIndex + 1}`} 
              draggable="false"
              className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl transition duration-200 pointer-events-none select-none" 
            />

            {(currentPhoto.caption || currentPhoto.dayTag) && (
              <div className="mt-2.5 text-center space-y-1 relative z-30">
                {currentPhoto.dayTag && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white uppercase tracking-wider">
                    {currentPhoto.dayTag}
                  </span>
                )}
                {currentPhoto.caption && (
                  <p className="text-white text-xs sm:text-sm font-medium">
                    {currentPhoto.caption}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Next Button */}
          {visibleSlots.length > 1 && (
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2 sm:right-6 z-50 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition active:scale-90 cursor-pointer"
              title="पुढील फोटो (→)"
            >
              <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          )}
        </div>
      )}

      {/* Event Committee Popup Modal */}
      <EventCommitteeModal
        isOpen={showCommitteeModal}
        onClose={() => setShowCommitteeModal(false)}
        eventId={initiative.id}
        eventTitle={initiative.titleMr}
        year={selectedYear || new Date().getFullYear().toString()}
      />

    </div>
  );
}