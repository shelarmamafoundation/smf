// src/pages/public/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { authService } from '../../services/authService';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const base = import.meta.env.BASE_URL;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    const res = await authService.loginWithGoogle();
    setLoading(false);

    if (res.success) {
      navigate('/admin');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#1F040A] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-md w-full bg-white/5 border border-amber-500/30 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl relative z-10 text-center">
        
        <button 
          onClick={() => navigate('/')} 
          className="inline-flex items-center gap-1.5 text-xs text-gray-300 hover:text-amber-300 mb-6 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>मुख्य पानावर परत जा</span>
        </button>

        <div className="w-20 h-20 mx-auto rounded-full p-1 bg-gradient-to-tr from-amber-400 to-amber-200 shadow-xl mb-4">
          <img 
            src={`${base}logo.jpg`} 
            alt="Shelarmama Foundation" 
            className="w-full h-full object-cover rounded-full bg-black"
            onError={(e) => { e.target.src = `${base}logo.png`; }}
          />
        </div>

        <h2 className="text-2xl font-black text-white tracking-wide">
          व्यवस्थापन कक्ष
        </h2>
        <p className="text-xs text-gray-300 mt-1 mb-6">
          शेलारमामा फाऊंडेशन • अधिकृत ॲडमिन व कार्यकर्ता लॉगिन
        </p>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-start gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-gray-100 text-gray-900 font-bold text-sm shadow-xl flex items-center justify-center gap-3 transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
          )}
          <span>{loading ? 'प्रमाणीकरण सुरू आहे...' : 'Google ने लॉगिन करा'}</span>
        </button>

        <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-center gap-1.5 text-gray-400 text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>केवळ अधिकृत प्रतिनिधींसाठी सुरक्षित प्रवेश</span>
        </div>

      </div>
    </div>
  );
}