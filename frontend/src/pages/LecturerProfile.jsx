import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronRight, Star, BookOpen, GraduationCap, AlertCircle, MessageSquare, Plus, X, Heart, Ghost, UserCircle, User } from 'lucide-react';

const LecturerProfile = ({ onDepartmentClick }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [lecturer, setLecturer] = useState(null);
  const [courses, setCourses] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [likedReviews, setLikedReviews] = useState([]); // Track IDs of liked reviews
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [selectedReviewCourseId, setSelectedReviewCourseId] = useState('');
  const [identityType, setIdentityType] = useState('anon'); // 'full', 'initials', 'anon'

  // Initialize selectedReviewCourseId when courses are loaded
  useEffect(() => {
    if (courses.length > 0 && !selectedReviewCourseId) {
      setSelectedReviewCourseId(courses[0].id);
    }
  }, [courses]);

  const handleAddReview = async () => {
    if (!newComment.trim()) return alert('נא להוסיף תוכן לביקורת');
    if (!selectedReviewCourseId) return alert('נא לבחור קורס רלוונטי');
    
    // Get user info from localStorage
    const savedUser = localStorage.getItem('user');
    const user = savedUser ? JSON.parse(savedUser) : { name: 'אורח/ת', id: 'guest' };

    let displayName = 'סטודנט/ית אנונימי/ת';
    if (identityType === 'full') {
      displayName = user.name;
    } else if (identityType === 'initials') {
      const parts = user.name.trim().split(/\s+/);
      if (parts.length > 1) {
        displayName = `${parts[0][0]}.${parts[parts.length - 1][0]}`;
      } else if (parts.length === 1 && parts[0]) {
        displayName = `${parts[0][0]}.`;
      }
    }

    const newReview = {
      lecturerId: id, 
      courseId: selectedReviewCourseId,
      author: displayName,
      authorId: user.id,
      rating: newRating,
      comment: newComment,
      date: new Date().toLocaleDateString('he-IL'),
      likes: 0,
      likedBy: []
    };

    try {
      console.log('Sending review to server:', newReview);
      const res = await fetch('http://localhost:3000/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview)
      });

      if (!res.ok) throw new Error('Failed to save review');

      const savedReview = await res.json();
      console.log('Review saved successfully:', savedReview);

      // Refresh reviews list from server
      const reviewsRes = await fetch(`http://localhost:3000/reviews?lecturerId=${id}`);
      const updatedReviews = await reviewsRes.json();
      
      // If server-side filtering isn't perfect, we can also filter locally
      // But for now, we'll trust the query param or manually filter
      const lecturerCourses = courses.map(c => c.id);
      const filteredReviews = updatedReviews.filter(r => 
        String(r.lecturerId) === String(id) || lecturerCourses.includes(r.courseId)
      );

      setReviews(filteredReviews);
      setIsModalOpen(false);
      setNewComment('');
      setNewRating(5);
      setIdentityType('anon');
    } catch (err) {
      console.error('Error saving review:', err);
      alert('שגיאה בשמירת הביקורת. אנא נסו שוב.');
    }
  };

  const handleLikeReview = (reviewId) => {
    const review = reviews.find(r => r.id === reviewId);
    if (review?.isUserReview) {
      alert('לא ניתן לעשות לייק לביקורת של עצמך');
      return;
    }

    if (likedReviews.includes(reviewId)) {
      setLikedReviews(likedReviews.filter(id => id !== reviewId));
      setReviews(reviews.map(r => r.id === reviewId ? { ...r, likes: (r.likes || 1) - 1 } : r));
    } else {
      setLikedReviews([...likedReviews, reviewId]);
      setReviews(reviews.map(r => r.id === reviewId ? { ...r, likes: (r.likes || 0) + 1 } : r));
    }
  };

  useEffect(() => {
    const fetchLecturerData = async () => {
      try {
        setLoading(true);
        console.log('Current ID from URL:', id);

        // Fetch ALL lecturers
        const lectsRes = await fetch(`http://localhost:3000/lecturers`);
        const allLecturers = await lectsRes.json();
        
        const foundLecturer = allLecturers.find(l => String(l.id) === String(id));

        if (!foundLecturer) {
           setError('מרצה לא נמצא');
           setLoading(false);
           return;
        }

        // Fetch ALL courses to filter manually (more reliable than query params in some setups)
        const coursesRes = await fetch(`http://localhost:3000/courses`);
        const allCourses = await coursesRes.json();
        const lecturerCourses = allCourses.filter(c => String(c.lecturerId) === String(foundLecturer.id));

        // Fetch ALL reviews to find those related to this lecturer's courses
        const reviewsRes = await fetch(`http://localhost:3000/reviews`);
        const allReviews = await reviewsRes.json();
        
        // Link reviews to lecturer via course IDs
        const courseIds = lecturerCourses.map(c => c.id);
        const lecturerReviews = allReviews.filter(r => courseIds.includes(r.courseId));

        setLecturer(foundLecturer);
        setCourses(lecturerCourses);
        setReviews(lecturerReviews);
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
    ? (courses.reduce((acc, c) => acc + (c.avgRating || 0), 0) / courses.length).toFixed(1)
    : '0.0';

  const textReviews = reviews.filter(r => r.comment && r.comment.trim() !== '');

  return (
    <div dir="rtl" className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-4xl mx-auto py-12 px-6">
        {/* Back Button */}
        <div className="flex justify-start mb-8">
          <button 
            onClick={() => {
              if (lecturer && lecturer.department) {
                const dept = Array.isArray(lecturer.department) ? lecturer.department[0] : lecturer.department;
                if (onDepartmentClick) {
                  onDepartmentClick(dept);
                } else {
                  navigate('/');
                }
              } else {
                navigate(-1);
              }
            }}
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
            <div className="flex items-start gap-3 justify-start mb-6">
              <div className="bg-indigo-50 p-1.5 rounded-xl">
                <GraduationCap className="h-6 w-6 text-indigo-400" />
              </div>
              <div className="flex flex-wrap gap-2 justify-start">
                {Array.isArray(lecturer.department) ? (
                  lecturer.department.map((dept, index) => (
                    <button 
                      key={index} 
                      onClick={() => onDepartmentClick && onDepartmentClick(dept)}
                      className="bg-white border border-slate-200 text-slate-600 px-4 py-1 rounded-2xl text-sm font-bold shadow-sm hover:border-indigo-500 hover:text-indigo-600 transition-all cursor-pointer"
                    >
                      {dept}
                    </button>
                  ))
                ) : (
                  <button 
                    onClick={() => onDepartmentClick && onDepartmentClick(lecturer.department)}
                    className="bg-white border border-slate-200 text-slate-600 px-4 py-1 rounded-2xl text-sm font-bold shadow-sm hover:border-indigo-500 hover:text-indigo-600 transition-all cursor-pointer"
                  >
                    {lecturer.department}
                  </button>
                )}
              </div>
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
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex items-center justify-start gap-6">
            <div className="bg-amber-50 p-4 rounded-2xl">
              <Star className="h-8 w-8 text-amber-500 fill-amber-500" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-slate-900">{avgRating}</div>
              <div className="text-xs font-black text-slate-400 uppercase tracking-widest">דירוג ממוצע</div>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex items-center justify-start gap-6">
            <div className="bg-indigo-50 p-4 rounded-2xl">
              <BookOpen className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-slate-900">{courses.length}</div>
              <div className="text-xs font-black text-slate-400 uppercase tracking-widest">מספר קורסים</div>
            </div>
          </div>
        </div>

        {/* Course List Section */}
        <section className="w-full text-right mb-16">
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

        {/* Review System Section */}
        <section className="w-full text-right">
          <div className="flex justify-between items-end mb-8 relative">
            <div className="flex-1">
              <h2 className="text-3xl font-black text-slate-800 pb-4 inline-block relative">
                ביקורות סטודנטים
                <div className="absolute bottom-0 right-0 w-24 h-1.5 bg-indigo-600 rounded-full"></div>
              </h2>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-95 transition-all flex items-center gap-2 mb-4"
            >
              <Plus className="h-4 w-4" />
              הוספת ביקורת
            </button>
            <div className="absolute bottom-0 right-0 left-0 h-px bg-slate-200 -z-10"></div>
          </div>

          <div className="space-y-6">
            {textReviews.length > 0 ? (
              textReviews.map(review => (
                <div key={review.id} className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm text-right relative overflow-hidden">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-black">
                        {(review.author || 'ש')[0]}
                      </div>
                      <div className="text-right">
                        <div className="font-black text-slate-900">{review.author || 'סטודנט/ית אנונימי/ת'}</div>
                        <div className="flex items-center gap-1 text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-3 w-3 ${i < (review.rating || 5) ? 'fill-current' : 'text-slate-200'}`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{review.date}</div>
                  </div>
                  
                  <p className="text-slate-600 text-lg font-medium leading-relaxed mb-6">
                    {review.comment}
                  </p>
                  
                  <div className="flex items-center justify-between border-t border-slate-50 pt-6">
                    <div className="flex items-center gap-2">
                      {review.courseId && (
                        <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-widest">
                          {courses.find(c => String(c.id) === String(review.courseId))?.title || 'קורס כללי'}
                        </span>
                      )}
                      <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest">
                        {review.semester && `${review.semester}, `}{review.year && `${review.year}`}
                      </span>
                    </div>

                    <button 
                      onClick={() => handleLikeReview(review.id)}
                      className={`flex items-center gap-2 transition-all active:scale-110 ${
                        review.isUserReview 
                          ? 'text-slate-300 cursor-not-allowed opacity-50' 
                          : likedReviews.includes(review.id)
                            ? 'text-rose-500'
                            : 'text-slate-400 hover:text-rose-500'
                      }`}
                      title={review.isUserReview ? 'לא ניתן לעשות לייק לביקורת שלך' : ''}
                      disabled={review.isUserReview}
                    >
                      <span className="text-xs font-black">{review.likes || 0}</span>
                      <Heart 
                        className={`h-5 w-5 ${likedReviews.includes(review.id) ? 'fill-current' : ''}`} 
                      />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-400">אין ביקורות עדיין</h3>
                <p className="text-slate-400 text-sm mt-2">היו הראשונים לכתוב ביקורת על המרצה!</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Review Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm" 
          dir="rtl"
          onClick={() => {
            setIsModalOpen(false);
            setNewComment('');
            setNewRating(5);
          }}
        >
          <div 
            className="bg-white w-full max-w-md rounded-[40px] p-8 text-right animate-in zoom-in-95 duration-200 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button - REPOSITIONED TO TOP-RIGHT */}
            <button 
              onClick={(e) => {
                e.preventDefault();
                console.log('X Button Clicked');
                setIsModalOpen(false);
                setNewComment('');
                setNewRating(5);
              }}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-full cursor-pointer z-[110]"
              type="button"
            >
              <X className="h-6 w-6" />
            </button>

            <h3 className="text-2xl font-black text-slate-900 mb-6 mr-10 text-right">הוספת ביקורת על המרצה</h3>
            
            <div className="mb-6">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">דירוג המרצה</label>
              <div className="flex items-center gap-1.5 flex-row-reverse justify-end">
                {[5, 4, 3, 2, 1].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      console.log(`Rating Selected: ${num}`);
                      setNewRating(num);
                    }}
                    className="transition-transform active:scale-110 cursor-pointer"
                  >
                    <Star 
                      className={`h-7 w-7 ${num <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">בחר קורס רלוונטי</label>
              <select 
                value={selectedReviewCourseId}
                onChange={(e) => setSelectedReviewCourseId(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 rounded-[22px] px-5 py-3 outline-none text-right font-bold text-sm appearance-none cursor-pointer"
              >
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
            </div>

            <div className="mb-8">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">תוכן הביקורת</label>
              <textarea 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 rounded-[24px] p-5 h-32 outline-none text-right font-medium text-sm" 
                placeholder="ספרו לנו על המרצה..."
              ></textarea>
            </div>

            {/* Redesigned Identity Selector */}
            <div className="mb-8">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block text-right">איך להציג את שמך?</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'full', label: 'שם מלא', icon: User },
                  { id: 'initials', label: 'ראשי תיבות', icon: UserCircle },
                  { id: 'anon', label: 'אנונימי/ת', icon: Ghost }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setIdentityType(opt.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                      identityType === opt.id 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                        : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    <opt.icon className={`h-5 w-5 ${identityType === opt.id ? 'text-indigo-600' : 'text-slate-300'}`} />
                    <span className="font-bold text-[10px]">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                console.log('Submit Review Button Clicked');
                handleAddReview();
              }}
              className="w-full bg-indigo-600 text-white py-4 rounded-[22px] font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-[0.98] cursor-pointer text-sm"
            >
              שלח ביקורת
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LecturerProfile;
