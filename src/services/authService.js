// src/services/authService.js
import { signInWithPopup, signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';

export const authService = {
  getCurrentUser() {
    try {
      const data = localStorage.getItem('smf_logged_in_user');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async loginWithGoogle() {
    try {
      // 1. Google Popup Open करणे
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const userEmail = fbUser.email?.toLowerCase().trim();

      // 2. थेट Firestore Database मधून तपासणे (Zero Hardcode)
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', userEmail), where('status', '==', 'active'));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // जर डेटाबेसमध्ये ईमेल नसेल तर त्वरित साइन आउट करणे
        await signOut(auth);
        return {
          success: false,
          message: `या (${userEmail}) ईमेलला डेटाबेसमध्ये परमिशन नाही. कृपया आधी सुपर ॲडमिनकडून नोंद करून घ्या.`
        };
      }

      // 3. डेटाबेसमधील युजर डेटा मिळवणे
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      const sessionUser = {
        id: userDoc.id,
        name: userData.name || fbUser.displayName,
        email: userData.email,
        photoURL: fbUser.photoURL || '',
        isSuperAdmin: Boolean(userData.isSuperAdmin),
        permissions: userData.permissions || {}
      };

      // फास्ट UI साठी लोकल कॅशमध्ये सेव्ह करणे
      localStorage.setItem('smf_logged_in_user', JSON.stringify(sessionUser));
      return { success: true, user: sessionUser };

    } catch (err) {
      console.error('Google Sign-In Error:', err);
      return {
        success: false,
        message: err.message || 'लॉगिन करताना त्रुटी आली.'
      };
    }
  },

  async logout() {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem('smf_logged_in_user');
    window.location.href = `${import.meta.env.BASE_URL}login`;
  }
};