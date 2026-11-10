// src/pages/admin/AdminFinancePage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Trash2, Edit3, ArrowUp, ArrowDown, 
  HandCoins, RefreshCw, Lock, ShieldAlert,
  FileSpreadsheet, Printer, Upload, Loader2, Clock, CheckCircle2, AlertCircle
} from 'lucide-react';
import Swal from 'sweetalert2';
import { auth } from '../../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { financeService } from '../../services/financeService';
import { INITIATIVES_DATA } from '../../data/initiativesData';
import { userService } from '../../services/userService';
import FinanceSummaryCards from '../../components/admin/finance/FinanceSummaryCards';
import FinanceTransactionModal from '../../components/admin/finance/FinanceTransactionModal';
import FinanceImportModal from '../../components/admin/finance/FinanceImportModal';

const LAST_EVENT_STORAGE_KEY = 'smf_finance_last_event_id';

export default function AdminFinancePage() {
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  // Firestore Pagination States
  const [lastDocSnapshot, setLastDocSnapshot] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Authentication State
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
      role: 'SUPER_ADMIN',
      isSuperAdmin: true
    };
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser((prev) => ({
          ...prev,
          id: user.uid,
          name: user.displayName || prev.name || 'Sandesh Mahadik',
          email: user.email || prev.email || '',
          role: prev.role || 'SUPER_ADMIN',
          isSuperAdmin: prev.isSuperAdmin !== undefined ? prev.isSuperAdmin : true
        }));
      }
    });

    return () => unsubscribe();
  }, []);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('ALL');
  const [selectedEvent, setSelectedEvent] = useState('ALL');
  const [selectedEventYear, setSelectedEventYear] = useState('ALL');
  const [selectedFinancialYear, setSelectedFinancialYear] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('ALL');

  useEffect(() => {
    loadData();
  }, []);

  // १. डेटा व कॅटेगरीज लोड करणे
  const loadData = async () => {
    setLoading(true);
    try {
      const [res, usersData, cats] = await Promise.all([
        financeService.getPaginatedRecords(25),
        userService?.getUsers ? userService.getUsers() : [],
        financeService.getCategories()
      ]);
      setRecords(res.records || []);
      setLastDocSnapshot(res.lastDocSnapshot);
      setHasMore(res.hasMore);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setCategories(Array.isArray(cats) ? cats : []);
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

  // २. अजून २५ नोंदी लोड करणे (Load More)
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore || !lastDocSnapshot) return;

    setLoadingMore(true);
    try {
      const res = await financeService.getMorePaginatedRecords(lastDocSnapshot, 25);
      setRecords(prev => [...prev, ...res.records]);
      setLastDocSnapshot(res.lastDocSnapshot);
      setHasMore(res.hasMore);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  // ३. नोंद सेव्ह करणे
  const handleSaveRecord = async (formData) => {
    try {
      const activeUser = {
        ...currentUser,
        email: currentUser.email || auth.currentUser?.email || '',
        name: currentUser.name || auth.currentUser?.displayName || 'Sandesh Mahadik',
        id: currentUser.id || auth.currentUser?.uid || 'admin_1',
        isSuperAdmin: currentUser.isSuperAdmin !== undefined ? currentUser.isSuperAdmin : true
      };

      if (formData.eventId) {
        localStorage.setItem(LAST_EVENT_STORAGE_KEY, formData.eventId);
      }

      if (editingRecord) {
        await financeService.updateRecord(editingRecord.id, formData, activeUser);
        setRecords(prev => prev.map(r => r.id === editingRecord.id ? { ...r, ...formData } : r));
        Swal.fire({
          icon: 'success',
          title: 'नोंद अपडेट केली!',
          text: 'बदल यशस्वीरीत्या सेव्ह झाले आहेत.',
          confirmButtonColor: '#580A1A',
          timer: 1800,
          showConfirmButton: false
        });
      } else {
        const created = await financeService.createRecord(formData, activeUser);
        setRecords(prev => [created, ...prev]);
        Swal.fire({
          icon: 'success',
          title: 'नोंद यशस्वी!',
          text: `पावती क्र: ${formData.txnId || 'तयार झाली'}`,
          confirmButtonColor: '#580A1A',
          timer: 2000,
          showConfirmButton: false
        });
      }

      if (formData.category && !categories.includes(formData.category)) {
        setCategories(prev => [...prev, formData.category]);
      }

      setEditingRecord(null);
      setShowModal(false);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'अडचण आली!',
        text: err.message || 'नोंद सेव्ह करता आली नाही.',
        confirmButtonColor: '#580A1A'
      });
    }
  };

  const handleDeleteRecord = async (record) => {
    const isSuper = Boolean(currentUser?.isSuperAdmin === true || currentUser?.role === 'SUPER_ADMIN');
    if (!isSuper) {
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

  const normalizeEventName = (rawName) => {
    if (!rawName) return 'सामान्य संस्था निधी';
    const clean = rawName.replace(/\s+/g, '').trim();
    if (clean === 'चैत्रनवरात्र' || clean === 'चैत्रनवरात्री' || clean === 'chaitra-navratri') {
      return 'चैत्र नवरात्री';
    }
    return rawName.trim();
  };

  const getRecordFinancialYear = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    if (month >= 4) {
      return `${year}-${String(year + 1).slice(-2)}`;
    } else {
      return `${year - 1}-${String(year).slice(-2)}`;
    }
  };

  const dynamicEventOptions = useMemo(() => {
    const eventSet = new Set();
    INITIATIVES_DATA.forEach(i => eventSet.add(i.titleMr.trim()));
    safeRecords.forEach(r => {
      const eName = normalizeEventName(r.eventName);
      if (eName) eventSet.add(eName);
    });
    return Array.from(eventSet).sort();
  }, [safeRecords]);

  const availableEventYears = useMemo(() => {
    const years = new Set();
    safeRecords.forEach(r => {
      const y = r.eventYear || (r.date ? new Date(r.date).getFullYear().toString() : '');
      if (y) years.add(y);
    });
    return Array.from(years).sort().reverse();
  }, [safeRecords]);

  const availableFinancialYears = useMemo(() => {
    const fySet = new Set();
    safeRecords.forEach(r => {
      const fy = getRecordFinancialYear(r.date);
      if (fy) fySet.add(fy);
    });
    return Array.from(fySet).sort().reverse();
  }, [safeRecords]);

  const isSuperAdmin = Boolean(currentUser?.isSuperAdmin === true || currentUser?.role === 'SUPER_ADMIN');

  const userVisibleRecords = useMemo(() => {
    return safeRecords.filter(r => {
      if (r.isDeleted) return false;
      if (isSuperAdmin) return true;
      return r.createdByUserId === currentUser?.id || r.assignedUserId === currentUser?.id;
    });
  }, [safeRecords, isSuperAdmin, currentUser]);

  const selectedStaffObj = safeUsers.find(u => u.id === selectedStaff);
  const targetStaffName = selectedStaffObj?.name?.trim().toLowerCase();
  const targetStaffEmail = selectedStaffObj?.email?.trim().toLowerCase();

  const filteredRecords = useMemo(() => {
    return userVisibleRecords.filter(r => {
      const matchSearch = (r.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (r.eventName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (r.assignedUserName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (r.createdByUserName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (r.txnId || '').toLowerCase().includes(searchTerm.toLowerCase());

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

      const normalizedRecordEvent = normalizeEventName(r.eventName);
      const matchEvent = selectedEvent === 'ALL' || normalizedRecordEvent === selectedEvent;

      const recordEventYear = r.eventYear || (r.date ? new Date(r.date).getFullYear().toString() : '');
      const matchEventYear = selectedEventYear === 'ALL' || recordEventYear === selectedEventYear;

      const matchFY = selectedFinancialYear === 'ALL' || getRecordFinancialYear(r.date) === selectedFinancialYear;
      const matchType = selectedType === 'ALL' || r.type === selectedType;

      const recStatus = r.paymentStatus || r.status || 'PAID';
      const matchStatus = selectedPaymentStatus === 'ALL' || recStatus === selectedPaymentStatus;

      return matchSearch && matchStaff && matchEvent && matchEventYear && matchFY && matchType && matchStatus;
    });
  }, [userVisibleRecords, searchTerm, selectedStaff, targetStaffName, targetStaffEmail, selectedEvent, selectedEventYear, selectedFinancialYear, selectedType, selectedPaymentStatus]);

  const totals = financeService.calculateTotals(filteredRecords, selectedStaff, selectedStaffObj);

  // एक्सेल एक्सपोर्ट
  const handleExportExcel = () => {
    if (filteredRecords.length === 0) {
      Swal.fire({ icon: 'warning', title: 'नोंदी नाहीत', text: 'एक्सपोर्ट करण्यासाठी कोणतीही नोंद उपलब्ध नाही.' });
      return;
    }

    const headers = ["दिनांक", "पावती क्र.", "प्रकार", "इव्हेंटचे नाव", "इव्हेंट वर्ष", "तपशील", "वर्गवारी", "पेमेंट स्थिती", "एकूण बिल (₹)", "दिलेली रक्कम (₹)", "बाकी रक्कम (₹)", "प्रतिनिधी", "मोड"];
    const rows = filteredRecords.map(r => [
      `"${r.date || ''}"`,
      `"${r.txnId || ''}"`,
      `"${r.type === 'INCOME' ? 'जमा' : r.type === 'EXPENSE' ? 'खर्च' : 'ॲडव्हान्स'}"`,
      `"${normalizeEventName(r.eventName)}"`,
      `"${r.eventYear || (r.date ? new Date(r.date).getFullYear() : '')}"`,
      `"${(r.description || '').replace(/"/g, '""')}"`,
      `"${r.category || ''}"`,
      `"${(r.paymentStatus || r.status) === 'PENDING' ? 'देणे बाकी' : (r.paymentStatus || r.status) === 'PARTIAL' ? 'अर्धवट' : 'पूर्ण दिले'}"`,
      Number(r.amount) || 0,
      r.paidAmount !== undefined ? Number(r.paidAmount) : Number(r.amount) || 0,
      Number(r.pendingAmount) || 0,
      `"${r.assignedUserName || ''}"`,
      `"${r.mode || 'CASH'}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SMF_Finance_${selectedEvent}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // पीडीएफ प्रिंट
// पीडीएफ प्रिंट (अचूक ॲडव्हान्स ऑटो-सेटलमेंट व सर्व मूळ शेड्यूल्ससह)
  const handlePrintPDF = () => {
    if (filteredRecords.length === 0) {
      Swal.fire({ icon: 'warning', title: 'नोंदी नाहीत', text: 'प्रिंट करण्यासाठी कोणतीही नोंद उपलब्ध नाही.' });
      return;
    }

    const incomeRecords = filteredRecords.filter(r => r.type === 'INCOME');
    const expenseRecords = filteredRecords.filter(r => r.type === 'EXPENSE');

    // जमा वर्गीकरण
    const incomeCategories = {};
    incomeRecords.forEach(r => {
      const cat = r.category || 'इतर जमा';
      if (!incomeCategories[cat]) incomeCategories[cat] = { total: 0, items: [] };
      incomeCategories[cat].total += Number(r.amount || 0);
      incomeCategories[cat].items.push(r);
    });

    // खर्च वर्गीकरण (Paid आणि Pending सह)
    const expenseCategories = {};
    expenseRecords.forEach(r => {
      const cat = r.category || 'इतर विविध खर्च';
      if (!expenseCategories[cat]) expenseCategories[cat] = { total: 0, paid: 0, pending: 0, items: [] };
      const totalAmt = Number(r.amount || 0);
      const pStatus = r.paymentStatus || r.status || 'PAID';
      const paid = r.paidAmount !== undefined ? Number(r.paidAmount) : (pStatus === 'PENDING' ? 0 : totalAmt);
      const pending = r.pendingAmount !== undefined ? Number(r.pendingAmount) : (pStatus === 'PENDING' ? totalAmt : 0);

      expenseCategories[cat].total += totalAmt;
      expenseCategories[cat].paid += paid;
      expenseCategories[cat].pending += pending;
      expenseCategories[cat].items.push(r);
    });

    const totalIncome = Object.values(incomeCategories).reduce((sum, c) => sum + c.total, 0);
    const totalActualExpense = Object.values(expenseCategories).reduce((sum, c) => sum + c.paid, 0);
    const totalPendingLiability = Object.values(expenseCategories).reduce((sum, c) => sum + c.pending, 0);
    const netBalance = totalIncome - totalActualExpense;

    // =========================================================
    // अचूक ॲडव्हान्स आणि ऑटो-सेटलमेंट गणित (Print साठी)
    // =========================================================
    const advanceGivenRecords = filteredRecords.filter(r => r.type === 'ADVANCE_GIVEN');
    const totalAdvanceGiven = advanceGivenRecords.reduce((sum, r) => sum + Number(r.amount || 0), 0);

    // प्रत्येक कार्यकर्त्याला मिळालेला ॲडव्हान्स पूल तयार करणे
    const printStaffPool = {};
    advanceGivenRecords.forEach(r => {
      const amt = Number(r.amount) || 0;
      const key = (r.assignedUserName || r.createdByUserName || '').trim().toLowerCase();
      if (key) {
        printStaffPool[key] = (printStaffPool[key] || 0) + amt;
      }
    });

    let advanceSpent = 0;
    expenseRecords.forEach(r => {
      const pStatus = r.paymentStatus || r.status || 'PAID';
      const paidAmt = r.paidAmount !== undefined ? Number(r.paidAmount) : (pStatus === 'PENDING' ? 0 : Number(r.amount || 0));
      const key = (r.assignedUserName || r.createdByUserName || '').trim().toLowerCase();

      if (r.mode === 'FROM_ADVANCE') {
        advanceSpent += paidAmt;
      } else if (r.mode === 'CASH' && key && (printStaffPool[key] || 0) > 0) {
        const available = printStaffPool[key];
        const settled = Math.min(available, paidAmt);
        advanceSpent += settled;
        printStaffPool[key] -= settled;
      }
    });

    const remainingAdvance = Math.max(0, totalAdvanceGiven - advanceSpent);

    const incKeys = Object.keys(incomeCategories);
    const expKeys = Object.keys(expenseCategories);
    const maxSummaryRows = Math.max(incKeys.length, expKeys.length);

    // पान १: सारांश टेबल (Summary Rows)
    let summaryRowsHtml = '';
    for (let i = 0; i < maxSummaryRows; i++) {
      const incCat = incKeys[i];
      const expCat = expKeys[i];
      const incData = incCat ? incomeCategories[incCat] : null;
      const expData = expCat ? expenseCategories[expCat] : null;

      summaryRowsHtml += `
        <tr>
          <td style="width: 4%; text-align: center;">${incCat ? i + 1 : ''}</td>
          <td style="width: 32%; font-weight: bold;">
            ${incCat || ''}
            ${incData ? `<br><span style="font-size: 9px; color: #64748b; font-weight: normal;">(एकूण: ${incData.items.length} नोंदी)</span>` : ''}
          </td>
          <td style="width: 14%; text-align: right; font-weight: bold; color: #166534;">
            ${incData ? '₹ ' + incData.total.toLocaleString('en-IN') : ''}
          </td>

          <td style="width: 1%; background-color: #cbd5e1; border: none; padding: 0;"></td>

          <td style="width: 4%; text-align: center;">${expCat ? i + 1 : ''}</td>
          <td style="width: 31%; font-weight: bold;">
            ${expCat || ''}
            ${expData ? `<br><span style="font-size: 9px; color: #64748b; font-weight: normal;">(एकूण: ${expData.items.length} नोंदी${expData.pending > 0 ? ` | देणे बाकी: ₹${expData.pending.toLocaleString('en-IN')}` : ''})</span>` : ''}
          </td>
          <td style="width: 14%; text-align: right; font-weight: bold; color: #991b1b;">
            ${expData ? '₹ ' + expData.paid.toLocaleString('en-IN') : ''}
          </td>
        </tr>
      `;
    }

    // पान २: विभागनिहाय सविस्तर खर्च तपशील (Expense Schedules Table)
    let detailsHtml = `<h2 style="font-size: 14px; color: #991b1b; border-bottom: 2px solid #991b1b; padding-bottom: 4px; margin-top: 10px;">विभागनिहाय सविस्तर खर्च तपशील (Expense Schedules)</h2>`;

    expKeys.forEach((catName, idx) => {
      const cat = expenseCategories[catName];
      detailsHtml += `
        <div style="margin-top: 14px; margin-bottom: 18px; page-break-inside: avoid;">
          <div style="display: flex; justify-content: space-between; align-items: center; background: #fee2e2; padding: 5px 8px; border-radius: 4px; border-left: 4px solid #991b1b;">
            <strong style="color: #991b1b; font-size: 11px;">विभाग ${idx + 1}: ${catName}</strong>
            <span style="font-weight: bold; font-size: 11px; color: #991b1b;">
              प्रत्यक्ष पेड: ₹ ${cat.paid.toLocaleString('en-IN')} 
              ${cat.pending > 0 ? `<span style="font-size: 9px; color: #d97706; margin-left: 8px;">(देणे बाकी: ₹ ${cat.pending.toLocaleString('en-IN')})</span>` : ''}
            </span>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-top: 4px;">
            <thead>
              <tr style="background: #f8fafc; font-size: 9px; text-transform: uppercase;">
                <th style="border: 1px solid #cbd5e1; padding: 4px; width: 4%;">क्र.</th>
                <th style="border: 1px solid #cbd5e1; padding: 4px; width: 10%;">दिनांक</th>
                <th style="border: 1px solid #cbd5e1; padding: 4px; width: 14%;">पावती क्र.</th>
                <th style="border: 1px solid #cbd5e1; padding: 4px; width: 34%;">तपशील</th>
                <th style="border: 1px solid #cbd5e1; padding: 4px; width: 14%;">कोणामार्फत</th>
                <th style="border: 1px solid #cbd5e1; padding: 4px; width: 10%;">स्थिती</th>
                <th style="border: 1px solid #cbd5e1; padding: 4px; width: 14%; text-align: right;">रक्कम (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${cat.items.map((item, itemIdx) => {
                const itemStatus = item.paymentStatus || item.status || 'PAID';
                const itemTotal = Number(item.amount || 0);
                const itemPaid = item.paidAmount !== undefined ? Number(item.paidAmount) : (itemStatus === 'PENDING' ? 0 : itemTotal);
                const itemPending = item.pendingAmount !== undefined ? Number(item.pendingAmount) : (itemStatus === 'PENDING' ? itemTotal : 0);

                return `
                  <tr style="font-size: 10px;">
                    <td style="border: 1px solid #cbd5e1; padding: 4px; text-align: center;">${itemIdx + 1}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 4px;">${item.date}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 4px; font-family: monospace;">${item.txnId || '-'}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 4px;">
                      ${item.description}
                      ${item.mode === 'FROM_ADVANCE' ? '<span style="font-size: 8px; background: #fef3c7; color: #92400e; padding: 1px 3px; border-radius: 3px; margin-left: 4px;">ॲडव्हान्स</span>' : ''}
                    </td>
                    <td style="border: 1px solid #cbd5e1; padding: 4px; color: #475569;">${item.assignedUserName || item.createdByUserName || '-'}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 4px; text-align: center;">
                      ${itemStatus === 'PAID' ? '<span style="color: #166534; font-weight: bold;">पूर्ण</span>' : 
                        itemStatus === 'PARTIAL' ? `<span style="color: #d97706; font-weight: bold;">अर्धवट<br><small style="color: #dc2626;">बाकी: ₹${itemPending.toLocaleString('en-IN')}</small></span>` : 
                        '<span style="color: #dc2626; font-weight: bold;">देणे बाकी</span>'}
                    </td>
                    <td style="border: 1px solid #cbd5e1; padding: 4px; text-align: right; font-weight: bold; color: ${itemStatus === 'PENDING' ? '#dc2626' : '#991b1b'};">
                      ${itemStatus === 'PENDING' ? `₹ ${itemTotal.toLocaleString('en-IN')} <br><small style="color: #dc2626; font-weight: normal;">(देणे बाकी)</small>` : `₹ ${itemPaid.toLocaleString('en-IN')}`}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    });

    const printWin = window.open('', '_blank');
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>जमा-खर्च पत्रक - शेलारमामा फाऊंडेशन</title>
          <style>
            @page { size: A4 portrait; margin: 8mm; }
            body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; font-size: 11px; color: #1e293b; margin: 0; padding: 10px; }
            .header-table { width: 100%; border-bottom: 2px solid #580a1a; padding-bottom: 6px; margin-bottom: 10px; }
            .header-table h1 { margin: 0; font-size: 20px; color: #580a1a; font-weight: 900; }
            table.summary-table { width: 100%; border-collapse: collapse; }
            table.summary-table th, table.summary-table td { border: 1px solid #cbd5e1; padding: 6px; }
            .th-jama { background-color: #dcfce7; color: #166534; font-size: 11px; }
            .th-kharch { background-color: #fee2e2; color: #991b1b; font-size: 11px; }
            .page-break { page-break-before: always; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 15px; display: flex; justify-content: flex-end;">
            <button onclick="window.print()" style="padding: 7px 18px; background: #580a1a; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 12px;">प्रिंट करा / PDF सेव्ह करा</button>
          </div>

          <div class="header-table">
            <table style="width: 100%;">
              <tr>
                <td>
                  <h1>शेलारमामा फाऊंडेशन</h1>
                  <p>अधिकृत जमा-खर्च लेजर व ताळेबंद पत्रक (मुख्य सारांश)</p>
                </td>
                <td style="text-align: right;">
                  <p><strong>उपक्रम:</strong> ${selectedEvent === 'ALL' ? 'सर्व उपक्रम' : selectedEvent}</p>
                  <p><strong>कालावधी:</strong> FY ${selectedFinancialYear} | Event Year: ${selectedEventYear}</p>
                  <p><strong>दिनांक:</strong> ${new Date().toLocaleDateString('mr-IN')}</p>
                </td>
              </tr>
            </table>
          </div>

          <table class="summary-table">
            <thead>
              <tr>
                <th colspan="3" class="th-jama">जमा सारांश (INCOME SUMMARY)</th>
                <th style="background-color: #cbd5e1; border: none;"></th>
                <th colspan="3" class="th-kharch">प्रत्यक्ष खर्च सारांश (EXPENSE SUMMARY)</th>
              </tr>
              <tr style="background-color: #f8fafc; font-size: 10px;">
                <th style="width: 4%;">क्र.</th>
                <th>विभाग / हेड</th>
                <th style="width: 14%;">एकूण रक्कम (₹)</th>
                <th style="background-color: #cbd5e1; border: none;"></th>
                <th style="width: 4%;">क्र.</th>
                <th>विभाग / हेड</th>
                <th style="width: 14%;">पेड रक्कम (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${summaryRowsHtml}
            </tbody>
            <tfoot>
              <tr style="background-color: #f1f5f9; font-weight: bold; font-size: 12px;">
                <td colspan="2" style="text-align: right; padding: 8px;">एकूण जमा:</td>
                <td style="text-align: right; color: #166534; font-size: 13px;">₹ ${totalIncome.toLocaleString('en-IN')}</td>
                <td style="background-color: #cbd5e1; border: none;"></td>
                <td colspan="2" style="text-align: right; padding: 8px;">एकूण प्रत्यक्ष खर्च:</td>
                <td style="text-align: right; color: #991b1b; font-size: 13px;">₹ ${totalActualExpense.toLocaleString('en-IN')}</td>
              </tr>
            </tfoot>
          </table>

          <div style="margin-top: 15px; border-top: 2px solid #0f172a; padding-top: 8px;">
            <table style="width: 100%; font-size: 12px; font-weight: bold;">
              <tr>
                <td>शिल्लक रक्कम (Net Balance): <span style="font-size: 14px; color: ${netBalance >= 0 ? '#166534' : '#991b1b'};">₹ ${netBalance.toLocaleString('en-IN')}</span></td>
                <td style="text-align: right;">एकूण नोंदी संख्या: ${incomeRecords.length + expenseRecords.length}</td>
              </tr>
              ${totalPendingLiability > 0 ? `
                <tr>
                  <td colspan="2" style="padding-top: 5px; color: #dc2626;">
                    📌 एकूण प्रलंबित देणी (Total Pending Liabilities): ₹ ${totalPendingLiability.toLocaleString('en-IN')}
                  </td>
                </tr>
              ` : ''}
            </table>

            ${totalAdvanceGiven > 0 ? `
              <div style="margin-top: 10px; background-color: #fffbeb; border: 1px dashed #d97706; padding: 6px 10px; border-radius: 6px; font-size: 10px;">
                <strong>📌 ॲडव्हान्स माहिती:</strong> वितरीत ॲडव्हान्स: ₹ ${totalAdvanceGiven.toLocaleString('en-IN')} | झालेला खर्च: ₹ ${advanceSpent.toLocaleString('en-IN')} | शिल्लक ॲडव्हान्स: ₹ ${remainingAdvance.toLocaleString('en-IN')}
              </div>
            ` : ''}
          </div>

          <div class="page-break"></div>
          ${detailsHtml}

          <script>
            window.onload = function() { setTimeout(function() { window.print(); }, 400); }
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  const rememberedEventId = localStorage.getItem(LAST_EVENT_STORAGE_KEY) || 'aapla-dandiya';

  return (
    <div className="w-full px-3 sm:px-6 lg:px-8 py-3 space-y-3 font-sans pb-24">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-gray-200 pb-2.5">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-heritage-crimson block">
            हिशोब व वित्त व्यवस्थापन
          </span>
          <h1 className="text-base sm:text-2xl font-black text-heritage-burgundy leading-tight">
            जमा-खर्च लेजर
          </h1>
          <p className="hidden sm:block text-xs text-gray-500 mt-0.5">
            स्क्रीनवर {records.length} पैकी {filteredRecords.length} नोंदी जुळल्या आहेत.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {isSuperAdmin && (
            <>
              <button
                type="button"
                onClick={() => setShowImportModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold text-xs shadow-2xs transition active:scale-95 cursor-pointer"
                title="CSV फाईल Import करा"
              >
                <Upload className="w-4 h-4 text-indigo-600" />
                <span>डेटा Import</span>
              </button>

              <button
                type="button"
                onClick={handleExportExcel}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs shadow-2xs transition active:scale-95 cursor-pointer"
                title="एक्सेल शीट डाउनलोड करा"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Excel Export</span>
              </button>

              <button
                type="button"
                onClick={handlePrintPDF}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-2xs transition active:scale-95 cursor-pointer"
                title="ताळेबंद PDF रिपोर्ट प्रिंट करा"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>PDF प्रिंट</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => { setEditingRecord(null); setShowModal(true); }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-heritage-burgundy hover:bg-heritage-crimson text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>नवीन नोंद</span>
          </button>
        </div>
      </div>

      {/* 2. Summary Cards (५ वे देणे बाकी कार्ड समाविष्ट) */}
      <FinanceSummaryCards totals={totals} />

      {/* 3. Filters */}
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

        {/* Event Filter */}
        <select 
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="h-8 px-2.5 rounded-xl bg-white border border-gray-200 text-gray-800 font-bold outline-none cursor-pointer shrink-0 max-w-[150px] truncate"
        >
          <option value="ALL">सर्व इव्हेंट्स ({dynamicEventOptions.length})</option>
          <option value="सामान्य संस्था निधी">सामान्य संस्था निधी</option>
          {dynamicEventOptions.map(evName => (
            <option key={evName} value={evName}>{evName}</option>
          ))}
        </select>

        {/* Payment Status Filter */}
        <select
          value={selectedPaymentStatus}
          onChange={(e) => setSelectedPaymentStatus(e.target.value)}
          className="h-8 px-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold outline-none cursor-pointer shrink-0"
          title="पेमेंट स्थिती फिल्टर"
        >
          <option value="ALL">सर्व पेमेंट्स</option>
          <option value="PAID">फक्त पूर्ण (PAID)</option>
          <option value="PARTIAL">फक्त अर्धवट (PARTIAL)</option>
          <option value="PENDING">फक्त बाकी (PENDING)</option>
        </select>

        {/* Event Year Filter */}
        <select 
          value={selectedEventYear}
          onChange={(e) => setSelectedEventYear(e.target.value)}
          className="h-8 px-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 font-bold outline-none cursor-pointer shrink-0"
        >
          <option value="ALL">सर्व Event Years</option>
          {availableEventYears.map(yr => (
            <option key={yr} value={yr}>इव्हेंट वर्ष: {yr}</option>
          ))}
        </select>

        {/* Financial Year Filter */}
        <select 
          value={selectedFinancialYear}
          onChange={(e) => setSelectedFinancialYear(e.target.value)}
          className="h-8 px-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 font-bold outline-none cursor-pointer shrink-0"
        >
          <option value="ALL">सर्व आर्थिक वर्षे (FY)</option>
          {availableFinancialYears.map(fy => (
            <option key={fy} value={fy}>FY {fy}</option>
          ))}
        </select>

        {/* Staff Filter */}
        <select 
          value={selectedStaff}
          onChange={(e) => setSelectedStaff(e.target.value)}
          className="h-8 px-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-bold outline-none cursor-pointer shrink-0"
        >
          <option value="ALL">सर्व Staff</option>
          {safeUsers.map(u => (
            <option key={u.id} value={u.id}>{u.name}</option>
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

        {/* Refresh Button */}
        <button
          type="button"
          onClick={loadData}
          className="h-8 px-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 shrink-0 flex items-center justify-center cursor-pointer"
          title="माहिती रीफ्रेश करा"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-heritage-burgundy' : ''}`} />
        </button>

      </div>

      {/* 4. Transactions List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">तारीख व ID</th>
                <th className="p-3">प्रकार / इव्हेंट</th>
                <th className="p-3">तपशील व वर्गवारी</th>
                <th className="p-3">स्थिती</th>
                <th className="p-3">पेमेंट मोड</th>
                <th className="p-3">रक्कम (₹)</th>
                <th className="p-3 text-right">कृती</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((r) => {
                  const canEdit = financeService.canEditRecord(r, currentUser);
                  const pStatus = r.paymentStatus || r.status || 'PAID';
                  const totalAmt = Number(r.amount) || 0;
                  const paidAmt = r.paidAmount !== undefined ? Number(r.paidAmount) : (pStatus === 'PENDING' ? 0 : totalAmt);
                  const pendingAmt = r.pendingAmount !== undefined ? Number(r.pendingAmount) : (pStatus === 'PENDING' ? totalAmt : 0);

                  return (
                    <tr key={r.id} className="hover:bg-gray-50/80 transition">
                      <td className="p-3 whitespace-nowrap">
                        <span className="text-gray-700 font-bold block">{r.date}</span>
                        <span className="text-[9px] font-mono font-black text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                          {r.txnId || 'SMF-TXN'}
                        </span>
                      </td>

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
                          {normalizeEventName(r.eventName)}
                        </span>
                      </td>

                     {/* तपशील व वर्गवारी (नोंद कोणाची आहे) */}
                      <td className="p-3">
                        <span className="font-bold text-gray-900 block leading-snug">
                          {r.description || r.category}
                        </span>

                        <div className="flex items-center gap-1.5 flex-wrap mt-1">
                          <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded font-medium">
                            {r.category || 'सर्वसाधारण'}
                          </span>

                          {/* नोंद कोणाची आहे (createdBy किंवा assignedUser) */}
                          <span className="text-[10px] text-slate-400 font-medium">
                            • 👤 नोंद: {r.createdByUserName || r.assignedUserName || 'संस्था प्रतिनिधी'}
                          </span>
                        </div>
                      </td>

                      {/* Payment Status Column */}
                      <td className="p-3 whitespace-nowrap">
                        {pStatus === 'PAID' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> पूर्ण पेड
                          </span>
                        ) : pStatus === 'PARTIAL' ? (
                          <div>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-full">
                              <Clock className="w-3 h-3" /> अर्धवट
                            </span>
                            <span className="text-[9px] text-rose-600 block font-bold mt-0.5">
                              बाकी: ₹{pendingAmt.toLocaleString('en-IN')}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                            <AlertCircle className="w-3 h-3" /> देणे बाकी
                          </span>
                        )}
                      </td>

                      {/* पेमेंट मोड व खाली कोणाचा ॲडव्हान्स आहे ते नाव */}
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black inline-block ${
                          r.mode === 'FROM_ADVANCE' ? 'bg-amber-100 text-amber-900' :
                          r.mode === 'ONLINE' ? 'bg-sky-50 text-sky-800' : 'bg-emerald-50 text-emerald-800'
                        }`}>
                          {r.mode === 'FROM_ADVANCE' ? 'ॲडव्हान्स' : r.mode === 'ONLINE' ? 'ऑनलाइन' : 'रोख'}
                        </span>

                        {/* मोडच्या खाली कोणाला ॲडव्हान्स दिला / कोणामार्फत आहे ते नाव */}
                        {(r.mode === 'FROM_ADVANCE' || r.type === 'ADVANCE_GIVEN') && r.assignedUserName && (
                          <span className="text-[9px] font-bold text-slate-500 block mt-0.5">
                            ({r.assignedUserName})
                          </span>
                        )}
                      </td>

                      {/* Smart Amount Column (देणे बाकी असताना - ₹ 0 ऐवजी खरी रक्कम दाखवणे) */}
                      <td className="p-3 whitespace-nowrap">
                        {pStatus === 'PENDING' ? (
                          <div>
                            <span className="text-sm font-black text-rose-600 block">
                              ₹ {totalAmt.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-1 py-0.5 rounded inline-block">
                              (पूर्ण देणे बाकी)
                            </span>
                          </div>
                        ) : pStatus === 'PARTIAL' ? (
                          <div>
                            <span className="text-sm font-black text-amber-700 block">
                              - ₹ {paidAmt.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[9px] text-rose-600 block font-bold">
                              बाकी: ₹{pendingAmt.toLocaleString('en-IN')}
                            </span>
                          </div>
                        ) : (
                          <div className="font-black text-sm">
                            <span className={r.type === 'INCOME' ? 'text-emerald-600' : r.type === 'EXPENSE' ? 'text-rose-600' : 'text-amber-600'}>
                              {r.type === 'INCOME' ? '+' : '-'} ₹ {paidAmt.toLocaleString('en-IN')}
                            </span>
                          </div>
                        )}
                      </td>

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
                              title="सॉफ्ट-डिलीट करा"
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

        {/* Mobile View */}
        <div className="block md:hidden divide-y divide-gray-100">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((r) => {
              const canEdit = financeService.canEditRecord(r, currentUser);
              const pStatus = r.paymentStatus || r.status || 'PAID';
              const totalAmt = Number(r.amount) || 0;
              const paidAmt = r.paidAmount !== undefined ? Number(r.paidAmount) : (pStatus === 'PENDING' ? 0 : totalAmt);
              const pendingAmt = r.pendingAmount !== undefined ? Number(r.pendingAmount) : (pStatus === 'PENDING' ? totalAmt : 0);

              return (
                <div key={r.id} className="p-3 flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      r.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' :
                      pStatus === 'PENDING' ? 'bg-rose-100 text-rose-700' :
                      r.type === 'EXPENSE' ? 'bg-rose-50 text-rose-600' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {r.type === 'INCOME' ? <ArrowDown className="w-3.5 h-3.5 rotate-180" /> :
                       pStatus === 'PENDING' ? <AlertCircle className="w-3.5 h-3.5" /> :
                       r.type === 'EXPENSE' ? <ArrowUp className="w-3.5 h-3.5" /> : <HandCoins className="w-3.5 h-3.5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-gray-900 truncate">{r.description || r.category}</h4>
                        <span className="text-[8px] font-mono font-black text-gray-400 bg-gray-100 px-1 rounded shrink-0">
                          {r.txnId || 'SMF-TXN'}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 truncate mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-gray-700">{normalizeEventName(r.eventName)}</span>
                        <span>•</span>
                        <span>👤 {r.assignedUserName || r.createdByUserName || '-'}</span>
                        <span>•</span>
                        <span>{r.date}</span>
                        {pStatus === 'PARTIAL' && (
                          <span className="text-amber-700 font-bold bg-amber-50 px-1 rounded">बाकी: ₹{pendingAmt}</span>
                        )}
                        {pStatus === 'PENDING' && (
                          <span className="text-rose-700 font-bold bg-rose-50 px-1 rounded">देणे बाकी</span>
                        )}
                      </p>
                      {r.type === 'ADVANCE_GIVEN' && r.assignedUserName && (
                        <span className="text-[8px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1 rounded mt-0.5 inline-block">
                          👉 ॲडव्हान्स: {r.assignedUserName}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-black">
                      {pStatus === 'PENDING' ? (
                        <span className="text-rose-600">₹{totalAmt.toLocaleString('en-IN')} (बाकी)</span>
                      ) : pStatus === 'PARTIAL' ? (
                        <span className="text-amber-700">-₹{paidAmt.toLocaleString('en-IN')}</span>
                      ) : (
                        <span className={r.type === 'INCOME' ? 'text-emerald-600' : r.type === 'EXPENSE' ? 'text-rose-600' : 'text-amber-600'}>
                          {r.type === 'INCOME' ? '+' : '-'}₹{paidAmt.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-end gap-1.5 mt-1">
                      <span className="px-1.5 py-0.2 rounded text-[8px] font-black bg-gray-100 text-gray-700">
                        {r.mode === 'ONLINE' ? 'ऑनलाइन' : r.mode === 'FROM_ADVANCE' ? 'ॲडव्हान्स' : 'रोख'}
                      </span>

                      {canEdit ? (
                        <button
                          type="button"
                          onClick={() => handleEditClick(r)}
                          className="p-1 text-gray-400 hover:text-amber-600"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-gray-300" />
                      )}

                      {isSuperAdmin && (
                        <button 
                          type="button" 
                          onClick={() => handleDeleteRecord(r)}
                          className="p-1 text-gray-300 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

        {/* 5. Load More Button Section */}
        <div className="p-4 flex flex-col items-center justify-center gap-2 border-t border-gray-100 bg-gray-50/50">
          <div className="text-[11px] text-gray-500 font-bold">
            सध्या {records.length} नोंदी लोड झाल्या आहेत.
          </div>

          {hasMore ? (
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-heritage-burgundy hover:bg-heritage-crimson text-white font-bold text-xs shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>अजून २५ नोंदी आणत आहे...</span>
                </>
              ) : (
                <span>अजून २५ नोंदी लोड करा (+२५)</span>
              )}
            </button>
          ) : (
            <span className="text-xs text-gray-400 font-medium bg-gray-100 px-3 py-1 rounded-full">
              सर्व नोंदी लोड झाल्या आहेत.
            </span>
          )}
        </div>

      </div>

      {/* Transaction Modal */}
      {showModal && (
        <FinanceTransactionModal 
          onClose={() => { setShowModal(false); setEditingRecord(null); }}
          onSave={handleSaveRecord}
          existingCategories={categories}
          existingEvents={INITIATIVES_DATA}
          defaultEventId={rememberedEventId}
          usersList={safeUsers}
          currentUser={currentUser}
          initialData={editingRecord}
        />
      )}

      {/* Import CSV Modal */}
      {showImportModal && (
        <FinanceImportModal 
          onClose={() => setShowImportModal(false)}
          onSuccess={loadData}
          existingUsers={safeUsers}
        />
      )}

    </div>
  );
}