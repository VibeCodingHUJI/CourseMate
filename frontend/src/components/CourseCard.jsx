import React from 'react';
import { Link } from 'react-router-dom';
import { User, FileText, Pencil } from 'lucide-react';

const CourseCard = ({ course, onClick }) => {
  const getTypeStyles = (type) => {
    switch (type) {
      case 'חובה': return { badge: 'bg-rose-50 text-rose-600', border: 'border-rose-100 hover:border-rose-200' };
      case 'בחירה': return { badge: 'bg-emerald-50 text-emerald-600', border: 'border-slate-200 hover:border-indigo-200' };
      case 'קורסי יסוד': return { badge: 'bg-blue-50 text-blue-600', border: 'border-blue-100 hover:border-blue-200' };
      case 'חובת בחירה': return { badge: 'bg-amber-50 text-amber-600', border: 'border-amber-100 hover:border-amber-200' };
      default: return { badge: 'bg-slate-50 text-slate-600', border: 'border-slate-200 hover:border-indigo-200' };
    }
  };

  const styles = getTypeStyles(course.type);

  return (
    <div 
      onClick={() => onClick(course)}
      dir="rtl"
      className={`bg-white rounded-[32px] shadow-sm border p-8 hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer flex flex-col h-full text-right ${styles.border}`}
    >
      <div className="flex justify-start items-start mb-6">
        {/* Badge Container */}
        <div className="flex flex-wrap items-center gap-2">
          <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${styles.badge}`}>
            {course.type}
          </div>
          <div className="bg-amber-50 text-amber-700 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
            {course.credits} נ"ז
          </div>
          <div className="bg-indigo-50 text-indigo-700 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
            {course.code} | {course.language || 'עברית'}
          </div>
          {course.campus && (
            <div className="bg-slate-50 text-slate-400 px-3 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border border-slate-100 whitespace-nowrap">
              {course.campus}
            </div>
          )}
          {course.semester && (
            <div className="bg-orange-50 text-orange-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
              {course.semester === 'שנתי' ? 'שנתי' :
               course.semester === 'א' ? 'סמסטר א׳' : 
               course.semester === 'ב' ? 'סמסטר ב׳' : 
               course.semester === 'א וב' ? 'סמסטר א׳ וב׳' : `סמסטר ${course.semester}`}
            </div>
          )}
          {course.assessmentType && (
            <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${course.assessmentType === 'בחינה' ? 'bg-violet-50 text-violet-600' : 'bg-teal-50 text-teal-600'}`}>
              {course.assessmentType}
            </div>
          )}
          <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${course.attendanceMandatory ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-500'}`}>
            נוכחות: {course.attendanceMandatory ? 'חובה' : 'אין'}
          </div>
        </div>
      </div>
    
    <h3 className="text-2xl font-extrabold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">
      {course.title}
    </h3>
    <p className="text-slate-500 text-sm font-medium mb-4 line-clamp-2 leading-relaxed">
      {course.description}
    </p>

    {course.prerequisites && course.prerequisites.length > 0 && (
      <div className="mb-6 flex flex-col gap-2">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">דרישות קדם:</span>
        <div className="flex flex-wrap gap-2 justify-start">
          {course.prerequisites.map((pre, index) => (
            <span key={index} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-bold">
              {pre}
            </span>
          ))}
        </div>
      </div>
    )}
    
    <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-start">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 shrink-0">
          <User className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <div className="text-xs text-slate-700 font-black flex flex-wrap gap-x-1.5 gap-y-1">
            <span className="whitespace-nowrap">מרצה:</span>
            {course.instructors && course.instructors.length > 0 ? (
              course.instructors.map((inst, idx) => (
                <span key={inst.id} className="whitespace-nowrap">
                  <Link 
                    to={`/lecturer/${inst.id}`} 
                    onClick={(e) => e.stopPropagation()} 
                    className="hover:text-indigo-600 hover:underline transition-all"
                  >
                    {inst.name}
                  </Link>
                  {idx < course.instructors.length - 1 ? ',' : ''}
                </span>
              ))
            ) : (
              <span className="whitespace-nowrap">{course.instructor || 'לא ידוע'}</span>
            )}
          </div>
          {course.ta && (
            <span className="text-[10px] text-slate-500 font-bold mt-0.5">מתרגל/ת: {course.ta}</span>
          )}
        </div>
      </div>
    </div>
  </div>
  );
};

export default CourseCard;
