import React, { useState, useEffect, useRef } from 'react';
import { GraduationCap, ChevronDown, Check, Search } from 'lucide-react';

const AuthPage = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    track: '' // Will store the value (e.g., 'Computer Science')
  });

  const [trackSearch, setTrackSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const STUDY_TRACKS = [
    { id: 'cs', label: 'מדעי המחשב', value: 'Computer Science' },
    { id: 'ba', label: 'מנהל עסקים', value: 'Business Administration' },
    { id: 'eco', label: 'כלכלה', value: 'Economics' },
    { id: 'psy', label: 'פסיכולוגיה', value: 'Psychology' },
    { id: 'oth', label: 'אחר', value: 'Other' },
  ];

  const filteredTracks = STUDY_TRACKS.filter(t => 
    t.label.toLowerCase().includes(trackSearch.toLowerCase())
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
      if (authMode === 'signup') {
        const checkRes = await fetch(`http://localhost:3000/users?email=${authForm.email}`);
        const existingUsers = await checkRes.json();
        if (existingUsers.length > 0) {
          throw new Error('משתמש עם אימייל זה כבר קיים במערכת');
        }

        const response = await fetch(`http://localhost:3000/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...authForm, isGuest: false })
        });
        const data = await response.json();
        onLogin(data);
      } else {
        const response = await fetch(`http://localhost:3000/users?email=${authForm.email}&password=${authForm.password}`);
        const users = await response.json();

        if (users.length === 0) {
          throw new Error('אימייל או סיסמה שגויים');
        }

        onLogin(users[0]);
      }
    } catch (err) {
      if (err.message.includes('Failed to fetch')) {
        alert('לא ניתן להתחבר לשרת הנתונים. וודאו ש-json-server פועל.');
      } else {
        alert(err.message);
      }
    }
  };

  const selectedTrackLabel = STUDY_TRACKS.find(t => t.value === authForm.track)?.label || '';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl shadow-indigo-500/10 border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="p-10">
          <div className="flex flex-col items-center mb-10">
            <div className="bg-indigo-600 p-4 rounded-3xl mb-4 shadow-xl shadow-indigo-600/20">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">CourseMate</h1>
            <p className="text-slate-400 font-bold mt-2 text-center">ברוכים הבאים לקהילת הסטודנטים</p>
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
              <input 
                type="password" 
                required
                value={authForm.password}
                onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-2xl px-5 py-3.5 outline-none transition-all font-medium text-right"
                placeholder="••••••••"
              />
            </div>

            {authMode === 'signup' && (
              <div className="relative" ref={dropdownRef}>
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block text-right">בחר מסלול לימוד</label>
                <div 
                  className={`w-full bg-slate-50 border-2 border-transparent focus-within:border-indigo-500/20 focus-within:bg-white rounded-2xl px-5 py-3.5 transition-all cursor-pointer flex items-center justify-between gap-2`}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  <input 
                    type="text"
                    placeholder="חפש מסלול..."
                    value={isDropdownOpen ? trackSearch : (selectedTrackLabel || 'בחר מסלול לימוד')}
                    readOnly={!isDropdownOpen}
                    onChange={(e) => setTrackSearch(e.target.value)}
                    onFocus={() => setIsDropdownOpen(true)}
                    className="bg-transparent outline-none w-full text-right font-medium cursor-pointer"
                  />
                </div>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                      {filteredTracks.length > 0 ? (
                        filteredTracks.map(t => (
                          <div 
                            key={t.id}
                            onClick={() => {
                              setAuthForm({...authForm, track: t.value});
                              setTrackSearch('');
                              setIsDropdownOpen(false);
                            }}
                            className="px-6 py-4 hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors group"
                          >
                            {authForm.track === t.value && <Check className="h-4 w-4 text-indigo-600" />}
                            <span className={`font-bold text-right flex-1 ${authForm.track === t.value ? 'text-indigo-600' : 'text-slate-700 group-hover:text-indigo-600'}`}>
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

            {authMode === 'login' && (
              <div className="flex items-center gap-2 justify-start mt-2">
                <input 
                  type="checkbox" 
                  id="rememberMe"
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="rememberMe" className="text-xs font-bold text-slate-500 cursor-pointer">זכור אותי</label>
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
