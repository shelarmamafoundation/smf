//smf\src\components\admin\FormControllerCard.jsx
import React, { useState, useEffect } from 'react';
import { formSettingsService } from '../../services/formSettingsService';
import { Settings, CheckCircle2, XCircle, Clock, RefreshCw, SlidersHorizontal, X } from 'lucide-react';
import Swal from 'sweetalert2';

export default function FormControllerCard({ isSuperAdmin }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingKey, setUpdatingKey] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = formSettingsService.subscribeSettings((data) => {
      setSettings(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // SweetAlert2 ne 'Upcoming' date ghene
  const handleStatusChange = async (formKey, newStatus) => {
    let startDate = settings?.[formKey]?.startDate || '';

    if (newStatus === 'upcoming') {
      const { value: inputDate } = await Swal.fire({
        title: 'नोंदणी कधी सुरू होणार?',
        input: 'text',
        inputValue: startDate || '१५ नोव्हेंबर २०२६, सायं. ६:०० वा.',
        inputPlaceholder: 'उदा. १५ नोव्हेंबर २०२६, सायं. ६:०० वा.',
        showCancelButton: true,
        confirmButtonText: 'तारीख सेव्ह करा',
        cancelButtonText: 'रद्द करा',
        confirmButtonColor: '#d97706',
        cancelButtonColor: '#64748b',
        customClass: {
          popup: 'rounded-2xl font-sans',
          confirmButton: 'rounded-xl text-xs font-bold px-4 py-2',
          cancelButton: 'rounded-xl text-xs font-bold px-4 py-2'
        }
      });

      if (!inputDate) return;
      startDate = inputDate;
    }

    setUpdatingKey(formKey);
    await formSettingsService.updateFormStatus(formKey, newStatus, startDate);
    setUpdatingKey(null);

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'फॉर्म स्थिती अपडेट झाली!',
      showConfirmButton: false,
      timer: 2000
    });
  };

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
        <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
        <span>फॉर्म स्थिती लोड होत आहे...</span>
      </div>
    );
  }

  const formsList = [
    { key: 'saapshidi', name: 'सापशिडी स्पर्धा फॉर्म', tag: 'Diwali Special' },
    { key: 'dandiya', name: 'दांडिया पास नोंदणी फॉर्म', tag: 'Navratri' },
    // Udya navin form aala ki fakt ithe 1 line add karaychi:
    // { key: 'blood_donation', name: 'रक्तदान शिबिर नोंदणी', tag: 'Social' },
  ];

  // Active forms chi count
  const activeCount = formsList.filter(f => (settings?.[f.key]?.status === 'active' || settings?.[f.key]?.isOpen)).length;

  return (
    <>
      {/* 1. DASHBOARD COMPACT BAR (Dashboard var gardi honar nahi) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-slate-900">फॉर्म ॲक्सेस व प्रवेश नियंत्रण</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {activeCount} फॉर्म सक्रिय
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              सापशिडी, दांडिया व आगामी इव्हेंट्सचे फॉर्म चालू, बंद किंवा आगामी ठेवा.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition active:scale-95 shadow-sm shrink-0 cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5 text-amber-400" />
          <span>फॉर्म व्यवस्थापित करा ({formsList.length})</span>
        </button>
      </div>

      {/* 2. POPUP MODAL (Kitihi form asle tari yat clean scrollable disel) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">सर्व नोंदणी फॉर्म्स नियंत्रण</h3>
                  <p className="text-[11px] text-slate-500">प्रत्येक फॉर्मची चालू स्थिती इथून बदला</p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content - Scrollable List */}
            <div className="p-4 sm:p-5 space-y-3 overflow-y-auto max-h-[65vh]">
              {formsList.map((f) => {
                const config = settings?.[f.key] || { status: 'closed' };
                const currentStatus = config.status || (config.isOpen ? 'active' : 'closed');
                const isProcessing = updatingKey === f.key;

                return (
                  <div 
                    key={f.key}
                    className={`p-3.5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      currentStatus === 'active' 
                        ? 'border-emerald-300 bg-emerald-50/20' 
                        : currentStatus === 'upcoming'
                        ? 'border-amber-300 bg-amber-50/25'
                        : 'border-slate-200 bg-slate-50/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{f.name}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                          {f.tag}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[11px] font-semibold">
                        {currentStatus === 'active' && (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> थेट नोंदणी सुरू आहे
                          </span>
                        )}
                        {currentStatus === 'upcoming' && (
                          <span className="text-amber-800 font-bold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-600" /> लवकरच ({config.startDate || 'तारीख नाही'})
                          </span>
                        )}
                        {currentStatus === 'closed' && (
                          <span className="text-rose-700 font-bold flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" /> नोंदणी बंद आहे
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Status Pills */}
                    <div className="flex items-center gap-1 shrink-0 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
                      <button
                        onClick={() => handleStatusChange(f.key, 'active')}
                        disabled={isProcessing || currentStatus === 'active'}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition active:scale-95 cursor-pointer ${
                          currentStatus === 'active'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        सुरू
                      </button>

                      <button
                        onClick={() => handleStatusChange(f.key, 'upcoming')}
                        disabled={isProcessing || currentStatus === 'upcoming'}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition active:scale-95 cursor-pointer ${
                          currentStatus === 'upcoming'
                            ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                            : 'text-slate-600 hover:text-amber-800 hover:bg-amber-50'
                        }`}
                      >
                        लवकरच
                      </button>

                      <button
                        onClick={() => handleStatusChange(f.key, 'closed')}
                        disabled={isProcessing || currentStatus === 'closed'}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition active:scale-95 cursor-pointer ${
                          currentStatus === 'closed'
                            ? 'bg-rose-700 text-white shadow-xs'
                            : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
                        }`}
                      >
                        बंद
                      </button>

                      {isProcessing && <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600 ml-1" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                बंद करा (Close)
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}