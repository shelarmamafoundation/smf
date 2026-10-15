// src/services/financeService.js
import { 
  collection, addDoc, getDocs, updateDoc, 
  doc, query, orderBy, limit, startAfter, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION_NAME = 'finance_records';
const CACHE_KEY = 'smf_finance_records_cache';

export const financeService = {
  // १. Event Prefix (3-Letter Slug) Generate karne
  getEventPrefix(eventId = '', eventName = '') {
    if (!eventId || eventId === 'general') return 'GEN';

    const slugMap = {
      'aapla-dandiya': 'DND',
      'dahi-handi': 'DHD',
      'shivjayanti': 'SHV',
      'diwali-pahat': 'DWL',
      'cricket-cup': 'CRK'
    };

    if (slugMap[eventId]) return slugMap[eventId];

    // Custom event asel tar tyachya navatun 3 initials ghene
    const cleanName = (eventName || eventId)
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase();

    return cleanName.slice(0, 3) || 'EVT';
  },

  // २. Compact & Audit-friendly Transaction ID: SMF-26-DND-EXP-8412
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

  // ३. 48-Hour Edit Eligibility Rule
  canEditRecord(record, currentUser) {
    if (!record) return false;
    if (currentUser?.role === 'SUPER_ADMIN') return true;

    // Check ownership (Admin kinva jaani entry banavli to)
    const isOwner = record.createdByUserId === currentUser?.id || currentUser?.role === 'ADMIN';
    if (!isOwner) return false;

    // 48 hours limit calculation
    const createdTime = record.createdAt?.toDate 
      ? record.createdAt.toDate().getTime() 
      : new Date(record.createdAt || record.date).getTime();

    const hoursDiff = (Date.now() - createdTime) / (1000 * 60 * 60);
    return hoursDiff <= 48;
  },

  // ४. कॅश-फर्स्ट + २५ लेटेस्ट नोंदी (सॉफ्ट डिलीट वगळून)
  async getInitialRecords(forceServer = false) {
    const cached = localStorage.getItem(CACHE_KEY);
    
    if (cached && !forceServer) {
      try {
        const parsed = JSON.parse(cached);
        return parsed.filter(r => !r.isDeleted);
      } catch (e) {
        console.error("Cache parsing error:", e);
      }
    }

    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        orderBy('date', 'desc'),
        limit(25)
      );
      const snap = await getDocs(q);
      const records = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(r => !r.isDeleted);

      localStorage.setItem(CACHE_KEY, JSON.stringify(records));
      return records;
    } catch (err) {
      console.warn("Offline fallback for finance:", err);
      return cached ? JSON.parse(cached).filter(r => !r.isDeleted) : [];
    }
  },

  // getRecords alias
  getRecords(forceServer = false) {
    return this.getInitialRecords(forceServer);
  },

  // ५. लोड मोर (पुढील २५ नोंदी आणणे)
  async getMoreRecords(lastRecord) {
    if (!lastRecord) return [];
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('date', 'desc'),
        startAfter(lastRecord.date),
        limit(25)
      );
      const snap = await getDocs(q);
      const moreRecords = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(r => !r.isDeleted);

      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
      const merged = [...cached, ...moreRecords];
      localStorage.setItem(CACHE_KEY, JSON.stringify(merged));

      return moreRecords;
    } catch (err) {
      console.error("Load more failed:", err);
      return [];
    }
  },

  // ६. नवीन नोंद तयार करणे (Unique ID, Audit Trail & Duplicate Check सह)
  async createRecord(recordData, currentUser) {
    const recordYear = recordData.date 
      ? new Date(recordData.date).getFullYear().toString() 
      : new Date().getFullYear().toString();

    // Generate Human-Readable Unique Transaction ID
    const txnId = recordData.txnId || this.generateTransactionId(
      recordData.type,
      recordData.eventId,
      recordData.eventName,
      recordData.date
    );

    // Duplicate Check: jar already local cache madhe ha txnId asel tar block kara
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
    if (cached.some(r => r.txnId === txnId)) {
      throw new Error('Duplicate entry detect zali ahe. Krupaya thambun punha prayatna kara.');
    }

    const payload = {
      ...recordData,
      txnId,
      amount: Number(recordData.amount) || 0,
      year: recordYear,
      
      // निर्मिती ऑडिट (Creation Audit)
      createdByUserId: currentUser?.id || 'system',
      createdByUserName: currentUser?.name || 'संस्था प्रतिनिधी',
      createdByEmail: currentUser?.email || '',
      createdAt: serverTimestamp(),

      // अपडेट स्थिती (Update Audit)
      updatedByUserId: null,
      updatedByUserName: null,
      updatedByEmail: null,
      updatedAt: null,

      // Soft Delete Flag (SuperAdmin only)
      isDeleted: false,
      deletedByUserId: null,
      deletedByUserName: null,
      deletedAt: null
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);
    const newRecord = { 
      id: docRef.id, 
      ...payload, 
      createdAt: new Date().toISOString() 
    };

    // Cache update
    localStorage.setItem(CACHE_KEY, JSON.stringify([newRecord, ...cached]));

    return newRecord;
  },

  // ७. नोंद अपडेट करणे (Audit सह)
  async updateRecord(id, updatedData, currentUser) {
    const docRef = doc(db, COLLECTION_NAME, id);
    const payload = {
      ...updatedData,
      amount: Number(updatedData.amount) || 0,
      year: updatedData.date ? new Date(updatedData.date).getFullYear().toString() : new Date().getFullYear().toString(),
      
      // Audit: शेवटचा बदल कोणी व कधी केला
      updatedByUserId: currentUser?.id || 'system',
      updatedByUserName: currentUser?.name || 'संस्था प्रतिनिधी',
      updatedByEmail: currentUser?.email || '',
      updatedAt: serverTimestamp()
    };

    await updateDoc(docRef, payload);

    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
    const newCached = cached.map(r => r.id === id ? { ...r, ...payload, updatedAt: new Date().toISOString() } : r);
    localStorage.setItem(CACHE_KEY, JSON.stringify(newCached));

    return payload;
  },

  // ८. सॉफ्ट डिलीट (फक्त SuperAdmin करू शकतो)
  async softDeleteRecord(id, currentUser) {
    const docRef = doc(db, COLLECTION_NAME, id);
    const payload = {
      isDeleted: true,
      deletedByUserId: currentUser?.id || 'super_admin',
      deletedByUserName: currentUser?.name || 'SuperAdmin',
      deletedAt: serverTimestamp()
    };

    await updateDoc(docRef, payload);

    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached.filter(r => r.id !== id)));
  },

  // deleteRecord alias
  deleteRecord(id, currentUser) {
    return this.softDeleteRecord(id, currentUser);
  },

  // ९. ताळेबंद व युजरनिहाय ॲडव्हान्स हिशोब (User-wise Ledger Calculation)
  // ६. ताळेबंद व युजरनिहाय हिशोब (Complete P&L & Wallet Engine)
  calculateTotals(records = [], selectedStaffId = 'ALL', selectedStaffObj = null) {
    let totalIncome = 0;
    let totalExpense = 0;
    let totalAdvanceGiven = 0;
    let advanceSpent = 0;
    let cashInHand = 0;
    let onlineBalance = 0;

    const isStaffFiltered = selectedStaffId && selectedStaffId !== 'ALL';
    const targetStaffName = selectedStaffObj?.name?.trim().toLowerCase();

    records.forEach(r => {
      if (r.isDeleted) return;

      const amt = Number(r.amount) || 0;
      const isCash = r.mode === 'CASH';
      const isOnline = r.mode === 'ONLINE';

      // Staff match conditions
      const isTargetAssigned = (selectedStaffId && r.assignedUserId === selectedStaffId) ||
                              (targetStaffName && (r.assignedUserName || '').trim().toLowerCase() === targetStaffName);

      const isTargetCreator = (selectedStaffId && r.createdByUserId === selectedStaffId) ||
                             (targetStaffName && (r.createdByUserName || '').trim().toLowerCase() === targetStaffName);

      if (r.type === 'INCOME') {
        if (!isStaffFiltered || isTargetAssigned || isTargetCreator) {
          totalIncome += amt;
          if (isCash) cashInHand += amt;
          if (isOnline) onlineBalance += amt;
        }
      } 
      else if (r.type === 'EXPENSE') {
        if (!isStaffFiltered) {
          totalExpense += amt;
          if (isCash) cashInHand -= amt;
          if (isOnline) onlineBalance -= amt;
        } else {
          // Filtered staff jar kharch karnara / entry karnara asel tar tyachya hatatun vaza
          if (isTargetCreator || isTargetAssigned) {
            totalExpense += amt;
            if (isCash || r.mode === 'FROM_ADVANCE') cashInHand -= amt;
            if (isOnline) onlineBalance -= amt;
          }
        }
      } 
      else if (r.type === 'ADVANCE_GIVEN') {
        if (!isStaffFiltered) {
          totalAdvanceGiven += amt;
          if (isCash) cashInHand -= amt;
          if (isOnline) onlineBalance -= amt;
        } else {
          // १. Jar ha advance ya staff la MILAALA asel (e.g. Manish Dalvi): Inflow (+)
          if (isTargetAssigned) {
            totalAdvanceGiven += amt;
            if (isCash) cashInHand += amt;
            if (isOnline) onlineBalance += amt;
          }
          // २. Jar ya staff ne swatachya hatatun dusryala DILA asel (e.g. Sandesh Mahadik): Outflow (-)
          else if (isTargetCreator) {
            totalAdvanceGiven += amt;
            if (isCash) cashInHand -= amt;
            if (isOnline) onlineBalance -= amt;
          }
        }
      }
    });

    // Nivval Shillak (Net Balance Calculation)
    let netBalance = 0;
    if (isStaffFiltered) {
      // User chya personal wallet chi shillak = (Jama + Milaala Advance) - (Kharch + Dusryala Dila Advance)
      netBalance = cashInHand + onlineBalance;
    } else {
      // Sansthechi shillak = Income - Expense
      netBalance = totalIncome - totalExpense;
    }

    return {
      totalIncome,
      totalExpense,
      totalAdvanceGiven,
      advanceSpent,
      remainingAdvanceInMarket: Math.max(0, totalAdvanceGiven - totalExpense),
      netBalance,
      cashInHand,
      onlineBalance
    };
  }
};