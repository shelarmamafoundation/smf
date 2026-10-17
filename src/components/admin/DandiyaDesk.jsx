// src/components/admin/DandiyaDesk.jsx
import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, CheckCircle2, Clock, Check, Phone, MapPin, Ticket, Calendar } from 'lucide-react';

export default function DandiyaDesk() {
  const SCRIPT_URL = import.meta.env.VITE_DANDIYA_SCRIPT_URL;

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('pending'); // 'all', 'pending', 'issued'
  const [dateFilter, setDateFilter] = useState('17-Oct'); // Default aajchi tarikh
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'single', 'dual', 'group'

  const [bandInputs, setBandInputs] = useState({});
  const [assigningRow, setAssigningRow] = useState(null);

  // Date normalize karnara helper function (Strict matching)
  const normalizeDate = (rawDate) => {
    if (!rawDate) return '';
    const str = rawDate.toString().toLowerCase().trim();
    if (str.includes('16')) return '16-oct';
    if (str.includes('17')) return '17-oct';
    if (str.includes('18')) return '18-oct';
    if (str.includes('19')) return '19-oct';
    return str;
  };

  // Vyaktinchi sankhya mojnyasathi (Single=1, Couple=2, Group(N)=N)
  const getPersonCount = (entryTypeStr) => {
    const raw = (entryTypeStr || '').toString().toLowerCase();
    if (raw.includes('couple') || raw.includes('dual') || raw.includes('२') || raw.includes('2')) {
      return 2;
    }
    const match = raw.match(/\d+/);
    if (match) {
      return parseInt(match[0], 10) || 1;
    }
    return 1;
  };

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
      alert('Network error: ' + err.message);
    } finally {
      setAssigningRow(null);
    }
  };

  // 1. Strict Date Matching (Counts aani Cards dohnisaathi)
  const dateScopedList = registrations.filter((item) => {
    if (dateFilter === 'all') return true;
    return normalizeDate(item.date) === normalizeDate(dateFilter);
  });

  // 2. Date-based dynamic counts
  const dateTotalTokens = dateScopedList.length;
  const dateIssuedTokens = dateScopedList.filter((r) => r.status === 'Issued').length;
  const datePendingTokens = dateTotalTokens - dateIssuedTokens;

  const dateTotalHeadcount = dateScopedList.reduce((acc, curr) => acc + getPersonCount(curr.entryType), 0);
  const dateIssuedHeadcount = dateScopedList
    .filter((r) => r.status === 'Issued')
    .reduce((acc, curr) => acc + getPersonCount(curr.entryType), 0);
  const datePendingHeadcount = dateTotalHeadcount - dateIssuedHeadcount;

  // 3. Final list with Status + Search + Type filters
  const filteredList = dateScopedList.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
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

    const rawType = (item.entryType || '').toString().toLowerCase();
    const matchesType =
      typeFilter === 'all'
        ? true
        : typeFilter === 'single'
        ? (rawType.includes('single') || rawType.includes('एक'))
        : typeFilter === 'dual'
        ? (rawType.includes('dual') || rawType.includes('couple') || rawType.includes('२') || rawType.includes('2'))
        : (rawType.includes('group') || rawType.includes('ग्रुप') || rawType.includes('grp'));

    return matchesSearch && matchesStatus && matchesType;
  });

  const activeDateLabel = dateFilter === 'all' ? 'Sarv Divas' : `${dateFilter}`;

  return (
    <div className="p-2.5 max-w-2xl mx-auto space-y-2.5 font-sans">
      
      {/* 1. Header */}
      <div className="bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Ticket className="w-4 h-4 text-amber-500" />
          <div>
            <h1 className="text-xs font-black text-slate-800">दांडिया रिस्टबँड डेस्क</h1>
            <p className="text-[10px] text-slate-500 font-medium">
              {activeDateLabel} aakde: <strong className="text-slate-800">{dateTotalTokens} Pass ({dateTotalHeadcount} Vyakti)</strong>
            </p>
          </div>
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

      {/* 2. Tarikh Nivada (Date Filter Chips) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar bg-slate-100/70 p-1.5 rounded-xl border border-slate-200">
        <span className="text-[10px] font-bold text-slate-500 pl-1 flex items-center gap-1 shrink-0">
          <Calendar className="w-3.5 h-3.5 text-amber-600" />
          तारीख:
        </span>
        {[
          { id: 'all', label: 'सर्व दिवस' },
          { id: '16-Oct', label: '16 Oct' },
          { id: '17-Oct', label: '17 Oct (आज)' },
          { id: '18-Oct', label: '18 Oct' },
          { id: '19-Oct', label: '19 Oct' }
        ].map((d) => (
          <button
            key={d.id}
            onClick={() => setDateFilter(d.id)}
            className={`px-3 py-1 rounded-lg text-[11px] font-extrabold border transition shrink-0 ${
              dateFilter === d.id
                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* 3. Status Cards (Dynamic per date) */}
      <div className="grid grid-cols-3 gap-1.5">
        <button
          onClick={() => setStatusFilter('all')}
          className={`py-2 px-1.5 rounded-xl border text-center transition ${
            statusFilter === 'all'
              ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-xs'
              : 'bg-white border-slate-200 text-slate-600'
          }`}
        >
          <div className="text-[10px] font-medium opacity-90">एकूण नोंदणी</div>
          <div className="text-sm font-black">{dateTotalTokens} पास</div>
          <div className="text-[10px] font-extrabold text-slate-900 mt-0.5">
            👥 {dateTotalHeadcount} व्यक्ती
          </div>
        </button>

        <button
          onClick={() => setStatusFilter('pending')}
          className={`py-2 px-1.5 rounded-xl border text-center transition ${
            statusFilter === 'pending'
              ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-xs'
              : 'bg-white border-slate-200 text-amber-700'
          }`}
        >
          <div className="text-[10px] font-medium opacity-90">बाकी (Pending)</div>
          <div className="text-sm font-black">{datePendingTokens} पास</div>
          <div className="text-[10px] font-extrabold text-amber-950 mt-0.5">
            👥 {datePendingHeadcount} व्यक्ती
          </div>
        </button>

        <button
          onClick={() => setStatusFilter('issued')}
          className={`py-2 px-1.5 rounded-xl border text-center transition ${
            statusFilter === 'issued'
              ? 'bg-emerald-700 text-white border-emerald-800 font-bold shadow-xs'
              : 'bg-white border-emerald-300 text-emerald-800'
          }`}
        >
          <div className="text-[10px] font-medium opacity-90">दिलेले (Issued)</div>
          <div className="text-sm font-black text-emerald-950">{dateIssuedTokens} पास</div>
          <div className="text-[10px] font-extrabold text-emerald-900 mt-0.5">
            👥 {dateIssuedHeadcount} व्यक्ती
          </div>
        </button>
      </div>

      {/* 4. Entry Type Filters */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
        {[
          { id: 'all', label: 'सर्व प्रकार' },
          { id: 'single', label: 'Single (१)' },
          { id: 'dual', label: 'Couple (२)' },
          { id: 'group', label: 'Group (३+)' }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTypeFilter(t.id)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition shrink-0 ${
              typeFilter === t.id
                ? 'bg-slate-900 text-amber-300 border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 5. Search Input */}
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

      {/* 6. List */}
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
            const headcount = getPersonCount(item.entryType);

            return (
              <div
                key={item.tokenId}
                className={`bg-white rounded-xl border p-2.5 shadow-xs transition ${
                  isIssued ? 'border-emerald-300 bg-emerald-50/25' : 'border-amber-200 hover:border-amber-400'
                }`}
              >
                {/* Header Row */}
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-mono font-black text-xs text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300 shrink-0">
                      {item.tokenId}
                    </span>
                    
                    {/* Date Badge */}
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-300 shrink-0 font-mono">
                      {item.date || '16-Oct'}
                    </span>

                    {/* Entry Type + Headcount */}
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300 shrink-0">
                      {item.entryType} ({headcount} जण)
                    </span>
                    
                    <h3 className="font-bold text-slate-900 text-xs truncate">{item.name}</h3>
                  </div>

                  {isIssued ? (
                    <span className="flex items-center gap-0.5 text-[9px] font-black text-emerald-950 bg-emerald-100 border border-emerald-400 px-2 py-0.5 rounded-full shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                      #{item.bandNo}
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded-full shrink-0">
                      <Clock className="w-2.5 h-2.5" />
                      बाकी
                    </span>
                  )}
                </div>

                {/* Sub details */}
                <div className="flex items-center gap-3 text-[10px] text-slate-600 mb-2 font-medium">
                  <span className="flex items-center gap-1">
                    <Phone className="w-2.5 h-2.5 text-slate-400" />
                    <a href={`tel:${item.mobile}`} className="hover:underline text-slate-900 font-mono font-semibold">
                      {item.mobile}
                    </a>
                  </span>
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                    <span className="truncate">{item.place}</span>
                  </span>
                </div>

                {/* Action Row */}
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
                        ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                        : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
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