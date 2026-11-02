import React, { useState, useEffect, useMemo } from 'react';
import { Search, RefreshCw, CheckCircle2, Phone, MapPin, Trophy, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

export default function SaapshidiDesk() {
  const SCRIPT_URL = import.meta.env.VITE_DANDIYA_SCRIPT_URL;

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tabFilter, setTabFilter] = useState('all'); // 'all', 'confirmed', 'waiting', 'present'
  const [updatingId, setUpdatingId] = useState(null);

  // Pagination State (Admin la scroll karava lagu naye mhanun)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15); // Default 15 entries per page

  // Data Fetch
  const fetchPlayers = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch(`${SCRIPT_URL}?action=getAllSaapshidi&event=saapshidi`);
      const data = await res.json();
      if (data.success) {
        setPlayers(data.data || []);
      }
    } catch (err) {
      console.error('Data fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  // Attendance Toggle (Present / Pending)
  const toggleAttendance = async (item) => {
    const newStatus = item.attendance === 'Present' ? 'Pending' : 'Present';
    setUpdatingId(item.tokenId);

    try {
      const res = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'markSaapshidiAttendance',
          event: 'saapshidi',
          tokenId: item.tokenId,
          attendance: newStatus
        })
      });
      const data = await res.json();
      if (data.success) {
        setPlayers((prev) =>
          prev.map((p) => (p.tokenId === item.tokenId ? { ...p, attendance: newStatus } : p))
        );
      } else {
        alert(data.error || 'Truti aali!');
      }
    } catch (err) {
      alert('Network error: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // Search & Filter Logic
  const filteredList = useMemo(() => {
    return players.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.tokenId.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.mobile.toString().includes(q) ||
        (item.place && item.place.toLowerCase().includes(q));

      const isConfirmed = item.status === 'Confirmed';
      const isPresent = item.attendance === 'Present';

      const matchesTab =
        tabFilter === 'all'
          ? true
          : tabFilter === 'confirmed'
          ? isConfirmed
          : tabFilter === 'waiting'
          ? !isConfirmed
          : isPresent;

      return matchesSearch && matchesTab;
    });
  }, [players, searchQuery, tabFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredList.length / pageSize) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, currentPage, pageSize]);

  // Filter badallyas page 1 var reset karne
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, tabFilter, pageSize]);

  const confirmedCount = players.filter((p) => p.status === 'Confirmed').length;
  const waitingCount = players.filter((p) => p.status === 'Waiting').length;
  const presentCount = players.filter((p) => p.attendance === 'Present').length;

  return (
    <div className="w-full max-w-5xl mx-auto p-2.5 sm:p-4 space-y-2.5 font-sans">
      
      {/* 1. Header */}
      <div className="bg-white px-3.5 py-2.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 leading-tight">सापशिडी हजेरी डेस्क</h1>
            <p className="text-[10px] text-slate-500 font-medium">
              १५ नोव्हेंबर | एकूण खेळाडू: <strong className="text-slate-800">{players.length}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchPlayers(true)}
          disabled={refreshing || loading}
          className="p-1 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-amber-600' : ''}`} />
          <span>रिफ्रेश</span>
        </button>
      </div>

      {/* 2. Micro Status Bar */}
      <div className="grid grid-cols-4 gap-1.5">
        <button
          onClick={() => setTabFilter('all')}
          className={`py-1.5 px-1 rounded-xl border text-center transition cursor-pointer ${
            tabFilter === 'all'
              ? 'bg-slate-900 text-white border-slate-900 font-black shadow-xs'
              : 'bg-white border-slate-200 text-slate-600'
          }`}
        >
          <div className="text-[9px] font-medium opacity-80">सर्व</div>
          <div className="text-xs font-black">{players.length}</div>
        </button>

        <button
          onClick={() => setTabFilter('confirmed')}
          className={`py-1.5 px-1 rounded-xl border text-center transition cursor-pointer ${
            tabFilter === 'confirmed'
              ? 'bg-amber-500 text-slate-950 border-amber-500 font-black shadow-xs'
              : 'bg-white border-slate-200 text-amber-800'
          }`}
        >
          <div className="text-[9px] font-medium">निश्चित</div>
          <div className="text-xs font-black">{confirmedCount}/१००</div>
        </button>

        <button
          onClick={() => setTabFilter('waiting')}
          className={`py-1.5 px-1 rounded-xl border text-center transition cursor-pointer ${
            tabFilter === 'waiting'
              ? 'bg-purple-700 text-white border-purple-700 font-black shadow-xs'
              : 'bg-white border-slate-200 text-purple-700'
          }`}
        >
          <div className="text-[9px] font-medium">वेटिंग (WL)</div>
          <div className="text-xs font-black">{waitingCount}</div>
        </button>

        <button
          onClick={() => setTabFilter('present')}
          className={`py-1.5 px-1 rounded-xl border text-center transition cursor-pointer ${
            tabFilter === 'present'
              ? 'bg-emerald-700 text-white border-emerald-700 font-black shadow-xs'
              : 'bg-white border-slate-200 text-emerald-800'
          }`}
        >
          <div className="text-[9px] font-medium">हजर</div>
          <div className="text-xs font-black text-emerald-900">{presentCount}</div>
        </button>
      </div>

      {/* 3. Search & Page Size Select */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="टोकन, नाव, मोबाईल शोधा..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-12 py-2 text-xs focus:border-amber-500 outline-none font-medium shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Entries per page dropdown */}
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          aria-label="Pratyek panavar dakhvaychya nodani sankhya"
          className="bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 outline-none cursor-pointer shadow-xs"
        >
          <option value={10}>10 नोंदी</option>
          <option value={15}>15 नोंदी</option>
          <option value={25}>25 नोंदी</option>
          <option value={50}>50 नोंदी</option>
        </select>
      </div>

      {/* 4. Single-Column Compact Strip List (Aaju-bajula nako, saral list) */}
      {loading ? (
        <div className="text-center py-10 bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-5 h-5 text-amber-500 animate-spin mx-auto mb-1.5" />
          <p className="text-xs font-bold text-slate-600">डेटा लोड होत आहे...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 text-slate-400">
          <p className="text-xs font-semibold">कोणतीही नोंदणी सापडली नाही.</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {paginatedList.map((item) => {
            const isConfirmed = item.status === 'Confirmed';
            const isPresent = item.attendance === 'Present';
            const isSaving = updatingId === item.tokenId;

            return (
              <div
                key={item.tokenId}
                className={`bg-white rounded-xl border p-2.5 shadow-xs transition flex items-center justify-between gap-2.5 ${
                  isPresent 
                    ? 'border-emerald-300 bg-emerald-50/25' 
                    : isConfirmed 
                    ? 'border-slate-200 hover:border-amber-400' 
                    : 'border-purple-200 bg-purple-50/15'
                }`}
              >
                {/* Left Side: Token & Slot Details */}
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex flex-col items-center justify-center shrink-0">
                    <span className="font-mono font-black text-xs text-amber-900 bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-300">
                      {item.tokenId}
                    </span>
                    <span
                      className={`text-[8px] font-black px-1 mt-0.5 rounded ${
                        isConfirmed
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-purple-100 text-purple-900'
                      }`}
                    >
                      {isConfirmed ? `#${item.slotNo}` : item.slotNo}
                    </span>
                  </div>

                  {/* Player Info (Name, Mobile, Place) */}
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-xs truncate leading-tight">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                      <a href={`tel:${item.mobile}`} className="hover:underline font-mono font-bold text-slate-700">
                        {item.mobile}
                      </a>
                      <span>•</span>
                      <span>वय: {item.age || '-'}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="hidden sm:inline truncate max-w-[120px]">{item.place}</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Quick Action Button */}
                <div className="shrink-0">
                  <button
                    onClick={() => toggleAttendance(item)}
                    disabled={isSaving}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-xs ${
                      isPresent
                        ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                    }`}
                  >
                    {isSaving ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : isPresent ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        <span>हजर</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>हजेरी लावा</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Pagination Controls (Scroll na kartana direct page badla) */}
      {!loading && filteredList.length > 0 && (
        <div className="bg-white px-3 py-2 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
          <div className="text-[11px] text-slate-500">
            एकूण <strong className="text-slate-800">{filteredList.length}</strong> पैकी{' '}
            <span>{(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredList.length)}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1 px-2 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-0.5"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>मागे</span>
            </button>

            <span className="px-2 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-black">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1 px-2 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-0.5"
            >
              <span>पुढे</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}