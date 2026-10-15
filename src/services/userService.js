// src/services/userService.js
import { collection, doc, getDocs, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { INITIATIVES_DATA } from '../data/initiativesData';

const STORAGE_KEY = 'smf_users_v3';
const CACHE_TIME_KEY = 'smf_users_cache_time';
const CACHE_EXPIRY_MS = 10 * 60 * 1000; // 10 मिनिटे कॅश (Reads वाचवण्यासाठी)

export const SYSTEM_MODULES = [
  {
    id: 'events',
    labelMr: 'इव्हेंट्स व फोटो गॅलरी',
    descMr: 'इव्हेंट माहिती, वर्ष आणि १० फोटो स्लॉट्स व्यवस्थापन'
  },
  {
    id: 'finance',
    labelMr: 'जमा-खर्च (Income & Expenses)',
    descMr: 'हिशोब नोंदी, बिल अपलोड आणि ताळेबंद अहवाल'
  },
  {
    id: 'userManagement',
    labelMr: 'युजर मॅनेजमेंट (User Access)',
    descMr: 'नवीन प्रतिनिधींना अधिकार व परवानग्या देणे'
  }
];

export const userService = {
  // 1. स्मार्ट कॅश + Firestore Fetch (Reads वाचवण्यासाठी)
  async getUsers(forceRefresh = false) {
    const cachedData = localStorage.getItem(STORAGE_KEY);
    const lastCacheTime = parseInt(localStorage.getItem(CACHE_TIME_KEY) || '0', 10);
    const isCacheValid = Date.now() - lastCacheTime < CACHE_EXPIRY_MS;

    // जर कॅश वैध असेल आणि फोर्स रिफ्रेश नसेल, तर 0 Firestore Reads!
    if (!forceRefresh && cachedData && isCacheValid) {
      try {
        return JSON.parse(cachedData);
      } catch (e) {
        console.error("Cache read failed", e);
      }
    }

    try {
      // फक्त कॅश एक्स्पायर झाल्यावर किंवा रिफ्रेश मागितल्यावरच Firestore वरून आणणे
      const querySnapshot = await getDocs(collection(db, 'users'));
      const fetchedUsers = [];
      querySnapshot.forEach((docSnap) => {
        fetchedUsers.push({
          id: docSnap.id,
          ...docSnap.data()
        });
      });

      // कॅश अपडेट करा
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fetchedUsers));
      localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
      return fetchedUsers;
    } catch (err) {
      console.warn("Firestore fetch offline fallback:", err);
      return cachedData ? JSON.parse(cachedData) : [];
    }
  },

  // ऑफलाइन सिंक्रोनायझेशनसाठी सिंक्रोनस पद्धत
  getUsersSync() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  // 2. नवीन युजर तयार करून थेट Firestore मध्ये पाठवणे (फक्त 1 Write)
  async createUser(userData) {
    const emailKey = userData.email.trim().toLowerCase();
    const cleanId = emailKey.replace(/[^a-zA-Z0-9]/g, '_'); // ईमेल आधारित स्वच्छ Document ID

    const newUserPayload = {
      name: userData.name.trim(),
      email: emailKey,
      phone: userData.phone ? userData.phone.trim() : '',
      isSuperAdmin: Boolean(userData.isSuperAdmin),
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: serverTimestamp(),
      permissions: userData.isSuperAdmin ? {
        events: { canView: true, canEdit: true, scope: 'all' },
        finance: { canView: true, canEdit: true, scope: 'all' },
        userManagement: { canView: true, canEdit: true }
      } : (userData.permissions || {
        events: { canView: true, canEdit: false, scope: [] },
        finance: { canView: false, canEdit: false, scope: [] },
        userManagement: { canView: false, canEdit: false }
      })
    };

    // थेट Firestore मध्ये 1 डॉक्युमेंट Write करा
    await setDoc(doc(db, 'users', cleanId), newUserPayload, { merge: true });

    // UI तात्काळ अपडेट होण्यासाठी लोकल कॅशमध्ये बदल
    const currentList = this.getUsersSync();
    const updatedList = [{ id: cleanId, ...newUserPayload }, ...currentList.filter(u => u.id !== cleanId)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

    return { id: cleanId, ...newUserPayload };
  },

  // 3. युजरचे अधिकार बदलणे (फक्त 1 Document Write)
  async updateUser(userId, updatedData) {
    const emailKey = updatedData.email.trim().toLowerCase();
    const updatePayload = {
      name: updatedData.name.trim(),
      email: emailKey,
      phone: updatedData.phone ? updatedData.phone.trim() : '',
      isSuperAdmin: Boolean(updatedData.isSuperAdmin),
      updatedAt: serverTimestamp(),
      permissions: updatedData.isSuperAdmin ? {
        events: { canView: true, canEdit: true, scope: 'all' },
        finance: { canView: true, canEdit: true, scope: 'all' },
        userManagement: { canView: true, canEdit: true }
      } : updatedData.permissions
    };

    // Firestore मध्ये अपडेट
    await setDoc(doc(db, 'users', userId), updatePayload, { merge: true });

    // लोकल कॅश अपडेट
    const currentList = this.getUsersSync();
    const updatedList = currentList.map(u => u.id === userId ? { ...u, ...updatePayload } : u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

    return updatedList;
  },

  // 4. युजर काढून टाकणे (1 Delete Call)
  async deleteUser(userId) {
    const currentList = this.getUsersSync();
    const target = currentList.find(u => u.id === userId);
    const superAdmins = currentList.filter(u => u.isSuperAdmin);

    if (target?.isSuperAdmin && superAdmins.length <= 1) {
      throw new Error('किमान एक सुपर ॲडमिन असणे अनिवार्य आहे!');
    }

    // Firestore मधून डॉक्युमेंट डिलीट
    await deleteDoc(doc(db, 'users', userId));

    // कॅशमधून काढणे
    const updatedList = currentList.filter(u => u.id !== userId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    return updatedList;
  },

  // परमिशन तपासणी (शून्य डेटाबेस कॉल्स)
  hasPermission(user, moduleName, action = 'view', eventId = null) {
    if (!user) return false;
    if (user.isSuperAdmin) return true;

    const modPerm = user.permissions?.[moduleName];
    if (!modPerm) return false;

    if (action === 'view' && !modPerm.canView) return false;
    if (action === 'edit' && !modPerm.canEdit) return false;

    if (eventId && modPerm.scope) {
      if (modPerm.scope === 'all') return true;
      if (Array.isArray(modPerm.scope)) return modPerm.scope.includes(eventId);
      return false;
    }

    return true;
  }
};