// src/services/financeService.js
import { 
  collection, addDoc, getDocs, updateDoc, setDoc, getDoc,
  doc, query, orderBy, limit, startAfter, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION_NAME = 'finance_records';
const CATEGORY_COLLECTION = 'finance_categories';
const CATEGORY_CACHE_KEY = 'smf_finance_categories_cache';

// तुझ्या मूळ सर्व १० अधिकृत कॅटेगरीज
export const DEFAULT_FINANCE_CATEGORIES = [
  'मंडप आणि लाइटिंग',
  'डेकोरेशन',
  'मंडप व डेकोरेशन',
  'ध्वनी व लाईट्स',
  'प्रसाद व भोजन',
  'बॅनर्स व जाहिरात',
  'पारितोषिक व सन्मानचिन्ह',
  'वाहतूक व इंधन',
  'देणगी पावती',
  'इतर विविध खर्च'
];

export const financeService = {
  // १. इव्हेंट प्रीफिक्स तयार करणे
  getEventPrefix(eventId = '', eventName = '') {
    if (!eventId || eventId === 'general') return 'GEN';

    const slugMap = {
      'aapla-dandiya': 'DND',
      'dahi-handi': 'DHD',
      'shivjayanti': 'SHV',
      'diwali-pahat': 'DWL',
      'cricket-cup': 'CRK',
      'chaitra-navratri': 'CHA',
      'saapshidi': 'SPS'
    };

    if (slugMap[eventId]) return slugMap[eventId];

    const cleanName = (eventName || eventId)
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase();

    return cleanName.slice(0, 3) || 'EVT';
  },

  // २. युनिक ट्रॅन्झॅक्शन आयडी तयार करणे
  generateTransactionId(type = 'EXPENSE', eventId = '', eventName = '', dateStr = '') {
    const yearSuffix = dateStr 
      ? new Date(dateStr).getFullYear().toString().slice(-2) 
      : new Date().getFullYear().toString().slice(-2);

    const eventPrefix = this.getEventPrefix(eventId, eventName);

    const typeCode = type === 'INCOME' 
      ? 'INC' 
      : type === 'ADVANCE_GIVEN' 
      ? 'ADV' 
      : 'EXP';

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);

    return `SMF-${yearSuffix}-${eventPrefix}-${typeCode}-${randomSuffix}`;
  },

  // ३. स्वतंत्र Collection मधून सर्व कॅटेगरीज मिळवणे (युनिक व कॅशसह)
  async getCategories() {
    const cached = localStorage.getItem(CATEGORY_CACHE_KEY);
    try {
      const snap = await getDocs(collection(db, CATEGORY_COLLECTION));
      const dbCategories = snap.docs.map(d => d.data().name).filter(Boolean);

      // डीफॉल्ट + कलेक्शनमधील सर्व कॅटेगरीज युनिक करणे
      const mergedSet = new Set([...DEFAULT_FINANCE_CATEGORIES, ...dbCategories]);
      const uniqueList = Array.from(mergedSet);

      localStorage.setItem(CATEGORY_CACHE_KEY, JSON.stringify(uniqueList));
      return uniqueList;
    } catch (err) {
      console.warn("Categories fetch error, using fallback cache:", err);
      return cached ? JSON.parse(cached) : DEFAULT_FINANCE_CATEGORIES;
    }
  },

  // ४. नवीन कॅटेगरी स्वतंत्र Collection मध्ये सेव्ह करणे (Auto Deduplication)
  async addCategory(newCategory) {
    const cleanCat = (newCategory || '').trim();
    if (!cleanCat) return;

    try {
      // डॉक्युमेंट आयडी कॅटेगरीच्या नावावरून सुरक्षित बनवणे
      const docId = cleanCat.toLowerCase().replace(/[^a-z0-9\u0900-\u097F]/g, '_');
      const docRef = doc(db, CATEGORY_COLLECTION, docId);
      
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        await setDoc(docRef, {
          name: cleanCat,
          createdAt: serverTimestamp()
        });
      }

      // Local Cache अपडेट करणे
      const cached = JSON.parse(localStorage.getItem(CATEGORY_CACHE_KEY) || '[]');
      if (!cached.includes(cleanCat)) {
        cached.push(cleanCat);
        localStorage.setItem(CATEGORY_CACHE_KEY, JSON.stringify(cached));
      }
    } catch (err) {
      console.error("नवीन कॅटेगरी जोडताना तांत्रिक अडचण:", err);
    }
  },

  // ५. ४८ तासांचा एडिट नियम
  canEditRecord(record, currentUser) {
    if (!record) return false;
    if (currentUser?.isSuperAdmin === true || currentUser?.role === 'SUPER_ADMIN') return true;

    const isOwner = record.createdByUserId === currentUser?.id || currentUser?.role === 'ADMIN';
    if (!isOwner) return false;

    const createdTime = record.createdAt?.toDate 
      ? record.createdAt.toDate().getTime() 
      : new Date(record.createdAt || record.date).getTime();

    const hoursDiff = (Date.now() - createdTime) / (1000 * 60 * 60);
    return hoursDiff <= 48;
  },

  // ६. पहिल्या २५ नोंदी आणणे (Pagination)
  async getPaginatedRecords(pageSize = 25) {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('date', 'desc'),
        limit(pageSize)
      );

      const snap = await getDocs(q);
      const records = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(r => !r.isDeleted);

      const lastDoc = snap.docs[snap.docs.length - 1] || null;

      return {
        records,
        lastDocSnapshot: lastDoc,
        hasMore: snap.docs.length === pageSize
      };
    } catch (err) {
      console.error("पॅजिनेशन फेच त्रुटी:", err);
      return { records: [], lastDocSnapshot: null, hasMore: false };
    }
  },

  // ७. पुढील २५ नोंदी लोड करणे (Load More)
  async getMorePaginatedRecords(lastDocSnapshot, pageSize = 25) {
    if (!lastDocSnapshot) {
      return { records: [], lastDocSnapshot: null, hasMore: false };
    }

    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('date', 'desc'),
        startAfter(lastDocSnapshot),
        limit(pageSize)
      );

      const snap = await getDocs(q);
      const newRecords = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(r => !r.isDeleted);

      const newLastDoc = snap.docs[snap.docs.length - 1] || null;

      return {
        records: newRecords,
        lastDocSnapshot: newLastDoc,
        hasMore: snap.docs.length === pageSize
      };
    } catch (err) {
      console.error("लोड मोर त्रुटी:", err);
      return { records: [], lastDocSnapshot: null, hasMore: false };
    }
  },

  // ८. नवीन नोंद सेव्ह करणे (पार्ट पेमेंट व पेंडिंग सुरक्षित गणित)
  async createRecord(recordData, currentUser) {
    const recordYear = recordData.date 
      ? new Date(recordData.date).getFullYear().toString() 
      : new Date().getFullYear().toString();

    const txnId = recordData.txnId || this.generateTransactionId(
      recordData.type,
      recordData.eventId,
      recordData.eventName,
      recordData.date
    );

    const totalAmt = Number(recordData.amount) || 0;
    const paymentStatus = recordData.paymentStatus || 'PAID';

    let actualPaid = totalAmt;
    let pendingAmt = 0;

    if (paymentStatus === 'PENDING') {
      actualPaid = 0;
      pendingAmt = totalAmt;
    } else if (paymentStatus === 'PARTIAL') {
      actualPaid = Number(recordData.paidAmount) || 0;
      pendingAmt = Math.max(0, totalAmt - actualPaid);
    }

    // कॅटेगरी नवीन असल्यास स्वतंत्र Collection मध्ये आपोआप जोडणे
    if (recordData.category) {
      await this.addCategory(recordData.category);
    }

    const payload = {
      ...recordData,
      txnId,
      amount: totalAmt,
      paidAmount: actualPaid,
      pendingAmount: pendingAmt,
      paymentStatus,
      status: paymentStatus,
      year: recordYear,
      eventYear: recordData.eventYear || recordYear,
      createdByUserId: currentUser?.id || 'system',
      createdByUserName: currentUser?.name || 'संस्था प्रतिनिधी',
      createdByEmail: currentUser?.email || '',
      createdAt: serverTimestamp(),
      updatedByUserId: null,
      updatedByUserName: null,
      updatedByEmail: null,
      updatedAt: null,
      isDeleted: false,
      deletedByUserId: null,
      deletedByUserName: null,
      deletedAt: null
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);
    return { id: docRef.id, ...payload };
  },

  // ९. नोंद अपडेट करणे
  async updateRecord(id, updatedData, currentUser) {
    const docRef = doc(db, COLLECTION_NAME, id);
    const totalAmt = Number(updatedData.amount) || 0;
    const paymentStatus = updatedData.paymentStatus || 'PAID';

    let actualPaid = totalAmt;
    let pendingAmt = 0;

    if (paymentStatus === 'PENDING') {
      actualPaid = 0;
      pendingAmt = totalAmt;
    } else if (paymentStatus === 'PARTIAL') {
      actualPaid = Number(updatedData.paidAmount) || 0;
      pendingAmt = Math.max(0, totalAmt - actualPaid);
    }

    if (updatedData.category) {
      await this.addCategory(updatedData.category);
    }

    const payload = {
      ...updatedData,
      amount: totalAmt,
      paidAmount: actualPaid,
      pendingAmount: pendingAmt,
      paymentStatus,
      status: paymentStatus,
      year: updatedData.date ? new Date(updatedData.date).getFullYear().toString() : new Date().getFullYear().toString(),
      eventYear: updatedData.eventYear || (updatedData.date ? new Date(updatedData.date).getFullYear().toString() : new Date().getFullYear().toString()),
      updatedByUserId: currentUser?.id || 'system',
      updatedByUserName: currentUser?.name || 'संस्था प्रतिनिधी',
      updatedByEmail: currentUser?.email || '',
      updatedAt: serverTimestamp()
    };

    await updateDoc(docRef, payload);
    return payload;
  },

  // १०. सॉफ्ट डिलीट
  async softDeleteRecord(id, currentUser) {
    const docRef = doc(db, COLLECTION_NAME, id);
    const payload = {
      isDeleted: true,
      deletedByUserId: currentUser?.id || 'super_admin',
      deletedByUserName: currentUser?.name || 'SuperAdmin',
      deletedAt: serverTimestamp()
    };

    await updateDoc(docRef, payload);
  },

 // ११. अचूक ताळेबंद व स्मार्ट ॲडव्हान्स ऑटो-सेटलमेंट इंजिन (P&L Engine)
  calculateTotals(records = [], selectedStaffId = 'ALL', selectedStaffObj = null) {
    let totalIncome = 0;
    let totalExpense = 0;          // एकूण प्रत्यक्ष खर्च
    let totalEstimatedExpense = 0; // एकूण बिलिंग खर्च
    let totalPendingPayable = 0;   // देणे बाकी
    let totalAdvanceGiven = 0;     // एकूण वाटलेला ॲडव्हान्स
    let advanceSpent = 0;          // ॲडव्हान्समधून खर्च झालेली रक्कम
    let cashInHand = 0;
    let onlineBalance = 0;

    const isStaffFiltered = selectedStaffId && selectedStaffId !== 'ALL';

    // १. प्रत्येक कार्यकर्त्याला मिळालेला ॲडव्हान्स आधी मोजणे
    const staffAdvancePool = {};

    records.forEach(r => {
      if (r.isDeleted) return;
      if (r.type === 'ADVANCE_GIVEN') {
        const amt = Number(r.amount) || 0;
        const staffKey = (r.assignedUserName || r.createdByUserName || '').trim().toLowerCase();
        if (staffKey) {
          staffAdvancePool[staffKey] = (staffAdvancePool[staffKey] || 0) + amt;
        }
      }
    });

    // २. सर्व व्यवहारांची अचूक नोंद व ऑटो-सेटलमेंट
    records.forEach(r => {
      if (r.isDeleted) return;

      const totalBillAmt = Number(r.amount) || 0;
      const pStatus = r.paymentStatus || r.status || 'PAID';
      const paidAmt = r.paidAmount !== undefined ? Number(r.paidAmount) : (pStatus === 'PENDING' ? 0 : totalBillAmt);
      const pendingAmt = r.pendingAmount !== undefined ? Number(r.pendingAmount) : (pStatus === 'PENDING' ? totalBillAmt : 0);

      const isCash = r.mode === 'CASH';
      const isOnline = r.mode === 'ONLINE';
      const staffKey = (r.assignedUserName || r.createdByUserName || '').trim().toLowerCase();

      // जमा (INCOME)
      if (r.type === 'INCOME') {
        totalIncome += totalBillAmt;
        if (isCash) cashInHand += totalBillAmt;
        if (isOnline) onlineBalance += totalBillAmt;
      } 
      // खर्च (EXPENSE)
      else if (r.type === 'EXPENSE') {
        totalEstimatedExpense += totalBillAmt;
        totalPendingPayable += pendingAmt;
        totalExpense += paidAmt;

        // स्मार्ट सेटलमेंट: मोड 'ॲडव्हान्स' असो किंवा कार्यकर्त्याकडे रोख ॲडव्हान्स उपलब्ध असो,
        // तो खर्च आधी त्या ॲडव्हान्समधूनच वजा होईल.
        let paidFromAdvanceAmt = 0;

        if (r.mode === 'FROM_ADVANCE') {
          paidFromAdvanceAmt = paidAmt;
        } else if (isCash && staffKey && (staffAdvancePool[staffKey] || 0) > 0) {
          const available = staffAdvancePool[staffKey];
          paidFromAdvanceAmt = Math.min(available, paidAmt);
          staffAdvancePool[staffKey] -= paidFromAdvanceAmt; // ॲडव्हान्स पूल कमी केला
        }

        advanceSpent += paidFromAdvanceAmt;
        const remainingDirectCash = paidAmt - paidFromAdvanceAmt;

        // मुख्य तिजोरीतून फक्त तोच खर्च वजा होईल जो ॲडव्हान्सच्या बाहेरचा आहे (दुहेरी वजावट थांबवली)
        if (isCash) {
          cashInHand -= remainingDirectCash;
        } else if (isOnline) {
          onlineBalance -= paidAmt;
        }
      } 
      // ॲडव्हान्स वाटप (ADVANCE_GIVEN)
      else if (r.type === 'ADVANCE_GIVEN') {
        totalAdvanceGiven += totalBillAmt;
        if (!isStaffFiltered) {
          if (isCash) cashInHand -= totalBillAmt;
          if (isOnline) onlineBalance -= totalBillAmt;
        }
      }
    });

    let remainingAdvanceInMarket = 0;
    let netBalance = 0;

    if (isStaffFiltered) {
      // स्टाफ फिल्टर असताना:
      remainingAdvanceInMarket = Math.max(0, totalAdvanceGiven - totalExpense);
      netBalance = totalAdvanceGiven - totalExpense;
      if (netBalance === 0) {
        cashInHand = 0;
        onlineBalance = 0;
      }
    } else {
      // संपूर्ण संस्था लेजर:
      remainingAdvanceInMarket = Math.max(0, totalAdvanceGiven - advanceSpent);
      netBalance = totalIncome - totalExpense;
    }

    return {
      totalIncome,
      totalExpense,
      totalEstimatedExpense,
      totalPendingPayable,
      totalAdvanceGiven,
      advanceSpent,
      remainingAdvanceInMarket,
      netBalance,
      cashInHand,
      onlineBalance
    };
  }
};