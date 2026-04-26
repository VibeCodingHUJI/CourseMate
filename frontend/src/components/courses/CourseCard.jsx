import { Star, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => {
  return (
    <Link 
      to={`/course/${course.id}`}
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-primary-200 transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-secondary-800 group-hover:text-primary-600 transition-colors">
            {course.title}
          </h3>
          <span className="text-sm text-slate-500 font-mono">{course.code}</span>
        </div>
        <div className="bg-primary-50 text-primary-600 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
          <Star className="h-4 w-4 fill-current" />
          {course.avgRating}
        </div>
      </div>
      
      <div className="flex items-center gap-4 mt-6">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <TrendingUp className="h-4 w-4 text-orange-500" />
          <span>קושי: <b>{course.difficulty}/5</b></span>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
