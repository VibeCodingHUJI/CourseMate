import { TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => {
  return (
    <Link 
      to={`/course/${course.id}`}
      dir="rtl"
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-primary-200 transition-all group text-right"
    >
      <div className="flex justify-start items-center mb-4">
        <div className="flex flex-wrap items-center gap-2">
          {course.semester && (
            <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
              {course.semester === 'שנתי' ? 'שנתי' :
               course.semester === 'א' ? 'סמסטר א׳' : 
               course.semester === 'ב' ? 'סמסטר ב׳' : 
               course.semester === 'א וב' ? 'סמסטר א׳ וב׳' : `סמסטר ${course.semester}`}
            </span>
          )}
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
            {course.language || 'עברית'} | {course.code}
          </span>
          <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
            {course.credits} נ"ז
          </span>
          {course.type && (
            <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
              {course.type}
            </span>
          )}
        </div>
      </div>

      <h3 className="text-xl font-bold text-secondary-800 group-hover:text-primary-600 transition-colors mb-4">
        {course.title}
      </h3>
      
      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <TrendingUp className="h-4 w-4 text-orange-500" />
          <span>קושי: <b>{course.difficulty}/5</b></span>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
