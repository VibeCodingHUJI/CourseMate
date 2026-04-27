import React from 'react';
import { Star, User, TrendingUp } from 'lucide-react';

const CourseCard = ({ course, onClick }) => (
  <div 
    onClick={() => onClick(course)}
    className={`bg-white rounded-[32px] shadow-sm border p-8 hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer flex flex-col h-full ${course.type === 'חובה' ? 'border-rose-100 hover:border-rose-200' : 'border-slate-200 hover:border-indigo-200'}`}
  >
    <div className="flex justify-between items-start mb-6">
      <div className="flex gap-2">
        <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${course.type === 'חובה' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
          {course.type}
        </div>
        <div className="bg-amber-50 text-amber-700 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
          {course.credits} נ"ז
        </div>
        <div className="bg-indigo-50 text-indigo-700 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
          {course.code}
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-amber-500 font-black">
        <Star className="h-4 w-4 fill-current" />
        <span>{course.avgRating}</span>
      </div>
    </div>
    
    <h3 className="text-2xl font-extrabold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1 text-right">
      {course.title}
    </h3>
    <p className="text-slate-500 text-sm font-medium mb-4 line-clamp-2 leading-relaxed text-right">
      {course.description}
    </p>

    {course.prerequisites && course.prerequisites.length > 0 && (
      <div className="mb-6 flex flex-col gap-2 text-right">
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
    
    <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between flex-row-reverse">
      <div className="flex items-center gap-3 flex-row-reverse">
        <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 shrink-0">
          <User className="h-5 w-5" />
        </div>
        <div className="flex flex-col text-right">
          <span className="text-xs text-slate-700 font-black">מרצה: {course.instructor}</span>
          {course.ta && (
            <span className="text-[10px] text-slate-500 font-bold mt-0.5">מתרגל/ת: {course.ta}</span>
          )}
        </div>
      </div>
      <div className={`flex items-center gap-1.5 text-xs font-black ${course.difficulty > 4 ? 'text-rose-500' : 'text-emerald-500'}`}>
        <TrendingUp className="h-4 w-4" />
        קושי {course.difficulty}/5
      </div>
    </div>
  </div>
);

export default CourseCard;
