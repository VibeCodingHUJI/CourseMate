import React from 'react';
import { Send, X, User, UserCircle, Ghost } from 'lucide-react';

const ReviewForm = ({ 
  comment, semester, year, identityType, attendanceEnforced, difficulty,
  onCommentChange, onSemesterChange, onYearChange, onIdentityChange, onAttendanceChange, onDifficultyChange,
  onSubmit, onClose, hasRated
}) => {
  const getDifficultyText = (val) => {
    if (val <= 2) return "קל מאוד";
    if (val === 3) return "קל";
    if (val <= 7) return "בינוני";
    if (val <= 9) return "קשה";
    return "קשה מאוד";
  };

  // Parsing the existing comment if it was already partially filled
  // but usually this is a fresh state. We'll add local state for the parts.
  const SEMESTERS = [
    { id: 'a', label: "סמסטר א'" },
    { id: 'b', label: "סמסטר ב'" },
    { id: 's', label: 'סמסטר קיץ' },
    { id: 'y', label: 'שנתי' },
  ];

  const ACADEMIC_YEARS = [
    { id: '5786', label: 'תשפ"ו (2025-26)' },
    { id: '5785', label: 'תשפ"ה (2024-25)' },
    { id: '5784', label: 'תשפ"ד (2023-24)' },
    { id: '5783', label: 'תשפ"ג (2022-23)' },
  ];

  const IDENTITY_OPTIONS = [
    { id: 'full_name', label: 'שם מלא', icon: UserCircle },
    { id: 'initials', label: 'ראשי תיבות', icon: User },
    { id: 'anonymous', label: 'אנונימי/ת', icon: Ghost },
  ];

  const placeholderText = "ספרו בקצרה על החוויה שלכם מהקורס.";

  const wordCount = comment.trim() ? comment.trim().split(/\s+/).length : 0;
  const isOverLimit = wordCount > 200;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative" style={{ direction: 'rtl' }}>
      {/* Right Column: Info & Settings */}
      <div className="flex flex-col text-right">
        <div className="flex items-center gap-4 mb-2">
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-rose-500 transition-colors shrink-0"
            title="סגור"
          >
            <X className="h-8 w-8" />
          </button>
          <div className="text-right">
            <h3 className="text-4xl font-black text-slate-900 leading-tight">הוספת ביקורת</h3>
          </div>
        </div>
        <p className="text-slate-500 font-bold mb-8 text-lg mr-12">ספרו על הקורס מהחוויה שלכם בצורה בונה ומלמדת</p>

        <div className="space-y-6 pr-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-black uppercase tracking-widest text-slate-400 mb-2 block">סמסטר</label>
              <select 
                value={semester}
                onChange={(e) => onSemesterChange(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-3 py-3.5 outline-none focus:border-indigo-500 focus:bg-white transition-all text-right font-bold text-sm appearance-none cursor-pointer"
              >
                {SEMESTERS.map(s => (
                  <option key={s.id} value={s.label}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-black uppercase tracking-widest text-slate-400 mb-2 block">שנת לימוד</label>
              <select 
                value={year}
                onChange={(e) => onYearChange(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-3 py-3.5 outline-none focus:border-indigo-500 focus:bg-white transition-all text-right font-bold text-sm appearance-none cursor-pointer"
              >
                {ACADEMIC_YEARS.map(y => (
                  <option key={y.id} value={y.label}>{y.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-black uppercase tracking-widest text-slate-400 mb-3 block">איך להציג את שמך?</label>
            <div className="grid grid-cols-3 gap-3">
              {IDENTITY_OPTIONS.map(option => (
                <button
                  key={option.id}
                  onClick={() => onIdentityChange(option.id)}
                  className={`flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-2xl border-2 transition-all ${identityType === option.id ? 'border-indigo-600 bg-indigo-50 text-indigo-600 font-bold' : 'border-slate-100 text-slate-400 hover:border-slate-200 font-medium'}`}
                >
                  <option.icon className="h-6 w-6" />
                  <span className="text-[10px] font-black uppercase tracking-tight">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 relative">
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-black text-slate-700 block">רמת קושי הקורס (1-10)</label>
              {hasRated && <span className="text-[10px] font-black text-amber-500 bg-amber-50 px-2 py-1 rounded-lg">כבר דירגת רכיב זה בעבר.</span>}
            </div>
            <div className="flex items-center gap-6">
              <input 
                type="range" 
                min="1" 
                max="10" 
                step="1"
                value={difficulty}
                onChange={(e) => onDifficultyChange(parseInt(e.target.value))}
                disabled={hasRated}
                className={`flex-1 h-3 bg-slate-200 rounded-lg appearance-none accent-rose-500 ${hasRated ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              />
              <div className={`h-12 w-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center font-black text-xl border-2 border-rose-100 shadow-sm shrink-0 ${hasRated ? 'opacity-50' : ''}`}>
                {difficulty}
              </div>
            </div>
            <div className="flex justify-between mt-2 px-1">
              <span className={`text-[10px] font-black uppercase tracking-tighter ${hasRated ? 'text-slate-300' : 'text-slate-400'}`}>קל מאוד</span>
              <span className={`text-[10px] font-black uppercase tracking-tighter ${hasRated ? 'text-rose-300' : 'text-rose-600'}`}>
                {getDifficultyText(difficulty)}
              </span>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 relative">
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-black text-slate-700 block">האם נבדקה נוכחות?</label>
              {hasRated && <span className="text-[10px] font-black text-amber-500 bg-amber-50 px-2 py-1 rounded-lg">כבר דירגת רכיב זה בעבר.</span>}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: true, label: 'כן', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
                { id: false, label: 'לא', color: 'bg-rose-50 text-rose-600 border-rose-100' },
                { id: null, label: 'לא יודע/ת', color: 'bg-slate-100 text-slate-500 border-slate-200' }
              ].map(option => (
                <button
                  key={String(option.id)}
                  onClick={() => onAttendanceChange(option.id)}
                  disabled={hasRated}
                  className={`py-3 rounded-xl font-black text-[10px] border-2 transition-all ${
                    attendanceEnforced === option.id 
                      ? `${option.id === true ? 'bg-emerald-600' : option.id === false ? 'bg-rose-600' : 'bg-slate-600'} text-white border-transparent shadow-md` 
                      : `${option.color} hover:shadow-sm`
                  } ${hasRated ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Left Column: Unified Comment Area */}
      <div className="flex flex-col">
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-black text-slate-700">תוכן הביקורת</label>
            <span className={`text-[10px] font-black uppercase tracking-widest ${isOverLimit ? 'text-rose-500' : 'text-slate-400'}`}>
              {wordCount} / 200 מילים
            </span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 mb-3 text-right">
            האם החומר מורכב להבנה? כמה השקעה הקורס דורש? האם המבחן/העבודה היה הוגן? טיפים לסטודנטים אחרים...
          </p>
          <textarea 
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            className={`w-full bg-slate-50 border-2 rounded-3xl p-6 outline-none focus:bg-white transition-all resize-none text-right font-medium text-slate-600 h-48 overflow-y-auto ${isOverLimit ? 'border-rose-200 focus:border-rose-500' : 'border-slate-100 focus:border-indigo-500'}`}
            placeholder={placeholderText}
          ></textarea>
          {isOverLimit && (
            <p className="text-[10px] text-rose-500 font-bold mt-2 text-right italic">שימו לב: חרגתם ממכסת המילים (מקסימום 200)</p>
          )}
        </div>
        
        <div className="mt-4">
          <button 
            onClick={onSubmit}
            disabled={isOverLimit || !comment.trim()}
            className={`w-full py-6 rounded-[32px] font-black text-xl transition-all shadow-xl flex items-center justify-center gap-4 ${isOverLimit || !comment.trim() ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-indigo-600/20'}`}
          >
            <Send className="h-6 w-6" />
            פרסום ביקורת
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewForm;
