import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Image as ImageIcon, Sparkles, X, 
  ChevronLeft, ChevronRight, Filter, Users 
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

  // 1. Upkramache Dynamic Years Shodhne
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

  // 2. Selected Year cha data load karne
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

  // Lightbox Navigation Functions
  const allSlots = yearData?.slots || [];
  const visibleSlots = selectedDayFilter === 'ALL' 
    ? allSlots 
    : allSlots.filter(s => s.dayTag === selectedDayFilter);

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

  // Keyboard Navigation (Arrow Keys & Escape)
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

  return (
    <div className="min-h-screen bg-heritage-cream font-sans pb-24">
      
      {/* Hero Banner */}
      <div className="relative h-80 sm:h-[420px] w-full overflow-hidden bg-slate-900 pt-20">
        <img 
          src={fullCoverSrc} 
          alt={initiative.titleMr} 
          className="w-full h-full object-cover object-center opacity-45 scale-105"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-heritage-cream via-black/40 to-black/80"></div>

        <div className="absolute inset-x-0 bottom-8 max-w-5xl mx-auto px-4 sm:px-8 z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-heritage-gold/30 backdrop-blur-md text-heritage-burgundy text-xs font-extrabold uppercase tracking-wider mb-2 border border-heritage-gold/40">
              {lang === 'mr' ? initiative.badgeMr : initiative.badgeEn}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-heritage-burgundy tracking-tight drop-shadow-sm">
              {lang === 'mr' ? initiative.titleMr : initiative.titleEn}
            </h1>
            <p className="text-xs sm:text-sm text-heritage-burgundy/80 font-semibold mt-1">
              {lang === 'mr' ? initiative.categoryMr : initiative.categoryEn}
            </p>
          </div>

          <button 
            type="button"
            onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/90 hover:bg-white text-heritage-burgundy font-bold text-xs shadow-lg transition hover:-translate-y-0.5 cursor-pointer self-start sm:self-end border border-heritage-gold/30"
          >
            <ArrowLeft className="w-4 h-4 text-heritage-crimson" />
            <span>{lang === 'mr' ? 'मागे जा' : 'Back'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 mt-8 space-y-10">
        
        {/* Dynamic Year Tabs & Committee Button Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-heritage-gold/20 pb-3">
          
          {/* Year Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-heritage-burgundy uppercase tracking-wider shrink-0">
              वर्ष निवडा:
            </span>
            {availableYears.length > 0 ? (
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-heritage-gold/30 shadow-xs overflow-x-auto">
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
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-heritage-gold/20 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-lg font-black text-heritage-burgundy flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-heritage-gold" />
              <span>{yearData?.headlineMr || (lang === 'mr' ? 'उपक्रमाविषयी माहिती' : 'About Initiative')}</span>
            </h2>
            {(yearData?.startDate || yearData?.eventDate) && (
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full self-start sm:self-auto">
                कालावधी: {yearData.startDate || yearData.eventDate} {yearData.endDate && yearData.endDate !== yearData.startDate ? `ते ${yearData.endDate}` : ''}
              </span>
            )}
          </div>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-medium">
            {yearData?.descriptionMr || initiative.descMr || 'शेलारमामा फाऊंडेशनच्या माध्यमातून या उपक्रमाचे आयोजन दरवर्षी भव्य स्वरूपात केले जाते.'}
          </p>
        </div>

        {/* Photo Gallery Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-xl sm:text-2xl font-black text-heritage-burgundy flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-heritage-crimson" />
              <span>छायाचित्रे ({selectedYear})</span>
            </h2>

            {/* Day / Sub-event Filter Tabs */}
            {yearData?.eventDays && yearData.eventDays.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                <span className="text-[11px] font-bold text-gray-400 flex items-center gap-1 shrink-0 mr-1">
                  <Filter className="w-3.5 h-3.5" /> दिवस:
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedDayFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                    selectedDayFilter === 'ALL'
                      ? 'bg-heritage-burgundy text-white shadow-xs'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  सर्व फोटो ({allSlots.length})
                </button>
                {yearData.eventDays.map((day) => {
                  const count = allSlots.filter(s => s.dayTag === day.title).length;
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => setSelectedDayFilter(day.title)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                        selectedDayFilter === day.title
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white text-amber-900 border border-amber-200 hover:bg-amber-50'
                      }`}
                    >
                      {day.title} ({count})
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-400 text-xs">फोटो लोड होत आहेत...</div>
          ) : visibleSlots.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {visibleSlots.map((slot) => (
                <div 
                  key={slot.slotNo}
                  onClick={() => openLightbox(slot)}
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-heritage-gold/20 shadow-xs cursor-pointer hover:shadow-lg transition"
                >
                  <img 
                    src={slot.thumbUrl || slot.url} 
                    alt={slot.caption || `Photo ${slot.slotNo}`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    loading="lazy"
                  />
                  {slot.dayTag && (
                    <span className="absolute top-2 left-2 z-10 text-[9px] font-black px-2 py-0.5 rounded-md bg-amber-500 text-white shadow">
                      {slot.dayTag}
                    </span>
                  )}
                  {slot.caption && (
                    <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-[11px] text-white font-medium truncate">
                      {slot.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300">
              <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-500">
                {selectedDayFilter !== 'ALL' 
                  ? `"${selectedDayFilter}" साठी फोटो उपलब्ध नाहीत.` 
                  : `वर्ष ${selectedYear} चे फोटो अद्याप अपलोड केलेले नाहीत.`}
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Lightbox Slider Modal with Next, Prev & Keyboard Arrow Support */}
      {lightboxOpen && currentPhoto && (
        <div 
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 select-none"
        >
          {/* Close Button */}
          <button 
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition cursor-pointer z-50"
            title="बंद करा (Esc)"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Photo Counter */}
          <div className="absolute top-5 left-5 z-50 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold">
            {currentIndex + 1} / {visibleSlots.length}
          </div>

          {/* Previous Button */}
          {visibleSlots.length > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 sm:left-6 z-50 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition active:scale-90 cursor-pointer"
              title="मागील फोटो (←)"
            >
              <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          )}

          {/* Active Image Box */}
          <div 
            className="max-w-5xl max-h-[85vh] p-2 flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={currentPhoto.url || currentPhoto.thumbUrl} 
              alt={currentPhoto.caption || `Photo ${currentIndex + 1}`} 
              className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl transition duration-200" 
            />

            {(currentPhoto.caption || currentPhoto.dayTag) && (
              <div className="mt-3 text-center space-y-1">
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
              className="absolute right-3 sm:right-6 z-50 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition active:scale-90 cursor-pointer"
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