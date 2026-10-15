// src/pages/admin/AdminInitiativesPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Layers, Calendar, UploadCloud, Trash2, Save, 
  Loader2, Sparkles, CheckCircle2, AlertCircle, Plus, 
  X, ArrowLeft, ArrowRight 
} from 'lucide-react';
import { INITIATIVES_DATA } from '../../data/initiativesData';
import { uploadToImgBB } from '../../services/imageUploadService';
import { initiativeService } from '../../services/initiativeService';

export default function AdminInitiativesPage() {
  const [allInitiatives, setAllInitiatives] = useState(INITIATIVES_DATA);
  const [selectedInitiative, setSelectedInitiative] = useState(INITIATIVES_DATA[0]);
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [detectedYear, setDetectedYear] = useState(new Date().getFullYear().toString());

  const [headlineMr, setHeadlineMr] = useState('');
  const [descriptionMr, setDescriptionMr] = useState('');
  const [slots, setSlots] = useState([]); // Max 10 slots

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // Modal State for New Initiative
  const [showAddModal, setShowAddModal] = useState(false);
  const [newInitData, setNewInitData] = useState({
    titleMr: '',
    categoryMr: '',
    badgeMr: 'नवीन उपक्रम',
    descMr: '',
    image: ''
  });
  const [coverUploading, setCoverUploading] = useState(false);

  // Load initiatives & Year data
  useEffect(() => {
    // Local storage kinva Firestore madhun custom initiatives load karne
    const custom = JSON.parse(localStorage.getItem('smf_custom_initiatives') || '[]');
    if (custom.length > 0) {
      setAllInitiatives([...INITIATIVES_DATA, ...custom]);
    }
  }, []);

  const handleDateChange = (newDate) => {
    setEventDate(newDate);
    if (newDate) {
      setDetectedYear(new Date(newDate).getFullYear().toString());
    }
  };

  useEffect(() => {
    if (!selectedInitiative?.id || !detectedYear) return;
    loadYearData();
  }, [selectedInitiative?.id, detectedYear]);

  const loadYearData = async () => {
    setLoading(true);
    setStatusMsg({ type: '', text: '' });
    try {
      const data = await initiativeService.getYearGallery(selectedInitiative.id, detectedYear);
      if (data) {
        setEventDate(data.eventDate || `${detectedYear}-01-01`);
        setHeadlineMr(data.headlineMr || '');
        setDescriptionMr(data.descriptionMr || '');
        setSlots(data.slots || []);
      } else {
        setHeadlineMr('');
        setDescriptionMr('');
        setSlots([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Batch Upload to ImgBB
  const handleBatchUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const availableCount = 10 - slots.length;
    if (availableCount <= 0) {
      setStatusMsg({ type: 'error', text: 'कमाल १० फोटो स्लॉट आधीच भरले आहेत!' });
      return;
    }

    const filesToUpload = files.slice(0, availableCount);
    setUploadProgress({ current: 0, total: filesToUpload.length });

    const newSlots = [...slots];
    let nextSlotNo = 1;

    for (let i = 0; i < filesToUpload.length; i++) {
      setUploadProgress({ current: i + 1, total: filesToUpload.length });
      while (newSlots.some(s => s.slotNo === nextSlotNo) && nextSlotNo <= 10) {
        nextSlotNo++;
      }

      try {
        const res = await uploadToImgBB(filesToUpload[i]);
        newSlots.push({
          slotNo: nextSlotNo,
          url: res.url,
          thumbUrl: res.thumbUrl || res.url,
          caption: `फोटो ${nextSlotNo}`
        });
        nextSlotNo++;
      } catch (err) {
        console.error('File upload error:', err);
      }
    }

    setSlots(newSlots.sort((a, b) => a.slotNo - b.slotNo));
    setUploadProgress(null);
    setStatusMsg({ type: 'success', text: `${filesToUpload.length} फोटो यशस्वीरीत्या अपलोड झाले!` });
    e.target.value = '';
  };

  // Reorder Photos (Move Left / Right)
  const handleMovePhoto = (index, direction) => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slots.length) return;

    const updated = [...slots];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Slot numbers sync karne
    const renumbered = updated.map((s, idx) => ({ ...s, slotNo: idx + 1 }));
    setSlots(renumbered);
  };

  const handleRemoveSlot = (slotNo) => {
    const remaining = slots.filter(s => s.slotNo !== slotNo);
    const renumbered = remaining.map((s, idx) => ({ ...s, slotNo: idx + 1 }));
    setSlots(renumbered);
  };

  const handleCaptionChange = (slotNo, text) => {
    setSlots(prev => prev.map(s => s.slotNo === slotNo ? { ...s, caption: text } : s));
  };

  // Save Year Data
  const handleSave = async () => {
    setSaving(true);
    setStatusMsg({ type: '', text: '' });
    try {
      await initiativeService.saveYearGallery(selectedInitiative.id, detectedYear, {
        eventDate,
        headlineMr,
        descriptionMr,
        slots
      });
      setStatusMsg({ type: 'success', text: `वर्ष ${detectedYear} ची माहिती व फोटो यशस्वीरित्या सेव्ह झाले!` });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'त्रुटी आली.' });
    } finally {
      setSaving(false);
    }
  };

  // Create New Initiative Handler
  const handleCreateInitiative = async (e) => {
    e.preventDefault();
    if (!newInitData.titleMr.trim()) return;

    const newId = newInitData.titleMr.toLowerCase().replace(/\s+/g, '-');
    const newEntry = {
      id: newId,
      titleMr: newInitData.titleMr,
      titleEn: newInitData.titleMr,
      categoryMr: newInitData.categoryMr || 'सामाजिक व सांस्कृतिक',
      categoryEn: 'Social & Cultural',
      badgeMr: newInitData.badgeMr || 'नवा उपक्रम',
      badgeEn: 'Initiative',
      image: newInitData.image || '/assets/initiatives/default.jpg',
      descMr: newInitData.descMr || ''
    };

    const existingCustom = JSON.parse(localStorage.getItem('smf_custom_initiatives') || '[]');
    const updatedCustom = [...existingCustom, newEntry];
    localStorage.setItem('smf_custom_initiatives', JSON.stringify(updatedCustom));

    setAllInitiatives([...INITIATIVES_DATA, ...updatedCustom]);
    setSelectedInitiative(newEntry);
    setShowAddModal(false);
    setNewInitData({ titleMr: '', categoryMr: '', badgeMr: 'नवीन उपक्रम', descMr: '', image: '' });
    setStatusMsg({ type: 'success', text: `नवीन उपक्रम "${newEntry.titleMr}" तयार झाला!` });
  };

  const handleCoverUpload = async (file) => {
    if (!file) return;
    setCoverUploading(true);
    try {
      const res = await uploadToImgBB(file);
      setNewInitData(prev => ({ ...prev, image: res.url }));
    } catch (err) {
      alert(err.message || 'कव्हर फोटो अपलोड अयशस्वी.');
    } finally {
      setCoverUploading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-heritage-crimson text-xs font-bold uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>इव्हेंट व्यवस्थापन व गॅलरी</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-heritage-burgundy">
            प्रमुख उपक्रम (Year-wise Manager)
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            तारखेवरून वर्ष निश्चित करा, मल्टिपल फोटो अपलोड करा आणि क्रमाने लावा.
          </p>
        </div>

        {/* New Initiative Button */}
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-heritage-burgundy hover:bg-heritage-crimson text-white text-xs font-bold shadow-md transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>नवीन उपक्रम जोडा</span>
        </button>
      </div>

      {/* Status Msg */}
      {statusMsg.text && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
          statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Upkram Selection Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {allInitiatives.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelectedInitiative(item)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
              selectedInitiative.id === item.id
                ? 'bg-heritage-burgundy text-white border-heritage-burgundy shadow-sm'
                : 'bg-white text-gray-700 border-gray-200 hover:border-heritage-gold'
            }`}
          >
            {item.titleMr}
          </button>
        ))}
      </div>

      {/* Main Year Editor */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-heritage-burgundy flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-heritage-gold" />
              <span>{selectedInitiative.titleMr}</span>
            </h2>
            <span className="text-xs text-gray-400 font-medium">{selectedInitiative.categoryMr}</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
            <Calendar className="w-4 h-4 text-amber-600" />
            <span>सध्याचे वर्ष: {detectedYear}</span>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-400 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-heritage-burgundy" />
            <span>वर्ष {detectedYear} चा डेटा लोड होत आहे...</span>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Date, Headline & Description */}
            <div className="space-y-4 bg-gray-50/60 p-5 rounded-2xl border border-gray-200/80">
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    कार्यक्रमाची तारीख
                  </label>
                  <input 
                    type="date"
                    value={eventDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold focus:border-heritage-burgundy outline-none bg-white"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">या तारखेवरून वर्ष निश्चित होते</span>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    ठळक मथळा / शीर्षक (Headline)
                  </label>
                  <input 
                    type="text"
                    placeholder="उदा. २५,००० भाविकांच्या उपस्थितीत ऐतिहासिक सोहळा संपन्न..."
                    value={headlineMr}
                    onChange={(e) => setHeadlineMr(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold focus:border-heritage-burgundy outline-none bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  सविस्तर अहवाल / माहिती
                </label>
                <textarea 
                  rows={4}
                  placeholder="कार्यक्रमाचे स्वरूप, विशेष उपस्थिती, पारितोषिके किंवा उल्लेखनीय घडामोडी लिहा..."
                  value={descriptionMr}
                  onChange={(e) => setDescriptionMr(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:border-heritage-burgundy outline-none bg-white leading-relaxed"
                />
              </div>
            </div>

            {/* Photo Slots with Reorder Controls */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-black uppercase text-gray-700 tracking-wider">
                    १०-फोटो गॅलरी ({slots.length}/१० भरले आहेत)
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    क्रम बदलण्यासाठी डावा (←) किंवा उजवा (→) बाण वापरा.
                  </p>
                </div>

                {slots.length < 10 && (
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-heritage-burgundy/10 text-heritage-burgundy hover:bg-heritage-burgundy hover:text-white transition text-xs font-bold cursor-pointer border border-heritage-burgundy/20">
                    <UploadCloud className="w-4 h-4" />
                    <span>मल्टिपल फोटो निवडा ({10 - slots.length} जागा शिल्लक)</span>
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      onChange={handleBatchUpload}
                      disabled={Boolean(uploadProgress)}
                      className="hidden" 
                    />
                  </label>
                )}
              </div>

              {uploadProgress && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-amber-900">
                    <span>ImgBB वर फोटो अपलोड होत आहेत...</span>
                    <span>{uploadProgress.current} / {uploadProgress.total}</span>
                  </div>
                  <div className="w-full bg-amber-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-600 h-full transition-all duration-300"
                      style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Slots Grid with Reorder Arrows */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 pt-2">
                {slots.map((slot, index) => (
                  <div 
                    key={slot.slotNo}
                    className="relative border border-gray-200 rounded-2xl p-2 bg-white flex flex-col justify-between shadow-xs group"
                  >
                    <span className="absolute top-2 left-2 z-10 text-[9px] font-black px-2 py-0.5 rounded-md bg-heritage-burgundy text-white shadow">
                      स्लॉट {index + 1}
                    </span>

                    <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100">
                      <img 
                        src={slot.thumbUrl || slot.url} 
                        alt={`Photo ${index + 1}`} 
                        className="w-full h-full object-cover" 
                      />
                      <button 
                        type="button"
                        onClick={() => handleRemoveSlot(slot.slotNo)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600 text-white opacity-0 group-hover:opacity-100 transition shadow hover:bg-red-700 cursor-pointer"
                        title="फोटो काढा"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Reorder Buttons (Move Left / Right) */}
                    <div className="flex items-center justify-between gap-1 mt-2">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMovePhoto(index, 'left')}
                        className="p-1 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 hover:bg-heritage-burgundy hover:text-white disabled:opacity-30 cursor-pointer transition"
                        title="डावीकडे घ्या"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>

                      <span className="text-[10px] font-bold text-gray-400">#{index + 1}</span>

                      <button
                        type="button"
                        disabled={index === slots.length - 1}
                        onClick={() => handleMovePhoto(index, 'right')}
                        className="p-1 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 hover:bg-heritage-burgundy hover:text-white disabled:opacity-30 cursor-pointer transition"
                        title="उजवीकडे घ्या"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <input 
                      type="text"
                      placeholder="कॅप्शन..."
                      value={slot.caption || ''}
                      onChange={(e) => handleCaptionChange(slot.slotNo, e.target.value)}
                      className="mt-2 w-full text-[10px] px-2 py-1 border rounded-lg bg-white outline-none focus:border-heritage-burgundy"
                    />
                  </div>
                ))}

                {/* Empty placeholders if less than 10 */}
                {Array.from({ length: 10 - slots.length }).map((_, idx) => (
                  <div 
                    key={`empty-${idx}`}
                    className="border border-dashed border-gray-300 rounded-2xl p-2.5 bg-gray-50/60 flex flex-col items-center justify-center aspect-square text-gray-300"
                  >
                    <span className="text-[10px] font-bold">स्लॉट {slots.length + idx + 1} (रिक्त)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                type="button"
                disabled={saving || Boolean(uploadProgress)}
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-heritage-burgundy hover:bg-heritage-crimson text-white font-bold text-xs shadow-md transition disabled:opacity-60 cursor-pointer"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>वर्ष {detectedYear} ची माहिती सेव्ह करा</span>
              </button>
            </div>

          </div>
        )}

      </div>

      {/* Add New Initiative Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-200 space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-lg font-black text-heritage-burgundy">नवीन उपक्रम तयार करा</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInitiative} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">उपक्रमाचे नाव</label>
                <input 
                  type="text" 
                  required
                  placeholder="उदा. आरोग्य तपासणी शिबीर"
                  value={newInitData.titleMr}
                  onChange={(e) => setNewInitData({ ...newInitData, titleMr: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-heritage-burgundy outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">वर्गवारी / प्रकार</label>
                  <input 
                    type="text"
                    placeholder="उदा. समाजकल्याण • आरोग्य"
                    value={newInitData.categoryMr}
                    onChange={(e) => setNewInitData({ ...newInitData, categoryMr: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-heritage-burgundy outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">बॅज मजकूर</label>
                  <input 
                    type="text" 
                    placeholder="उदा. नवा उपक्रम"
                    value={newInitData.badgeMr}
                    onChange={(e) => setNewInitData({ ...newInitData, badgeMr: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-heritage-burgundy outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">मुख्य कव्हर फोटो (Cover Photo)</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleCoverUpload(e.target.files?.[0])}
                    className="text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-heritage-burgundy/10 file:text-heritage-burgundy cursor-pointer"
                  />
                  {coverUploading && <Loader2 className="w-4 h-4 animate-spin text-heritage-burgundy" />}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold text-gray-600"
                >
                  रद्द करा
                </button>
                <button 
                  type="submit"
                  disabled={coverUploading}
                  className="px-5 py-2 rounded-xl bg-heritage-burgundy text-white text-xs font-bold shadow hover:bg-heritage-crimson transition disabled:opacity-60"
                >
                  उपक्रम जोडा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}