
//\src\components\common\FormAccessGuard.jsx
import React, { useState, useEffect } from 'react';
import { formSettingsService } from '../../services/formSettingsService';
import { Link } from 'react-router-dom';
import { AlertOctagon, RefreshCw, ArrowLeft, Clock, Calendar } from 'lucide-react';

export default function FormAccessGuard({ formKey, defaultTitle, children }) {
  const [formConfig, setFormConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = formSettingsService.subscribeSettings((settings) => {
      if (settings && settings[formKey]) {
        setFormConfig(settings[formKey]);
      } else {
        setFormConfig({ status: 'active', isOpen: true });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [formKey]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#160205] text-stone-100 flex flex-col justify-center items-center p-4 font-sans">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mb-3" />
        <p className="text-xs font-bold text-stone-400">फॉर्म स्टेटस तपासत आहे...</p>
      </div>
    );
  }

  const status = formConfig?.status || (formConfig?.isOpen ? 'active' : 'closed');

  // १. जर नोंदणी लवकरच सुरू होणार असेल (UPCOMING)
  if (status === 'upcoming') {
    return (
      <div className="min-h-screen bg-[#160205] text-stone-100 flex flex-col justify-center items-center p-4 font-sans">
        <div className="w-full max-w-md bg-[#250408] border-2 border-amber-500/50 rounded-3xl p-6 text-center shadow-2xl relative">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 bg-amber-500/15 border-2 border-amber-500/40 text-amber-400">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          <span className="text-xs tracking-widest text-amber-400 uppercase font-black block">
            शेलारमामा फाऊंडेशन
          </span>

          <h2 className="text-xl sm:text-2xl font-black text-amber-200 mt-1">
            नोंदणी लवकरच सुरू होत आहे!
          </h2>

          <div className="my-4 bg-black/50 p-4 rounded-2xl border border-amber-500/30 text-left space-y-2">
            <p className="text-xs text-stone-300 font-medium">
              {defaultTitle || 'या कार्यक्रमाची'} ऑनलाइन नोंदणी खालील वेळेस सुरू होईल:
            </p>
            <div className="flex items-center gap-2 text-sm font-bold text-amber-300 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/30">
              <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{formConfig.startDate || 'तारीख व वेळ लवकरच जाहीर केली जाईल.'}</span>
            </div>
          </div>

          <Link 
            to="/" 
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition shadow-lg active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>मुख्य वेबसाईटवर जा</span>
          </Link>
        </div>
      </div>
    );
  }

  // २. जर नोंदणी बंद असेल (CLOSED)
  if (status === 'closed') {
    return (
      <div className="min-h-screen bg-[#160205] text-stone-100 flex flex-col justify-center items-center p-4 font-sans">
        <div className="w-full max-w-md bg-[#250408] border-2 border-rose-500/40 rounded-3xl p-6 text-center shadow-2xl relative">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 bg-rose-500/15 border-2 border-rose-500/40 text-rose-400">
            <AlertOctagon className="w-8 h-8" />
          </div>

          <span className="text-xs tracking-widest text-amber-400 uppercase font-black block">
            शेलारमामा फाऊंडेशन
          </span>

          <h2 className="text-xl sm:text-2xl font-black text-amber-200 mt-1">
            नोंदणी पूर्ण झाली आहे!
          </h2>

          <p className="text-xs text-stone-300 mt-2 leading-relaxed bg-black/40 p-3.5 rounded-2xl border border-stone-800">
            {formConfig.closedMessage || `${defaultTitle || 'या कार्यक्रमाची'} ऑनलाइन नोंदणी आता बंद करण्यात आली आहे.`}
          </p>

          <Link 
            to="/" 
            className="mt-5 inline-flex items-center justify-center gap-2 w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl text-xs sm:text-sm transition shadow-lg active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>मुख्य वेबसाईटवर जा</span>
          </Link>
        </div>
      </div>
    );
  }

  // ३. जर status === 'active' असेल तर मूळ फॉर्म दिसेल
  return <>{children}</>;
}