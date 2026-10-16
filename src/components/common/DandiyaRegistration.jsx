import React, { useState } from 'react';

export default function DandiyaRegistration() {
  const SCRIPT_URL = import.meta.env.VITE_DANDIYA_SCRIPT_URL;

  const [entryType, setEntryType] = useState('single');
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    place: '',
    groupName: '',
    totalCount: '1',
    bandNo: ''
  });
  const [hasBand, setHasBand] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenResult, setTokenResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      action: 'register',
      entryType: entryType === 'group' ? `ग्रुप (${formData.totalCount})` : entryType,
      name: formData.name,
      mobile: formData.mobile,
      place: formData.place,
      bandNo: hasBand ? formData.bandNo : ''
    };

    try {
      const res = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setTokenResult(data);
      } else {
        alert('नोंदणी करताना त्रुटी आली: ' + (data.error || 'सर्व्हर एरर'));
      }
    } catch (err) {
      alert('नेटवर्क एरर: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // नोंदणी यशस्वी झाल्यावर दिसणारा स्क्रीन (टोकन कार्ड)
  if (tokenResult) {
    return (
      <div className="min-h-[100dvh] bg-[#1a0507] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#2b080c] border border-amber-600/40 rounded-3xl p-6 text-center shadow-2xl">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl font-bold">
            ✓
          </div>
          <h2 className="text-xl font-bold text-amber-200">नोंदणी यशस्वी!</h2>
          <p className="text-xs text-stone-400 mt-1">शेलारमामा फाऊंडेशन दांडिया २०२६</p>

          <div className="my-6 bg-black/50 border border-amber-500/40 rounded-2xl p-5">
            <span className="text-[11px] font-semibold tracking-wider text-amber-400 uppercase block mb-1">
              तुमचा टोकन क्रमांक
            </span>
            <span className="text-4xl font-extrabold text-amber-300 font-mono tracking-widest block">
              {tokenResult.tokenId}
            </span>
          </div>

          <div className="text-sm text-stone-300 space-y-1 mb-6 text-left bg-black/20 p-3 rounded-xl border border-stone-800">
            <p><span className="text-stone-400">नाव:</span> <strong className="text-white">{tokenResult.name}</strong></p>
            {hasBand ? (
              <p className="text-emerald-400 text-xs mt-2 font-medium">तुमचा रिस्टबँड आधीच जोडला गेला आहे.</p>
            ) : (
              <p className="text-amber-300 text-xs mt-2 font-medium">
                👉 हा टोकन क्रमांक काउंटरवर दाखवून आपला रिस्टबँड मिळवा.
              </p>
            )}
          </div>

          <button
            onClick={() => {
              setTokenResult(null);
              setFormData({ name: '', mobile: '', place: '', groupName: '', totalCount: '1', bandNo: '' });
              setHasBand(false);
            }}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl transition text-sm active:scale-95"
          >
            नवीन नोंदणी करा
          </button>
        </div>
      </div>
    );
  }

  // मोबाईलसाठी अनुकूल फॉर्म
  return (
    <div className="min-h-[100dvh] bg-[#1a0507] text-stone-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm bg-[#2b080c] border border-amber-600/30 rounded-3xl p-5 shadow-2xl">
        
        {/* हेडर */}
        <div className="text-center mb-5">
          <span className="text-[10px] tracking-widest text-amber-400 uppercase font-semibold">
            शेलारमामा फाऊंडेशन
          </span>
          <h1 className="text-2xl font-bold text-amber-200 mt-0.5">दांडिया पास २०२६</h1>
          <p className="text-[11px] text-stone-400">१६ ऑक्टोबर ते १९ ऑक्टोबर | जलद नोंदणी</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {/* प्रवेश प्रकार */}
          <div>
            <label className="text-xs text-stone-300 font-medium block mb-1.5">प्रवेश प्रकार</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'single', label: 'Single' },
                { id: 'dual', label: 'Couple / २' },
                { id: 'group', label: 'Group' }
              ].map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setEntryType(t.id)}
                  className={`py-2 text-xs font-bold rounded-xl border transition ${
                    entryType === t.id
                      ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md'
                      : 'bg-black/30 border-stone-800 text-stone-400 hover:border-amber-600/50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* ग्रुप असल्यास फील्ड्स */}
          {entryType === 'group' && (
            <div className="grid grid-cols-2 gap-2 bg-black/20 p-2.5 rounded-xl border border-stone-800">
              <div>
                <label className="text-[11px] text-stone-300 block mb-1">ग्रुपचे नाव</label>
                <input
                  type="text"
                  placeholder="उदा. Freinds Group"
                  value={formData.groupName}
                  onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                  className="w-full bg-black/40 border border-stone-700 rounded-lg p-2 text-xs focus:border-amber-500 outline-none text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-stone-300 block mb-1">एकूण व्यक्ती</label>
                <input
                  type="number"
                  min="2"
                  value={formData.totalCount}
                  onChange={(e) => setFormData({ ...formData, totalCount: e.target.value })}
                  className="w-full bg-black/40 border border-stone-700 rounded-lg p-2 text-xs focus:border-amber-500 outline-none text-white font-mono"
                />
              </div>
            </div>
          )}

          {/* नाव */}
          <div>
            <label className="text-xs text-stone-300 block mb-1">
              {entryType === 'group' ? 'प्रमुख व्यक्तीचे नाव *' : 'पूर्ण नाव *'}
            </label>
            <input
              type="text"
              name="name"
              autoComplete="name"
              required
              placeholder="Your Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-black/40 border border-stone-700 rounded-xl p-2.5 text-sm focus:border-amber-500 outline-none text-white"
            />
          </div>

          {/* मोबाईल नंबर */}
          <div>
            <label className="text-xs text-stone-300 block mb-1">मोबाईल नंबर *</label>
            <input
              type="tel"
              name="tel"
              autoComplete="tel"
              required
              pattern="[0-9]{10}"
              placeholder="१० अंकी मोबाईल नंबर"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              className="w-full bg-black/40 border border-stone-700 rounded-xl p-2.5 text-sm focus:border-amber-500 outline-none text-white font-mono"
            />
          </div>

          {/* ठिकाण */}
          <div>
            <label className="text-xs text-stone-300 block mb-1">परिसर / ठिकाण *</label>
            <input
              type="text"
              required
              placeholder="उदा. Lower Parel,Worli,Dadar,Prabhadevi"
              value={formData.place}
              onChange={(e) => setFormData({ ...formData, place: e.target.value })}
              className="w-full bg-black/40 border border-stone-700 rounded-xl p-2.5 text-sm focus:border-amber-500 outline-none text-white"
            />
          </div>

          {/* आधीच बँड असल्यास चेकबॉक्स */}
          <div className="pt-2 border-t border-stone-800">
            <label className="flex items-center space-x-2 text-xs text-stone-300 cursor-pointer">
              <input
                type="checkbox"
                checked={hasBand}
                onChange={(e) => setHasBand(e.target.checked)}
                className="w-4 h-4 rounded border-stone-700 text-amber-500 focus:ring-0"
              />
              <span>माझ्याकडे आधीच रिस्टबँड आहे</span>
            </label>

            {hasBand && (
              <div className="mt-2.5">
                <input
                  type="text"
                  required={hasBand}
                  placeholder="बँडवरील नंबर टाका (उदा. 253915)"
                  value={formData.bandNo}
                  onChange={(e) => setFormData({ ...formData, bandNo: e.target.value })}
                  className="w-full bg-black/40 border border-amber-500/60 rounded-xl p-2.5 text-xs text-amber-200 font-mono outline-none"
                />
              </div>
            )}
          </div>

          {/* सबमिट बटण */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold rounded-xl text-sm transition active:scale-95 shadow-lg"
          >
            {loading ? 'नोंदणी होत आहे...' : 'टोकन मिळवा (नोंदणी पूर्ण)'}
          </button>
        </form>
      </div>
    </div>
  );
}