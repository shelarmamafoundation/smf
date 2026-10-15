// src/services/initiativeService.js
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const initiativeService = {
  // 1. Upkramache uplabdh asleli varsha shodhne (Dynamic Year Discovery)
  async getAvailableYears(initiativeId) {
    const cacheKey = `smf_years_${initiativeId}`;
    const cached = localStorage.getItem(cacheKey);

    try {
      const q = query(
        collection(db, 'initiatives_years'),
        where('initiativeId', '==', initiativeId)
      );
      const snap = await getDocs(q);
      const years = snap.docs
        .map(d => d.data().year)
        .filter(Boolean)
        .sort((a, b) => Number(b) - Number(a));

      if (years.length > 0) {
        localStorage.setItem(cacheKey, JSON.stringify(years));
        return years;
      }
      return cached ? JSON.parse(cached) : [new Date().getFullYear().toString()];
    } catch (err) {
      console.warn("Offline fallback for years:", err);
      return cached ? JSON.parse(cached) : [new Date().getFullYear().toString()];
    }
  },

  // 2. Tharavik varshachi mahiti aani photo slots milavne
  async getYearGallery(initiativeId, year) {
    const cacheKey = `smf_gallery_${initiativeId}_${year}`;
    const cached = localStorage.getItem(cacheKey);

    try {
      const docRef = doc(db, 'initiatives_years', `${initiativeId}_${year}`);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const data = snap.data();
        localStorage.setItem(cacheKey, JSON.stringify(data));
        return data;
      }
      return cached ? JSON.parse(cached) : null;
    } catch (err) {
      console.warn("Offline fallback for gallery:", err);
      return cached ? JSON.parse(cached) : null;
    }
  },

  // 3. Mahiti aani photos save karne (Fakt 1 Firestore write)
  async saveYearGallery(initiativeId, year, payload) {
    const docRef = doc(db, 'initiatives_years', `${initiativeId}_${year}`);
    
    const dataToSave = {
      initiativeId,
      year: String(year),
      eventDate: payload.eventDate || '',
      headlineMr: payload.headlineMr || '',
      descriptionMr: payload.descriptionMr || '',
      slots: payload.slots || [],
      updatedAt: serverTimestamp()
    };

    await setDoc(docRef, dataToSave, { merge: true });

    // Local cache update
    localStorage.setItem(`smf_gallery_${initiativeId}_${year}`, JSON.stringify(dataToSave));

    // Update years cache
    const yearsKey = `smf_years_${initiativeId}`;
    const existingYears = JSON.parse(localStorage.getItem(yearsKey) || '[]');
    if (!existingYears.includes(String(year))) {
      existingYears.push(String(year));
      existingYears.sort((a, b) => Number(b) - Number(a));
      localStorage.setItem(yearsKey, JSON.stringify(existingYears));
    }

    return dataToSave;
  }
};