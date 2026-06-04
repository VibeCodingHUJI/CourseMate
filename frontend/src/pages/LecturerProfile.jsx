import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronRight, Star, BookOpen, GraduationCap, AlertCircle, MessageSquare, Plus, X, Edit2, Trash2 } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '${API}';

const LecturerProfile = ({ user, onDepartmentClick }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [lecturer, setLecturer] = useState(null);
  const [courses, setCourses] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  const hasUserReview = reviews.some(r => String(r.authorId) === String(user?.id));

  const handlePostReview = async () => {
    if (user?.isGuest) return alert('אורחים אינם יכולים להוסיף ביקורות');

    try {
      let res;
      if (editingReviewId) {
        res = await fetch(`${API}/api/lecturers/${id}/reviews/${editingReviewId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rating: newRating, comment: newComment })
        });
      } else {
        res = await fetch(`${API}/api/lecturers/${id}/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, rating: newRating, comment: newComment })
        });
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'שגיאה בשמירת הביקורת');
      }

      const saved = await res.json();
      setReviews(prev => editingReviewId
        ? prev.map(r => r.id === editingReviewId ? saved : r)
        : [saved, ...prev]
      );
      setIsModalOpen(false);
      setNewComment('');
      setNewRating(5);
      setEditingReviewId(null);
      alert(editingReviewId ? 'הביקורת עודכנה בהצלחה!' : 'הביקורת פורסמה בהצלחה!');
    } catch (err) {
      alert('שגיאה בשמירת הביקורת: ' + err.message);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('האם אתם בטוחים שברצונכם למחוק את הביקורת?')) return;
    try {
      const res = await fetch(`${API}/api/lecturers/${id}/reviews/${reviewId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      alert('הביקורת נמחקה בהצלחה');
    } catch {
      alert('שגיאה במחיקת הביקורת');
    }
  };

  const handleEditReview = (review) => {
    setEditingReviewId(review.id);
    setNewRating(review.rating);
    setNewComment(review.comment);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewComment('');
    setNewRating(5);
    setEditingReviewId(null);
  };

  useEffect(() => {
    const fetchLecturerData = async () => {
      try {
        setLoading(true);
        const [lecturerRes, coursesRes, reviewsRes] = await Promise.all([
          fetch(`${API}/api/lecturers/${id}`),
          fetch(`${API}/api/lecturers/${id}/courses`),
          fetch(`${API}/api/lecturers/${id}/reviews`)
        ]);
        if (!lecturerRes.ok) throw new Error('Lecturer not found');
        setLecturer(await lecturerRes.json());
        setCourses(await coursesRes.json());
        const reviewsData = await reviewsRes.json();
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
        setError(null);
      } catch (err) {
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
          <button onClick={() => navigate('/')} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg active:scale-95">
            חזרה לדף הבית
          </button>
        </div>
      </div>
    );
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : '—';

  return (
    <div dir="rtl" className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-4xl mx-auto py-12 px-6">

        <div className="flex justify-start mb-8">
          <button
            onClick={() => {
              if (lecturer?.department) {
                const dept = Array.isArray(lecturer.department) ? lecturer.department[0] : lecturer.department;
                onDepartmentClick ? onDepartmentClick(dept) : navigate('/');
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

        {/* Header */}
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
                  lecturer.department.map((dept, i) => (
                    <button key={i} onClick={() => onDepartmentClick && onDepartmentClick(dept)}
                      className="bg-white border border-slate-200 text-slate-600 px-4 py-1 rounded-2xl text-sm font-bold shadow-sm hover:border-indigo-500 hover:text-indigo-600 transition-all">
                      {dept}
                    </button>
                  ))
                ) : (
                  <button onClick={() => onDepartmentClick && onDepartmentClick(lecturer.department)}
                    className="bg-white border border-slate-200 text-slate-600 px-4 py-1 rounded-2xl text-sm font-bold shadow-sm hover:border-indigo-500 hover:text-indigo-600 transition-all">
                    {lecturer.department}
                  </button>
                )}
              </div>
            </div>
            {lecturer.bio && <p className="text-slate-600 leading-relaxed max-w-2xl text-lg font-medium italic">{lecturer.bio}</p>}
          </div>
        </header>

        {/* Stats */}
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

        {/* Courses */}
        <section className="w-full text-right mb-16">
          <div className="mb-8 relative">
            <h2 className="text-3xl font-black text-slate-800 pb-4 inline-block relative">
              קורסים שהמרצה מלמד/ת
              <div className="absolute bottom-0 right-0 w-24 h-1.5 bg-indigo-600 rounded-full"></div>
            </h2>
            <div className="absolute bottom-0 right-0 left-0 h-px bg-slate-200 -z-10"></div>
          </div>
          <div className="space-y-4">
            {courses.length > 0 ? courses.map(course => (
              <Link key={course.id} to={`/course/${course.id}`}
                state={{ from: 'lecturer', lecturerId: id, lecturerName: lecturer.name }}
                className="bg-white p-6 rounded-[24px] border border-slate-200 hover:border-indigo-200 hover:bg-slate-50 hover:shadow-md transition-all group flex items-center justify-start gap-6">
                <div className="bg-slate-50 p-4 rounded-2xl group-hover:bg-indigo-50 transition-colors">
                  <BookOpen className="h-6 w-6 text-slate-400 group-hover:text-indigo-600" />
                </div>
                <div className="text-right flex-1">
                  <div className="font-black text-slate-900 text-xl mb-1">{course.title}</div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">קוד קורס: {course.code}</div>
                </div>
              </Link>
            )) : (
              <div className="text-center py-10 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 text-slate-400 font-bold">
                אין קורסים רשומים עבור מרצה זה
              </div>
            )}
          </div>
        </section>

        {/* Reviews */}
        <section className="w-full text-right">
          <div className="flex justify-between items-end mb-8 relative">
            <div className="flex-1">
              <h2 className="text-3xl font-black text-slate-800 pb-4 inline-block relative">
                ביקורות סטודנטים
                <div className="absolute bottom-0 right-0 w-24 h-1.5 bg-indigo-600 rounded-full"></div>
              </h2>
            </div>
            {!user?.isGuest && !hasUserReview && (
              <button onClick={() => setIsModalOpen(true)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-95 transition-all flex items-center gap-2 mb-4">
                <Plus className="h-4 w-4" />
                הוספת ביקורת
              </button>
            )}
            <div className="absolute bottom-0 right-0 left-0 h-px bg-slate-200 -z-10"></div>
          </div>

          <div className="space-y-6">
            {reviews.length > 0 ? reviews.map(review => (
              <div key={review.id} className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm text-right relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-black">
                      {(review.author || 'ס')[0]}
                    </div>
                    <div className="text-right">
                      <div className="font-black text-slate-900">{review.author}</div>
                      <div className="flex items-center gap-1 text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < (review.rating || 0) ? 'fill-current' : 'text-slate-200'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {String(review.authorId) === String(user?.id) && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEditReview(review)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="עריכה">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteReview(review.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title="מחיקה">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{review.date}</div>
                  </div>
                </div>

                <div className="pr-4 border-r-2 border-indigo-50">
                  <p className="text-slate-600 text-lg font-medium leading-relaxed">{review.comment}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-12 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-400">אין ביקורות עדיין</h3>
                <p className="text-slate-400 text-sm mt-2">היו הראשונים לכתוב ביקורת על המרצה!</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm"
          dir="rtl" onClick={closeModal}>
          <div className="bg-white w-full max-w-md rounded-[40px] p-8 text-right animate-in zoom-in-95 duration-200 shadow-2xl relative"
            onClick={e => e.stopPropagation()}>
            <button onClick={closeModal}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-full z-[110]">
              <X className="h-6 w-6" />
            </button>

            <h3 className="text-2xl font-black text-slate-900 mb-6 mr-10">
              {editingReviewId ? 'עריכת ביקורת' : 'הוספת ביקורת על המרצה'}
            </h3>

            {/* Star rating */}
            <div className="mb-6">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">דירוג המרצה</label>
              <div className="flex items-center gap-1.5 flex-row-reverse justify-end">
                {[5, 4, 3, 2, 1].map(num => (
                  <button key={num} type="button" onClick={() => setNewRating(num)} className="active:scale-110 cursor-pointer transition-transform">
                    <Star className={`h-7 w-7 ${num <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Review text */}
            <div className="mb-8">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                תוכן הביקורת
              </label>
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 rounded-[24px] p-5 h-36 outline-none text-right font-medium text-sm resize-none"
                placeholder="ספרו לנו על המרצה..."
              />
            </div>

            <button type="button" onClick={handlePostReview}
              className="w-full bg-indigo-600 text-white py-4 rounded-[22px] font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-[0.98] text-sm">
              {editingReviewId ? 'עדכן ביקורת' : 'שלח ביקורת'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LecturerProfile;
