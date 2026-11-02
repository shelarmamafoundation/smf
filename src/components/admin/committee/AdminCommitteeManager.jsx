// src/components/admin/committee/AdminCommitteeManager.jsx
import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Trash2, UploadCloud, Loader2, 
  Settings, CheckCircle2, UserCheck, Shield 
} from 'lucide-react';
import { committeeService } from '../../../services/committeeService';
import { uploadToImgBB } from '../../../services/imageUploadService';

export default function AdminCommitteeManager({ eventId, eventTitle, year }) {
  const [config, setConfig] = useState({ targetCount: 21, title: '' });
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form States sathi
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState('समिती सदस्य');
  const [memberGender, setMemberGender] = useState('MALE'); // MALE / FEMALE
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (eventId && year) {
      loadCommitteeData();
    }
  }, [eventId, year]);

  const loadCommitteeData = async () => {
    setLoading(true);
    const [cfg, mems] = await Promise.all([
      committeeService.getCommitteeConfig(eventId, year),
      committeeService.getMembers(eventId, year)
    ]);

    setConfig(cfg || { targetCount: 21, title: `${eventTitle} समिती ${year}` });
    setMembers(mems || []);
    setLoading(false);
  };

  const handleUpdateConfig = async (newTargetCount) => {
    const updated = { ...config, targetCount: Number(newTargetCount) };
    setConfig(updated);
    await committeeService.saveCommitteeConfig(eventId, year, updated);
  };

  const handlePhotoUpload = async (file) => {
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const res = await uploadToImgBB(file);
      setPhotoUrl(res.url);
    } catch (err) {
      alert('Photo upload zala nahi: ' + err.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberName.trim()) return;

    if (members.length >= (config.targetCount || 21)) {
      if (!window.confirm(`Sadasya sankhya nirdharit limit (${config.targetCount}) peksha jasti hot ahe. Continue karayche ka?`)) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const newMember = await committeeService.addMember({
        eventId,
        year: String(year),
        name: memberName.trim(),
        role: memberRole.trim(),
        gender: memberGender,
        photoUrl: photoUrl || '/assets/team/default.jpg',
        order: members.length + 1
      });

      setMembers(prev => [...prev, newMember]);
      setMemberName('');
      setMemberRole('समिती सदस्य');
      setPhotoUrl('');
    } catch (err) {
      alert('Member add kartanna truti: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Khari khurya kadhayche ahe ka?')) return;
    await committeeService.deleteMember(id);
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const maleCount = members.filter(m => m.gender === 'MALE').length;
  const femaleCount = members.filter(m => m.gender === 'FEMALE').length;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-sm space-y-6">
      
      {/* 1. Header & Target Config */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider">
            समिती व्यवस्थापन कक्ष
          </span>
          <h3 className="text-base sm:text-lg font-black text-heritage-burgundy">
            {eventTitle} ({year})
          </h3>
          <p className="text-[11px] text-gray-500 font-medium">
            एकूण भरलेले: <b>{members.length} / {config.targetCount}</b> (पुरुष: {maleCount} | महिला: {femaleCount})
          </p>
        </div>

        {/* Target Count Switcher (15 / 21 / Custom) */}
        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-200 self-start">
          <span className="text-[10px] font-bold text-gray-600 px-2">सदस्य संख्या कोटा:</span>
          {[15, 21].map(num => (
            <button
              key={num}
              type="button"
              onClick={() => handleUpdateConfig(num)}
              className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer ${
                config.targetCount === num 
                  ? 'bg-heritage-burgundy text-white shadow-xs' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {num} सदस्य
            </button>
          ))}
          <input 
            type="number"
            min="5"
            max="50"
            value={config.targetCount}
            onChange={(e) => handleUpdateConfig(e.target.value)}
            className="w-14 h-7 text-center rounded-xl bg-white border border-gray-300 font-bold text-xs outline-none"
            title="Custom sankhya taka"
          />
        </div>
      </div>

      {/* 2. Add Member Form (With Male / Female & Auto ImgBB) */}
      <form onSubmit={handleAddMember} className="grid grid-cols-1 sm:grid-cols-5 gap-3 bg-gray-50/80 p-4 rounded-2xl border border-gray-200 text-xs">
        
        {/* Name */}
        <div className="sm:col-span-1">
          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">नाव*</label>
          <input 
            type="text" 
            required 
            placeholder="उदा. सौ. सुप्रिया कदम" 
            value={memberName} 
            onChange={(e) => setMemberName(e.target.value)}
            className="w-full h-9 px-3 rounded-xl border border-gray-300 bg-white font-semibold outline-none focus:border-heritage-burgundy" 
          />
        </div>

        {/* Role */}
        <div className="sm:col-span-1">
          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">पद / जबाबदारी*</label>
          <input 
            type="text" 
            required 
            placeholder="उदा. महिला समन्वयक" 
            value={memberRole} 
            onChange={(e) => setMemberRole(e.target.value)}
            className="w-full h-9 px-3 rounded-xl border border-gray-300 bg-white font-semibold outline-none focus:border-heritage-burgundy" 
          />
        </div>

        {/* Gender Choice */}
        <div className="sm:col-span-1">
          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">वर्गवारी (Gender)*</label>
          <select 
            value={memberGender} 
            onChange={(e) => setMemberGender(e.target.value)}
            className={`w-full h-9 px-2.5 rounded-xl border font-bold outline-none cursor-pointer ${
              memberGender === 'FEMALE' 
                ? 'bg-pink-50 border-pink-300 text-pink-900' 
                : 'bg-sky-50 border-sky-300 text-sky-900'
            }`}
          >
            <option value="MALE">पुरुष प्रतिनिधी</option>
            <option value="FEMALE">महिला प्रतिनिधी</option>
          </select>
        </div>

        {/* Photo Upload */}
        <div className="sm:col-span-2">
          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">फोटो निवडा (Auto-Upload)</label>
          <div className="flex items-center gap-2">
            <label className="flex-1 h-9 px-3 rounded-xl border border-gray-300 bg-white flex items-center justify-center cursor-pointer text-xs font-bold text-gray-600 truncate hover:bg-gray-50">
              {uploadingPhoto ? (
                <span className="flex items-center gap-1.5 text-amber-700">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> अपलोड होत आहे...
                </span>
              ) : photoUrl ? (
                <span className="text-emerald-700 font-black">फोटो निवडला ✔</span>
              ) : (
                <span className="flex items-center gap-1.5 text-gray-500">
                  <UploadCloud className="w-3.5 h-3.5" /> फोटो निवडा (JPG/PNG)
                </span>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => handlePhotoUpload(e.target.files?.[0])} 
                className="hidden" 
                disabled={uploadingPhoto}
              />
            </label>

            <button
              type="submit"
              disabled={submitting || uploadingPhoto}
              className="h-9 px-5 rounded-xl bg-heritage-burgundy hover:bg-heritage-crimson text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs disabled:opacity-50 transition"
            >
              + जोडा
            </button>
          </div>
        </div>

      </form>

      {/* 3. Members Grid Display */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-black uppercase text-gray-700 tracking-wider">
            समिती सदस्य सूची ({members.length})
          </h4>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-400 text-xs">लोड होत आहे...</div>
        ) : members.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-3">
            {members.map((m, idx) => (
              <div 
                key={m.id} 
                className={`relative p-3 border rounded-2xl bg-white text-center flex flex-col items-center justify-between shadow-2xs group transition ${
                  m.gender === 'FEMALE' ? 'border-pink-200 bg-pink-50/20' : 'border-gray-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleDelete(m.id)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-red-100 text-red-600 opacity-0 group-hover:opacity-100 transition hover:bg-red-200 cursor-pointer z-10"
                  title="काढून टाका"
                >
                  <Trash2 className="w-3 h-3" />
                </button>

                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-heritage-gold/40 mb-1.5 bg-slate-100">
                  <img src={m.photoUrl} alt={m.name} className="w-full h-full object-cover" />
                </div>

                <div className="w-full">
                  <span className="text-[11px] font-black text-gray-900 block truncate" title={m.name}>
                    {m.name}
                  </span>
                  <span className="text-[9px] text-amber-900 font-bold block truncate">
                    {m.role}
                  </span>
                  <span className={`inline-block mt-1 text-[8px] font-black px-1.5 py-0.2 rounded-full ${
                    m.gender === 'FEMALE' ? 'bg-pink-100 text-pink-700' : 'bg-sky-100 text-sky-700'
                  }`}>
                    {m.gender === 'FEMALE' ? 'महिला' : 'पुरुष'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center border-2 border-dashed border-gray-200 rounded-2xl text-xs text-gray-400">
            कोणताही सदस्य जोडलेला नाही. वरील फॉर्ममधून सदस्य जोडा.
          </div>
        )}
      </div>

    </div>
  );
}