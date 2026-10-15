// src/components/common/AdminFloatingButton.jsx
import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { auth } from '../../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function AdminFloatingButton() {
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Logged in asel tar admin button dakhva
        setIsAdminUser(true);
      } else {
        setIsAdminUser(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!isAdminUser) return null;

  return (
    <Link
      to="/admin"
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-heritage-burgundy text-white font-bold text-xs shadow-lg hover:bg-heritage-crimson transition active:scale-95 border border-white/20"
      title="व्यवस्थापन कक्षात जा (Admin Dashboard)"
    >
      <ShieldCheck className="w-4 h-4 text-amber-300" />
      <span className="hidden sm:inline">Admin Panel</span>
    </Link>
  );
}