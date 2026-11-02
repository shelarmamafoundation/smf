// src/services/committeeService.js
import { db } from '../config/firebase';
import { 
  collection, addDoc, getDocs, doc, deleteDoc, updateDoc, 
  query, where, setDoc, getDoc, serverTimestamp 
} from 'firebase/firestore';

const COMMITTEE_META_COLLECTION = 'committee_configs';
const MEMBERS_COLLECTION = 'committee_members';

export const committeeService = {
  // 1. Committee Meta Setup aanne kinva save karne (Target members count, event, year)
  async getCommitteeConfig(eventId, year) {
    try {
      const configDocId = `${eventId}_${year}`;
      const docSnap = await getDoc(doc(db, COMMITTEE_META_COLLECTION, configDocId));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (err) {
      console.error('Config fetch error:', err);
      return null;
    }
  },

  async saveCommitteeConfig(eventId, year, configData) {
    const configDocId = `${eventId}_${year}`;
    await setDoc(doc(db, COMMITTEE_META_COLLECTION, configDocId), {
      eventId,
      year: String(year),
      title: configData.title || '',
      targetCount: Number(configData.targetCount) || 21, // 15 kiva 21
      updatedAt: serverTimestamp()
    }, { merge: true });
  },

  // 2. Members List aanne
  async getMembers(eventId, year) {
    try {
      const q = query(
        collection(db, MEMBERS_COLLECTION),
        where('eventId', '==', eventId),
        where('year', '==', String(year))
      );
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      return list.sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99));
    } catch (err) {
      console.error('Members fetch error:', err);
      return [];
    }
  },

  // 3. Member add karne (Gender: 'MALE' | 'FEMALE')
  async addMember(data) {
    const docRef = await addDoc(collection(db, MEMBERS_COLLECTION), {
      eventId: data.eventId,
      year: String(data.year),
      name: data.name.trim(),
      role: data.role.trim(),
      gender: data.gender || 'MALE', // 'MALE' | 'FEMALE'
      photoUrl: data.photoUrl || '/assets/team/default.jpg',
      order: Number(data.order) || 1,
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, ...data };
  },

  async deleteMember(id) {
    await deleteDoc(doc(db, MEMBERS_COLLECTION, id));
  }
};