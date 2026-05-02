import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronRight, Star, BookOpen, GraduationCap, AlertCircle } from 'lucide-react';

const LecturerProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [lecturer, setLecturer] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLecturerData = async () => {
      try {
        setLoading(true);
        console.log('Current ID from URL:', id);

        // Fetch ALL lecturers to ensure we can find the one with matching ID stringified
        const lectsRes = await fetch(`http://localhost:3000/lecturers`);
        const allLecturers = await lectsRes.json();
        console.log('Available Lecturers:', allLecturers);

        // STRICT STRING COMPARISON FIX
        const foundLecturer = allLecturers.find(l => String(l.id) === String(id));

        if (!foundLecturer) {
           console.error('Lecturer not found in array');
           setError('מרצה לא נמצא');
           setLoading(false);
           return;
        }

        // Fetch courses for this lecturer
        // Use the ID from the URL or from the found lecturer
        const coursesRes = await fetch(`http://localhost:3000/courses?lecturerId=${foundLecturer.id}`);
        const coursesData = await coursesRes.json();

        setLecturer(foundLecturer);
        setCourses(coursesData);
        setError(null);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('מרצה לא נמצא');
      } finally {
        setLoading(false);
      }
    };

    fetchLecturerData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !lecturer) {
    return (
      <div className="max-w-md mx-auto py-20 text-center" dir="rtl">
        <div className="bg-white p-12 rounded-[40px] shadow-sm border border-slate-200">
          <AlertCircle className="h-16 w-16 text-rose-500 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-slate-900 mb-4">{error}</h2>
          <p className="text-slate-500 mb-10 font-medium">מצטערים, לא הצלחנו למצוא את המרצה שחיפשתם.</p>
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
          >
            חזרה לדף הבית
          </button>
        </div>
      </div>
    );
  }

  const avgRating = courses.length > 0 
    ? (courses.reduce((acc, c) => acc + c.avgRating, 0) / courses.length).toFixed(1)
    : '0.0';

  return (
    <div dir="rtl" className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-4xl mx-auto py-12 px-6">
        {/* Back Button */}
        <div className="flex justify-start mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-indigo-600 font-black hover:bg-indigo-50 px-4 py-2 rounded-2xl transition-all"
          >
            <ChevronRight className="h-5 w-5" />
            <span>חזור</span>
          </button>
        </div>

        {/* Header Section */}
        <header className="bg-white rounded-[40px] shadow-sm border border-slate-200 p-10 mb-10 relative overflow-hidden text-right">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl"></div>
          <div className="relative z-10">
            <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">{lecturer.name}</h1>
            <div className="flex items-center gap-2 text-xl text-slate-500 font-medium justify-start mb-6">
              <GraduationCap className="h-6 w-6 text-indigo-400" />
              <span>המחלקה ל{lecturer.department}</span>
            </div>
            {lecturer.bio && (
              <p className="text-slate-600 leading-relaxed max-w-2xl text-lg font-medium italic">
                {lecturer.bio}
              </p>
            )}
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-6 mb-12">
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="text-right">
              <div className="text-3xl font-black text-slate-900">{avgRating}</div>
              <div className="text-xs font-black text-slate-400 uppercase tracking-widest">דירוג ממוצע</div>
            </div>
            <div className="bg-amber-50 p-4 rounded-2xl">
              <Star className="h-8 w-8 text-amber-500 fill-amber-500" />
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="text-right">
              <div className="text-3xl font-black text-slate-900">{courses.length}</div>
              <div className="text-xs font-black text-slate-400 uppercase tracking-widest">מספר קורסים</div>
            </div>
            <div className="bg-indigo-50 p-4 rounded-2xl">
              <BookOpen className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Course List Section */}
        <section className="w-full text-right">
          <div className="mb-8 relative">
            <h2 className="text-3xl font-black text-slate-800 pb-4 inline-block relative">
              קורסים שהמרצה מלמד/ת
              <div className="absolute bottom-0 right-0 w-24 h-1.5 bg-indigo-600 rounded-full"></div>
            </h2>
            <div className="absolute bottom-0 right-0 left-0 h-px bg-slate-200 -z-10"></div>
          </div>

          <div className="space-y-4">
            {courses.length > 0 ? (
              courses.map(course => (
                <Link 
                  to={`/course/${course.id}`}
                  key={course.id}
                  className="bg-white p-6 rounded-[24px] border border-slate-200 hover:border-indigo-200 hover:bg-slate-50 hover:shadow-md transition-all group flex items-center justify-start gap-6"
                >
                  <div className="bg-slate-50 p-4 rounded-2xl group-hover:bg-indigo-50 transition-colors">
                    <BookOpen className="h-6 w-6 text-slate-400 group-hover:text-indigo-600" />
                  </div>
                  <div className="text-right flex-1">
                    <div className="font-black text-slate-900 text-xl mb-1">{course.title}</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">קוד קורס: {course.code}</div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-10 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 text-slate-400 font-bold">
                אין קורסים רשומים עבור מרצה זה
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default LecturerProfile;
