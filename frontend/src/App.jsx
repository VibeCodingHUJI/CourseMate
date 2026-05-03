import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, GraduationCap, Star, MessageSquare, 
  BookOpen, TrendingUp, Send, FileText, 
  Download, Upload, User, ChevronLeft,
  Filter, Award, Clock, X, CheckCircle, Lock,
  Camera, Heart, ChevronDown
} from 'lucide-react';

// Components
import AuthPage from './components/AuthPage';
import CourseCard from './components/CourseCard';
import ReviewForm from './components/ReviewForm';
import CombinationForum from './components/CombinationForum';
import LecturerProfile from './pages/LecturerProfile';

// Data
import projectData from './data.json';

const STUDY_TRACKS = projectData.tracks;

const MATERIAL_CATEGORIES = [
  { id: 'summaries', label: 'סיכומים', icon: FileText },
  { id: 'tests', label: 'מבחנים', icon: GraduationCap },
  { id: 'homework', label: 'מטלות בית', icon: BookOpen },
  { id: 'formulas', label: 'דפי נוסחאות', icon: TrendingUp },
  { id: 'misc', label: 'שונות', icon: MessageSquare }
];

const Dashboard = ({ 
  user, 
  guestSelectedTrack, 
  setIsGuestDrawerOpen, 
  allCourses, 
  filteredCourses, 
  courseFilter, 
  setCourseFilter, 
  searchQuery, 
  setSearchQuery, 
  showSuggestions, 
  setShowSuggestions, 
  suggestions, 
  navigate 
}) => (
  <div className="max-w-7xl mx-auto">
    <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="text-right">
          {user.isGuest ? (
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">מסלול לימוד:</label>
              <button 
                onClick={() => setIsGuestDrawerOpen(true)}
                className="flex items-center gap-4 bg-white border-2 border-slate-200 rounded-[24px] px-8 py-4 hover:border-indigo-500 transition-all shadow-sm group"
              >
                <span className="font-bold text-slate-700">
                  {guestSelectedTrack ? STUDY_TRACKS.find(t => t.value === guestSelectedTrack)?.label : 'לחצו לבחירת חוג...'}
                </span>
                <Filter className="h-5 w-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-5xl font-black text-slate-900 mb-4 leading-tight tracking-tight">שלום {user.name.split(' ')[0]}!</h1>
              <p className="text-xl text-slate-500 font-medium">הנה הקורסים במסלול {STUDY_TRACKS.find(t => t.value === user.track)?.label || user.track} שלך</p>
            </>
          )}
        </div>

      <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit self-end">
        {['All', 'חובה', 'בחירה'].map(f => (
          <button
            key={f}
            onClick={() => setCourseFilter(f)}
            className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all ${courseFilter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            {f === 'All' ? 'הכל' : f}
          </button>
        ))}
      </div>
    </header>

    {/* Course Search Bar */}
    <div className="mb-12 relative max-w-2xl ml-auto group">
      <input
        key="search-input"
        type="text"
        placeholder="חפש קורס..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && suggestions.length > 0) {
            navigate(`/course/${suggestions[0].id}`);
            setSearchQuery('');
            setShowSuggestions(false);
          }
        }}
        className="w-full bg-white border-2 border-slate-200 rounded-[24px] py-4 px-12 focus:border-indigo-500 transition-all outline-none text-right font-medium shadow-sm"
      />
      <Search className="absolute right-5 top-4.5 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
          {suggestions.map(course => (
            <button
              key={course.id}
              onClick={() => {
                navigate(`/course/${course.id}`);
                setSearchQuery('');
                setShowSuggestions(false);
              }}
              className="w-full text-right px-6 py-4 hover:bg-slate-50 transition-colors flex items-center justify-between group/item"
            >
              <div className="flex items-center gap-3">
                 <span className="text-xs font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-lg group-hover/item:bg-white transition-colors">{course.code}</span>
                 <span className="font-bold text-slate-700 group-hover/item:text-indigo-600 transition-colors">{course.title}</span>
              </div>
              <ChevronLeft className="h-4 w-4 text-slate-300 group-hover/item:text-indigo-500 group-hover/item:-translate-x-1 transition-all" />
            </button>
          ))}
        </div>
      )}
    </div>
    
    <div className="space-y-16">
      {(user.isGuest && !guestSelectedTrack) ? (
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-20 grayscale blur-[2px] pointer-events-none select-none">
            {allCourses.slice(0, 6).map(course => (
              <CourseCard key={course.id} course={course} onClick={() => {}} />
            ))}
          </div>
          {/* Square Pop-up for Guest Start */}
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white w-full max-w-sm aspect-square rounded-[40px] p-12 shadow-2xl border border-slate-100 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-200">
              <div className="bg-indigo-50 w-20 h-20 rounded-3xl flex items-center justify-center mb-8 text-indigo-600">
                <Search className="h-10 w-10" />
              </div>
              <h3 className="text-4xl font-black text-slate-900 mb-4">Let's get started</h3>
              <p className="text-slate-500 mb-10 font-bold text-lg">בואו נתחיל! כדי לראות קורסים וביקורות, יש לבחור מסלול לימוד</p>
              <button 
                onClick={() => setIsGuestDrawerOpen(true)}
                className="w-full bg-indigo-600 text-white px-8 py-5 rounded-[28px] font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95 flex items-center justify-center gap-3 text-lg"
              >
                <span>בחר חוג</span>
                <ChevronDown className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {['א', 'ב', 'ג'].map(year => {
            const yearCourses = filteredCourses.filter(c => c.type === 'חובה' && c.year === year);
            if (yearCourses.length === 0) return null;
            return (
              <div key={year} className="space-y-8">
                <div className="flex items-center gap-4 flex-row-reverse">
                  <div className="h-px flex-1 bg-slate-200"></div>
                  <h2 className="text-3xl font-black text-slate-800">קורסי חובה - שנה {year}</h2>
                  <div className="h-px flex-1 bg-slate-200"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {yearCourses.map(course => (
                    <CourseCard key={course.id} course={course} onClick={(c) => navigate(`/course/${c.id}`)} />
                  ))}
                </div>
              </div>
            );
          })}

          {(() => {
            const electiveCourses = filteredCourses.filter(c => c.type === 'בחירה');
            if (electiveCourses.length === 0) return null;
            return (
              <div className="space-y-8">
                <div className="flex items-center gap-4 flex-row-reverse">
                  <div className="h-px flex-1 bg-slate-200"></div>
                  <h2 className="text-3xl font-black text-slate-800">קורסי בחירה</h2>
                  <div className="h-px flex-1 bg-slate-200"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {electiveCourses.map(course => (
                    <CourseCard key={course.id} course={course} onClick={(c) => navigate(`/course/${c.id}`)} />
                  ))}
                </div>
              </div>
            );
          })()}
        </>
      )}
    </div>
  </div>
);

const CourseDetail = ({ 
  selectedCourse, 
  navigate, 
  activeTab, 
  setActiveTab, 
  reviews, 
  user, 
  setIsReviewModalOpen, 
  handleLogout, 
  handleLikeReview, 
  questions, 
  setIsQuestionModalOpen, 
  handlePostAnswer, 
  handleLikeAnswer, 
  setIsMaterialModalOpen, 
  materials 
}) => {
  if (!selectedCourse) return <div className="text-center py-20 animate-pulse text-2xl font-black text-slate-400">טוען נתונים...</div>;
  
  const attendanceReviews = reviews.filter(r => r.attendanceEnforced !== undefined);
  const enforcementRate = attendanceReviews.length > 0
    ? Math.round((attendanceReviews.filter(r => r.attendanceEnforced).length / attendanceReviews.length) * 100)
    : null;

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={() => navigate('/')}
        className="group mb-8 flex items-center gap-3 text-slate-500 font-black hover:text-indigo-600 transition-all"
      >
        <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 group-hover:border-indigo-100">
          <ChevronLeft className="h-4 w-4 rotate-180" />
        </div>
        <span>חזרה לכל הקורסים</span>
      </button>

      <header className="bg-white rounded-[40px] shadow-sm border border-slate-200 p-10 mb-8 relative overflow-hidden text-right">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="flex-1 flex flex-col items-start text-right">
            <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight w-full">{selectedCourse.title}</h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mb-8 w-full">{selectedCourse.description}</p>
            
            <div className="flex flex-col items-start gap-2">
              {/* Row 1: [Type] [Credits] [ID|Lang] */}
              <div className="flex items-center gap-2">
                <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest ${selectedCourse.type === 'חובה' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {selectedCourse.type}
                </span>
                <span className="bg-amber-50 text-amber-700 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                  {selectedCourse.credits} נ"ז
                </span>
                <span className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                  {selectedCourse.code} | {selectedCourse.language || 'עברית'}
                </span>
              </div>
              
              {/* Row 2: [Semester] [Assessment] [Attendance] */}
              <div className="flex items-center gap-2">
                {selectedCourse.semester && (
                  <span className="bg-orange-50 text-orange-600 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                    {selectedCourse.semester === 'א' ? 'סמסטר א׳' : 
                     selectedCourse.semester === 'ב' ? 'סמסטר ב׳' : 
                     selectedCourse.semester === 'א וב' ? 'סמסטר א׳ וב׳' : `סמסטר ${selectedCourse.semester}`}
                  </span>
                )}
                {selectedCourse.assessmentType && (
                  <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest ${selectedCourse.assessmentType === 'בחינה' ? 'bg-violet-50 text-violet-600' : 'bg-teal-50 text-teal-600'}`}>
                    {selectedCourse.assessmentType}
                  </span>
                )}
                <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest ${selectedCourse.attendanceMandatory ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-500'}`}>
                  {selectedCourse.attendanceMandatory ? 'חובת נוכחות' : 'אין חובת נוכחות'}
                </span>
                {enforcementRate !== null && (
                  <span className="bg-indigo-900 text-white px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    <CheckCircle className="h-3 w-3" />
                    אכיפה בפועל: {enforcementRate}%
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="bg-slate-50 p-6 rounded-[32px] flex md:flex-col gap-8 min-w-[180px]">
            <div className="text-center">
              <div className="text-4xl font-black text-rose-500 mb-1">{selectedCourse.difficulty}</div>
              <div className="text-xs text-slate-400 font-black uppercase text-center">קושי</div>
            </div>
          </div>
        </div>
      </header>

      <div className="mb-10" style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <div className="p-1.5 bg-slate-100 rounded-[28px] w-fit flex gap-2" style={{ direction: 'rtl' }}>
          {[
            { id: 'reviews', label: 'ביקורות', icon: Star },
            { id: 'qna', label: 'שאלות ותשובות', icon: MessageSquare },
            { id: 'materials', label: 'חומרי לימוד', icon: BookOpen }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-8 py-4 rounded-[22px] transition-all font-black text-sm flex items-center gap-3 ${
                activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'fill-indigo-600' : ''}`} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-6">
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-black text-slate-900 text-right">ביקורות ({reviews.length})</h2>
                {!user.isGuest && (
                  <button 
                    onClick={() => setIsReviewModalOpen(true)}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-md active:scale-95 flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    הוספת ביקורת
                  </button>
                )}
              </div>

              {reviews.map(r => (
                <div key={r.id} className="bg-white rounded-[32px] shadow-sm border border-slate-200 p-8 text-right relative overflow-hidden">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-black shrink-0">
                        {r.author[0]}
                      </div>
                      <div className="text-right">
                        <div className="font-black text-slate-900">{r.author}</div>
                        <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">מרצה: {selectedCourse.instructor}</div>
                      </div>
                    </div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{r.date}</div>
                  </div>
                  
                  <div className="space-y-4 mb-8 pr-4 border-r-2 border-indigo-50">
                    {r.comment.split('\n\n').map((line, idx) => (
                      <div key={idx} className="text-slate-600 text-lg font-medium leading-relaxed italic whitespace-pre-wrap">
                        {line.startsWith('המבחן:') ? line.replace('המבחן:', 'המבחן היה הוגן:') : line}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                    <div className="flex items-center gap-4">
                      <div className="text-xs font-black text-slate-400 bg-slate-50 px-4 py-1.5 rounded-xl uppercase tracking-widest">
                        {r.semester}, {r.year}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleLikeReview(r.id)}
                      className="flex items-center gap-2 text-slate-400 hover:text-rose-500 transition-colors group/like"
                    >
                      <span className="text-xs font-black">{(r.likedBy?.length || 0)}</span>
                      <Heart className={`h-5 w-5 ${(r.likedBy || []).includes(user.id) ? 'fill-rose-500 text-rose-500' : 'group-hover/like:fill-rose-500'}`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'qna' && (
            <div className="space-y-6 text-right">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-black text-slate-900">שאלות מהקהילה</h2>
                <button onClick={() => setIsQuestionModalOpen(true)} className="bg-white border-2 border-slate-200 px-6 py-2 rounded-2xl font-black text-sm hover:border-indigo-500 transition-all">שאל שאלה</button>
              </div>
              {questions.map(q => (
                <div key={q.id} className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden text-right">
                  <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <MessageSquare className="h-6 w-6 text-indigo-400" />
                      <div className="text-xl font-bold text-right">{q.question}</div>
                    </div>
                    <div className="text-xs font-medium text-white/50 whitespace-nowrap">
                      פורסם ב-{q.date}
                    </div>
                  </div>
                  <div className="p-8 space-y-6">
                    {q.answers.map((a, i) => (
                      <div key={i} className="flex gap-6 border-r-4 border-slate-50 pr-6 group/ans">
                        <div className="h-10 w-10 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 shrink-0"><User className="h-5 w-5" /></div>
                        <div className="flex-1 flex justify-between items-start">
                          <p className="text-slate-700 font-medium">{a.text}</p>
                          <button 
                            onClick={() => handleLikeAnswer(q.id, i)}
                            className="flex items-center gap-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                          >
                            <span className="text-[10px] font-black">{a.likedBy?.length || 0}</span>
                            <Heart className={`h-4 w-4 ${(a.likedBy || []).includes(user.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {!user.isGuest && (
                      <div className="pt-4 mr-16 flex gap-3">
                        <input 
                          type="text" 
                          placeholder="תשובה..."
                          onKeyDown={(e) => { if (e.key === 'Enter') { handlePostAnswer(q.id, e.target.value); e.target.value = ''; } }}
                          className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 rounded-2xl px-6 py-3 outline-none text-right font-medium"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'materials' && (
            <div className="space-y-10 text-right">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-900">חומרי לימוד</h2>
                {!user.isGuest && (
                  <button 
                    onClick={() => setIsMaterialModalOpen(true)}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    העלאת חומר לימוד
                  </button>
                )}
              </div>

              {user.isGuest ? (
                <div className="bg-white rounded-[40px] border-2 border-dashed border-slate-200 p-12 text-center">
                  <div className="bg-slate-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-400">
                    <Lock className="h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">חומרי הלימוד זמינים לסטודנטים רשומים בלבד</h3>
                  <p className="text-slate-500 mb-8 font-medium">הירשמו עכשיו כדי לקבל גישה לסיכומים, מבחנים ודפי נוסחאות!</p>
                  <button 
                    onClick={handleLogout}
                    className="bg-indigo-600 text-white px-10 py-4 rounded-[24px] font-black hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
                  >
                    הירשמו עכשיו
                  </button>
                </div>
              ) : (
                <div className="space-y-12">
                  {MATERIAL_CATEGORIES.map(category => {
                    const categoryMaterials = materials.filter(m => m.category === category.id);
                    return (
                      <div key={category.id} className="space-y-4">
                        <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
                          <category.icon className="h-6 w-6 text-indigo-600" />
                          <h3 className="text-xl font-black text-slate-800">{category.label}</h3>
                          <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-black">{categoryMaterials.length}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                          {categoryMaterials.length > 0 ? (
                            categoryMaterials.map(m => (
                              <div key={m.id} className="flex items-center justify-between p-6 bg-white rounded-[32px] border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all group">
                                <div className="flex items-center gap-6">
                                  <div className="h-14 w-14 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all"><FileText className="h-6 w-6" /></div>
                                  <div className="text-right">
                                    <h4 className="font-black text-slate-900 text-lg">{m.title}</h4>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.type} • {m.author} • {m.date}</span>
                                  </div>
                                </div>
                                <button className="h-12 w-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all"><Download className="h-5 w-5" /></button>
                              </div>
                            ))
                          ) : (
                            <div className="py-8 text-center bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 text-slate-400 font-bold">
                              אין חומרים בקטגוריה זו עדיין
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  
  // Dashboard State
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('reviews');
  const [searchQuery, setSearchQuery] = useState('');
  const [isChangingTrack, setIsChangingTrack] = useState(false);
  const [trackSearch, setTrackSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('All'); // 'All', 'חובה', 'בחירה'
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Dynamic Content State
  const [reviews, setReviews] = useState([]);
  const [allReviews, setAllReviews] = useState([]); // For course card counters
  const [questions, setQuestions] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [guestTab, setGuestTab] = useState('forum'); // 'forum', 'courses'
  const [guestSelectedTrack, setGuestSelectedTrack] = useState('');
  const [isGuestDrawerOpen, setIsGuestDrawerOpen] = useState(false);

  // Sync selectedCourse with URL
  const location = useLocation();
  const navigate = useNavigate();

  // Consolidated initial data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, reviewsRes] = await Promise.all([
          fetch('http://localhost:3000/courses'),
          fetch('http://localhost:3000/reviews')
        ]);
        const courses = await coursesRes.json();
        const reviewsData = await reviewsRes.json();
        
        setAllReviews(reviewsData);
        const coursesWithCounts = courses.map(c => ({
          ...c,
          reviewCount: reviewsData.filter(r => r.courseId === c.id).length
        }));
        setAllCourses(coursesWithCounts);
      } catch (err) {
        console.error('Error fetching initial data:', err);
      }
    };
    fetchData();
  }, []);

  // Sync selectedCourse based on URL path
  useEffect(() => {
    if (allCourses.length > 0) {
      const match = location.pathname.match(/\/course\/([^/]+)/);
      if (match) {
        const courseId = match[1];
        const course = allCourses.find(c => String(c.id) === String(courseId));
        if (course) {
          setSelectedCourse(course);
        } else {
          setSelectedCourse(null);
        }
      } else if (location.pathname === '/') {
        setSelectedCourse(null);
      }
    }
  }, [location.pathname, allCourses]);

  // Load reviews/questions/materials when course is selected
  useEffect(() => {
    if (selectedCourse) {
      // Fetch reviews for specific course
      fetch(`http://localhost:3000/reviews?courseId=${selectedCourse.id}`)
        .then(res => res.json())
        .then(data => setReviews(data));
      
      // Fetch questions
      fetch(`http://localhost:3000/questions?courseId=${selectedCourse.id}`)
        .then(res => res.json())
        .then(data => setQuestions(data));

      // Fetch materials
      fetch(`http://localhost:3000/materials?courseId=${selectedCourse.id}`)
        .then(res => res.json())
        .then(data => setMaterials(data));
    }
  }, [selectedCourse]);

  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');

  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [newMaterialTitle, setNewMaterialTitle] = useState('');
  const [newMaterialCategory, setNewMaterialCategory] = useState('summaries');
  const [newMaterialFile, setNewMaterialFile] = useState(null);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewSemester, setNewReviewSemester] = useState("סמסטר א'");
  const [newReviewYear, setNewReviewYear] = useState('תשפ"ד');
  const [newReviewIdentity, setNewReviewIdentity] = useState('full'); // 'full', 'initials', 'anon'
  const [newReviewAttendance, setNewReviewAttendance] = useState(false);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setSelectedCourse(null);
    navigate('/');
  };

  const handleChangeTrack = (newTrack) => {
    if (user.isGuest) {
      setGuestSelectedTrack(newTrack);
      setGuestTab('courses'); // Switch to courses view for guests
    } else {
      const updatedUser = { ...user, track: newTrack };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    setIsChangingTrack(false);
    setTrackSearch('');
    setSelectedCourse(null);
    navigate('/'); // ALWAYS navigate to home after track change
  };

  const filteredTracks = STUDY_TRACKS.filter(t => t.label.includes(trackSearch));

  const suggestions = searchQuery.length > 1 
    ? allCourses.filter(c => 
        c.title.includes(searchQuery) || 
        c.code.includes(searchQuery)
      ).slice(0, 5)
    : [];

  const filteredCourses = allCourses.filter(c => {
    if (!user) return false;
    
    // Base filters: search and type (All, חובה, בחירה)
    const matchesSearch = c.title.includes(searchQuery) || c.code.includes(searchQuery);
    const matchesFilter = courseFilter === 'All' || c.type === courseFilter;
    
    // Guest Mode logic: Must have a selected track to see any courses
    if (user.isGuest) {
      if (!guestSelectedTrack) return false;
      return c.track === guestSelectedTrack && matchesSearch && matchesFilter;
    }

    // Logged-in user logic
    const matchesTrack = user.track === 'General' || !user.track || c.track === user.track;
    return matchesTrack && matchesSearch && matchesFilter;
  });

  const getAuthorDisplayName = (fullName, type) => {
    if (type === 'anon') return 'אנונימי/ת';
    if (type === 'initials') {
      return fullName.split(' ').map(n => n[0] + '.').join(' ');
    }
    return fullName;
  };

  const handlePostReview = async () => {
    if (user?.isGuest) return;
    if (!newReviewComment) return alert('נא למלא את תוכן הביקורת');
    
    const newReview = {
      courseId: selectedCourse.id,
      difficulty: 4,
      comment: newReviewComment,
      semester: newReviewSemester,
      year: newReviewYear,
      attendanceEnforced: newReviewAttendance,
      date: new Date().toLocaleDateString('he-IL'),
      author: getAuthorDisplayName(user.name, newReviewIdentity),
      authorId: user.id,
      identityType: newReviewIdentity,
      likedBy: []
    };
    
    try {
      const res = await fetch('http://localhost:3000/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview)
      });
      const savedReview = await res.json();
      setReviews([savedReview, ...reviews]);
      setAllReviews([savedReview, ...allReviews]);
      
      // Update allCourses count
      setAllCourses(allCourses.map(c => 
        c.id === selectedCourse.id 
          ? { ...c, reviewCount: (c.reviewCount || 0) + 1 } 
          : c
      ));

      setNewReviewComment('');
      setNewReviewAttendance(false);
      setIsReviewModalOpen(false);
      alert('הביקורת פורסמה בהצלחה!');
    } catch (err) {
      alert('שגיאה בפרסום הביקורת');
    }
  };

  const handlePostQuestion = async () => {
    if (!newQuestionText) return;
    
    const newQ = {
      courseId: selectedCourse.id,
      question: newQuestionText,
      answers: [],
      date: new Date().toLocaleDateString('he-IL')
    };

    try {
      const res = await fetch('http://localhost:3000/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQ)
      });
      const savedQ = await res.json();
      setQuestions([savedQ, ...questions]);
      setNewQuestionText('');
      setIsQuestionModalOpen(false);
    } catch (err) {
      alert('שגיאה בפרסום השאלה');
    }
  };

  const handlePostAnswer = async (qId, text) => {
    if (user?.isGuest) return;
    if (!text) return;

    const question = questions.find(q => q.id === qId);
    const updatedAnswers = [...question.answers, { 
      text, 
      date: new Date().toLocaleDateString('he-IL'),
      authorId: user.id,
      likedBy: []
    }];

    try {
      const res = await fetch(`http://localhost:3000/questions/${qId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: updatedAnswers })
      });
      const updatedQ = await res.json();
      setQuestions(questions.map(q => q.id === qId ? updatedQ : q));
    } catch (err) {
      alert('שגיאה בפרסום התשובה');
    }
  };

  const handleLikeReview = async (reviewId) => {
    const review = reviews.find(r => r.id === reviewId);
    if (!review || !user?.id) return;

    // Prevent self-liking using authorId (most reliable) OR name match (for existing reviews without ID)
    const userDisplayName = getAuthorDisplayName(user.name, review.identityType || 'full');
    if (review.authorId === user.id || review.author === userDisplayName) {
      alert('לא ניתן לעשות לייק לביקורת של עצמך');
      return;
    }

    const likedBy = review.likedBy || [];
    if (likedBy.includes(user.id)) return; // Already liked

    const updatedLikedBy = [...likedBy, user.id];

    try {
      const res = await fetch(`http://localhost:3000/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ likedBy: updatedLikedBy })
      });
      const updatedReview = await res.json();
      setReviews(reviews.map(r => r.id === reviewId ? updatedReview : r));
    } catch (err) {
      console.error('Error liking review:', err);
    }
  };

  const handleLikeAnswer = async (qId, answerIndex) => {
    const question = questions.find(q => q.id === qId);
    if (!question || !user?.id) return;

    const answer = question.answers[answerIndex];
    if (answer.authorId === user.id) {
      alert('לא ניתן לעשות לייק לתשובה של עצמך');
      return;
    }

    const updatedAnswers = question.answers.map((a, i) => {
      if (i === answerIndex) {
        const likedBy = a.likedBy || [];
        if (likedBy.includes(user.id)) return a;
        return { ...a, likedBy: [...likedBy, user.id] };
      }
      return a;
    });

    try {
      const res = await fetch(`http://localhost:3000/questions/${qId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: updatedAnswers })
      });
      const updatedQ = await res.json();
      setQuestions(questions.map(q => q.id === qId ? updatedQ : q));
    } catch (err) {
      console.error('Error liking answer:', err);
    }
  };

  const handleLikeForumAnswer = async (qId, answerIndex) => {
    // This will be handled inside CombinationForum or via a shared logic if needed
    // For now, let's keep it separate if necessary
  };

  const handlePostMaterial = async () => {
    if (user?.isGuest) return;
    if (!newMaterialTitle || !newMaterialFile) return alert('נא למלא כותרת ולבחור קובץ');

    const newMat = {
      courseId: selectedCourse.id,
      title: newMaterialTitle,
      category: newMaterialCategory,
      type: newMaterialFile.name.split('.').pop().toUpperCase(),
      author: user.name,
      date: new Date().toLocaleDateString('he-IL')
    };

    try {
      const res = await fetch('http://localhost:3000/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMat)
      });
      const savedMat = await res.json();
      setMaterials([savedMat, ...materials]);
      setNewMaterialTitle('');
      setNewMaterialFile(null);
      setIsMaterialModalOpen(false);
      alert('החומר הועלה בהצלחה!');
    } catch (err) {
      alert('שגיאה בהעלאת החומר');
    }
  };

  if (!user) return <AuthPage onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col" dir="rtl">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 transition-all">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="hidden md:flex gap-4 items-center">
            <div className="flex items-center gap-4 bg-slate-50 px-5 py-2 rounded-2xl border border-slate-100">
              <div className="text-right">
                <div className="text-sm font-black text-slate-900 leading-none">
                  {user.name} {user.isGuest && <span className="text-[10px] text-indigo-400 mr-1 font-black underline">(אורח/ת)</span>}
                </div>
                {!user.isGuest && (
                  <button 
                    onClick={() => setIsChangingTrack(!isChangingTrack)}
                    className="text-[10px] text-indigo-600 font-black uppercase mt-1 tracking-tighter hover:underline"
                  >
                    {STUDY_TRACKS.find(t => t.value === user.track)?.label || user.track}
                  </button>
                )}
              </div>
              <button 
                onClick={handleLogout}
                className="bg-white text-slate-400 px-3 py-2 rounded-xl hover:text-rose-500 hover:bg-rose-50 transition-all shadow-sm flex items-center gap-2 group"
              >
                <span className="text-[10px] font-black uppercase hidden lg:block">התנתקות</span>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1"></div>

          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => { 
            setSelectedCourse(null); 
            if (user?.isGuest) setGuestTab('forum');
          }}>
            <span className="text-2xl font-black text-slate-900 tracking-tight">CourseMate</span>
            <div className="bg-indigo-600 p-2 rounded-xl group-hover:scale-110 transition-transform">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        {/* Searchable Track Selection Popover */}
        {isChangingTrack && (
          <div className="absolute top-20 left-6 bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 w-72 animate-in fade-in slide-in-from-top-2 duration-200 z-[60]" dir="rtl">
            <div className="flex items-center gap-3 mb-3 px-2">
              <button onClick={() => setIsChangingTrack(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                <X className="h-4 w-4" />
              </button>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">חפש מסלול לימוד חדש</p>
            </div>
            <div className="relative mb-4">
              <input 
                autoFocus
                type="text"
                placeholder="חפש מסלול..."
                value={trackSearch}
                onChange={(e) => setTrackSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-4 outline-none focus:border-indigo-500/20 text-sm font-bold text-right font-medium"
              />
            </div>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {filteredTracks.map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    // Explicit direct mapping to ensure no jumps
                    const targetTrack = t.value;
                    handleChangeTrack(targetTrack);
                  }}
                  className={`w-full text-right px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${(user.isGuest ? guestSelectedTrack : user.track) === t.value ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  {t.label}
                </button>
              ))}
              {filteredTracks.length === 0 && <p className="text-xs text-slate-400 text-center py-2">לא נמצאו מסלולים</p>}
            </div>
          </div>
        )}
      </nav>
      
      <main className="flex-grow container mx-auto px-6 py-12">
        <Routes>
          <Route path="/lecturer/:id" element={
            <LecturerProfile onDepartmentClick={(dept) => {
              // Find the track value that matches the department label
              const targetTrack = STUDY_TRACKS.find(t => t.label === dept || t.value === dept)?.value || dept;
              handleChangeTrack(targetTrack);
              navigate('/');
            }} />
          } />
          <Route path="/course/:id" element={
            <CourseDetail 
              selectedCourse={selectedCourse}
              navigate={navigate}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              reviews={reviews}
              user={user}
              setIsReviewModalOpen={setIsReviewModalOpen}
              handleLogout={handleLogout}
              handleLikeReview={handleLikeReview}
              questions={questions}
              setIsQuestionModalOpen={setIsQuestionModalOpen}
              handlePostAnswer={handlePostAnswer}
              handleLikeAnswer={handleLikeAnswer}
              setIsMaterialModalOpen={setIsMaterialModalOpen}
              materials={materials}
            />
          } />
          <Route path="/" element={
            <>
              {user.isGuest && (
                <div className="flex gap-4 p-1.5 bg-slate-100 rounded-2xl w-fit mb-12 mr-auto ml-0 transition-all animate-in fade-in slide-in-from-top-4 duration-500">
                  <button 
                    onClick={() => setGuestTab('forum')}
                    className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${guestTab === 'forum' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    פורום שילובים
                  </button>
                  <button 
                    onClick={() => setGuestTab('courses')}
                    className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${guestTab === 'courses' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    צפייה בקורסים
                  </button>
                </div>
              )}

              {(user.isGuest && guestTab === 'forum') ? (
                <CombinationForum 
                  user={user} 
                  onLogout={handleLogout} 
                  onTrackSelect={handleChangeTrack} 
                  STUDY_TRACKS={STUDY_TRACKS}
                />
              ) : (
                <Dashboard 
                  user={user}
                  guestSelectedTrack={guestSelectedTrack}
                  setIsGuestDrawerOpen={setIsGuestDrawerOpen}
                  allCourses={allCourses}
                  filteredCourses={filteredCourses}
                  courseFilter={courseFilter}
                  setCourseFilter={setCourseFilter}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  showSuggestions={showSuggestions}
                  setShowSuggestions={setShowSuggestions}
                  suggestions={suggestions}
                  navigate={navigate}
                />
              )}
            </>
          } />
        </Routes>
      </main>

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm" dir="rtl" onClick={() => setIsReviewModalOpen(false)}>
          <div className="bg-white w-full max-w-4xl rounded-[40px] p-10 shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <ReviewForm 
              comment={newReviewComment}
              semester={newReviewSemester}
              year={newReviewYear}
              identityType={newReviewIdentity}
              attendanceEnforced={newReviewAttendance}
              onCommentChange={setNewReviewComment}
              onSemesterChange={setNewReviewSemester}
              onYearChange={setNewReviewYear}
              onIdentityChange={setNewReviewIdentity}
              onAttendanceChange={setNewReviewAttendance}
              onSubmit={handlePostReview}
              onClose={() => setIsReviewModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Question Modal */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm" dir="rtl" onClick={() => setIsQuestionModalOpen(false)}>
          <div className="bg-white w-full max-w-lg rounded-[40px] p-10 text-right animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setIsQuestionModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                <X className="h-8 w-8" />
              </button>
              <h3 className="text-3xl font-black text-slate-900">שאל שאלה</h3>
            </div>
            <textarea 
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 rounded-[32px] p-6 h-48 outline-none mb-8 text-right font-medium" 
              placeholder="מה השאלה?"
            ></textarea>
            <div className="mt-8">
              <button onClick={handlePostQuestion} className="w-full bg-indigo-600 text-white py-5 rounded-[28px] font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-[0.98]">
                פרסם שאלה
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Material Modal */}
      {isMaterialModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm" dir="rtl" onClick={() => setIsMaterialModalOpen(false)}>
          <div className="bg-white w-full max-w-lg rounded-[40px] p-10 text-right animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setIsMaterialModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors"><X className="h-8 w-8" /></button>
              <h3 className="text-3xl font-black text-slate-900">העלאת חומר לימוד</h3>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">כותרת החומר</label>
                <input type="text" value={newMaterialTitle} onChange={(e) => setNewMaterialTitle(e.target.value)} className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-right" placeholder="למשל: מבחן מועד א 2023" />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">סוג החומר</label>
                <div className="grid grid-cols-2 gap-3">
                  {MATERIAL_CATEGORIES.map(cat => (
                    <button 
                      key={cat.id} 
                      onClick={() => setNewMaterialCategory(cat.id)} 
                      className={`flex items-center justify-start gap-3 px-4 py-3 rounded-xl border-2 transition-all font-bold text-sm ${newMaterialCategory === cat.id ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                    >
                      <cat.icon className="h-4 w-4" />
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">בחירת קובץ</label>
                <div onClick={() => document.getElementById('materialFile').click()} className={`border-2 border-dashed rounded-[32px] p-8 text-center cursor-pointer transition-all ${newMaterialFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-200 hover:border-indigo-200 bg-slate-50'}`}>
                  <input id="materialFile" type="file" className="hidden" onChange={(e) => setNewMaterialFile(e.target.files[0])} />
                  {newMaterialFile ? (
                    <div className="flex flex-col items-center text-emerald-600 font-bold"><CheckCircle className="h-10 w-10 mb-2" /><span className="text-sm truncate w-full px-4">{newMaterialFile.name}</span></div>
                  ) : (
                    <div className="flex flex-col items-center text-slate-400"><Upload className="h-10 w-10 mb-2" /><span className="text-sm font-black uppercase tracking-widest text-center">לחץ לבחירת קובץ</span></div>
                  )}
                </div>
              </div>
              <button onClick={handlePostMaterial} className="w-full bg-indigo-600 text-white py-5 rounded-[28px] font-black text-lg hover:bg-indigo-700 shadow-xl active:scale-95 transition-all mt-4">פרסם חומר לימוד</button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-white border-t border-slate-200 py-16 mt-20 text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">&copy; 2026 COURSEMATE ISRAEL 🇮🇱 מיוצר על ידי סטודנטים</p>
      </footer>

      {/* Guest Sidebar Drawer */}
      <div 
        className={`fixed inset-0 z-[110] transition-opacity duration-300 ${isGuestDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        dir="rtl"
      >
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsGuestDrawerOpen(false)}></div>
        <div className={`absolute top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-out transform ${isGuestDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-8 h-full flex flex-col">
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setIsGuestDrawerOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                <X className="h-8 w-8" />
              </button>
              <h2 className="text-2xl font-black text-slate-900">בחירת מסלול לימוד</h2>
            </div>

            <div className="relative mb-6">
              <input 
                type="text"
                placeholder="חפש חוג/מסלול..."
                value={trackSearch}
                onChange={(e) => setTrackSearch(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 rounded-2xl py-3 px-10 outline-none text-right font-bold transition-all"
              />
              <Search className="absolute right-3 top-3.5 h-4 w-4 text-slate-400" />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredTracks.map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    handleChangeTrack(t.value);
                    setIsGuestDrawerOpen(false);
                  }}
                  className={`w-full text-right px-6 py-4 rounded-2xl font-bold transition-all ${guestSelectedTrack === t.value ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  {t.label}
                </button>
              ))}
              {filteredTracks.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-slate-400 font-bold">לא נמצאו מסלולים תואמים</p>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-400 font-medium">לא מוצאים את החוג שלכם? <br/>נסו לחפש "אחר" או פנו אלינו.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
