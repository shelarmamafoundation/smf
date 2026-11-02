// src/components/common/EventCommitteeModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Users, Sparkles, Loader2, Heart } from 'lucide-react';
import { committeeService } from '../../services/committeeService';

export default function EventCommitteeModal({ isOpen, onClose, eventId, eventTitle, year }) {
  const [members, setMembers] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'MALE' | 'FEMALE'

  useEffect(() => {
    if (!isOpen || !eventId) return;
    loadData();
  }, [isOpen, eventId, year]);

  const loadData = async () => {
    setLoading(true);
    const [cfg, mems] = await Promise.all([
      committeeService.getCommitteeConfig(eventId, year),
      committeeService.getMembers(eventId, year)
    ]);
    setConfig(cfg);
    setMembers(mems || []);
    setLoading(false);
  };

  if (!isOpen) return null;

  const filteredMembers = activeTab === 'ALL'
    ? members
    : members.filter(m => m.gender === activeTab);

  const maleCount = members.filter(m => m.gender === 'MALE').length;
  const femaleCount = members.filter(m => m.gender === 'FEMALE').length;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm select-none"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 max-h-[90vh] flex flex-col shadow-2xl border border-heritage-gold/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 shrink-0">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-heritage-crimson flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-heritage-gold" />
              <span>{eventTitle} • वर्ष {year}</span>
            </span>
            <h2 className="text-lg sm:text-xl font-black text-heritage-burgundy leading-tight">
              उत्सव संयोजन समिती ({members.length} सदस्य)
            </h2>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1.5 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Male / Female Filter Tabs */}
        <div className="flex items-center gap-2 py-3 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'ALL' 
                ? 'bg-heritage-burgundy text-white shadow-xs' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            सर्व सदस्य ({members.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('FEMALE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'FEMALE' 
                ? 'bg-pink-600 text-white shadow-xs' 
                : 'bg-pink-50 text-pink-700 border border-pink-200'
            }`}
          >
            <Heart className="w-3 h-3" />
            <span>महिला समिती ({femaleCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('MALE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'MALE' 
                ? 'bg-sky-700 text-white shadow-xs' 
                : 'bg-sky-50 text-sky-800 border border-sky-200'
            }`}
          >
            पुरुष प्रतिनिधी ({maleCount})
          </button>
        </div>

        {/* Members Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {loading ? (
            <div className="py-16 text-center text-gray-400 text-xs flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-heritage-burgundy" />
              <span>समिती लोड होत आहे...</span>
            </div>
          ) : filteredMembers.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 pt-2">
              {filteredMembers.map((m) => (
                <div 
                  key={m.id} 
                  className="bg-heritage-cream/40 rounded-2xl p-3 text-center border border-heritage-gold/20 flex flex-col items-center justify-between hover:shadow-md transition"
                >
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-200 border-2 border-heritage-gold/40 shadow-inner mb-2">
                    <img 
                      src={m.photoUrl} 
                      alt={m.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
                      }}
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-heritage-burgundy leading-snug">{m.name}</h4>
                    <span className="text-[10px] font-bold text-amber-900 bg-amber-100/70 px-2.5 py-0.5 rounded-full inline-block mt-1">
                      {m.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-gray-400 text-xs">
              या वर्गवारीत अद्याप सदस्य जोडलेले नाहीत.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}