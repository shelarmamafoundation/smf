// src/services/dbService.js
import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';

const LOCAL_USERS_KEY = 'smf_cached_users';
const LOCAL_GALLERY_KEY = 'smf_cached_gallery';

export const dbService = {
  
  // ================= USERS MODULE ================= //
  async fetchUsers(forceRefresh = false) {
    if (!forceRefresh) {
      const cached = localStorage.getItem(LOCAL_USERS_KEY);
      if (cached) return JSON.parse(cached);
    }

    try {
      const snap = await getDocs(collection(db, 'users'));
      const usersList = [];
      snap.forEach(d => usersList.push({ id: d.id, ...d.data() }));
      
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(usersList));
      return usersList;
    } catch (e) {
      console.warn("Offline fallback users:", e);
      return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
    }
  },

  async saveUser(user) {
    const userRef = doc(db, 'users', user.id);
    const dataToSave = {
      ...user,
      updatedAt: serverTimestamp()
    };
    await setDoc(userRef, dataToSave, { merge: true });

    // Local cache update
    const current = await this.fetchUsers(false);
    const updated = current.some(u => u.id === user.id)
      ? current.map(u => u.id === user.id ? { ...u, ...user } : u)
      : [user, ...current];
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(updated));
  },

  async deleteUser(userId) {
    await deleteDoc(doc(db, 'users', userId));
    const current = await this.fetchUsers(false);
    const filtered = current.filter(u => u.id !== userId);
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(filtered));
  },

  // ================= 10-SLOT GALLERY MODULE ================= //
  async getEventGallery(eventId, year) {
    const docKey = `${eventId}_${year}`;
    const cacheKey = `${LOCAL_GALLERY_KEY}_${docKey}`;
    
    const cached = localStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);

    try {
      const snap = await getDoc(doc(db, 'events_gallery', docKey));
      if (snap.exists()) {
        const data = snap.data();
        localStorage.setItem(cacheKey, JSON.stringify(data));
        return data;
      }
      return { eventId, year, slots: [] };
    } catch (e) {
      return { eventId, year, slots: [] };
    }
  },

  async updateGallerySlot(eventId, year, slotNo, photoUrl, metaTitle = '') {
    const docKey = `${eventId}_${year}`;
    const cacheKey = `${LOCAL_GALLERY_KEY}_${docKey}`;
    const existing = await this.getEventGallery(eventId, year);

    let updatedSlots = [...(existing.slots || [])];
    const index = updatedSlots.findIndex(s => s.slotNo === slotNo);

    const slotPayload = {
      slotNo,
      url: photoUrl,
      title: metaTitle,
      updatedAt: new Date().toISOString()
    };

    if (index >= 0) {
      updatedSlots[index] = slotPayload;
    } else {
      updatedSlots.push(slotPayload);
    }

    // Sort 1 te 10 slots
    updatedSlots.sort((a, b) => a.slotNo - b.slotNo);

    const fullPayload = {
      eventId,
      year,
      slots: updatedSlots,
      updatedAt: serverTimestamp()
    };

    await setDoc(doc(db, 'events_gallery', docKey), fullPayload, { merge: true });
    localStorage.setItem(cacheKey, JSON.stringify(fullPayload));
    return fullPayload;
  }
};