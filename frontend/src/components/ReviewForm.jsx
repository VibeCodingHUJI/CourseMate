import React from 'react';
import { Send, X, User, UserCircle, Ghost } from 'lucide-react';

const ReviewForm = ({ 
  comment, grade, semester, year, identityType,
  onCommentChange, onGradeChange, onSemesterChange, onYearChange, onIdentityChange,
  onSubmit, onClose 
}) => {
  const SEMESTERS = [
    { id: 'a', label: 'סמסטר א\'' },
    { id: 'b', label: 'סמסטר ב\'' },
    { id: 's', label: 'סמסטר קיץ' },
  ];

  const IDENTITY_OPTIONS = [
    { id: 'full', label: 'שם מלא', icon: UserCircle },
    { id: 'initials', label: 'ראשי תיבות', icon: User },
    { id: 'anon', label: 'אנונימי/ת', icon: Ghost },
  ];

  return (
    <div className="space-y-8 text-right">
      <div className="flex justify-between items-center flex-row-reverse mb-2">
        <h3 className="text-3xl font-black text-slate-900">הוספת ביקורת</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition-colors">
          <X className="h-8 w-8" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Identity Selection */}
        <div>
          <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 block">איך להציג את שמך?</label>
          <div className="grid grid-cols-3 gap-3">
            {IDENTITY_OPTIONS.map(option => (
              <button
                key={option.id}
                onClick={() => onIdentityChange(option.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${identityType === option.id ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
              >
                <option.icon className="h-6 w-6" />
                <span className="text-xs font-bold">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">ציון (אופציונלי)</label>
            <input 
              type="number" 
              value={grade}
              onChange={(e) => onGradeChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500 transition-all text-right font-bold"
              placeholder="0-100"
            />
          </div>
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">שנת לימוד</label>
            <input 
              type="text" 
              value={year}
              onChange={(e) => onYearChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500 transition-all text-right font-bold"
              placeholder="תשפ״ד"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">סמסטר</label>
          <select 
            value={semester}
            onChange={(e) => onSemesterChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500 transition-all text-right font-bold appearance-none cursor-pointer"
          >
            {SEMESTERS.map(s => (
              <option key={s.id} value={s.label}>{s.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 block">הביקורת שלך</label>
          <textarea 
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-[32px] p-6 h-40 outline-none focus:border-indigo-500 transition-all resize-none text-right font-medium" 
            placeholder="מה דעתך על הקורס? איך היה המבחן?"
          ></textarea>
        </div>

        <button 
          onClick={onSubmit}
          className="w-full bg-indigo-600 text-white py-5 rounded-[28px] font-black text-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-xl shadow-indigo-600/20 mt-4 flex items-center justify-center gap-3"
        >
          <Send className="h-5 w-5" />
          פרסום ביקורת
        </button>
      </div>
    </div>
  );
};

export default ReviewForm;
