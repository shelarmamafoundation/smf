// src/components/admin/initiatives/YearGalleryEditor.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, Save, Loader2, Sparkles } from 'lucide-react';
import PhotoSlotCard from './PhotoSlotCard';
import { initiativeService } from '../../../services/initiativeService';

export default function YearGalleryEditor({ initiative }) {
  const availableYears = ['2026', '2025', '2024', '2023'];
  const [selectedYear, setSelectedYear] = useState('2026');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // फॉर्म स्टेट
  const [eventDate, setEventDate] = useState('');
  const [descriptionMr, setDescriptionMr] = useState('');
  const [slots, setSlots] = useState([]); // कमाल १० स्लॉट्स

  // वर्ष बदलल्यावर डेटा लोड करणे
  useEffect(() => {
    if (!initiative?.id) return;
    loadGallery();
  }, [initiative?.id, selectedYear]);

  const loadGallery = async () => {
    setLoading(true);
    try {
      const data = await initiativeService.getYearGallery(initiative.id, selectedYear);
      setEventDate(data.eventDate || '');
      setDescriptionMr(data.descriptionMr || '');
      setSlots(data.slots || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // स्लॉट अपडेट हँडलर
  const handleSlotUpdate = (slotNo, updatedSlot) => {
    setSlots(prev => {
      const existing = prev.filter(s => s.slotNo !== slotNo);
      return [...existing, updatedSlot].sort((a, b) => a.slotNo - b.slotNo);
    });
  };

  // स्लॉट काढणे
  const handleSlotRemove = (slotNo) => {
    setSlots(prev => prev.filter(s => s.slotNo !== slotNo));
  };

  // बदल सेव्ह करणे (१ Firestore Write)
  const handleSave = async () => {
    setSaving(true);
    try {
      await initiativeService.saveYearGallery(initiative.id, selectedYear, {
        eventDate,
        descriptionMr,
        slots
      });
      alert(`वर्ष ${selectedYear} ची माहिती व फोटो यशस्वीरित्या सेव्ह झाले!`);
    } catch (err) {
      alert(err.message || 'माहिती सेव्ह करताना त्रुटी आली.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
      
      {/* 1. Header & Year Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-lg font-black text-heritage-burgundy flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-heritage-gold" />
            <span>{initiative.titleMr} — वर्षानिहाय फोटो व माहिती व्यवस्थापन</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            वर्ष निवडा, तारीख टाका आणि १० फोटो स्लॉट्स मॅनेज करा.
          </p>
        </div>

        {/* Year Pills */}
        <div className="flex items-center gap-1.5 bg-gray-100 p-1.5 rounded-2xl">
          {availableYears.map(yr => (
            <button
              key={yr}
              type="button"
              onClick={() => setSelectedYear(yr)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedYear === yr
                  ? 'bg-heritage-burgundy text-white shadow-sm'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              {yr}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-gray-400 text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-heritage-burgundy" />
          <span>वर्ष {selectedYear} चा डेटा लोड होत आहे...</span>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* 2. तारीख आणि संक्षिप्त माहिती */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                कार्यक्रमाची तारीख ({selectedYear})
              </label>
              <input 
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold focus:border-heritage-burgundy outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                या वर्षाची संक्षिप्त माहिती / अहवाल
              </label>
              <input 
                type="text"
                placeholder="उदा. २०२६ मध्ये २५,००० हून अधिक भाविकांची उपस्थिती..."
                value={descriptionMr}
                onChange={(e) => setDescriptionMr(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold focus:border-heritage-burgundy outline-none"
              />
            </div>
          </div>

          {/* 3. १०-फोटो स्लॉट्स ग्रिड */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold uppercase text-gray-500 tracking-wider">
                १०-फोटो स्लॉट्स ({slots.length}/१० भरले आहेत)
              </span>
              <span className="text-[11px] text-gray-400">
                प्रत्येक स्लॉट ImgBB CDN द्वारे लोड होईल
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(slotNo => {
                const existingSlot = slots.find(s => s.slotNo === slotNo);
                return (
                  <PhotoSlotCard 
                    key={slotNo}
                    slotNo={slotNo}
                    slotData={existingSlot}
                    onUpdate={handleSlotUpdate}
                    onRemove={handleSlotRemove}
                  />
                );
              })}
            </div>
          </div>

          {/* 4. सेव्ह बटण */}
          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-heritage-burgundy hover:bg-heritage-crimson text-white font-bold text-xs shadow-md transition disabled:opacity-60 cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>वर्ष {selectedYear} चे बदल सेव्ह करा</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}