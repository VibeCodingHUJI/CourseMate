import React, { useState, useEffect, useRef } from 'react';
import { GraduationCap, ChevronDown, Check, Search, Eye, EyeOff } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AuthPage = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    track: '' // Will store the value (e.g., '521-3010')
  });

  const [studyTracks, setStudyTracks] = useState([]);
  const [trackSearch, setTrackSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch real study tracks on mount
  useEffect(() => {
    fetch(`${API}/api/combinations`)
      .then(res => res.json())
      .then(data => {
        const tracks = Array.isArray(data) ? data : (data.value || []);
        setStudyTracks(Array.isArray(tracks) ? tracks : []);
      })
      .catch(err => {
        console.error('Error fetching combinations:', err);
        setStudyTracks([]);
      });
  }, []);

  const filteredTracks = (Array.isArray(studyTracks) ? studyTracks : []).filter(t => 
    t?.label?.toLowerCase().includes(trackSearch.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (authMode === 'signup' && (!authForm.name || !authForm.email || !authForm.password || !authForm.track)) {
      return alert('נא למלא את כל השדות');
    }

    if (!authForm.email.endsWith('@mail.huji.ac.il')) {
      return alert('נא להשתמש בכתובת אימייל של האוניברסיטה העברית (@mail.huji.ac.il)');
    }

    try {
      const url = authMode === 'signup'
        ? `${API}/api/auth/signup`
        : `${API}/api/auth/login`;
      const body = authMode === 'signup'
        ? { name: authForm.name, email: authForm.email, password: authForm.password, track: authForm.track }
        : { email: authForm.email, password: authForm.password };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error(`שגיאת שרת (${response.status}) — ודאו שהשרת פועל`);
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      onLogin(data);
    } catch (err) {
      alert(err.message || 'שגיאה בהתחברות לשרת');
    }
  };

  const selectedTrackLabel = studyTracks.find(t => t.value === authForm.track)?.label || '';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-[32px] sm:rounded-[40px] shadow-2xl shadow-indigo-500/10 border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="p-6 sm:p-10">
          <div className="flex flex-col items-center mb-8 sm:mb-10">
            <div className="mb-4">
              <img src="/logo.png" alt="CourseMate Logo" className="h-16 w-16 sm:h-20 sm:w-20 object-contain" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">CourseMate</h1>
            </div>
          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
            <button 
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-3 rounded-xl font-black transition-all ${authMode === 'login' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              התחברות
            </button>
            <button 
              onClick={() => setAuthMode('signup')}
              className={`flex-1 py-3 rounded-xl font-black transition-all ${authMode === 'signup' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              הרשמה
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {authMode === 'signup' && (
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block text-right">שם מלא</label>
                <input 
                  type="text" 
                  required
                  value={authForm.name}
                  onChange={(e) => setAuthForm({...authForm, name: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-2xl px-5 py-3.5 outline-none transition-all font-medium text-right"
                  placeholder="ישראל ישראלי"
                />
              </div>
            )}
            
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block text-right">כתובת אימייל</label>
              <input 
                type="email" 
                required
                value={authForm.email}
                onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-2xl px-5 py-3.5 outline-none transition-all font-medium text-right"
                placeholder="name@mail.huji.ac.il"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block text-right">סיסמה</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={authForm.password}
                  onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-2xl px-5 py-3.5 outline-none transition-all font-medium text-right pl-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {authMode === 'signup' && (
              <div className="relative" ref={dropdownRef}>
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block text-right">בחר מסלול לימוד</label>
                <div 
                  className={`w-full bg-slate-50 border-2 border-transparent focus-within:border-indigo-500/20 focus-within:bg-white rounded-2xl px-5 py-3.5 transition-all cursor-pointer flex items-center justify-between gap-2`}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  <div className="flex-1 text-right overflow-hidden">
                    {isDropdownOpen ? (
                      <input 
                        autoFocus
                        type="text"
                        placeholder="חפש מסלול..."
                        value={trackSearch}
                        onChange={(e) => setTrackSearch(e.target.value)}
                        className="bg-transparent outline-none w-full text-right font-medium"
                      />
                    ) : (
                      <span className={`font-medium truncate block ${selectedTrackLabel ? 'text-slate-900' : 'text-slate-400'}`}>
                        {selectedTrackLabel || 'בחר מסלול לימוד'}
                      </span>
                    )}
                  </div>
                </div>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                      {filteredTracks.length > 0 ? (
                        filteredTracks.map(t => (
                          <div 
                            key={t.value}
                            onClick={() => {
                              setAuthForm({...authForm, track: t.value});
                              setTrackSearch('');
                              setIsDropdownOpen(false);
                            }}
                            className="px-6 py-4 hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors group"
                          >
                            {authForm.track === t.value && <Check className="h-4 w-4 text-indigo-600 shrink-0" />}
                            <span className={`font-bold text-right flex-1 text-sm ${authForm.track === t.value ? 'text-indigo-600' : 'text-slate-700 group-hover:text-indigo-600'}`}>
                              {t.label}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="px-6 py-4 text-slate-400 text-sm text-center font-bold">לא נמצאו מסלולים</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}



            <button 
              type="submit"
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all mt-4"
            >
              {authMode === 'login' ? 'כניסה למערכת' : 'יצירת חשבון'}
            </button>
          </form>

          <div className="mt-6">
            <button 
              onClick={() => onLogin({ 
                id: `guest-${Math.random().toString(36).substr(2, 9)}`,
                name: 'אורח/ת', 
                track: 'General', 
                isGuest: true 
              })}
              className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-black text-lg hover:bg-slate-200 active:scale-95 transition-all"
            >
              כניסה כאורח/ת
            </button>
          </div>
        </div>
        <div className="bg-slate-50 p-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 font-medium">בלחיצה על הכפתור, הנך מאשר את תנאי השימוש</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
