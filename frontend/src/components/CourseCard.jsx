import React from 'react';
import { Link } from 'react-router-dom';
import { User, FileText, Pencil } from 'lucide-react';

const CourseCard = ({ course, onClick }) => (
  <div 
    onClick={() => onClick(course)}
    dir="rtl"
    className={`bg-white rounded-[32px] shadow-sm border p-8 hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer flex flex-col h-full text-right ${course.type === 'חובה' ? 'border-rose-100 hover:border-rose-200' : 'border-slate-200 hover:border-indigo-200'}`}
  >
    <div className="flex justify-start items-start mb-6">
      {/* Badge Container */}
      <div className="flex flex-col items-start gap-2">
        {/* Row 1: [Type] [Credits] [ID|Lang] */}
        <div className="flex items-center gap-2">
          <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${course.type === 'חובה' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
            {course.type}
          </div>
          <div className="bg-amber-50 text-amber-700 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            {course.credits} נ"ז
          </div>
          <div className="bg-indigo-50 text-indigo-700 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            {course.code} | {course.language || 'עברית'}
          </div>
        </div>
        
        {/* Row 2: [Semester] [Assessment] [Attendance] */}
        <div className="flex items-center gap-2">
          {course.semester && (
            <div className="bg-orange-50 text-orange-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              {course.semester === 'א' ? 'סמסטר א׳' : 
               course.semester === 'ב' ? 'סמסטר ב׳' : 
               course.semester === 'א וב' ? 'סמסטר א׳ וב׳' : `סמסטר ${course.semester}`}
            </div>
          )}
          {course.assessmentType && (
            <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${course.assessmentType === 'בחינה' ? 'bg-violet-50 text-violet-600' : 'bg-teal-50 text-teal-600'}`}>
              {course.assessmentType}
            </div>
          )}
          <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${course.attendanceMandatory ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-500'}`}>
            {course.attendanceMandatory ? 'חובת נוכחות' : 'אין חובת נוכחות'}
          </div>
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
          <span className="text-xs text-slate-700 font-black">
            מרצה: <Link to={`/lecturer/${course.lecturerId}`} onClick={(e) => e.stopPropagation()} className="hover:text-indigo-600 hover:underline transition-all">
              {course.instructor}
            </Link>
          </span>
          {course.ta && (
            <span className="text-[10px] text-slate-500 font-bold mt-0.5">מתרגל/ת: {course.ta}</span>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default CourseCard;
