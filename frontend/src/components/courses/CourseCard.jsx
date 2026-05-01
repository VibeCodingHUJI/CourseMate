import { Star, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => {
  return (
    <Link 
      to={`/course/${course.id}`}
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-primary-200 transition-all group"
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
            {course.language || 'עברית'} | {course.code}
          </span>
          <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-bold">
            {course.credits} נ"ז
          </span>
          {course.type && (
            <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">
              {course.type}
            </span>
          )}
        </div>

        <div className="bg-primary-50 text-primary-600 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
          <Star className="h-4 w-4 fill-current" />
          {course.avgRating}
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
