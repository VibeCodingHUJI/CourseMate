import React from 'react';
import { Star, Send } from 'lucide-react';

const ReviewForm = ({ 
  rating, comment, grade, semester, year,
  onRatingChange, onCommentChange, onGradeChange, 
  onSemesterChange, onYearChange, onSubmit 
}) => {
  const SEMESTERS = [
    { id: 'a', label: 'סמסטר א\'' },
    { id: 'b', label: 'סמסטר ב\'' },
    { id: 's', label: 'סמסטר קיץ' },
  ];

  return (
    <div className="bg-slate-900 text-white rounded-[40px] p-8 sticky top-28 shadow-2xl shadow-slate-900/20 text-right">
      <h3 className="text-2xl font-black mb-6">פרסם ביקורת</h3>
      <div className="space-y-6">
        <div>
          <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 block">דירוג הקורס</label>
          <div className="flex gap-2 justify-end">
            {[1, 2, 3, 4, 5].map(s => (
              <Star 
                key={s} 
                onClick={() => onRatingChange(s)}
                className={`h-8 w-8 cursor-pointer transition-colors ${s <= rating ? 'text-amber-500 fill-current' : 'text-slate-700 hover:text-amber-500'}`} 
              />
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
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500 transition-all text-right font-bold"
              placeholder="0-100"
            />
          </div>
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">שנת לימוד</label>
            <input 
              type="text" 
              value={year}
              onChange={(e) => onYearChange(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500 transition-all text-right font-bold"
              placeholder="תשפ״ד"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">סמסטר</label>
          <select 
            value={semester}
            onChange={(e) => onSemesterChange(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500 transition-all text-right font-bold appearance-none cursor-pointer"
          >
            {SEMESTERS.map(s => (
              <option key={s.id} value={s.label} className="bg-slate-900">{s.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 block">הביקורת שלך</label>
          <textarea 
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-3xl p-5 text-sm mb-4 h-32 outline-none focus:border-indigo-500 focus:bg-white/10 transition-all resize-none text-right" 
            placeholder="איך היה הקורס? איך המרצה?"
          ></textarea>
        </div>

        <button 
          onClick={onSubmit}
          className="w-full bg-indigo-500 text-white py-4 rounded-3xl font-black flex items-center justify-center gap-3 hover:bg-indigo-400 active:scale-95 transition-all shadow-xl shadow-indigo-500/10"
        >
          <Send className="h-5 w-5" />
          שליחת ביקורת
        </button>
      </div>
    </div>
  );
};

export default ReviewForm;
