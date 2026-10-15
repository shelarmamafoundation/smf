// src/pages/public/InitiativeDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Image as ImageIcon, Sparkles, X, FileText } from 'lucide-react';
import { INITIATIVES_DATA } from '../../data/initiativesData';
import { initiativeService } from '../../services/initiativeService';

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
  const [activePreview, setActivePreview] = useState(null);

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
        setSelectedYear(yrs[0]); // Sarvat naveen varsh select karne
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
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadYearContent();
  }, [initiative, selectedYear]);

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
        
        {/* Dynamic Year Tabs */}
        {availableYears.length > 0 && (
          <div className="flex items-center justify-between border-b border-heritage-gold/20 pb-3">
            <span className="text-xs font-extrabold text-heritage-burgundy uppercase tracking-wider">
              वर्ष निवडा:
            </span>
            <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-heritage-gold/30 shadow-xs">
              {availableYears.map((yr) => (
                <button
                  key={yr}
                  onClick={() => setSelectedYear(yr)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedYear === yr
                      ? 'bg-heritage-burgundy text-white shadow-sm'
                      : 'text-gray-600 hover:text-heritage-burgundy'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Narrative & Highlights Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-heritage-gold/20 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-heritage-burgundy flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-heritage-gold" />
              <span>{yearData?.headlineMr || (lang === 'mr' ? 'उपक्रमाविषयी माहिती' : 'About Initiative')}</span>
            </h2>
            {yearData?.eventDate && (
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                दिनांक: {yearData.eventDate}
              </span>
            )}
          </div>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-medium">
            {yearData?.descriptionMr || initiative.descMr || 'शेलारमामा फाऊंडेशनच्या माध्यमातून या उपक्रमाचे आयोजन दरवर्षी भव्य स्वरूपात केले जाते.'}
          </p>
        </div>

        {/* 10-Photo Gallery Section */}
        <div className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-black text-heritage-burgundy flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-heritage-crimson" />
            <span>छायाचित्रे ({selectedYear})</span>
          </h2>

          {loading ? (
            <div className="py-16 text-center text-gray-400 text-xs">फोटो लोड होत आहेत...</div>
          ) : yearData?.slots?.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {yearData.slots.map((slot) => (
                <div 
                  key={slot.slotNo}
                  onClick={() => setActivePreview(slot.url)}
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-heritage-gold/20 shadow-xs cursor-pointer hover:shadow-lg transition"
                >
                  <img 
                    src={slot.thumbUrl || slot.url} 
                    alt={slot.caption || `Photo ${slot.slotNo}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    loading="lazy"
                  />
                  {slot.caption && (
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-[11px] text-white font-medium truncate">
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
                वर्ष {selectedYear} चे फोटो अद्याप अपलोड केलेले नाहीत.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Lightbox Modal */}
      {activePreview && (
        <div 
          onClick={() => setActivePreview(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <button 
            onClick={() => setActivePreview(null)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={activePreview} 
            alt="Preview" 
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl" 
          />
        </div>
      )}

    </div>
  );
}