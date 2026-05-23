import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Search, GraduationCap, Star, MessageSquare, 
  BookOpen, TrendingUp, Send, FileText, 
  Download, Upload, User, ChevronLeft,
  Filter, Award, Clock, X, CheckCircle, Lock,
  Camera, Heart, ChevronDown, Link as LinkIcon, ExternalLink, Share2, HardDrive,
  Edit2, Trash2
} from 'lucide-react';

// Components
import AuthPage from './components/AuthPage';
import CourseCard from './components/CourseCard';
import ReviewForm from './components/ReviewForm';
import CombinationForum from './components/CombinationForum';
import ForumsModal from './components/ForumsModal';
import LecturerProfile from './pages/LecturerProfile';

// Data
import projectData from './data.json';

const STUDY_TRACKS = projectData.tracks;

const MATERIAL_CATEGORIES = [
  { id: 'links', label: 'קישורים שימושיים', icon: LinkIcon },
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
  navigate,
  studyTracks,
  filterSemester, setFilterSemester,
  filterCampus, setFilterCampus,
  filterLanguage, setFilterLanguage,
  filterYear, setFilterYear,
  studentForums,
  studentForumQuestions,
  newStudentForumQ,
  setNewStudentForumQ,
  onPostStudentForumQ,
  onPostStudentForumA,
  expandedStudentQs,
  onToggleStudentQ,
  activeStudentForumId,
  setActiveStudentForumId,
  isStudentForumModalOpen,
  setIsStudentForumModalOpen
}) => {
  return (
  <div className="max-w-7xl mx-auto">
    <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="text-right">
          {user?.isGuest ? (
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">מסלול לימוד:</label>
              <button 
                onClick={() => setIsGuestDrawerOpen?.(true)}
                className="flex items-center gap-4 bg-white border-2 border-slate-200 rounded-[24px] px-8 py-4 hover:border-indigo-500 transition-all shadow-sm group"
              >
                <span className="font-bold text-slate-700">
                  {(studyTracks || []).find(t => t.value === guestSelectedTrack)?.label || 'לחצו לבחירת חוג...'}
                </span>
                <Filter className="h-5 w-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-5xl font-black text-slate-900 mb-4 leading-tight tracking-tight">שלום {(user?.name || '').split(' ')[0]}!</h1>
              <p className="text-xl text-slate-500 font-medium">הנה הקורסים במסלול {(studyTracks || []).find(t => t.value === user?.track)?.label || user?.track} שלך</p>
            </>
          )}
        </div>

      <div className="flex flex-col items-end gap-6">
        {user && !user.isGuest && (
          <button 
            onClick={() => setIsStudentForumModalOpen?.(true)}
            className="group flex items-center gap-3 bg-white border-2 border-indigo-100 hover:border-indigo-500 px-6 py-3 rounded-2xl transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <div className="bg-indigo-50 p-2 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <MessageSquare className="h-4 w-4" />
            </div>
            <span className="text-sm font-black text-slate-700 group-hover:text-indigo-600">הפורומים של השילוב שלך</span>
          </button>
        )}

        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
          {['All', 'חובה', 'בחירה', 'קורסי יסוד', 'חובת בחירה'].map(f => (
            <button
              key={f}
              onClick={() => setCourseFilter?.(f)}
              className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all ${courseFilter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {f === 'All' ? 'הכל' : f}
            </button>
          ))}
        </div>
      </div>
    </header>

    <ForumsModal 
      isOpen={isStudentForumModalOpen}
      onClose={() => setIsStudentForumModalOpen?.(false)}
      user={user}
      forumsList={studentForums || []}
      activeForumId={activeStudentForumId}
      onSetActiveForum={setActiveStudentForumId}
      forumQuestions={studentForumQuestions || []}
      newQuestion={newStudentForumQ}
      setNewQuestion={setNewStudentForumQ}
      onPostQuestion={onPostStudentForumQ}
      onPostAnswer={onPostStudentForumA}
      expandedQs={expandedStudentQs || {}}
      onToggleQ={onToggleStudentQ}
    />

    {/* Course Search Bar */}
    <div className="mb-8 relative max-w-2xl ml-auto group">
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

    {/* Multi-criteria Filters */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12" dir="rtl">
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2 text-right">סמסטר</label>
        <select 
          value={filterSemester} 
          onChange={(e) => setFilterSemester(e.target.value)}
          className="bg-white border-2 border-slate-200 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500 transition-all font-bold text-sm text-right appearance-none cursor-pointer hover:border-slate-300"
        >
          {['הכל', "סמסטר א'", "סמסטר ב'", 'שנתי', 'קיץ'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2 text-right">קמפוס</label>
        <select 
          value={filterCampus} 
          onChange={(e) => setFilterCampus(e.target.value)}
          className="bg-white border-2 border-slate-200 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500 transition-all font-bold text-sm text-right appearance-none cursor-pointer hover:border-slate-300"
        >
          {['הכל', 'הר הצופים', 'קרית א"י ספרא', 'עין כרם', 'רחובות'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2 text-right">שפה</label>
        <select 
          value={filterLanguage} 
          onChange={(e) => setFilterLanguage(e.target.value)}
          className="bg-white border-2 border-slate-200 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500 transition-all font-bold text-sm text-right appearance-none cursor-pointer hover:border-slate-300"
        >
          {['הכל', 'עברית', 'אנגלית'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2 text-right">שנה בתואר</label>
        <select 
          value={filterYear} 
          onChange={(e) => setFilterYear(e.target.value)}
          className="bg-white border-2 border-slate-200 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500 transition-all font-bold text-sm text-right appearance-none cursor-pointer hover:border-slate-300"
        >
          {['הכל', "שנה א'", "שנה ב'", "שנה ג'", "שנה ד'"].map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
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
            const yearCourses = filteredCourses.filter(c => c.type !== 'בחירה' && c.year === year);
            if (yearCourses.length === 0) return null;
            return (
              <div key={year} className="space-y-8">
                <div className="flex items-center gap-4 flex-row-reverse">
                  <div className="h-px flex-1 bg-slate-200"></div>
                  <h2 className="text-3xl font-black text-slate-800">
                    {courseFilter === 'All' ? 'קורסי חובה' : courseFilter} - שנה {year}
                  </h2>
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
};

const MaterialItem = ({ item, user, onUpdate, onDelete, getMaterialIcon }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [editUrl, setEditUrl] = useState(item.url || '');

  const handleSave = async () => {
    if (!editTitle || (item.isLink && !editUrl)) return alert('נא למלא את כל הפרטים');
    await onUpdate(item.id, { title: editTitle, url: editUrl });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(item.title);
    setEditUrl(item.url || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex flex-col gap-4 p-6 bg-slate-50 rounded-[32px] border-2 border-indigo-100 animate-in fade-in duration-200 text-right">
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 mr-2">כותרת</label>
            <input 
              type="text" 
              value={editTitle} 
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-indigo-500 transition-all font-bold text-right"
            />
          </div>
          {item.isLink && (
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 mr-2">כתובת (URL)</label>
              <input 
                type="text" 
                value={editUrl} 
                onChange={(e) => setEditUrl(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-indigo-500 transition-all font-medium text-right"
                dir="ltr"
              />
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <button 
            onClick={() => onDelete(item.id)}
            className="flex items-center gap-2 text-rose-500 hover:text-rose-600 font-black text-xs transition-all px-4 py-2 hover:bg-rose-50 rounded-xl"
          >
            <Trash2 className="h-4 w-4" />
            <span>מחיקת פריט</span>
          </button>
          <div className="flex gap-2">
            <button 
              onClick={handleCancel}
              className="px-4 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-200 transition-all text-xs"
            >
              ביטול
            </button>
            <button 
              onClick={handleSave}
              className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all text-xs shadow-md"
            >
              שמירה
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-6 bg-white rounded-[32px] border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all group">
      <div className="flex items-center gap-6">
        <div className="h-14 w-14 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
          {getMaterialIcon(item)}
        </div>
        <div className="text-right">
          <h4 className="font-black text-slate-900 text-lg">{item.title}</h4>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {item.isLink ? `${item.type} • ${item.date}` : `${item.type} • ${item.author} • ${item.date}`}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {!user.isGuest && (
          <button 
            onClick={() => setIsEditing(true)}
            className="h-12 w-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all"
            title="עריכה"
          >
            <Edit2 className="h-5 w-5" />
          </button>
        )}
        {item.isLink ? (
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="h-12 w-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all">
            <ExternalLink className="h-5 w-5" />
          </a>
        ) : (
          <button className="h-12 w-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all">
            <Download className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

const CourseDetail = ({ 
  selectedCourse, 
  navigate, 
  activeTab, 
  setActiveTab, 
  reviews, 
  user, 
  setIsReviewModalOpen, 
  setIsRatingModalOpen,
  handleLogout, 
  handleLikeReview, 
  handleDeleteReview,
  handleEditReview,
  editingReviewId,
  inlineEditComment,
  setInlineEditComment,
  handleSaveInlineEdit,
  handleCancelInlineEdit,
  questions, 
  setIsQuestionModalOpen, 
  handlePostAnswer, 
  handleLikeAnswer, 
  setIsMaterialModalOpen,
  setIsLinkModalOpen,
  materials,
  onUpdateMaterial,
  onDeleteMaterial
}) => {
  const location = useLocation();
  if (!selectedCourse) return <div className="text-center py-20 animate-pulse text-2xl font-black text-slate-400">טוען נתונים...</div>;
  
  const fromLecturer = location.state?.from === 'lecturer';
  const lecturerName = location.state?.lecturerName;

  const handleBack = () => {
    // If we have history, go back. Otherwise go to home.
    if (window.history.length > 1 && location.key !== 'default') {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const attendanceReviews = reviews.filter(r => r.attendanceEnforced !== undefined && r.attendanceEnforced !== null);
  const enforcementRate = attendanceReviews.length > 0
    ? Math.round((attendanceReviews.filter(r => r.attendanceEnforced === true).length / attendanceReviews.length) * 100)
    : null;

  const difficultyReviews = reviews.filter(r => r.difficulty !== undefined);
  const avgDifficulty = difficultyReviews.length > 0
    ? (difficultyReviews.reduce((sum, r) => sum + r.difficulty, 0) / difficultyReviews.length).toFixed(1)
    : selectedCourse.difficulty;

  const textReviews = reviews.filter(r => r.comment && r.comment.trim() !== '');

  const hasUserRated = reviews.some(r => 
    (r.authorId !== undefined && String(r.authorId) === String(user?.id)) || 
    (r.author === user?.name)
  );

  const handleOpenRatingModal = () => {
    if (hasUserRated) {
      alert('כבר דירגת את הקורס הזה, תודה על העזרה!');
    } else {
      setIsRatingModalOpen(true);
    }
  };

  const handleOpenReviewModal = () => {
    setIsReviewModalOpen(true);
  };

  const getMaterialIcon = (m) => {
    if (m.isLink) {
      if (m.type === 'WHATSAPP') return <Share2 className="h-6 w-6" />;
      if (m.type === 'DRIVE') return <HardDrive className="h-6 w-6" />;
      return <LinkIcon className="h-6 w-6" />;
    }
    return <FileText className="h-6 w-6" />;
  };

  const getTypeBadgeStyles = (type) => {
    switch (type) {
      case 'חובה': return 'bg-rose-50 text-rose-600';
      case 'בחירה': return 'bg-emerald-50 text-emerald-600';
      case 'קורסי יסוד': return 'bg-blue-50 text-blue-600';
      case 'חובת בחירה': return 'bg-amber-50 text-amber-600';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={handleBack}
        className="group mb-8 flex items-center gap-3 text-slate-500 font-black hover:text-indigo-600 transition-all"
      >
        <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 group-hover:border-indigo-100">
          <ChevronLeft className="h-4 w-4 rotate-180" />
        </div>
        <span>{fromLecturer ? `חזרה למרצה: ${lecturerName || ''}` : 'חזרה לכל הקורסים'}</span>
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
                <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest ${getTypeBadgeStyles(selectedCourse.type)}`}>
                  {selectedCourse.type}
                </span>
                <span className="bg-amber-50 text-amber-700 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                  {selectedCourse.credits} נ"ז
                </span>
                <span className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                  {selectedCourse.code} | {selectedCourse.language || 'עברית'}
                </span>
                {selectedCourse.campus && (
                  <span className="bg-slate-50 text-slate-400 px-3 py-1 rounded-xl text-[9px] font-bold uppercase tracking-wider border border-slate-100">
                    {selectedCourse.campus}
                  </span>
                )}
              </div>
              
              {/* Row 2: [Semester] [Assessment] [Attendance] [Lecturer] */}
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
                  נוכחות: {selectedCourse.attendanceValue || (selectedCourse.attendanceMandatory ? 'חובה' : 'אין')}
                </span>
                <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <User className="h-3 w-3" />
                  {selectedCourse.instructors && selectedCourse.instructors.length > 0 ? (
                    selectedCourse.instructors.map((inst, idx) => (
                      <Link key={inst.id} to={`/lecturer/${inst.id}`} className="hover:underline">
                        {inst.name}{idx < selectedCourse.instructors.length - 1 ? ',' : ''}
                      </Link>
                    ))
                  ) : (
                    <span>{selectedCourse.instructor || 'לא ידוע'}</span>
                  )}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 p-6 rounded-[32px] flex md:flex-col items-center gap-4 min-w-[180px]">
            <div className="text-center">
              <div className="text-4xl font-black text-rose-500 mb-1">{avgDifficulty}</div>
              <div className="text-[10px] text-slate-400 font-black uppercase text-center">קושי ממוצע</div>
              <div className="text-[10px] text-slate-400 font-bold text-center mt-1">({difficultyReviews.length || 0} הצבעות)</div>
            </div>
            {!user.isGuest && (
              <button 
                onClick={() => setIsRatingModalOpen(true)}
                className="bg-white border-2 border-rose-100 text-rose-500 px-4 py-2 rounded-xl font-black text-[10px] uppercase hover:bg-rose-50 transition-all shadow-sm"
              >
                דרג קושי
              </button>
            )}
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
                <h2 className="text-2xl font-black text-slate-900 text-right">ביקורות ({textReviews.length})</h2>
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

              {textReviews.map(r => (
                <div key={r.id} className="bg-white rounded-[32px] shadow-sm border border-slate-200 p-8 text-right relative overflow-hidden">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-black shrink-0">
                        {r.author[0]}
                      </div>
                      <div className="text-right">
                        <div className="font-black text-slate-900">{r.author}</div>
                        <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex flex-wrap gap-1">
                          <span>מרצה:</span>
                          {selectedCourse.instructors && selectedCourse.instructors.length > 0 ? (
                            selectedCourse.instructors.map((inst, idx) => (
                              <Link 
                                key={inst.id} 
                                to={`/lecturer/${inst.id}`} 
                                className="hover:underline"
                              >
                                {inst.name}{idx < selectedCourse.instructors.length - 1 ? ',' : ''}
                              </Link>
                            ))
                          ) : (
                            <span>{selectedCourse.instructor || 'לא ידוע'}</span>
                          )}
                        </div>
                        </div>

                    </div>
                    <div className="flex items-center gap-4">
                      {((r.authorId !== undefined && String(r.authorId) === String(user?.id)) || (r.author === user?.name)) && (
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleEditReview(r)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                            title="עריכה"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteReview(r.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="מחיקה"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{r.date}</div>
                    </div>
                  </div>
                  
                  <div className="mb-8 pr-4 border-r-2 border-indigo-50">
                    {editingReviewId === r.id ? (
                      <div className="space-y-4">
                        <textarea 
                          value={inlineEditComment}
                          onChange={(e) => setInlineEditComment(e.target.value)}
                          className="w-full bg-slate-50 border-2 border-indigo-100 focus:border-indigo-500 rounded-[24px] p-6 h-32 outline-none text-right font-medium text-slate-700 resize-none transition-all"
                        />
                        <div className="flex items-center gap-3 justify-end">
                          <button 
                            onClick={handleCancelInlineEdit}
                            className="px-6 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-100 transition-all text-sm"
                          >
                            ביטול
                          </button>
                          <button 
                            onClick={() => handleSaveInlineEdit(r.id)}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all text-sm shadow-md"
                          >
                            שמירה
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-600 text-lg font-medium leading-relaxed italic whitespace-pre-wrap">
                        {r.comment}
                      </p>
                    )}
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
              <div className="flex justify-between items-start mb-6">
                <div className="text-right">
                  <h2 className="text-2xl font-black text-slate-900">חומרי לימוד</h2>
                </div>
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
                        <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
                          <div className="flex items-center gap-3">
                            <category.icon className="h-6 w-6 text-indigo-600" />
                            <h3 className="text-xl font-black text-slate-800">{category.label}</h3>
                            <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-black">{categoryMaterials.length}</span>
                          </div>
                          {category.id === 'links' && !user.isGuest && (
                            <button 
                              onClick={() => setIsLinkModalOpen(true)}
                              className="text-indigo-600 hover:text-indigo-700 font-black text-xs flex items-center gap-1.5 transition-all px-3 py-1.5 bg-indigo-50 rounded-xl"
                            >
                              <LinkIcon className="h-3 w-3" />
                              הוספת קישור
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                          {categoryMaterials.length > 0 ? (
                            categoryMaterials.map(m => (
                              <MaterialItem 
                                key={m.id}
                                item={m}
                                user={user}
                                onUpdate={onUpdateMaterial}
                                onDelete={onDeleteMaterial}
                                getMaterialIcon={getMaterialIcon}
                              />
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
  
  // New multi-criteria filters
  const [filterSemester, setFilterSemester] = useState('הכל');
  const [filterCampus, setFilterCampus] = useState('הכל');
  const [filterLanguage, setFilterLanguage] = useState('הכל');
  const [filterYear, setFilterYear] = useState('הכל');
  
  // Student Personal Forum State
  const [studentForums, setStudentForums] = useState([]); // List of relevant forums
  const [studentForumQuestions, setStudentForumQuestions] = useState([]);
  const [activeStudentForumId, setActiveStudentForumId] = useState(null);
  const [isStudentForumExpanded, setIsStudentForumExpanded] = useState(false);
  const [isStudentForumModalOpen, setIsStudentForumModalOpen] = useState(false);
  const [newStudentForumQ, setNewStudentForumQ] = useState('');
  const [expandedStudentQs, setExpandedStudentQs] = useState({});

  const toggleStudentQ = (qId) => {
    setExpandedStudentQs(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  // Dynamic Content State
  const [studyTracks, setStudyTracks] = useState([]);
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

  // Load study tracks on mount
  useEffect(() => {
    fetch('http://localhost:5000/api/combinations')
      .then(res => res.json())
      .then(data => setStudyTracks(data.value || data))
      .catch(err => console.error('Error fetching combinations:', err));
  }, []);

  // Fetch Student Personal Forums
  useEffect(() => {
    if (!user || user.isGuest || !user.track) {
      setStudentForums([]);
      return;
    }

    const fetchStudentForums = async () => {
      try {
        const res = await fetch('http://localhost:3000/combinations');
        const forums = await res.json();
        
        const mA = String(user.track || '').trim();
        const mB = String(user.majorB || '').trim();
        const yr = String(user.academicYear || '').trim();

        console.log('DEBUG: Attempting to match forums for:', { mA, mB, yr });

        // Helper for loose matching
        const isMatch = (field, search) => {
          if (!field || !search) return false;
          const f = String(field).toLowerCase().trim();
          const s = String(search).toLowerCase().trim();
          return f.includes(s) || s.includes(f);
        };

        // 1. Primary Forum: Both Major A AND Major B
        const primary = forums.filter(f => {
          const matchesMajors = (isMatch(f.title, mA) && isMatch(f.title, mB)) || 
                               (isMatch(f.majorA, mA) && isMatch(f.majorB, mB)) ||
                               (isMatch(f.majorA, mB) && isMatch(f.majorB, mA));
          const matchesYear = !yr || yr === 'הכל' || isMatch(f.academicYear, yr);
          return matchesMajors && matchesYear;
        });

        // 2. Secondary Forums (Major A): Major A but NOT Major B
        const secA = forums.filter(f => {
          const matchesMajor = isMatch(f.title, mA) || isMatch(f.majorA, mA) || isMatch(f.majorB, mA);
          const matchesOther = mB && (isMatch(f.title, mB) || isMatch(f.majorA, mB) || isMatch(f.majorB, mB));
          const matchesYear = !yr || yr === 'הכל' || isMatch(f.academicYear, yr);
          return matchesMajor && !matchesOther && matchesYear;
        });

        // 3. Secondary Forums (Major B): Major B but NOT Major A
        const secB = forums.filter(f => {
          const matchesMajor = isMatch(f.title, mB) || isMatch(f.majorA, mB) || isMatch(f.majorB, mB);
          const matchesOther = mA && (isMatch(f.title, mA) || isMatch(f.majorA, mA) || isMatch(f.majorB, mA));
          const matchesYear = !yr || yr === 'הכל' || isMatch(f.academicYear, yr);
          return matchesMajor && !matchesOther && matchesYear;
        });

        const allRelevant = [...primary, ...secA, ...secB];
        console.log('DEBUG: Lenient search results:', { total: forums.length, matched: allRelevant.length });
        
        setStudentForums(allRelevant);
        
        if (allRelevant.length > 0 && !activeStudentForumId) {
          setActiveStudentForumId(primary.length > 0 ? primary[0].id : allRelevant[0].id);
        }
      } catch (err) {
        console.error('Error fetching student forums:', err);
      }
    };

    fetchStudentForums();
  }, [user?.track, user?.majorB, user?.academicYear]);

  // Fetch Questions for active forum
  useEffect(() => {
    if (!activeStudentForumId) {
      setStudentForumQuestions([]);
      return;
    }

    fetch(`http://localhost:3000/combinationQuestions?combinationId=${activeStudentForumId}`)
      .then(res => res.json())
      .then(qs => setStudentForumQuestions(qs.reverse()))
      .catch(err => console.error('Error fetching active forum questions:', err));
  }, [activeStudentForumId]);

  const handlePostStudentForumQ = async () => {
    if (!newStudentForumQ.trim() || !activeStudentForumId) return;

    const newQ = {
      combinationId: activeStudentForumId,
      question: newStudentForumQ,
      answers: [],
      date: new Date().toLocaleDateString('he-IL'),
      author: user.name
    };

    try {
      const res = await fetch('http://localhost:3000/combinationQuestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQ)
      });
      const savedQ = await res.json();
      setStudentForumQuestions([savedQ, ...studentForumQuestions]);
      setNewStudentForumQ('');
      alert('השאלה פורסמה בהצלחה!');
    } catch (err) {
      alert('שגיאה בפרסום השאלה');
    }
  };

  const handlePostStudentForumA = async (qId, text) => {
    if (!text.trim()) return;
    const question = studentForumQuestions.find(q => q.id === qId);
    if (!question) return;

    const updatedAnswers = [...question.answers, { 
      text, 
      date: new Date().toLocaleDateString('he-IL'), 
      author: user.name,
      authorId: user.id,
      likedBy: []
    }];

    try {
      const res = await fetch(`http://localhost:3000/combinationQuestions/${qId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: updatedAnswers })
      });
      const updatedQ = await res.json();
      setStudentForumQuestions(studentForumQuestions.map(q => q.id === qId ? updatedQ : q));
    } catch (err) {
      alert('שגיאה בפרסום התשובה');
    }
  };

  // Consolidated initial data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentTrack = user?.isGuest ? guestSelectedTrack : user?.track;
        if (!currentTrack || (user?.isGuest && !guestSelectedTrack)) {
          setAllCourses([]);
          return;
        }

        let coursesUrl = 'http://localhost:3000/courses';
        
        // Use real SQL data for any combination selected from the database
        // Real combinations use roadmap codes (e.g. 521-3010)
        const isRealCombination = /^\d{3}-\d{4}$/.test(currentTrack);
        if (isRealCombination) {
          coursesUrl = `http://localhost:5000/api/combinations/${currentTrack}/courses`;
        } else if (currentTrack === 'Computer Science') {
          // Compatibility with legacy mock data
          coursesUrl = 'http://localhost:5000/api/combinations/521-3010/courses';
        }

        const [coursesRes, reviewsRes] = await Promise.all([
          fetch(coursesUrl),
          fetch('http://localhost:3000/reviews')
        ]);
        const coursesData = await coursesRes.json();
        const courses = Array.isArray(coursesData) ? coursesData : (coursesData.value || []);
        
        const reviewsData = (await reviewsRes.json()) || [];

        setAllReviews(reviewsData);
        const coursesWithCounts = courses.map(c => {
          const courseReviews = (reviewsData || []).filter(r => String(r?.courseId) === String(c?.id));
          const difficultyReviews = courseReviews.filter(r => r?.difficulty !== undefined);
          
          let avgDiff;
          if (difficultyReviews.length > 0) {
            avgDiff = (difficultyReviews.reduce((sum, r) => sum + r.difficulty, 0) / difficultyReviews.length);
          } else {
            // Standardize existing 1-5 scale data to 1-10
            avgDiff = (c.difficulty || 0) * 2;
          }
          
          return {
            ...c,
            track: currentTrack, // Ensure it matches the filter
            reviewCount: courseReviews.length,
            difficulty: avgDiff
          };
        });
        setAllCourses(coursesWithCounts);
      } catch (err) {
        console.error('Error fetching initial data:', err);
      }
    };
    fetchData();
  }, [user?.track, guestSelectedTrack]);

  // Sync selectedCourse based on URL path
  useEffect(() => {
    const syncCourseFromUrl = async () => {
      const match = location.pathname.match(/\/course\/([^/]+)/);
      if (match) {
        const courseId = match[1];
        let course = allCourses.find(c => String(c.id) === String(courseId));
        
        if (!course) {
          try {
            const res = await fetch(`http://localhost:5000/api/courses/${courseId}`);
            if (res.ok) {
              course = await res.json();
            }
          } catch (err) {
            console.error('Error fetching individual course:', err);
          }
        }
        
        if (course) {
          setSelectedCourse(course);
        } else if (allCourses.length > 0) {
          setSelectedCourse(null);
        }
      } else if (location.pathname === '/') {
        setSelectedCourse(null);
      }
    };
    
    syncCourseFromUrl();
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

  const fileInputRef = useRef(null);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkType, setNewLinkType] = useState('drive'); // 'drive', 'whatsapp', 'other'
  const [newMaterialTitle, setNewMaterialTitle] = useState('');
  const [newMaterialCategory, setNewMaterialCategory] = useState('summaries');
  const [newMaterialFile, setNewMaterialFile] = useState(null);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewSemester, setNewReviewSemester] = useState("סמסטר א'");
  const [newReviewYear, setNewReviewYear] = useState('תשפ"ו (2025-26)');
  const [newReviewIdentity, setNewReviewIdentity] = useState('full'); // 'full', 'initials', 'anon'
  const [newReviewAttendance, setNewReviewAttendance] = useState(null); // null means not selected
  const [newReviewDifficulty, setNewReviewDifficulty] = useState(5);

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

  const filteredTracks = studyTracks.filter(t => t.label.includes(trackSearch));

  const suggestions = searchQuery.length > 1 
    ? allCourses.filter(c => 
        c.title.includes(searchQuery) || 
        c.code.includes(searchQuery)
      ).slice(0, 5)
    : [];

  const filteredCourses = allCourses.filter(c => {
    if (!user) return false;
    
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      (c.title && c.title.toLowerCase().includes(query)) || 
      (c.code && c.code.toLowerCase().includes(query));
      
    const matchesFilter = courseFilter === 'All' || c.type === courseFilter;
    
    // Multi-criteria filters
    const semesterQuery = filterSemester.replace(/'/g, '');
    const matchesSemester = filterSemester === 'הכל' || (c.semester && (
      (filterSemester === "סמסטר א'" && (c.semester.includes('א') || c.semester.includes('1'))) ||
      (filterSemester === "סמסטר ב'" && (c.semester.includes('ב') || c.semester.includes('2'))) ||
      c.semester.includes(semesterQuery)
    ));
      
    const matchesCampus = filterCampus === 'הכל' || 
      (c.campus && c.campus.includes(filterCampus === 'קרית א"י ספרא' ? 'ספרא' : filterCampus));
      
    const matchesLanguage = filterLanguage === 'הכל' || 
      (c.language && c.language.includes(filterLanguage));
    
    const yearMap = { "שנה א'": "א", "שנה ב'": "ב", "שנה ג'": "ג", "שנה ד'": "ד" };
    const matchesYear = filterYear === 'הכל' || c.year === yearMap[filterYear];

    const passesAllCriteria = matchesSemester && matchesCampus && matchesLanguage && matchesYear;

    // Guest Mode logic: Must have a selected track to see any courses
    if (user.isGuest) {
      if (!guestSelectedTrack) return false;
      return c.track === guestSelectedTrack && matchesSearch && matchesFilter && passesAllCriteria;
    }

    // Logged-in user logic
    const matchesTrack = user.track === 'General' || !user.track || c.track === user.track;
    return matchesTrack && matchesSearch && matchesFilter && passesAllCriteria;
  });

  const getAuthorDisplayName = (fullName, type) => {
    if (!fullName) return 'אורח/ת';
    if (type === 'anon') return 'אנונימי/ת';
    if (type === 'initials') {
      return fullName.trim().split(/\s+/).map(n => n[0] + '.').join(' ');
    }
    return fullName;
  };

  const handlePostReview = async () => {
    if (user?.isGuest) return;
    if (!newReviewComment) return alert('נא למלא את תוכן הביקורת');
    
    const reviewData = {
      courseId: selectedCourse.id,
      difficulty: newReviewDifficulty,
      comment: newReviewComment,
      semester: newReviewSemester,
      year: newReviewYear,
      attendanceEnforced: newReviewAttendance,
      date: editingReviewId ? reviews.find(r => r.id === editingReviewId)?.date : new Date().toLocaleDateString('he-IL'),
      author: getAuthorDisplayName(user.name, newReviewIdentity),
      authorId: user.id,
      identityType: newReviewIdentity,
      likedBy: editingReviewId ? (reviews.find(r => r.id === editingReviewId)?.likedBy || []) : []
    };
    
    try {
      let res;
      if (editingReviewId) {
        res = await fetch(`http://localhost:3000/reviews/${editingReviewId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reviewData)
        });
      } else {
        res = await fetch('http://localhost:3000/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reviewData)
        });
      }

      if (!res.ok) throw new Error('Failed to save review');
      const savedReview = await res.json();
      
      if (editingReviewId) {
        setReviews(reviews.map(r => r.id === editingReviewId ? savedReview : r));
        setAllReviews(allReviews.map(r => r.id === editingReviewId ? savedReview : r));
      } else {
        setReviews([savedReview, ...reviews]);
        setAllReviews([savedReview, ...allReviews]);
        setAllCourses(allCourses.map(c => 
          c.id === selectedCourse.id 
            ? { ...c, reviewCount: (c.reviewCount || 0) + 1 } 
            : c
        ));
      }

      setNewReviewComment('');
      setNewReviewAttendance(null);
      setNewReviewDifficulty(5);
      setEditingReviewId(null);
      setIsReviewModalOpen(false);
      alert(editingReviewId ? 'הביקורת עודכנה בהצלחה!' : 'הביקורת פורסמה בהצלחה!');
    } catch (err) {
      alert('שגיאה בשמירת הביקורת');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('האם אתם בטוחים שברצונכם למחוק את הביקורת?')) return;

    try {
      const res = await fetch(`http://localhost:3000/reviews/${reviewId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete review');

      setReviews(reviews.filter(r => r.id !== reviewId));
      setAllReviews(allReviews.filter(r => r.id !== reviewId));
      setAllCourses(allCourses.map(c => 
        c.id === selectedCourse?.id 
          ? { ...c, reviewCount: Math.max(0, (c.reviewCount || 0) - 1) } 
          : c
      ));
      alert('הביקורת נמחקה בהצלחה');
    } catch (err) {
      alert('שגיאה במחיקת הביקורת');
    }
  };

  const [inlineEditComment, setInlineEditComment] = useState('');

  const handleEditReview = (review) => {
    setEditingReviewId(review.id);
    setInlineEditComment(review.comment);
  };

  const handleCancelInlineEdit = () => {
    setEditingReviewId(null);
    setInlineEditComment('');
  };

  const handleSaveInlineEdit = async (reviewId) => {
    if (!inlineEditComment.trim()) return alert('נא למלא את תוכן הביקורת');

    try {
      const res = await fetch(`http://localhost:3000/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: inlineEditComment })
      });

      if (!res.ok) throw new Error('Failed to update review');
      const updatedReview = await res.json();
      
      setReviews(reviews.map(r => r.id === reviewId ? updatedReview : r));
      setAllReviews(allReviews.map(r => r.id === reviewId ? updatedReview : r));
      
      setEditingReviewId(null);
      setInlineEditComment('');
      alert('הביקורת עודכנה בהצלחה!');
    } catch (err) {
      alert('שגיאה בעדכון הביקורת');
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

  const hasUserRated = reviews.some(r => 
    (r.authorId !== undefined && String(r.authorId) === String(user?.id)) || 
    (r.author === user?.name)
  );

  const handlePostRating = async () => {
    if (user?.isGuest || !selectedCourse) return;
    
    const newRating = {
      courseId: selectedCourse.id,
      rating: 5, // Default rating since UI only shows difficulty
      difficulty: newReviewDifficulty,
      attendanceEnforced: newReviewAttendance,
      comment: "", // Empty comment for quick rating
      semester: newReviewSemester,
      year: newReviewYear,
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
        body: JSON.stringify(newRating)
      });
      
      if (!res.ok) throw new Error('Failed to post rating');
      
      const savedRating = await res.json();
      setReviews([savedRating, ...reviews]);
      setAllReviews([savedRating, ...allReviews]);
      
      // Update allCourses count
      setAllCourses(allCourses.map(c => 
        c.id === selectedCourse.id 
          ? { ...c, reviewCount: (c.reviewCount || 0) + 1 } 
          : c
      ));

      setNewReviewAttendance(null);
      setNewReviewDifficulty(5);
      setIsRatingModalOpen(false);
      alert('הדירוג נשלח בהצלחה!');
    } catch (err) {
      console.error('Rating submission error:', err);
      alert('שגיאה בשליחת הדירוג');
    }
  };

  const handlePostMaterial = async () => {
    if (user?.isGuest || !selectedCourse) return;
    if (!newMaterialTitle || !newMaterialFile) return alert('נא למלא את כל הפרטים ולבחור קובץ');

    const newMaterial = {
      courseId: selectedCourse.id,
      title: newMaterialTitle,
      category: newMaterialCategory,
      type: newMaterialFile.name.split('.').pop().toUpperCase(),
      author: user.name,
      date: new Date().toLocaleDateString('he-IL'),
      likedBy: []
    };

    try {
      const res = await fetch('http://localhost:3000/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMaterial)
      });
      const savedM = await res.json();
      setMaterials([savedM, ...materials]);
      setNewMaterialTitle('');
      setNewMaterialFile(null);
      setIsMaterialModalOpen(false);
      alert('חומר הלימוד הועלה בהצלחה!');
    } catch (err) {
      alert('שגיאה בהעלאת חומר הלימוד');
    }
  };

  const handleEditLink = (link) => {
    setEditingLinkId(link.id);
    setNewLinkTitle(link.title);
    setNewLinkUrl(link.url);
    setNewLinkType(link.type.toLowerCase());
    setIsLinkModalOpen(true);
  };

  const handlePostLink = async () => {
    if (user?.isGuest || !selectedCourse) return;
    if (!newLinkTitle || !newLinkUrl) return alert('נא למלא את כל הפרטים');

    const linkData = {
      courseId: selectedCourse.id,
      title: newLinkTitle,
      url: newLinkUrl,
      category: 'links',
      type: newLinkType.toUpperCase(),
      author: user.name,
      date: editingLinkId ? materials.find(m => m.id === editingLinkId)?.date : new Date().toLocaleDateString('he-IL'),
      isLink: true,
      likedBy: editingLinkId ? (materials.find(m => m.id === editingLinkId)?.likedBy || []) : []
    };

    try {
      let res;
      if (editingLinkId) {
        res = await fetch(`http://localhost:3000/materials/${editingLinkId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(linkData)
        });
      } else {
        res = await fetch('http://localhost:3000/materials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(linkData)
        });
      }

      if (!res.ok) throw new Error('Failed to save link');
      const savedL = await res.json();
      
      if (editingLinkId) {
        setMaterials(materials.map(m => m.id === editingLinkId ? savedL : m));
      } else {
        setMaterials([savedL, ...materials]);
      }

      setNewLinkTitle('');
      setNewLinkUrl('');
      setEditingLinkId(null);
      setIsLinkModalOpen(false);
      alert(editingLinkId ? 'הקישור עודכן בהצלחה!' : 'הקישור נוסף בהצלחה!');
    } catch (err) {
      alert('שגיאה בשמירת הקישור');
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm('האם למחוק את הפריט?')) return;
    try {
      const res = await fetch(`http://localhost:3000/materials/${materialId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete material');
      setMaterials(materials.filter(m => m.id !== materialId));
      alert('הפריט נמחק בהצלחה');
    } catch (err) {
      alert('שגיאה במחיקת הפריט');
    }
  };

  const handleUpdateMaterial = async (id, data) => {
    try {
      const res = await fetch(`http://localhost:3000/materials/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update material');
      const updated = await res.json();
      setMaterials(materials.map(m => m.id === id ? updated : m));
      alert('העדכון נשמר בהצלחה');
    } catch (err) {
      alert('שגיאה בשמירת העדכון');
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
                    {(studyTracks || []).find(t => t.value === user.track)?.label || user.track}
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
                  key={t.value}
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
            <LecturerProfile user={user} onDepartmentClick={(dept) => {
              // Find the track value that matches the department label
              const targetTrack = studyTracks.find(t => t.label === dept || t.value === dept)?.value || dept;
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
              setIsRatingModalOpen={setIsRatingModalOpen}
              handleLogout={handleLogout}
              handleLikeReview={handleLikeReview}
              handleDeleteReview={handleDeleteReview}
              handleEditReview={handleEditReview}
              editingReviewId={editingReviewId}
              inlineEditComment={inlineEditComment}
              setInlineEditComment={setInlineEditComment}
              handleSaveInlineEdit={handleSaveInlineEdit}
              handleCancelInlineEdit={handleCancelInlineEdit}
              questions={questions}
              setIsQuestionModalOpen={setIsQuestionModalOpen}
              handlePostAnswer={handlePostAnswer}
              handleLikeAnswer={handleLikeAnswer}
              setIsMaterialModalOpen={setIsMaterialModalOpen}
              setIsLinkModalOpen={setIsLinkModalOpen}
              materials={materials}
              onUpdateMaterial={handleUpdateMaterial}
              onDeleteMaterial={handleDeleteMaterial}
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
                  STUDY_TRACKS={studyTracks}
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
                  studyTracks={studyTracks}
                  filterSemester={filterSemester}
                  setFilterSemester={setFilterSemester}
                  filterCampus={filterCampus}
                  setFilterCampus={setFilterCampus}
                  filterLanguage={filterLanguage}
                  setFilterLanguage={setFilterLanguage}
                  filterYear={filterYear}
                  setFilterYear={setFilterYear}
                  studentForums={studentForums}
                  studentForumQuestions={studentForumQuestions}
                  newStudentForumQ={newStudentForumQ}
                  setNewStudentForumQ={setNewStudentForumQ}
                  onPostStudentForumQ={handlePostStudentForumQ}
                  onPostStudentForumA={handlePostStudentForumA}
                  expandedStudentQs={expandedStudentQs}
                  onToggleStudentQ={toggleStudentQ}
                  activeStudentForumId={activeStudentForumId}
                  setActiveStudentForumId={setActiveStudentForumId}
                  isStudentForumModalOpen={isStudentForumModalOpen}
                  setIsStudentForumModalOpen={setIsStudentForumModalOpen}
                />
              )}
            </>
          } />
        </Routes>
      </main>

      {/* Rating Modal (Difficulty Only) */}
      {isRatingModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm" dir="rtl" onClick={() => setIsRatingModalOpen(false)}>
          <div className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setIsRatingModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                <X className="h-8 w-8" />
              </button>
              <h3 className="text-3xl font-black text-slate-900">דירוג קורס מהיר</h3>
            </div>

            <div className="space-y-8">
              <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 relative">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-black text-slate-700 block">רמת קושי הקורס (1-10)</label>
                  {hasUserRated && <span className="text-[10px] font-black text-amber-500 bg-amber-50 px-2 py-1 rounded-lg">כבר דירגת רכיב זה בעבר.</span>}
                </div>
                <div className="flex items-center gap-6">
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    step="1"
                    value={newReviewDifficulty}
                    onChange={(e) => setNewReviewDifficulty(parseInt(e.target.value))}
                    disabled={hasUserRated}
                    className={`flex-1 h-3 bg-slate-200 rounded-lg appearance-none accent-rose-500 ${hasUserRated ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  />
                  <div className={`h-12 w-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center font-black text-xl border-2 border-rose-100 shadow-sm shrink-0 ${hasUserRated ? 'opacity-50' : ''}`}>
                    {newReviewDifficulty}
                  </div>
                </div>
                <div className="flex justify-between mt-2 px-1">
                  <span className={`text-[10px] font-black uppercase tracking-tighter ${hasUserRated ? 'text-slate-300' : 'text-slate-400'}`}>קל מאוד</span>
                  <span className={`text-[10px] font-black uppercase tracking-tighter ${hasUserRated ? 'text-rose-300' : 'text-rose-600'}`}>
                    {newReviewDifficulty <= 2 ? "קל מאוד" : newReviewDifficulty === 3 ? "קל" : newReviewDifficulty <= 7 ? "בינוני" : newReviewDifficulty <= 9 ? "קשה" : "קשה מאוד"}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 mb-8">
                <label className="text-sm font-black text-slate-700 mb-4 block">סמסטר</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "סמסטר א'", label: "סמסטר א'" },
                    { id: "סמסטר ב'", label: "סמסטר ב'" },
                    { id: "סמסטר קיץ", label: "סמסטר קיץ" },
                    { id: "שנתי", label: "שנתי" }
                  ].map(option => (
                    <button
                      key={option.id}
                      onClick={() => setNewReviewSemester(option.id)}
                      className={`py-3 rounded-xl font-black text-sm border-2 transition-all ${
                        newReviewSemester === option.id 
                          ? 'bg-indigo-600 text-white border-transparent shadow-md' 
                          : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200 hover:shadow-sm'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 relative">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-black text-slate-700 block">האם נבדקה נוכחות?</label>
                  {hasUserRated && <span className="text-[10px] font-black text-amber-500 bg-amber-50 px-2 py-1 rounded-lg">כבר דירגת רכיב זה בעבר.</span>}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: true, label: 'כן', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
                    { id: false, label: 'לא', color: 'bg-rose-50 text-rose-600 border-rose-100' },
                    { id: null, label: 'לא יודע/ת', color: 'bg-slate-100 text-slate-500 border-slate-200' }
                  ].map(option => (
                    <button
                      key={String(option.id)}
                      onClick={() => setNewReviewAttendance(option.id)}
                      disabled={hasUserRated}
                      className={`py-3 rounded-xl font-black text-sm border-2 transition-all ${
                        newReviewAttendance === option.id 
                          ? `${option.id === true ? 'bg-emerald-600' : option.id === false ? 'bg-rose-600' : 'bg-slate-600'} text-white border-transparent shadow-md` 
                          : `${option.color} hover:shadow-sm`
                      } ${hasUserRated ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handlePostRating}
                className="w-full bg-indigo-600 text-white py-5 rounded-[28px] font-black text-lg hover:bg-indigo-700 shadow-xl active:scale-95 transition-all"
              >
                שלח דירוג
              </button>
            </div>
          </div>
        </div>
      )}

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
              difficulty={newReviewDifficulty}
              onCommentChange={setNewReviewComment}
              onSemesterChange={setNewReviewSemester}
              onYearChange={setNewReviewYear}
              onIdentityChange={setNewReviewIdentity}
              onAttendanceChange={setNewReviewAttendance}
              onDifficultyChange={setNewReviewDifficulty}
              onSubmit={handlePostReview}
              onClose={() => setIsReviewModalOpen(false)}
              hasRated={hasUserRated}
            />
          </div>
        </div>
      )}

      {/* Question Modal */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm" dir="rtl" onClick={() => setIsQuestionModalOpen(false)}>
          <div className="bg-white w-full max-w-lg rounded-[40px] p-10 text-right animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-8 gap-4">
              <button 
                onClick={() => setIsQuestionModalOpen(false)} 
                className="p-2 text-slate-400 hover:text-rose-500 transition-colors shrink-0 -mt-2 -mr-2"
                title="סגור"
              >
                <X className="h-8 w-8" />
              </button>
              <div className="text-right flex-1">
                <h3 className="text-3xl font-black text-slate-900">שאל שאלה</h3>
                <p className="text-slate-500 font-bold text-sm mt-1">תשאלו שאלה קצרה וקולעת שיכולה לעזור לסטודנטים נוספים ותשימו לב שזאת שאלה שלא נשאלה כבר.</p>
              </div>
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
            <div className="flex flex-col gap-1 mb-8">
              <div className="flex items-center gap-4">
                <button onClick={() => setIsMaterialModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors"><X className="h-8 w-8" /></button>
                <h3 className="text-3xl font-black text-slate-900">העלאת חומר לימוד</h3>
              </div>
              <p className="text-slate-500 font-bold text-sm mt-1 pr-12">כאן תמצאו חומרים שיכולים לעזור לכם בקורס. יש לכם חומר שיכול לעזור? העלו אותו כדי שהמאגר ימשיך לגדול.</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">כותרת החומר</label>
                <input type="text" value={newMaterialTitle} onChange={(e) => setNewMaterialTitle(e.target.value)} className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-right" placeholder="למשל: מבחן מועד א 2023" />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">סוג החומר</label>
                <div className="grid grid-cols-2 gap-3">
                  {MATERIAL_CATEGORIES.filter(cat => cat.id !== 'links').map(cat => (
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
                <div onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-[32px] p-8 text-center cursor-pointer transition-all ${newMaterialFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-200 hover:border-indigo-200 bg-slate-50'}`}>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    className="hidden" 
                    onChange={(e) => setNewMaterialFile(e.target.files[0])} 
                  />
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

      {/* Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm" dir="rtl" onClick={() => { setIsLinkModalOpen(false); setEditingLinkId(null); }}>
          <div className="bg-white w-full max-w-lg rounded-[40px] p-10 text-right animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => { setIsLinkModalOpen(false); setEditingLinkId(null); }} className="text-slate-400 hover:text-rose-500 transition-colors"><X className="h-8 w-8" /></button>
              <h3 className="text-3xl font-black text-slate-900">{editingLinkId ? 'עריכת קישור' : 'הוספת קישור'}</h3>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">כותרת הקישור</label>
                <input 
                  type="text" 
                  value={newLinkTitle} 
                  onChange={(e) => setNewLinkTitle(e.target.value)} 
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-right" 
                  placeholder="למשל: קבוצת וואטסאפ של הקורס" 
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">כתובת הקישור (URL)</label>
                <input 
                  type="text" 
                  value={newLinkUrl} 
                  onChange={(e) => setNewLinkUrl(e.target.value)} 
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-right" 
                  placeholder="https://..." 
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">סוג הקישור</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'drive', label: 'Google Drive', icon: LinkIcon },
                    { id: 'whatsapp', label: 'WhatsApp', icon: Share2 },
                    { id: 'other', label: 'אחר', icon: ExternalLink }
                  ].map(type => (
                    <button 
                      key={type.id} 
                      onClick={() => setNewLinkType(type.id)} 
                      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all font-bold text-xs ${newLinkType === type.id ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                    >
                      <type.icon className="h-5 w-5" />
                      <span>{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handlePostLink} className="w-full bg-indigo-600 text-white py-5 rounded-[28px] font-black text-lg hover:bg-indigo-700 shadow-xl active:scale-95 transition-all mt-4">
                {editingLinkId ? 'עדכן קישור' : 'הוסף קישור'}
              </button>
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
                  key={t.value}
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
