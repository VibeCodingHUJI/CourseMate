import React, { useState } from 'react';
import { GraduationCap } from 'lucide-react';

const AuthPage = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    track: 'Computer Science'
  });

  const STUDY_TRACKS = [
    { id: 'cs', label: 'מדעי המחשב', value: 'Computer Science' },
    { id: 'ba', label: 'מנהל עסקים', value: 'Business Administration' },
    { id: 'eco', label: 'כלכלה', value: 'Economics' },
    { id: 'psy', label: 'פסיכולוגיה', value: 'Psychology' },
    { id: 'oth', label: 'אחר', value: 'Other' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (authMode === 'signup' && (!authForm.name || !authForm.email || !authForm.password)) {
      return alert('נא למלא את כל השדות');
    }
    const userData = {
      name: authMode === 'signup' ? authForm.name : 'סטודנט חוזר',
      email: authForm.email,
      track: authForm.track,
      isGuest: false
    };
    onLogin(userData);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl shadow-indigo-500/10 border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="p-10">
          <div className="flex flex-col items-center mb-10">
            <div className="bg-indigo-600 p-4 rounded-3xl mb-4 shadow-xl shadow-indigo-600/20">
              < GraduationCap className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">ReviewUni</h1>
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
                placeholder="name@university.ac.il"
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
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block text-right">מסלול לימוד</label>
                <select 
                  value={authForm.track}
                  onChange={(e) => setAuthForm({...authForm, track: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-2xl px-5 py-3.5 outline-none transition-all font-medium appearance-none cursor-pointer text-right"
                >
                  {STUDY_TRACKS.map(t => (
                    <option key={t.id} value={t.value}>{t.label}</option>
                  ))}
                </select>
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
              onClick={() => onLogin({ name: 'אורח/ת', track: 'General', isGuest: true })}
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
