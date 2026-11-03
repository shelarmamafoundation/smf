// src/services/committeeService.js
import { db } from '../config/firebase';
import { 
  collection, addDoc, getDocs, doc, deleteDoc, updateDoc, 
  query, where, setDoc, getDoc, serverTimestamp 
} from 'firebase/firestore';

const COMMITTEE_META_COLLECTION = 'committee_configs';
const MEMBERS_COLLECTION = 'committee_members';

export const committeeService = {
  // १. समिती कोटा आणि माहिती आणणे
  async getCommitteeConfig(eventId, year) {
    try {
      const configDocId = `${eventId}_${year}`;
      const docSnap = await getDoc(doc(db, COMMITTEE_META_COLLECTION, configDocId));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (err) {
      console.error('माहिती लोड करताना अडचण:', err);
      return null;
    }
  },

  async saveCommitteeConfig(eventId, year, configData) {
    const configDocId = `${eventId}_${year}`;
    await setDoc(doc(db, COMMITTEE_META_COLLECTION, configDocId), {
      eventId,
      year: String(year),
      title: configData.title || '',
      targetCount: Number(configData.targetCount) || 21,
      updatedAt: serverTimestamp()
    }, { merge: true });
  },

  // २. सर्व सदस्यांची यादी मिळवणे
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
      console.error('सदस्य यादी लोड करताना त्रुटी:', err);
      return [];
    }
  },

  // ३. एकाच वेळी अनेक सदस्य जोडणे (Bulk Insert)
  async addBulkMembers(membersList = []) {
    const promises = membersList.map((data, idx) => {
      return addDoc(collection(db, MEMBERS_COLLECTION), {
        eventId: data.eventId,
        year: String(data.year),
        name: data.name.trim(),
        role: data.role.trim(),
        gender: data.gender || 'MALE',
        photoUrl: data.photoUrl || '/assets/team/default.jpg',
        order: Number(data.order) || idx + 1,
        createdAt: serverTimestamp()
      });
    });
    const results = await Promise.all(promises);
    return results.map((docRef, idx) => ({ id: docRef.id, ...membersList[idx] }));
  },

  // ४. एक-एक सदस्य जोडणे
  async addMember(data) {
    const docRef = await addDoc(collection(db, MEMBERS_COLLECTION), {
      eventId: data.eventId,
      year: String(data.year),
      name: data.name.trim(),
      role: data.role.trim(),
      gender: data.gender || 'MALE',
      photoUrl: data.photoUrl || '/assets/team/default.jpg',
      order: Number(data.order) || 1,
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, ...data };
  },

  // ५. फोटो अपडेट करणे
  async updateMemberPhoto(memberId, photoUrl) {
    const docRef = doc(db, MEMBERS_COLLECTION, memberId);
    await updateDoc(docRef, {
      photoUrl,
      updatedAt: serverTimestamp()
    });
  },

  // ६. सदस्य डिलीट करणे
  async deleteMember(id) {
    await deleteDoc(doc(db, MEMBERS_COLLECTION, id));
  }
};