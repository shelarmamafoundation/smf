// src/services/financeService.js
import { 
  collection, addDoc, getDocs, updateDoc, 
  doc, query, orderBy, limit, startAfter, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION_NAME = 'finance_records';

export const financeService = {
  // १. इव्हेंट प्रीफिक्स
  getEventPrefix(eventId = '', eventName = '') {
    if (!eventId || eventId === 'general') return 'GEN';

    const slugMap = {
      'aapla-dandiya': 'DND',
      'dahi-handi': 'DHD',
      'shivjayanti': 'SHV',
      'diwali-pahat': 'DWL',
      'cricket-cup': 'CRK',
      'chaitra-navratri': 'CHA'
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

  // ३. ४८ तासांचा एडिट नियम
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

  // ४. पहिल्या २५ नोंदी आणणे (Initial Paginated Fetch)
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

  // ५. पुढील २५ नोंदी लोड करणे (Load More)
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

  // ६. नवीन नोंद सेव्ह करणे
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

    const payload = {
      ...recordData,
      txnId,
      amount: Number(recordData.amount) || 0,
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

  // ७. नोंद अपडेट करणे
  async updateRecord(id, updatedData, currentUser) {
    const docRef = doc(db, COLLECTION_NAME, id);
    const payload = {
      ...updatedData,
      amount: Number(updatedData.amount) || 0,
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

  // ८. सॉफ्ट डिलीट
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

  // ९. एकूण ताळेबंद हिशोब (P&L Engine)
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
          if (isTargetAssigned) {
            totalAdvanceGiven += amt;
            if (isCash) cashInHand += amt;
            if (isOnline) onlineBalance += amt;
          } else if (isTargetCreator) {
            totalAdvanceGiven += amt;
            if (isCash) cashInHand -= amt;
            if (isOnline) onlineBalance -= amt;
          }
        }
      }
    });

    let netBalance = 0;
    if (isStaffFiltered) {
      netBalance = cashInHand + onlineBalance;
    } else {
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