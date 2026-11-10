import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, AlertCircle, Users, Trophy, Calendar, Clock, Gift, Camera, ExternalLink, Scissors } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SaapshidiRegistration() {
  const SCRIPT_URL = import.meta.env.VITE_DANDIYA_SCRIPT_URL;

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    age: '',
    place: ''
  });

  const [stats, setStats] = useState({
    confirmedCount: 0,
    waitingCount: 0,
    maxSlots: 100,
    isFull: false
  });

  const [loadingStats, setLoadingStats] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checkingMobile, setCheckingMobile] = useState(false);
  const [mobileError, setMobileError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [tokenResult, setTokenResult] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${SCRIPT_URL}?action=getSaapshidiStats&event=saapshidi`);
      const data = await res.json();
      if (data.success) {
        setStats({
          confirmedCount: data.confirmedCount || 0,
          waitingCount: data.waitingCount || 0,
          maxSlots: data.maxSlots || 100,
          isFull: data.isFull || false
        });
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleEnglishOnlyInput = (field, val) => {
    const sanitized = val.replace(/[^a-zA-Z0-9\s.,-]/g, '');
    setFormData((prev) => ({ ...prev, [field]: sanitized }));
  };

  const handleMobileBlur = async () => {
    const cleanMobile = formData.mobile.trim();
    if (cleanMobile.length !== 10) return;

    setCheckingMobile(true);
    setMobileError('');

    try {
      const res = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'checkSaapshidiMobile',
          event: 'saapshidi',
          mobile: cleanMobile
        })
      });
      const data = await res.json();
      if (data.success && data.exists) {
        setMobileError('हा मोबाईल नंबर आधीच नोंदवला आहे!');
      }
    } catch (err) {
      console.error('Mobile check error:', err);
    } finally {
      setCheckingMobile(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mobileError) return;

    if (!formData.name.trim() || !formData.mobile.trim() || !formData.place.trim()) {
      setGeneralError('कृपया सर्व माहिती भरा!');
      return;
    }

    setSubmitting(true);
    setGeneralError('');

    try {
      const res = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'registerSaapshidi',
          event: 'saapshidi',
          name: formData.name.trim(),
          mobile: formData.mobile.trim(),
          age: formData.age.trim(),
          place: formData.place.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        setTokenResult(data);
        fetchStats();
      } else {
        setGeneralError(data.error || 'नोंदणी करताना त्रुटी आली.');
      }
    } catch (err) {
      setGeneralError('नेटवर्क एरर: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const percentageFilled = Math.min(100, Math.round((stats.confirmedCount / stats.maxSlots) * 100));

  // ==================== TOKEN RESULT SCREEN ====================
  if (tokenResult) {
    const isWaiting = tokenResult.isWaiting;

    return (
      <div className="min-h-screen bg-[#160205] text-stone-100 flex flex-col justify-center items-center p-3 font-sans">
        <div className="w-full max-w-md bg-[#250408] border-2 border-amber-500/60 rounded-3xl p-5 sm:p-6 shadow-2xl text-center relative">
          
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl font-black bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/50 shadow-lg">
            ✓
          </div>

          <span className="text-xs tracking-widest text-amber-400 uppercase font-black block">
            शेलारमामा फाऊंडेशन • दिवाळी विशेष
          </span>
          <h2 className="text-2xl font-black text-amber-200 mt-1">
            {isWaiting ? 'वेटिंग लिस्ट नोंदणी झाली!' : 'सहभाग निश्चित झाला!'}
          </h2>
          <p className="text-xs text-amber-100/80 mt-1">भव्य सापशिडी स्पर्धा २०२६ (फक्त महिलांसाठी)</p>

          <div className="my-4 bg-black/70 border-2 border-amber-500/50 rounded-2xl p-4">
            <span className="text-xs font-bold tracking-wider text-amber-400 uppercase block mb-1">
              {isWaiting ? 'वेटिंग टोकन क्रमांक' : 'खेळाडू टोकन क्रमांक'}
            </span>
            <span className="text-4xl font-black text-amber-300 font-mono tracking-widest block py-1">
              {tokenResult.tokenId}
            </span>
            <div className="mt-2 inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-sm font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
              {isWaiting ? `वेटिंग क्रम: ${tokenResult.slotNo}` : `खेळाडू क्रमांक: ${tokenResult.slotNo} / १००`}
            </div>
          </div>

          <div className="text-sm text-stone-200 space-y-2 mb-4 text-left bg-black/40 p-4 rounded-xl border border-stone-800">
            <p><span className="text-stone-400">नाव:</span> <strong className="text-white text-base">{tokenResult.name}</strong></p>
            <p><span className="text-stone-400">स्पर्धा तारीख:</span> <strong className="text-amber-300">१५ नोव्हेंबर २०२६</strong></p>
            <p><span className="text-stone-400">वेळ:</span> <strong className="text-amber-300">संध्याकाळी ६:०० वाजता</strong></p>
            
            {isWaiting ? (
              <p className="text-amber-300 text-xs mt-2 pt-2 border-t border-stone-800 font-medium leading-relaxed">
                👉 पहिल्या १०० मधील खेळाडू अनुपस्थित राहिल्यास वेटिंग लिस्टनुसार क्रमांक दिला जाईल.
              </p>
            ) : (
              <p className="text-emerald-400 text-xs mt-2 pt-2 border-t border-stone-800 font-medium leading-relaxed">
                👉 १५ नोव्हेंबरला संध्याकाळी ५:४५ वाजता मैदानावर उपस्थित राहून हा टोकन दाखवावा.
              </p>
            )}
          </div>

          {/* SPONSOR SECTION: AAURA UNISEX SALON (Token Screen) */}
          <div className="my-4 bg-gradient-to-r from-purple-950/70 via-pink-950/50 to-purple-950/70 border border-pink-500/40 rounded-2xl p-3.5 text-center shadow-md">
            <span className="text-[10px] font-black tracking-widest text-amber-300 uppercase block">
              ✨ Special Gift & Beauty Partner ✨
            </span>
            <h4 className="text-sm font-black text-white mt-1 tracking-wide">
              AAURA UNISEX SALON
            </h4>
            <p className="text-[11px] text-pink-300 font-semibold">
              Harshada Kulkarni • Lalbaug
            </p>
            <a
              href="https://www.instagram.com/aaura.lalbaug?utm_source=qr&obrf=dXRyZjd0MXo1cjd3"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2.5 inline-flex items-center justify-center gap-1.5 w-full py-2 bg-gradient-to-r from-purple-700 via-pink-600 to-rose-600 hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md transition active:scale-95"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Instagram वर फॉलो करा (@aaura.lalbaug)</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>

          {/* Social Contact Button */}
          <a
            href="https://www.instagram.com/shelarmamafoundation"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mb-3 py-2.5 bg-gradient-to-r from-purple-900 to-pink-900 hover:from-purple-800 hover:to-pink-800 border border-pink-500/40 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
          >
            <Camera className="w-4 h-4 text-pink-400" />
            <span>इन्स्टाग्रामवर मेसेज करा (@shelarmamafoundation)</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>

          <button
            onClick={() => {
              setTokenResult(null);
              setFormData({ name: '', mobile: '', age: '', place: '' });
              fetchStats();
            }}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl text-sm transition active:scale-95 shadow-lg"
          >
            नवीन नोंदणी करा
          </button>
        </div>
      </div>
    );
  }

  // ==================== MAIN FULLSCREEN EASY FORM ====================
  return (
    <div className="min-h-screen bg-[#160205] text-stone-100 flex flex-col items-center justify-start py-1 sm:py-4 px-2 sm:px-4 font-sans">
      
      {/* Top Header */}
      <div className="w-full max-w-md flex items-center justify-between py-2 px-1 mb-1">
        <Link to="/" className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold">
          <ArrowLeft className="w-4 h-4" />
          <span>मुख्य वेबसाईट</span>
        </Link>
        <span className="text-xs uppercase tracking-wider text-amber-200/70 font-black">
          Shelarmama Foundation
        </span>
      </div>

      {/* Main Container Card */}
      <div className="w-full max-w-md bg-[#250408] border border-amber-600/40 rounded-3xl overflow-hidden shadow-2xl relative mb-4">
        
        {/* Top Poster Image Banner */}
        <div className="relative w-full h-44 sm:h-52 bg-stone-900 overflow-hidden">
          <img 
            src={`${import.meta.env.BASE_URL}assets/saapshidi-banner.jpg`} 
            alt="भव्य सापशिडी स्पर्धा" 
            className="w-full h-full object-cover object-top opacity-95"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#250408] via-[#250408]/30 to-transparent" />
          
          <div className="absolute top-2.5 left-3">
            <span className="inline-flex items-center gap-1 bg-black/70 backdrop-blur-md text-amber-300 border border-amber-500/50 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              दिवाळी विशेष
            </span>
          </div>

          <div className="absolute bottom-2 left-3.5 right-3.5 text-left">
            <h1 className="text-xl sm:text-2xl font-black text-amber-200 leading-tight drop-shadow-lg">
              भव्य सापशिडी स्पर्धा २०२६
            </h1>
            <p className="text-xs sm:text-sm font-bold text-stone-200 drop-shadow">
              २० × २० फुटांच्या भव्य पटावर महिला होणार सोंगट्या!
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-5 pt-3">
          
          {/* Tarikh aani Time Pills */}
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-amber-300 bg-black/50 border border-amber-500/30 px-3.5 py-2.5 rounded-2xl mb-3.5">
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-amber-400" /> २२ नोव्हेंबर २०२६</span>
            <span className="text-stone-500">•</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-amber-400" /> सायं. ६:०० वा.</span>
          </div>

          {/* 100 Slots Live Progress Bar */}
          <div className="bg-black/60 border border-stone-800 rounded-2xl p-3 mb-4">
            <div className="flex items-center justify-between text-xs sm:text-sm font-bold mb-1.5">
              <span className="text-stone-300 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-400" />
                नोंदणी स्थिती:
              </span>
              <span className={stats.isFull ? "text-amber-400 font-black text-sm" : "text-emerald-400 font-black text-sm"}>
                {loadingStats ? "लोड होत आहे..." : `${stats.confirmedCount} / ${stats.maxSlots} जागा भरल्या`}
              </span>
            </div>

            <div className="w-full bg-stone-900 rounded-full h-2.5 overflow-hidden border border-stone-800">
              <div
                className={`h-full transition-all duration-500 ${
                  stats.isFull ? 'bg-amber-500' : 'bg-gradient-to-r from-emerald-500 to-amber-400'
                }`}
                style={{ width: `${percentageFilled}%` }}
              />
            </div>

            {stats.isFull ? (
              <p className="text-xs text-amber-300 font-bold mt-2 text-center">
                ⚠️ १०० मुख्य जागा पूर्ण झाल्या आहेत! आता वेटिंग लिस्ट सुरू आहे.
              </p>
            ) : (
              <p className="text-xs text-stone-300 mt-1.5 text-center font-medium">
                प्रथम १०० नोंदणी करणाऱ्या महिलांनाच थेट खेळण्याची संधी!
              </p>
            )}
          </div>

          {generalError && (
            <div className="p-3 bg-red-950/80 border border-red-600 text-red-200 text-xs sm:text-sm rounded-xl mb-3.5 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{generalError}</span>
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* १. नाव */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs sm:text-sm text-stone-200 font-bold">खेळाडू महिलेचे पूर्ण नाव *</label>
                <span className="text-[10px] text-amber-400/80 font-semibold">(English मध्ये)</span>
              </div>
              <input
                type="text"
                required
                placeholder="उदा. Pooja Ramesh Patil"
                value={formData.name}
                onChange={(e) => handleEnglishOnlyInput('name', e.target.value)}
                className="w-full bg-black/60 border-2 border-stone-700 focus:border-amber-500 rounded-xl px-3.5 py-3 text-sm sm:text-base outline-none text-white font-medium transition placeholder:text-stone-600"
              />
            </div>

            {/* २. मोबाईल नंबर */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs sm:text-sm text-stone-200 font-bold">मोबाईल नंबर (WhatsApp) *</label>
                {checkingMobile && <span className="text-xs text-amber-400 animate-pulse font-bold">तपासत आहे...</span>}
              </div>
              <input
                type="tel"
                inputMode="numeric"
                required
                maxLength={10}
                pattern="[0-9]{10}"
                placeholder="१० अंकी मोबाईल नंबर टाका"
                value={formData.mobile}
                onBlur={handleMobileBlur}
                onChange={(e) => {
                  const num = e.target.value.replace(/[^0-9]/g, '');
                  setFormData({ ...formData, mobile: num });
                  setMobileError('');
                }}
                className={`w-full bg-black/60 border-2 rounded-xl px-3.5 py-3 text-sm sm:text-base font-mono outline-none text-white transition placeholder:text-stone-600 ${
                  mobileError ? 'border-red-500 bg-red-950/20' : 'border-stone-700 focus:border-amber-500'
                }`}
              />
              {mobileError && (
                <p className="text-xs text-red-400 font-bold mt-1.5 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{mobileError}</span>
                </p>
              )}
            </div>

            {/* ३. वय आणि परिसर */}
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="text-xs sm:text-sm text-stone-200 font-bold block mb-1">वय *</label>
                <input
                  type="number"
                  inputMode="numeric"
                  required
                  min="12"
                  max="80"
                  placeholder="उदा. 28"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full bg-black/60 border-2 border-stone-700 focus:border-amber-500 rounded-xl py-3 px-2 text-center text-sm sm:text-base font-mono outline-none text-white placeholder:text-stone-600"
                />
              </div>
              <div className="col-span-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs sm:text-sm text-stone-200 font-bold">परिसर / ठिकाण *</label>
                  <span className="text-[10px] text-amber-400/80 font-semibold">(English)</span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Lower Parel, Dadar, etc."
                  value={formData.place}
                  onChange={(e) => handleEnglishOnlyInput('place', e.target.value)}
                  className="w-full bg-black/60 border-2 border-stone-700 focus:border-amber-500 rounded-xl px-3.5 py-3 text-sm sm:text-base outline-none text-white placeholder:text-stone-600"
                />
              </div>
            </div>

            {/* बक्षिसे आणि नियम बॉक्स */}
            <div className="bg-black/50 border-2 border-amber-500/40 rounded-2xl p-3.5 text-xs text-stone-200 space-y-2 mt-2">
              <p className="text-amber-300 font-black text-sm flex items-center gap-1.5 leading-tight">
                <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                <span>प्रथम क्रमांकाच्या विजेत्या महिलेला मानाची पैठणी! 👑</span>
              </p>
              <p className="text-emerald-400 font-black text-xs sm:text-sm flex items-center gap-1.5 leading-tight">
                <Gift className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>१०० खेळाडू – १०० बक्षिसे! (प्रत्येकीस आकर्षक भेट)</span>
              </p>
              <p className="text-stone-300 font-medium text-xs pt-1.5 border-t border-stone-800 leading-relaxed">
                📌 ही स्पर्धा फक्त महिलांसाठी असून १५ नोव्हेंबरला संध्याकाळी ६:०० वाजता उपस्थित राहणे आवश्यक आहे.
              </p>
            </div>

            {/* SPONSOR SECTION: AAURA UNISEX SALON (Main Form) */}
            <div className="bg-gradient-to-r from-purple-950/60 via-pink-950/40 to-purple-950/60 border border-pink-500/40 rounded-2xl p-3 text-center my-2 shadow-sm">
              <div className="flex items-center justify-center gap-1.5 text-[10px] font-black uppercase text-amber-300 tracking-wider">
                <span>✨ Event Gift & Beauty Partner ✨</span>
              </div>
              <h4 className="text-sm font-black text-white mt-0.5">
                AAURA UNISEX SALON
              </h4>
              <p className="text-[11px] text-pink-300 font-medium">
                Harshada Kulkarni • Lalbaug
              </p>
              <a
                href="https://www.instagram.com/aaura.lalbaug?utm_source=qr&obrf=dXRyZjd0MXo1cjd3"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center justify-center gap-1 text-[11px] font-bold text-pink-200 hover:text-white bg-pink-900/50 hover:bg-pink-900/80 border border-pink-500/30 px-3 py-1 rounded-full transition"
              >
                <Camera className="w-3 h-3 text-pink-400" />
                <span>Instagram Profile पहा (@aaura.lalbaug)</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            </div>

            {/* सबमिट बटण */}
            <button
              type="submit"
              disabled={submitting || checkingMobile || !!mobileError}
              className={`w-full py-4 font-black rounded-2xl text-sm sm:text-base transition active:scale-95 shadow-xl mt-2 flex items-center justify-center gap-2 cursor-pointer ${
                stats.isFull
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 text-white'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-stone-950'
              } disabled:opacity-50`}
            >
              {submitting ? (
                <span>नोंदणी होत आहे...</span>
              ) : stats.isFull ? (
                <span>वेटिंग लिस्टसाठी नोंदणी करा (Waiting List)</span>
              ) : (
                <span>स्पर्धेसाठी नोंदणी करा (Get Token)</span>
              )}
            </button>

          </form>

          {/* Social Contact Card (Shelarmama Foundation Instagram) */}
          <div className="mt-5 pt-4 border-t border-stone-800 text-center">
            <span className="text-xs text-stone-400 font-semibold block mb-2">
              काही शंका किंवा अधिक माहिती हवी असल्यास:
            </span>
            <a
              href="https://www.instagram.com/shelarmamafoundation"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-900/60 via-pink-900/60 to-rose-900/60 hover:from-purple-900 hover:to-pink-900 border border-pink-500/40 text-stone-200 text-xs sm:text-sm font-bold shadow-md transition active:scale-95 w-full"
            >
              <Camera className="w-4 h-4 text-pink-400 shrink-0" />
              <span>Instagram वर मेसेज करा (@shelarmamafoundation)</span>
              <ExternalLink className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}