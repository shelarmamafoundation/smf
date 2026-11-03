// src/components/admin/committee/AdminCommitteeManager.jsx
import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Trash2, UploadCloud, Loader2, 
  Camera, FileText, CheckCircle2, AlertCircle 
} from 'lucide-react';
import Swal from 'sweetalert2';
import { committeeService } from '../../../services/committeeService';
import { uploadToImgBB } from '../../../services/imageUploadService';

export default function AdminCommitteeManager({ eventId, eventTitle, year }) {
  const [config, setConfig] = useState({ targetCount: 21, title: '' });
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tab: 'BULK' athva 'SINGLE'
  const [entryMode, setEntryMode] = useState('BULK');

  // Single Form States
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState('समिती सदस्य');
  const [memberGender, setMemberGender] = useState('MALE');
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Bulk Form State
  const [bulkText, setBulkText] = useState('');
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  // Card Photo Upload Loading State
  const [uploadingMemberId, setUploadingMemberId] = useState(null);

  useEffect(() => {
    if (eventId && year) {
      loadCommitteeData();
    }
  }, [eventId, year]);

  const loadCommitteeData = async () => {
    setLoading(true);
    try {
      const [cfg, mems] = await Promise.all([
        committeeService.getCommitteeConfig(eventId, year),
        committeeService.getMembers(eventId, year)
      ]);
      setConfig(cfg || { targetCount: 21, title: `${eventTitle} समिती ${year}` });
      setMembers(mems || []);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Data Load Na Thayo!',
        text: err.message || 'Firestore mathi data lavva ma samasya aavi.',
        confirmButtonColor: '#580A1A'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConfig = async (newTargetCount) => {
    const updated = { ...config, targetCount: Number(newTargetCount) };
    setConfig(updated);
    try {
      await committeeService.saveCommitteeConfig(eventId, year, updated);
      Swal.fire({
        icon: 'success',
        title: 'Quota Update Thayo!',
        text: `Kul sadasya sankhya ${newTargetCount} set thai gai.`,
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Permission Error!',
        text: 'Firestore Rules check karo: ' + err.message,
        confirmButtonColor: '#580A1A'
      });
    }
  };

  // 1. Single Member Submit
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberName.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Naam Jaruri Chhe!',
        text: 'Krupya sadasya nu naam lakho.',
        confirmButtonColor: '#580A1A'
      });
      return;
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

      Swal.fire({
        icon: 'success',
        title: 'Sadasya Jodayo!',
        text: `${newMember.name} safaltapurvak add thayo.`,
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Nondh Na Thai!',
        text: err.message || 'Firestore permissions check karo.',
        confirmButtonColor: '#580A1A'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Bulk Text Parse & Submit
  const handleBulkSubmit = async () => {
    if (!bulkText.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Text Empty Chhe!',
        text: 'Krupya list paste karo.',
        confirmButtonColor: '#580A1A'
      });
      return;
    }

    const lines = bulkText.split('\n').filter(line => line.trim().length > 0);
    const parsedList = [];

    lines.forEach((line, index) => {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length >= 1 && parts[0]) {
        const name = parts[0];
        const role = parts[1] || 'समिती सदस्य';
        const genderChar = (parts[2] || '').toUpperCase();
        const gender = (genderChar === 'F' || genderChar === 'FEMALE' || genderChar === 'महिला') ? 'FEMALE' : 'MALE';

        parsedList.push({
          eventId,
          year: String(year),
          name,
          role,
          gender,
          photoUrl: '/assets/team/default.jpg',
          order: members.length + index + 1
        });
      }
    });

    if (parsedList.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Format Mismatch!',
        text: 'Format aam hovo joiye: Naam, Pad, Gender(M/F)',
        confirmButtonColor: '#580A1A'
      });
      return;
    }

    setBulkSubmitting(true);
    try {
      const addedMembers = await committeeService.addBulkMembers(parsedList);
      setMembers(prev => [...prev, ...addedMembers]);
      setBulkText('');

      Swal.fire({
        icon: 'success',
        title: 'Bulk Entry Safal!',
        text: `Kul ${addedMembers.length} sadasyo ek sathe save thai gaya!`,
        confirmButtonColor: '#580A1A'
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Permission Denied!',
        text: 'Firestore Rules check karo: ' + err.message,
        confirmButtonColor: '#580A1A'
      });
    } finally {
      setBulkSubmitting(false);
    }
  };

  // 3. Card Photo Upload
  const handleCardPhotoChange = async (memberId, file) => {
    if (!file) return;
    setUploadingMemberId(memberId);
    try {
      const res = await uploadToImgBB(file);
      await committeeService.updateMemberPhoto(memberId, res.url);
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, photoUrl: res.url } : m));

      Swal.fire({
        icon: 'success',
        title: 'Photo Upload Thayo!',
        timer: 1200,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Upload Fail!',
        text: err.message,
        confirmButtonColor: '#580A1A'
      });
    } finally {
      setUploadingMemberId(null);
    }
  };

  // 4. Delete Confirmation
  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: 'Khatri Chhe?',
      text: `${name || 'Aa sadasya'} ne committee mathi kadhi nakhavu chhe?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ha, Delete Karo',
      cancelButtonText: 'Radd Karo'
    });

    if (result.isConfirmed) {
      try {
        await committeeService.deleteMember(id);
        setMembers(prev => prev.filter(m => m.id !== id));
        Swal.fire({
          icon: 'success',
          title: 'Delete Thai Gayu!',
          timer: 1200,
          showConfirmButton: false
        });
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Delete Na Thayu!',
          text: err.message,
          confirmButtonColor: '#580A1A'
        });
      }
    }
  };

  const maleCount = members.filter(m => m.gender === 'MALE').length;
  const femaleCount = members.filter(m => m.gender === 'FEMALE').length;

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 border border-gray-200 shadow-sm space-y-5">
      
      {/* Header & Target Config */}
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

        {/* Target Count Switcher */}
        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-200 self-start">
          <span className="text-[10px] font-bold text-gray-600 px-2">सदस्य कोटा:</span>
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
          />
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-2xl w-fit text-xs font-bold">
        <button
          type="button"
          onClick={() => setEntryMode('BULK')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl transition cursor-pointer ${
            entryMode === 'BULK' 
              ? 'bg-heritage-burgundy text-white shadow-xs' 
              : 'text-gray-600 hover:text-black'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>एकत्र कॉपी-पेस्ट करा (Bulk Entry)</span>
        </button>

        <button
          type="button"
          onClick={() => setEntryMode('SINGLE')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl transition cursor-pointer ${
            entryMode === 'SINGLE' 
              ? 'bg-heritage-burgundy text-white shadow-xs' 
              : 'text-gray-600 hover:text-black'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>एक-एक जोडा (Single Entry)</span>
        </button>
      </div>

      {/* Bulk Entry Box */}
      {entryMode === 'BULK' ? (
        <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-black text-amber-950 uppercase tracking-wide">
                यादी खाली पेस्ट करा (नाव, पद, M/F)
              </h4>
              <p className="text-[10px] text-amber-800">
                प्रत्येक ओळीवर: <b>नाव, पद, लिंग (M किंवा F)</b> टाका. उदा. <code>Manish Dalvi, Secretary, M</code>
              </p>
            </div>
            <button
              type="button"
              disabled={bulkSubmitting || !bulkText.trim()}
              onClick={handleBulkSubmit}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-heritage-burgundy hover:bg-heritage-crimson text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer self-start sm:self-auto shrink-0"
            >
              {bulkSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>सेव्ह होत आहे...</span>
                </>
              ) : (
                <span>सर्व सदस्य सेव्ह करा ↵</span>
              )}
            </button>
          </div>

          <textarea
            rows={5}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={`Manish Dalvi, Secretary, M\nPradeep Kadam, President, M\nDeepali Magar, President, F\nPrashant Gaonkar, Vice President, M`}
            className="w-full p-3 rounded-xl bg-white border border-amber-300 font-mono text-xs text-gray-800 outline-none focus:border-heritage-burgundy leading-relaxed"
          />
        </div>
      ) : (
        /* Single Add Form */
        <form onSubmit={handleAddMember} className="grid grid-cols-1 sm:grid-cols-5 gap-3 bg-gray-50/80 p-4 rounded-2xl border border-gray-200 text-xs">
          <div>
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

          <div>
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

          <div>
            <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">वर्गवारी*</label>
            <select 
              value={memberGender} 
              onChange={(e) => setMemberGender(e.target.value)}
              className="w-full h-9 px-2 rounded-xl border font-bold outline-none cursor-pointer bg-white"
            >
              <option value="MALE">पुरुष प्रतिनिधी (M)</option>
              <option value="FEMALE">महिला प्रतिनिधी (F)</option>
            </select>
          </div>

          <div className="sm:col-span-2 flex items-end gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-9 px-5 rounded-xl bg-heritage-burgundy hover:bg-heritage-crimson text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs disabled:opacity-50 transition"
            >
              + सदस्य जोडा
            </button>
          </div>
        </form>
      )}

      {/* Members Grid Display */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black uppercase text-gray-700 tracking-wider">
            समिती सदस्य सूची ({members.length})
          </h4>
          <span className="text-[10px] text-gray-400 font-medium">
            (फोटो जोडण्यासाठी सदस्याच्या फोटोवरील कॅमेरा आयकॉनवर क्लिक करा)
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-400 text-xs">लोड होत आहे...</div>
        ) : members.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-3">
            {members.map((m) => {
              const isUploadingThis = uploadingMemberId === m.id;

              return (
                <div 
                  key={m.id} 
                  className={`relative p-3 border rounded-2xl bg-white text-center flex flex-col items-center justify-between shadow-2xs group transition ${
                    m.gender === 'FEMALE' ? 'border-pink-200 bg-pink-50/20' : 'border-gray-200'
                  }`}
                >
                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDelete(m.id, m.name)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-100 text-red-600 opacity-0 group-hover:opacity-100 transition hover:bg-red-200 cursor-pointer z-10"
                    title="काढून टाका"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>

                  {/* Photo with Overlay Camera Button */}
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-heritage-gold/40 mb-1.5 bg-slate-100 group/avatar">
                    <img 
                      src={m.photoUrl} 
                      alt={m.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://png.pngtree.com/png-vector/20190223/ourmid/pngtree-profile-glyph-black-icon-png-image_691589.jpg';
                      }}
                    />

                    <label 
                      title="फोटो बदला / अपलोड करा"
                      className="absolute inset-0 bg-black/50 text-white flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition cursor-pointer"
                    >
                      {isUploadingThis ? (
                        <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                      ) : (
                        <>
                          <Camera className="w-4 h-4" />
                          <span className="text-[7px] font-bold mt-0.5">फोटो बदला</span>
                        </>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        disabled={isUploadingThis}
                        onChange={(e) => handleCardPhotoChange(m.id, e.target.files?.[0])}
                        className="hidden" 
                      />
                    </label>
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
              );
            })}
          </div>
        ) : (
          <div className="py-10 text-center border-2 border-dashed border-gray-200 rounded-2xl text-xs text-gray-400">
            कोणताही सदस्य जोडलेला नाही. वरील बॉक्समधून थेट यादी पेस्ट करा.
          </div>
        )}
      </div>

    </div>
  );
}