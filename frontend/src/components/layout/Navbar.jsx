import { Search, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-primary-600" />
          <span className="text-xl font-bold text-secondary-800">CourseMate</span>
        </Link>
        
        <div className="flex-1 max-w-md mx-8 relative">
          <input
            type="text"
            placeholder="חפש קורס..."
            className="w-full bg-slate-100 border-none rounded-full py-2 px-10 focus:ring-2 focus:ring-primary-500 transition-all outline-none"
          />
          <Search className="absolute right-3 top-2.5 h-5 w-5 text-slate-400" />
        </div>
        
        <div className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
          <Link to="/" className="hover:text-primary-600 transition-colors">כל הקורסים</Link>
          <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
            התחברות
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
