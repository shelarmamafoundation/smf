//\src\services\formSettingsService.js

import { db } from '../config/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const SETTINGS_COLLECTION = 'settings';
const EVENT_FORMS_DOC = 'event_forms';

const defaultSettings = {
  saapshidi: {
    status: 'active', // 'active' | 'upcoming' | 'closed'
    title: 'भव्य सापशिडी स्पर्धा २०२६',
    startDate: '', // e.g. "१ नोव्हेंबर २०२६, सायं. ६:०० वा."
    closedMessage: 'सापशिडी स्पर्धेची ऑनलाइन नोंदणी आता पूर्णपणे बंद झाली आहे.'
  },
  dandiya: {
    status: 'closed',
    title: 'आपला दांडिया २०२६',
    startDate: '',
    closedMessage: 'दांडिया महोत्सव संपन्न झाला असून नोंदणी बंद करण्यात आली आहे.'
  }
};

export const formSettingsService = {
  async getSettings() {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, EVENT_FORMS_DOC);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return snapshot.data();
      }
      await setDoc(docRef, defaultSettings);
      return defaultSettings;
    } catch (err) {
      console.error('Error fetching form settings:', err);
      return defaultSettings;
    }
  },

  subscribeSettings(callback) {
    const docRef = doc(db, SETTINGS_COLLECTION, EVENT_FORMS_DOC);
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data());
      } else {
        setDoc(docRef, defaultSettings);
        callback(defaultSettings);
      }
    }, (err) => {
      console.error('Settings subscription error:', err);
      callback(defaultSettings);
    });
  },

  async updateFormStatus(formKey, newStatus, startDate = '', closedMessage = '') {
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, EVENT_FORMS_DOC);
      const current = await this.getSettings();
      const updated = {
        ...current,
        [formKey]: {
          ...(current[formKey] || {}),
          status: newStatus,
          isOpen: newStatus === 'active',
          ...(startDate !== undefined ? { startDate } : {}),
          ...(closedMessage !== undefined ? { closedMessage } : {})
        }
      };
      await setDoc(docRef, updated, { merge: true });
      return { success: true };
    } catch (err) {
      console.error('Error updating form status:', err);
      alert('Firebase Error: ' + err.message);
      return { success: false, error: err.message };
    }
  }
};