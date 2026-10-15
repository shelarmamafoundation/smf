// src/pages/admin/AdminFinancePage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Trash2, Edit3, ArrowUp, ArrowDown, 
  HandCoins, RefreshCw, Lock, ShieldAlert
} from 'lucide-react';
import Swal from 'sweetalert2';
import { auth } from '../../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { financeService } from '../../services/financeService';
import { INITIATIVES_DATA } from '../../data/initiativesData';
import { userService } from '../../services/userService';
import FinanceSummaryCards from '../../components/admin/finance/FinanceSummaryCards';
import FinanceTransactionModal from '../../components/admin/finance/FinanceTransactionModal';

export default function AdminFinancePage() {
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  // Authentication: Live logged-in Firebase user state with proper fallback
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('smf_current_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    const user = auth.currentUser;
    return {
      id: user?.uid || 'admin_1',
      name: user?.displayName || 'Sandesh Mahadik',
      email: user?.email || '',
      role: 'SUPER_ADMIN'
    };
  });

  // Track Firebase live auth state to ensure email is never empty
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser((prev) => ({
          ...prev,
          id: user.uid,
          name: user.displayName || prev.name || 'Sandesh Mahadik',
          email: user.email || prev.email || '',
          role: prev.role || 'SUPER_ADMIN'
        }));
      }
    });

    return () => unsubscribe();
  }, []);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('ALL');
  const [selectedEvent, setSelectedEvent] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');

  const defaultCategories = [
    'मंडप व डेकोरेशन', 'ध्वनी व लाईट्स', 'प्रसाद व भोजन', 
    'बॅनर्स व जाहिरात', 'पारितोषिक व सन्मानचिन्ह', 'वाहतूक व इंधन', 
    'देणगी पावती', 'इतर विविध खर्च'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (force = false) => {
    setLoading(true);
    try {
      const [recordsData, usersData] = await Promise.all([
        financeService.getRecords(force),
        userService?.getUsers ? userService.getUsers() : []
      ]);
      setRecords(recordsData || []);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'त्रुटी!',
        text: 'हिशोब लोड करताना अडचण आली.',
        confirmButtonColor: '#580A1A'
      });
    } finally {
      setLoading(false);
    }
  };

  // Navin Nond save karva athva update karva mate
  const handleSaveRecord = async (formData) => {
    try {
      const activeUser = {
        ...currentUser,
        email: currentUser.email || auth.currentUser?.email || '',
        name: currentUser.name || auth.currentUser?.displayName || 'Sandesh Mahadik',
        id: currentUser.id || auth.currentUser?.uid || 'admin_1'
      };

      if (editingRecord) {
        await financeService.updateRecord(editingRecord.id, formData, activeUser);
        Swal.fire({
          icon: 'success',
          title: 'नोंद अपडेट केली!',
          text: 'बदल यशस्वीरीत्या सेव्ह झाले आहेत.',
          confirmButtonColor: '#580A1A',
          timer: 1800,
          showConfirmButton: false
        });
      } else {
        await financeService.createRecord(formData, activeUser);
        Swal.fire({
          icon: 'success',
          title: 'नोंद यशस्वी!',
          text: `पावती क्र: ${formData.txnId || 'तयार झाली'}`,
          confirmButtonColor: '#580A1A',
          timer: 2000,
          showConfirmButton: false
        });
      }

      setEditingRecord(null);
      setShowModal(false);
      const updated = await financeService.getRecords(true);
      setRecords(updated);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'अडचण आली!',
        text: err.message || 'नोंद सेव्ह करता आली नाही.',
        confirmButtonColor: '#580A1A'
      });
    }
  };

  // Soft Delete (Fakt SuperAdmin mate)
  const handleDeleteRecord = async (record) => {
    if (currentUser?.role !== 'SUPER_ADMIN') {
      Swal.fire({
        icon: 'error',
        title: 'परवानगी नाकारली!',
        text: 'नोंद काढून टाकण्याचा अधिकार फक्त SuperAdmin कडे आहे.',
        confirmButtonColor: '#580A1A'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'खात्री आहे का?',
      html: `पावती क्र. <b>${record.txnId || record.description}</b> कायमची काढून न टाकता सॉफ्ट-डिलीट केली जाईल.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'होय, डिलीट करा',
      cancelButtonText: 'रद्द करा'
    });

    if (result.isConfirmed) {
      try {
        await financeService.softDeleteRecord(record.id, currentUser);
        setRecords(prev => prev.filter(r => r.id !== record.id));
        Swal.fire({
          icon: 'success',
          title: 'काढून टाकले!',
          text: 'नोंद सुरक्षितपणे सॉफ्ट-डिलीट झाली.',
          confirmButtonColor: '#580A1A',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'त्रुटी!',
          text: 'नोंद डिलीट करता आली नाही.',
          confirmButtonColor: '#580A1A'
        });
      }
    }
  };

  // Edit Click Handler (48-Hour Lock Rule)
  const handleEditClick = (record) => {
    const isEligible = financeService.canEditRecord(record, currentUser);
    if (!isEligible) {
      Swal.fire({
        icon: 'info',
        title: 'नोंद लॉक झाली आहे!',
        text: 'ही नोंद होऊन ४८ तासांपेक्षा जास्त वेळ झाला असल्याने ती ऑडिट सुरक्षेसाठी लॉक करण्यात आली आहे.',
        confirmButtonColor: '#580A1A'
      });
      return;
    }
    setEditingRecord(record);
    setShowModal(true);
  };

  const safeRecords = Array.isArray(records) ? records : [];
  const safeUsers = Array.isArray(users) ? users : [];
  const availableYears = Array.from(new Set(safeRecords.map(r => r.year).filter(Boolean))).sort((a,b) => b - a);

  // Role-Based Data Visibility
  const userVisibleRecords = safeRecords.filter(r => {
    if (r.isDeleted) return false;
    if (currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN') return true;
    return r.createdByUserId === currentUser?.id || r.assignedUserId === currentUser?.id;
  });

  // Selected staff details fetch karvi name/email match mate
  const selectedStaffObj = safeUsers.find(u => u.id === selectedStaff);
  const targetStaffName = selectedStaffObj?.name?.trim().toLowerCase();
  const targetStaffEmail = selectedStaffObj?.email?.trim().toLowerCase();

  // UI Filters
  const filteredRecords = userVisibleRecords.filter(r => {
    const matchSearch = (r.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (r.eventName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (r.assignedUserName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (r.createdByUserName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (r.txnId || '').toLowerCase().includes(searchTerm.toLowerCase());

    // Staff Filter (ID, Name, and Email comparison banne baaju)
    let matchStaff = true;
    if (selectedStaff !== 'ALL') {
      const recCreatedId = r.createdByUserId || '';
      const recAssignedId = r.assignedUserId || '';
      const recCreatedName = (r.createdByUserName || '').trim().toLowerCase();
      const recAssignedName = (r.assignedUserName || '').trim().toLowerCase();
      const recCreatedEmail = (r.createdByEmail || '').trim().toLowerCase();
      const recAssignedEmail = (r.assignedUserEmail || '').trim().toLowerCase();

      const idMatch = recAssignedId === selectedStaff || recCreatedId === selectedStaff;
      const nameMatch = targetStaffName && (recAssignedName === targetStaffName || recCreatedName === targetStaffName);
      const emailMatch = targetStaffEmail && (recAssignedEmail === targetStaffEmail || recCreatedEmail === targetStaffEmail);

      matchStaff = Boolean(idMatch || nameMatch || emailMatch);
    }

    const matchEvent = selectedEvent === 'ALL' || r.eventId === selectedEvent;
    const matchYear = selectedYear === 'ALL' || r.year === selectedYear;
    const matchType = selectedType === 'ALL' || r.type === selectedType;

    return matchSearch && matchStaff && matchEvent && matchYear && matchType;
  });

  //const totals = financeService.calculateTotals(filteredRecords);
  // AdminFinancePage.jsx मधील ही ओळ:
  const totals = financeService.calculateTotals(filteredRecords, selectedStaff, selectedStaffObj);

  return (
    <div className="w-full px-3 sm:px-6 lg:px-8 py-3 space-y-3 font-sans pb-24">
      
      {/* 1. Page Header */}
      <div className="flex items-center justify-between gap-2 border-b border-gray-200 pb-2.5">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-heritage-crimson block">
            हिशोब व वित्त व्यवस्थापन
          </span>
          <h1 className="text-base sm:text-2xl font-black text-heritage-burgundy leading-tight">
            जमा-खर्च लेजर
          </h1>
          <p className="hidden sm:block text-xs text-gray-500 mt-0.5">
            इव्हेंटनुसार व प्रतिनिधीनुसार हिशोब, ॲडव्हान्स ट्रॅकिंग आणि रोख/ऑनलाइन ताळेबंद.
          </p>
        </div>

        {/* Navin Nond Button */}
        <button
          type="button"
          onClick={() => { setEditingRecord(null); setShowModal(true); }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-heritage-burgundy hover:bg-heritage-crimson text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>नवीन नोंद जोडा</span>
        </button>
      </div>

      {/* 2. Responsive Summary Cards */}
      <FinanceSummaryCards totals={totals} />

      {/* 3. Ultra-Compact Single-Line Horizontal Scroll Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-none text-[11px]">
        
        {/* Search */}
        <div className="relative shrink-0 w-36 sm:w-48">
          <Search className="w-3 h-3 absolute left-2.5 top-2.5 text-gray-400" />
          <input 
            type="text"
            placeholder="शोधा (नाव, ID, तपशील)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-8 pl-7 pr-2.5 text-[11px] rounded-xl bg-white border border-gray-200 outline-none focus:border-heritage-burgundy font-medium"
          />
        </div>

        {/* Staff Filter */}
        <select 
          value={selectedStaff}
          onChange={(e) => setSelectedStaff(e.target.value)}
          className="h-8 px-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold outline-none cursor-pointer shrink-0"
        >
          <option value="ALL">सर्व Staff</option>
          {safeUsers.map(u => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>

        {/* Event Filter */}
        <select 
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="h-8 px-2.5 rounded-xl bg-white border border-gray-200 text-gray-800 font-bold outline-none cursor-pointer shrink-0 max-w-[140px] truncate"
        >
          <option value="ALL">सर्व इव्हेंट्स</option>
          <option value="general">सामान्य संस्था निधी</option>
          {INITIATIVES_DATA.map(ev => (
            <option key={ev.id} value={ev.id}>{ev.titleMr}</option>
          ))}
        </select>

        {/* Type Filter */}
        <select 
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="h-8 px-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 font-bold outline-none cursor-pointer shrink-0"
        >
          <option value="ALL">सर्व प्रकार</option>
          <option value="EXPENSE">फक्त खर्च</option>
          <option value="INCOME">फक्त जमा</option>
          <option value="ADVANCE_GIVEN">फक्त ॲडव्हान्स</option>
        </select>

        {/* Year Filter */}
        <select 
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="h-8 px-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 font-bold outline-none cursor-pointer shrink-0"
        >
          <option value="ALL">All Years</option>
          {availableYears.map(yr => (
            <option key={yr} value={yr}>वर्ष {yr}</option>
          ))}
        </select>

        {/* Fresh Refresh Button */}
        <button
          type="button"
          onClick={() => loadData(true)}
          className="h-8 px-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 shrink-0 flex items-center justify-center cursor-pointer"
          title="माहिती रिफ्रेश करा"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-heritage-burgundy' : ''}`} />
        </button>

      </div>

      {/* 4. Transactions Desktop Table & Mobile Cards */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">तारीख व ID</th>
                <th className="p-3">प्रकार / इव्हेंट</th>
                <th className="p-3">तपशील व वर्गवारी</th>
                <th className="p-3">प्रतिनिधी</th>
                <th className="p-3">पेमेंट मोड</th>
                <th className="p-3">रक्कम (₹)</th>
                <th className="p-3 text-right">कृती</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((r) => {
                  const canEdit = financeService.canEditRecord(r, currentUser);
                  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

                  return (
                    <tr key={r.id} className="hover:bg-gray-50/80 transition">
                      
                      {/* Tarikh & Unique TXN ID */}
                      <td className="p-3 whitespace-nowrap">
                        <span className="text-gray-700 font-bold block">{r.date}</span>
                        <span className="text-[9px] font-mono font-black text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                          {r.txnId || 'SMF-TXN'}
                        </span>
                      </td>

                      {/* Prakar & Event */}
                      <td className="p-3">
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                            r.type === 'INCOME' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            r.type === 'EXPENSE' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {r.type === 'INCOME' ? 'जमा' : r.type === 'EXPENSE' ? 'खर्च' : 'ॲडव्हान्स'}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-gray-900 block truncate max-w-[150px]">
                          {r.eventName}
                        </span>
                      </td>

                      {/* Description & Category */}
                      <td className="p-3">
                        <span className="font-bold text-gray-900 block">{r.description}</span>
                        <span className="text-[10px] text-gray-500 bg-gray-100 px-1 py-0.5 rounded mt-0.5 inline-block">{r.category}</span>
                      </td>

                      {/* Representative */}
                      <td className="p-3 whitespace-nowrap text-gray-700">
                        <span className="font-bold">{r.assignedUserName}</span>
                        {r.createdByUserName && r.createdByUserName !== r.assignedUserName && (
                          <span className="text-[9px] text-gray-400 block">नोंद: {r.createdByUserName}</span>
                        )}
                      </td>

                      {/* Payment Mode */}
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          r.mode === 'FROM_ADVANCE' ? 'bg-amber-100 text-amber-900' :
                          r.mode === 'ONLINE' ? 'bg-sky-50 text-sky-800' : 'bg-emerald-50 text-emerald-800'
                        }`}>
                          {r.mode === 'FROM_ADVANCE' ? 'ॲडव्हान्समधून' : r.mode === 'ONLINE' ? 'ऑनलाइन' : 'रोख'}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="p-3 whitespace-nowrap font-black">
                        <span className={r.type === 'INCOME' ? 'text-emerald-600' : r.type === 'EXPENSE' ? 'text-rose-600' : 'text-amber-600'}>
                          {r.type === 'INCOME' ? '+' : '-'} ₹ {Number(r.amount).toLocaleString('en-IN')}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {canEdit ? (
                            <button
                              type="button"
                              onClick={() => handleEditClick(r)}
                              className="p-1 rounded-md text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition cursor-pointer"
                              title="नोंदीमध्ये बदल करा"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span title="४८ तास पूर्ण - नोंद लॉक झाली आहे" className="p-1 text-gray-300">
                              <Lock className="w-3.5 h-3.5" />
                            </span>
                          )}

                          {isSuperAdmin && (
                            <button 
                              type="button"
                              onClick={() => handleDeleteRecord(r)}
                              className="p-1 rounded-md text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="सॉफ्ट-डिलीट करा (SuperAdmin)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    कोणतीही नोंद सापडली नाही.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Feed View */}
        <div className="block md:hidden divide-y divide-gray-100">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((r) => {
              const canEdit = financeService.canEditRecord(r, currentUser);
              const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

              return (
                <div key={r.id} className="p-3 flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      r.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' :
                      r.type === 'EXPENSE' ? 'bg-rose-50 text-rose-600' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {r.type === 'INCOME' ? <ArrowDown className="w-3.5 h-3.5 rotate-180" /> :
                       r.type === 'EXPENSE' ? <ArrowUp className="w-3.5 h-3.5" /> : <HandCoins className="w-3.5 h-3.5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-gray-900 truncate">{r.description || r.category}</h4>
                        <span className="text-[8px] font-mono font-black text-gray-400 bg-gray-100 px-1 rounded shrink-0">
                          {r.txnId || 'SMF-TXN'}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 truncate mt-0.5">
                        <span className="font-semibold text-gray-700">{r.eventName}</span> • <span>{r.assignedUserName}</span> • <span>{r.date}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className={`text-xs font-black ${
                      r.type === 'INCOME' ? 'text-emerald-600' : r.type === 'EXPENSE' ? 'text-rose-600' : 'text-amber-600'
                    }`}>
                      {r.type === 'INCOME' ? '+' : '-'}₹{Number(r.amount).toLocaleString('en-IN')}
                    </div>
                    <div className="flex items-center justify-end gap-1.5 mt-1">
                      <span className="px-1.5 py-0.2 rounded text-[8px] font-black bg-gray-100 text-gray-700">
                        {r.mode}
                      </span>

                      {canEdit ? (
                        <button
                          type="button"
                          onClick={() => handleEditClick(r)}
                          className="p-1 text-gray-400 hover:text-amber-600"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      ) : (
                        <Lock className="w-3 h-3 text-gray-300" />
                      )}

                      {isSuperAdmin && (
                        <button 
                          type="button" 
                          onClick={() => handleDeleteRecord(r)}
                          className="p-1 text-gray-300 hover:text-rose-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-xs text-gray-400">
              कोणतीही नोंद सापडली नाही.
            </div>
          )}
        </div>

      </div>

      {/* Transaction Modal */}
      {showModal && (
        <FinanceTransactionModal 
          onClose={() => { setShowModal(false); setEditingRecord(null); }}
          onSave={handleSaveRecord}
          existingCategories={defaultCategories}
          existingEvents={INITIATIVES_DATA}
          usersList={safeUsers}
          currentUser={currentUser}
          initialData={editingRecord}
        />
      )}

    </div>
  );
}