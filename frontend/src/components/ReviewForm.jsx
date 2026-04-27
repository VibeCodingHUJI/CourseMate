import React from 'react';
import { Send, X, User, UserCircle, Ghost } from 'lucide-react';

const ReviewForm = ({ 
  comment, semester, year, identityType,
  onCommentChange, onSemesterChange, onYearChange, onIdentityChange,
  onSubmit, onClose 
}) => {
  // Parsing the existing comment if it was already partially filled
  // but usually this is a fresh state. We'll add local state for the parts.
  const [parts, setParts] = React.useState({
    lecturer: '',
    difficulty: '',
    investment: '',
    exam: '',
    general: ''
  });

  const updatePart = (key, value) => {
    const newParts = { ...parts, [key]: value };
    setParts(newParts);
    
    // Combine all non-empty parts into a single string
    const combined = [
      newParts.lecturer && `מרצה: ${newParts.lecturer}`,
      newParts.difficulty && `רמת קושי: ${newParts.difficulty}`,
      newParts.investment && `השקעה נדרשת: ${newParts.investment}`,
      newParts.exam && `המבחן: ${newParts.exam}`,
      newParts.general && `כללי: ${newParts.general}`
    ].filter(Boolean).join('\n\n');
    
    onCommentChange(combined);
  };

  const SEMESTERS = [
    { id: 'a', label: "סמסטר א'" },
    { id: 'b', label: "סמסטר ב'" },
    { id: 's', label: 'סמסטר קיץ' },
  ];

  const ACADEMIC_YEARS = [
    { id: '5786', label: 'תשפ"ו (2025-26)' },
    { id: '5785', label: 'תשפ"ה (2024-25)' },
    { id: '5784', label: 'תשפ"ד (2023-24)' },
    { id: '5783', label: 'תשפ"ג (2022-23)' },
  ];

  const IDENTITY_OPTIONS = [
    { id: 'full', label: 'שם מלא', icon: UserCircle },
    { id: 'initials', label: 'ראשי תיבות', icon: User },
    { id: 'anon', label: 'אנונימי/ת', icon: Ghost },
  ];

  const QUESTIONS = [
    { id: 'lecturer', label: 'מה דעתך על המרצה?', placeholder: 'מעביר/ה את החומר בצורה מעניינת?' },
    { id: 'difficulty', label: 'מה רמת הקושי של הקורס?', placeholder: 'האם החומר מורכב להבנה?' },
    { id: 'investment', label: 'כמה השקעה הקורס דורש?', placeholder: 'יש הרבה עבודות/תרגילים?' },
    { id: 'exam', label: 'האם המבחן היה הוגן?', placeholder: 'היה דומה לחומר שנלמד?' },
    { id: 'general', label: 'משהו נוסף שתרצו להוסיף?', placeholder: 'טיפים לסטודנטים אחרים...' },
  ];

  return (
    <div className="space-y-8 text-right" style={{ direction: 'rtl' }}>
      <div className="flex justify-between items-start">
        <div className="text-right">
          <h3 className="text-4xl font-black text-slate-900">הוספת ביקורת</h3>
          <p className="text-slate-500 font-bold mt-2 text-lg">שתפו את החוויה שלכם מהקורס</p>
        </div>
        <button 
          onClick={onClose} 
          className="bg-slate-100 p-4 rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all active:scale-90 group"
          title="סגור"
        >
          <X className="h-8 w-8 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Column: Details & Identity */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-black uppercase tracking-widest text-slate-400 mb-2 block">סמסטר</label>
              <select 
                value={semester}
                onChange={(e) => onSemesterChange(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3 outline-none focus:border-indigo-500 focus:bg-white transition-all text-right font-bold appearance-none cursor-pointer"
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
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3 outline-none focus:border-indigo-500 focus:bg-white transition-all text-right font-bold appearance-none cursor-pointer"
              >
                {ACADEMIC_YEARS.map(y => (
                  <option key={y.id} value={y.label}>{y.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-black uppercase tracking-widest text-slate-400 mb-3 block">איך להציג את שמך?</label>
            <div className="grid grid-cols-3 gap-2">
              {IDENTITY_OPTIONS.map(option => (
                <button
                  key={option.id}
                  onClick={() => onIdentityChange(option.id)}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border-2 transition-all ${identityType === option.id ? 'border-indigo-600 bg-indigo-50 text-indigo-600 font-bold' : 'border-slate-100 text-slate-400 hover:border-slate-200 font-medium'}`}
                >
                  <option.icon className="h-5 w-5" />
                  <span className="text-xs">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="hidden lg:block pt-6">
            <button 
              onClick={onSubmit}
              className="w-full bg-indigo-600 text-white py-6 rounded-[32px] font-black text-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-4"
            >
              <Send className="h-6 w-6" />
              פרסום ביקורת
            </button>
          </div>
        </div>

        {/* Right Column: Categorical Questions */}
        <div className="space-y-6 max-h-[500px] lg:max-h-none overflow-y-auto pr-2 custom-scrollbar">
          {QUESTIONS.map(q => (
            <div key={q.id}>
              <label className="text-sm font-black text-slate-700 mb-2 block">{q.label}</label>
              <textarea 
                value={parts[q.id]}
                onChange={(e) => updatePart(q.id, e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 h-24 outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none text-right font-medium" 
                placeholder={q.placeholder}
              ></textarea>
            </div>
          ))}
          
          <div className="lg:hidden pb-4">
            <button 
              onClick={onSubmit}
              className="w-full bg-indigo-600 text-white py-6 rounded-[32px] font-black text-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-4"
            >
              <Send className="h-6 w-6" />
              פרסום ביקורת
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewForm;
