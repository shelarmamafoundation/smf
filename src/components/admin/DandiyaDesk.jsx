import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, CheckCircle2, Clock, Check, Phone, MapPin, Ticket } from 'lucide-react';

export default function DandiyaDesk() {
  const SCRIPT_URL = import.meta.env.VITE_DANDIYA_SCRIPT_URL;

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending'); // 'all', 'pending', 'issued'
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'single', 'dual', 'group'

  const [bandInputs, setBandInputs] = useState({});
  const [assigningRow, setAssigningRow] = useState(null);

  const fetchRegistrations = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch(`${SCRIPT_URL}?action=getAll`);
      const data = await res.json();
      if (data.success) {
        setRegistrations(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleInlineAssign = async (item) => {
    const inputVal = bandInputs[item.tokenId]?.trim();
    if (!inputVal) {
      alert('Krupaya wristband number taka!');
      return;
    }

    setAssigningRow(item.tokenId);

    try {
      const res = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'assignBand',
          tokenId: item.tokenId,
          bandNo: inputVal
        })
      });
      const data = await res.json();
      if (data.success) {
        setRegistrations((prev) =>
          prev.map((reg) =>
            reg.tokenId === item.tokenId
              ? { ...reg, bandNo: inputVal, status: 'Issued' }
              : reg
          )
        );
      } else {
        alert(data.message || 'Truti aali!');
      }
    } catch (err) {
      alert('Network Error: ' + err.message);
    } finally {
      setAssigningRow(null);
    }
  };

  // Filter Logic
  const filteredList = registrations.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.tokenId.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      item.mobile.toString().includes(q) ||
      (item.bandNo && item.bandNo.toString().includes(q));

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'pending'
        ? item.status !== 'Issued'
        : item.status === 'Issued';

    const rawType = (item.entryType || '').toLowerCase();
    const matchesType =
      typeFilter === 'all'
        ? true
        : typeFilter === 'single'
        ? rawType.includes('single')
        : typeFilter === 'dual'
        ? (rawType.includes('dual') || rawType.includes('couple') || rawType.includes('2'))
        : rawType.includes('group');

    return matchesSearch && matchesStatus && matchesType;
  });

  const totalCount = registrations.length;
  const issuedCount = registrations.filter((r) => r.status === 'Issued').length;
  const pendingCount = totalCount - issuedCount;

  return (
    <div className="p-2.5 max-w-2xl mx-auto space-y-2.5">
      
      {/* 1. Ultra-Compact Header */}
      <div className="bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Ticket className="w-4 h-4 text-amber-500" />
          <h1 className="text-xs font-black text-slate-800">दांडिया रिस्टबँड डेस्क</h1>
        </div>

        <button
          onClick={() => fetchRegistrations(true)}
          disabled={refreshing || loading}
          className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold flex items-center gap-1 active:scale-95"
        >
          <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin text-amber-600' : ''}`} />
          <span>रिफ्रेश</span>
        </button>
      </div>

      {/* 2. Micro Status Bar (Compact Pills) */}
      <div className="grid grid-cols-3 gap-1.5">
        <button
          onClick={() => setStatusFilter('all')}
          className={`py-1.5 px-2 rounded-xl border text-center transition flex items-center justify-center gap-1.5 ${
            statusFilter === 'all'
              ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-xs'
              : 'bg-white border-slate-200 text-slate-600'
          }`}
        >
          <span className="text-[11px]">एकूण:</span>
          <span className="text-xs font-black">{totalCount}</span>
        </button>

        <button
          onClick={() => setStatusFilter('pending')}
          className={`py-1.5 px-2 rounded-xl border text-center transition flex items-center justify-center gap-1.5 ${
            statusFilter === 'pending'
              ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-xs'
              : 'bg-white border-slate-200 text-amber-600'
          }`}
        >
          <span className="text-[11px]">बाकी:</span>
          <span className="text-xs font-black">{pendingCount}</span>
        </button>

        <button
          onClick={() => setStatusFilter('issued')}
          className={`py-1.5 px-2 rounded-xl border text-center transition flex items-center justify-center gap-1.5 ${
            statusFilter === 'issued'
              ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs'
              : 'bg-white border-slate-200 text-emerald-600'
          }`}
        >
          <span className="text-[11px]">दिलेले:</span>
          <span className="text-xs font-black">{issuedCount}</span>
        </button>
      </div>

      {/* 3. Entry Type Filters (Single / Couple / Group quick pills) */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
        {[
          { id: 'all', label: 'सर्व' },
          { id: 'single', label: 'Single' },
          { id: 'dual', label: 'Couple' },
          { id: 'group', label: 'Group' }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTypeFilter(t.id)}
            className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition shrink-0 ${
              typeFilter === t.id
                ? 'bg-slate-900 text-amber-300 border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 4. Compact Search Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="टोकन, नाव किंवा मोबाईल नंबर टाका..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-12 py-2 text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-200 outline-none shadow-xs font-medium"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded"
          >
            Clear
          </button>
        )}
      </div>

      {/* 5. Ultra-Compact List (Multiple items fit on one mobile screen) */}
      {loading ? (
        <div className="text-center py-8 bg-white rounded-xl border border-slate-200">
          <RefreshCw className="w-5 h-5 text-amber-500 animate-spin mx-auto mb-1.5" />
          <p className="text-xs font-bold text-slate-600">डेटा लोड होत आहे...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-xl border border-slate-200 text-slate-400">
          <p className="text-xs font-semibold">कोणतीही नोंदणी सापडली नाही.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredList.map((item) => {
            const isIssued = item.status === 'Issued';
            const isSaving = assigningRow === item.tokenId;

            return (
              <div
                key={item.tokenId}
                className={`bg-white rounded-xl border p-2.5 shadow-xs transition ${
                  isIssued ? 'border-emerald-200 bg-emerald-50/15' : 'border-amber-200 hover:border-amber-400'
                }`}
              >
                {/* Header Row: Token + Type + Status Badge */}
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-mono font-black text-xs text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300 shrink-0">
                      {item.tokenId}
                    </span>
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                      {item.entryType}
                    </span>
                    <h3 className="font-bold text-slate-900 text-xs truncate">{item.name}</h3>
                  </div>

                  {isIssued ? (
                    <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded-full shrink-0">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      #{item.bandNo}
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded-full shrink-0">
                      <Clock className="w-2.5 h-2.5" />
                      बाकी
                    </span>
                  )}
                </div>

                {/* Sub details: Phone & Place */}
                <div className="flex items-center gap-3 text-[10px] text-slate-500 mb-2 font-medium">
                  <span className="flex items-center gap-1">
                    <Phone className="w-2.5 h-2.5 text-slate-400" />
                    <a href={`tel:${item.mobile}`} className="hover:underline text-slate-700 font-mono">
                      {item.mobile}
                    </a>
                  </span>
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                    <span className="truncate">{item.place}</span>
                  </span>
                </div>

                {/* Inline Action Row */}
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    disabled={isSaving}
                    placeholder={isIssued ? `बँड: ${item.bandNo}` : "बँड नंबर (उदा. 402)"}
                    value={bandInputs[item.tokenId] !== undefined ? bandInputs[item.tokenId] : (isIssued ? item.bandNo : '')}
                    onChange={(e) =>
                      setBandInputs({ ...bandInputs, [item.tokenId]: e.target.value })
                    }
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 focus:bg-white focus:border-amber-500 outline-none"
                  />

                  <button
                    onClick={() => handleInlineAssign(item)}
                    disabled={isSaving}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1 shrink-0 active:scale-95 ${
                      isIssued
                        ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                    }`}
                  >
                    {isSaving ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : isIssued ? (
                      'बदला'
                    ) : (
                      <>
                        <Check className="w-3 h-3" />
                        बँड द्या
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}