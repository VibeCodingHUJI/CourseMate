import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Search, GraduationCap, Star, MessageSquare, 
  BookOpen, TrendingUp, Send, FileText, 
  Download, Upload, User, ChevronLeft,
  Filter, Award, Clock, X, CheckCircle, Lock,
  Camera, Heart, ChevronDown, Link as LinkIcon, ExternalLink, Share2, HardDrive,
  Edit2, Trash2, Bell, BellDot, ArrowLeft
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
import { supabase } from './supabaseClient';
import { logActivity, ActivityActions } from './activityLogger';

const STUDY_TRACKS = projectData.tracks;

// Module-level variable — lives completely outside React, never affected by renders or closures
let _uploadCategory = 'misc';

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
  onOpenForumPage
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
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 mb-4 leading-tight tracking-tight">שלום {(user?.name || '').split(' ')[0]}!</h1>
              <p className="text-base sm:text-xl text-slate-500 font-medium">הנה הקורסים במסלול {(studyTracks || []).find(t => t.value === user?.track)?.label || user?.track} שלך</p>
            </>
          )}
        </div>

      <div className="flex flex-col items-start md:items-end gap-4 sm:gap-6 w-full md:w-auto">
        {user && !user.isGuest && (
          <button 
            onClick={() => onOpenForumPage?.()}
            className="group flex items-center gap-3 bg-white border-2 border-indigo-100 hover:border-indigo-500 px-6 py-3 rounded-2xl transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap flex-shrink-0"
          >
            <div className="bg-indigo-50 p-2 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <MessageSquare className="h-4 w-4" />
            </div>
            <span className="text-sm font-black text-slate-700 group-hover:text-indigo-600">הפורומים של השילוב שלך</span>
          </button>
        )}

        <div className="overflow-x-auto w-full md:w-auto pb-1">
        <div className="flex flex-row flex-nowrap gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit min-w-max">
          {['All', 'חובה', 'בחירה', 'קורסי יסוד', 'חובת בחירה'].map(f => (
            <button
              key={f}
              onClick={() => setCourseFilter?.(f)}
              className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all whitespace-nowrap flex-shrink-0 ${courseFilter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {f === 'All' ? 'הכל' : f}
            </button>
          ))}
        </div>
        </div>
      </div>
    </header>

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
                  <h2 className="text-xl sm:text-3xl font-black text-slate-800">
                    {courseFilter === 'All' ? 'קורסי חובה' : courseFilter} - שנה {year}
                  </h2>
                  <div className="h-px flex-1 bg-slate-200"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
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
                  <h2 className="text-xl sm:text-3xl font-black text-slate-800">קורסי בחירה</h2>
                  <div className="h-px flex-1 bg-slate-200"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
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
            {`${item.type || item.fileExtension?.toUpperCase() || 'קובץ'} • ${item.date}`}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {!user.isGuest && user.id === item.userId && (
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
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="h-12 w-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all">
            <Download className="h-5 w-5" />
          </a>
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
  handleDeleteQuestion,
  handlePostAnswer,
  handleDeleteAnswer,
  onOpenMaterialUpload,
  setIsLinkModalOpen,
  materials,
  onUpdateMaterial,
  onDeleteMaterial,
  isFollowing,
  onToggleFollow
}) => {
  const location = useLocation();
  const [isUnfollowModalOpen, setIsUnfollowModalOpen] = useState(false);
  const [answerInputs, setAnswerInputs] = useState({});

  if (!selectedCourse) return <div className="text-center py-20 animate-pulse text-2xl font-black text-slate-400">טוען נתונים...</div>;
  
  const fromLecturer = location.state?.from === 'lecturer';
  const lecturerName = location.state?.lecturerName;

  const handleBack = () => {
    if (window.history.length > 1 && location.key !== 'default') {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const handleFollowToggle = () => {
    if (isFollowing) {
      setIsUnfollowModalOpen(true);
    } else {
      onToggleFollow(selectedCourse.id, selectedCourse.title, true);
    }
  };

  const confirmUnfollow = () => {
    onToggleFollow(selectedCourse.id, selectedCourse.title, false);
    setIsUnfollowModalOpen(false);
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
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      {/* Unfollow Confirmation Modal */}
      {isUnfollowModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsUnfollowModalOpen(false)}>
          <div className="bg-white w-full max-w-sm rounded-[40px] p-10 text-center shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="bg-rose-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-rose-500">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4 leading-tight">האם ברצונך לבטל את המעקב אחרי קורס זה?</h3>
            <div className="flex flex-col gap-3 mt-8">
              <button 
                onClick={confirmUnfollow}
                className="w-full bg-rose-500 text-white py-4 rounded-[24px] font-black hover:bg-rose-600 transition-all shadow-lg shadow-rose-200 active:scale-95"
              >
                כן, בטל מעקב
              </button>
              <button 
                onClick={() => setIsUnfollowModalOpen(false)}
                className="w-full bg-slate-100 text-slate-500 py-4 rounded-[24px] font-black hover:bg-slate-200 transition-all active:scale-95"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={handleBack}
        className="group mb-8 flex items-center gap-3 text-slate-500 font-black hover:text-indigo-600 transition-all"
      >
        <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 group-hover:border-indigo-100">
          <ChevronLeft className="h-4 w-4 rotate-180" />
        </div>
        <span>{fromLecturer ? `חזרה למרצה: ${lecturerName || ''}` : 'חזרה לכל הקורסים'}</span>
      </button>

      <header className="bg-white rounded-[24px] sm:rounded-[40px] shadow-sm border border-slate-200 p-6 sm:p-10 mb-4 sm:mb-8 relative overflow-hidden text-right">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="flex-1 flex flex-col items-start text-right w-full">
            <div className="flex items-center gap-3 mb-6">
               <h1 className="text-2xl sm:text-5xl font-black text-slate-900 tracking-tight">{selectedCourse.title}</h1>
               {!user.isGuest && (
                 <div className="flex items-center gap-3 group cursor-pointer shrink-0" onClick={handleFollowToggle}>
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${isFollowing ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-200 hover:border-indigo-300'}`}>
                      {isFollowing ? (
                        <CheckCircle className="h-5 w-5 text-white" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-slate-100 group-hover:bg-indigo-100"></div>
                      )}
                    </div>
                    <span className={`text-xs font-black transition-colors whitespace-nowrap ${isFollowing ? 'text-emerald-600' : 'text-slate-400 group-hover:text-indigo-500'}`}>
                      {isFollowing ? 'עוקב' : 'מעקב אחרי הקורס'}
                    </span>
                 </div>
               )}
            </div>
            <p className="text-sm sm:text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mb-4 sm:mb-8 w-full">{selectedCourse.description}</p>
            
            <div className="flex flex-col items-start gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${getTypeBadgeStyles(selectedCourse.type)}`}>
                  {selectedCourse.type}
                </span>
                <span className="bg-amber-50 text-amber-700 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                  {selectedCourse.credits} נ"ז
                </span>
                <span className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                  {selectedCourse.code} | {selectedCourse.language || 'עברית'}
                </span>
                {selectedCourse.campus && (
                  <span className="bg-slate-50 text-slate-400 px-3 py-1 rounded-xl text-[9px] font-bold uppercase tracking-wider border border-slate-100 whitespace-nowrap">
                    {selectedCourse.campus}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                {selectedCourse.semester && (
                  <span className="bg-orange-50 text-orange-600 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                    {selectedCourse.semester === 'שנתי' ? 'שנתי' :
                     selectedCourse.semester === 'א' ? 'סמסטר א׳' : 
                     selectedCourse.semester === 'ב' ? 'סמסטר ב׳' : 
                     selectedCourse.semester === 'א וב' ? 'סמסטר א׳ וב׳' : `סמסטר ${selectedCourse.semester}`}
                  </span>
                )}
                {selectedCourse.assessmentType && (
                  <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${selectedCourse.assessmentType === 'בחינה' ? 'bg-violet-50 text-violet-600' : 'bg-teal-50 text-teal-600'}`}>
                    {selectedCourse.assessmentType}
                  </span>
                )}
                <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${selectedCourse.attendanceMandatory ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-500'}`}>
                  נוכחות: {selectedCourse.attendanceMandatory ? 'חובה' : 'אין'}
                </span>
                <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center flex-wrap gap-x-1.5 gap-y-1 max-w-full">
                  <User className="h-3 w-3" />
                  {selectedCourse.instructors && selectedCourse.instructors.length > 0 ? (
                    selectedCourse.instructors.map((inst, idx) => (
                      <span key={inst.id} className="whitespace-nowrap">
                        <Link to={`/lecturer/${inst.id}`} className="hover:underline">
                          {inst.name}
                        </Link>
                        {idx < selectedCourse.instructors.length - 1 ? ',' : ''}
                      </span>
                    ))
                  ) : (
                    <span className="whitespace-nowrap">{selectedCourse.instructor || 'לא ידוע'}</span>
                  )}
                </span>
              </div>
              {selectedCourse.attendanceMandatory && selectedCourse.attendanceValue && selectedCourse.attendanceValue.length > 10 && (
                <p className="text-xs text-blue-700 bg-blue-50 rounded-2xl px-4 py-2 mt-2 leading-relaxed w-full">
                  {selectedCourse.attendanceValue}
                </p>
              )}
            </div>
          </div>

          <div className="bg-slate-50 p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] flex md:flex-col items-center gap-3 sm:gap-4 min-w-[120px] sm:min-w-[180px]">
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

      <div className="mb-6 sm:mb-10 overflow-x-auto pb-1">
        <div className="p-1.5 bg-slate-100 rounded-[28px] w-fit flex gap-1 sm:gap-2" dir="rtl">
          {[
            { id: 'reviews', label: 'ביקורות', icon: Star },
            { id: 'qna', label: 'שאלות ותשובות', icon: MessageSquare },
            { id: 'materials', label: 'חומרי לימוד', icon: BookOpen }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 sm:px-8 py-3 sm:py-4 rounded-[22px] transition-all font-black text-xs sm:text-sm flex items-center gap-2 sm:gap-3 whitespace-nowrap ${
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
              <div key={r.id} className="bg-white rounded-[24px] sm:rounded-[32px] shadow-sm border border-slate-200 p-5 sm:p-8 text-right relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-black shrink-0">
                      {r.author[0]}
                    </div>
                    <div className="text-right">
                      <div className="font-black text-slate-900">{r.author}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {((r.authorId !== undefined && String(r.authorId) === String(user?.id)) || (r.author === user?.name)) && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEditReview(r)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="עריכה">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteReview(r.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title="מחיקה">
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
                        <button onClick={handleCancelInlineEdit} className="px-6 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-100 transition-all text-sm">ביטול</button>
                        <button onClick={() => handleSaveInlineEdit(r.id)} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all text-sm shadow-md">שמירה</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-600 text-lg font-medium leading-relaxed italic whitespace-pre-wrap">{r.comment}</p>
                  )}
                </div>
                
                <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                  <div className="text-xs font-black text-slate-400 bg-slate-50 px-4 py-1.5 rounded-xl uppercase tracking-widest">{r.semester}, {r.year}</div>
                  <button onClick={() => handleLikeReview(r.id)} className="flex items-center gap-2 text-slate-400 hover:text-rose-500 transition-colors group/like">
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
            {questions.length === 0 && (
              <div className="text-center py-12 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-400">אין שאלות עדיין</h3>
                <p className="text-slate-400 text-sm mt-2">היו הראשונים לשאול שאלה על הקורס!</p>
              </div>
            )}
            {questions.map(q => (
              <div key={q.id} className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden text-right">
                {/* Question header */}
                <div className="p-8 bg-slate-900 text-white flex justify-between items-start">
                  <div className="flex items-start gap-4 flex-1">
                    <MessageSquare className="h-6 w-6 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xl font-bold">{q.title}</div>
                      <div className="text-sm text-white/60 mt-1 font-medium">{q.author} · {q.date}</div>
                    </div>
                  </div>
                  {String(q.authorId) === String(user?.id) && !user?.isGuest && (
                    <button onClick={() => handleDeleteQuestion(q.id)} className="text-white/30 hover:text-rose-400 transition-colors p-1 shrink-0 mr-2">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {/* Question content */}
                <div className="px-8 pt-6 pb-4">
                  <p className="text-slate-700 font-medium leading-relaxed">{q.content}</p>
                </div>
                {/* Answers */}
                {(q.answers || []).length > 0 && (
                  <div className="px-8 pb-4 space-y-4 border-t border-slate-100 pt-4">
                    {(q.answers || []).map(a => (
                      <div key={a.id} className="flex items-start gap-4 border-r-4 border-indigo-50 pr-4 group">
                        <div className="h-8 w-8 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 font-black text-sm shrink-0">
                          {(a.author || 'ס')[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-black text-slate-800 text-sm">{a.author}</span>
                            <span className="text-[10px] text-slate-400">{a.date}</span>
                          </div>
                          <p className="text-slate-600 text-sm font-medium leading-relaxed">{a.content}</p>
                        </div>
                        {String(a.authorId) === String(user?.id) && !user?.isGuest && (
                          <button onClick={() => handleDeleteAnswer(q.id, a.id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-400 transition-all p-1 shrink-0">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {/* Answer input */}
                <div className="px-8 pb-6 pt-3 border-t border-slate-100 flex gap-3 items-center">
                  <input
                    type="text"
                    value={answerInputs[q.id] || ''}
                    onChange={e => setAnswerInputs(prev => ({ ...prev, [q.id]: e.target.value }))}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && answerInputs[q.id]?.trim().length >= 2) {
                        handlePostAnswer(q.id, answerInputs[q.id]);
                        setAnswerInputs(prev => ({ ...prev, [q.id]: '' }));
                      }
                    }}
                    placeholder="כתבו תשובה ולחצו Enter..."
                    className="flex-1 bg-slate-50 border-2 border-transparent focus:border-indigo-200 rounded-2xl px-5 py-3 outline-none text-right font-medium text-sm transition-all"
                  />
                  <button
                    onClick={() => {
                      if (answerInputs[q.id]?.trim().length >= 2) {
                        handlePostAnswer(q.id, answerInputs[q.id]);
                        setAnswerInputs(prev => ({ ...prev, [q.id]: '' }));
                      }
                    }}
                    className="bg-indigo-600 text-white px-5 py-3 rounded-2xl font-black text-sm hover:bg-indigo-700 active:scale-95 transition-all shrink-0 flex items-center justify-center"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="space-y-10 text-right">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-black text-slate-900">חומרי לימוד</h2>
            </div>

            {user.isGuest ? (
              <div className="bg-white rounded-[40px] border-2 border-dashed border-slate-200 p-12 text-center">
                <div className="bg-slate-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-400"><Lock className="h-10 w-10" /></div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">חומרי הלימוד זמינים לסטודנטים רשומים בלבד</h3>
                <p className="text-slate-500 mb-8 font-medium">הירשמו עכשיו כדי לקבל גישה לסיכומים, מבחנים ודפי נוסחאות!</p>
                <button onClick={handleLogout} className="bg-indigo-600 text-white px-10 py-4 rounded-[24px] font-black hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all">הירשמו עכשיו</button>
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
                        {!user.isGuest && (
                          category.id === 'links' ? (
                            <button onClick={() => setIsLinkModalOpen(true)} className="text-indigo-600 hover:text-indigo-700 font-black text-xs flex items-center gap-1.5 transition-all px-3 py-1.5 bg-indigo-50 rounded-xl">
                              <LinkIcon className="h-3 w-3" />
                              הוספת קישור
                            </button>
                          ) : (
                            <button onClick={() => onOpenMaterialUpload(category.id)} className="text-indigo-600 hover:text-indigo-700 font-black text-xs flex items-center gap-1.5 transition-all px-3 py-1.5 bg-indigo-50 rounded-xl">
                              <Upload className="h-3 w-3" />
                              העלאה
                            </button>
                          )
                        )}
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        {categoryMaterials.length > 0 ? categoryMaterials.map(m => (
                          <MaterialItem key={m.id} item={m} user={user} onUpdate={onUpdateMaterial} onDelete={onDeleteMaterial} getMaterialIcon={getMaterialIcon} />
                        )) : (
                          <div className="py-8 text-center bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 text-slate-400 font-bold">אין חומרים בקטגוריה זו עדיין</div>
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
  );
};

const App = () => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    if (parsed?.isGuest) { localStorage.removeItem('user'); return null; }
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(parsed?.id);
    if (!isUuid) { localStorage.removeItem('user'); return null; }
    return parsed;
  });
  
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('reviews');
  const [searchQuery, setSearchQuery] = useState('');
  const [isChangingTrack, setIsChangingTrack] = useState(false);
  const [trackSearch, setTrackSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('All');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filterSemester, setFilterSemester] = useState('הכל');
  const [filterCampus, setFilterCampus] = useState('הכל');
  const [filterLanguage, setFilterLanguage] = useState('הכל');
  const [filterYear, setFilterYear] = useState('הכל');
  
  const [studentForums, setStudentForums] = useState([]);
  const [studentForumQuestions, setStudentForumQuestions] = useState([]);
  const [activeStudentForumId, setActiveStudentForumId] = useState(null);
  const [isStudentForumModalOpen, setIsStudentForumModalOpen] = useState(false);
  const [newStudentForumQ, setNewStudentForumQ] = useState('');
  const [expandedStudentQs, setExpandedStudentQs] = useState({});

  const toggleStudentQ = (qId) => setExpandedStudentQs(prev => ({ ...prev, [qId]: !prev[qId] }));

  const [studyTracks, setStudyTracks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [guestTab, setGuestTab] = useState('forum');
  const [guestSelectedTrack, setGuestSelectedTrack] = useState('');
  const [isGuestDrawerOpen, setIsGuestDrawerOpen] = useState(false);
  const [showForumView, setShowForumView] = useState(false);
  const [forumViewId, setForumViewId] = useState(null);

  // Lifted Follow State
  const [followedCourseIds, setFollowedCourseIds] = useState([]);

  // Load followed courses from DB when user logs in
  useEffect(() => {
    if (!user?.id || user.isGuest) { setFollowedCourseIds([]); return; }
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/follows/${user.id}`)
      .then(r => r.json())
      .then(ids => { if (Array.isArray(ids)) setFollowedCourseIds(ids); })
      .catch(() => {});
  }, [user?.id]);

  const [notifications, setNotifications] = useState([]);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const notifyRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => { if (notifyRef.current && !notifyRef.current.contains(e.target)) setIsNotifyOpen(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!user?.id || user?.isGuest) return;
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/notifications?userId=${user.id}`)
      .then(res => res.json())
      .then(data => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || user?.isGuest) return;

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        const n = payload.new;
        setNotifications(prev => [{
          id: n.id,
          text: n.text,
          read: n.read,
          forumId: n.forum_id,
          date: new Date(n.created_at).toLocaleDateString('he-IL', { hour: '2-digit', minute: '2-digit' })
        }, ...prev]);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || user?.isGuest) return;
    const hasUnread = notifications.some(n => !n.read);
    if (isNotifyOpen && hasUnread) {
      // Persist to DB when panel opens
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/notifications/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      }).catch(() => {});
    }
    if (!isNotifyOpen && hasUnread) {
      // Clear badge when panel closes
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  }, [isNotifyOpen]);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/combinations`)
      .then(res => res.json())
      .then(data => setStudyTracks(Array.isArray(data) ? data : (data.value || [])))
      .catch(err => console.error('Error fetching combinations:', err));
  }, []);

  useEffect(() => {
    if (!user || user.isGuest || !user.track) { setStudentForums([]); return; }
    const fetchStudentForums = async () => {
      try {
        const _API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${_API}/api/general-forums/relevant?track=${encodeURIComponent(user.track)}`);
        const forums = await res.json();
        const list = Array.isArray(forums) ? forums : [];
        setStudentForums(list);
        if (list.length > 0) setActiveStudentForumId(list[0].id);
      } catch (err) { console.error('Error fetching student forums:', err); }
    };
    fetchStudentForums();
  }, [user?.track]);

  useEffect(() => {
    if (!activeStudentForumId) { setStudentForumQuestions([]); return; }
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/general-forum-questions?forumId=${activeStudentForumId}`)
      .then(res => res.json())
      .then(qs => setStudentForumQuestions(Array.isArray(qs) ? qs : []))
      .catch(err => console.error('Error fetching questions:', err));
  }, [activeStudentForumId]);

  const handlePostStudentForumQ = async () => {
    if (!newStudentForumQ.trim() || !activeStudentForumId) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/general-forum-questions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ forumId: activeStudentForumId, question: newStudentForumQ, author: user.name, userId: user.isGuest ? null : user.id }) });
      const savedQ = await res.json();
      setStudentForumQuestions([savedQ, ...studentForumQuestions]);
      setNewStudentForumQ('');
      alert('השאלה פורסמה בהצלחה!');
    } catch (err) { alert('שגיאה בפרסום השאלה'); }
  };

  const handlePostStudentForumA = async (qId, text) => {
    if (!text.trim()) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/general-forum-answers`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ questionId: qId, text, author: user.name, userId: user.isGuest ? null : user.id }) });
      const updatedQ = await res.json();
      setStudentForumQuestions(studentForumQuestions.map(q => q.id === qId ? updatedQ : q));
    } catch (err) { alert('שגיאה בפרסום התשובה'); }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentTrack = user?.isGuest ? guestSelectedTrack : user?.track;
        if (!currentTrack || (user?.isGuest && !guestSelectedTrack)) { setAllCourses([]); return; }
        const _API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        let url = `${_API}/api/courses`;
        if (/^\d{3}-\d{4}$/.test(currentTrack)) url = `${_API}/api/combinations/${currentTrack}/courses`;
        else if (currentTrack === 'Computer Science') url = `${_API}/api/combinations/521-3010/courses`;
        const [cRes, rRes] = await Promise.all([fetch(url), fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reviews`)]);        const cData = await cRes.json();
        let rData = [];
        try { const parsed = await rRes.json(); if (Array.isArray(parsed)) rData = parsed; } catch {}
        setAllReviews(rData);
        setAllCourses((Array.isArray(cData) ? cData : (cData.value || [])).map(c => {
          const cR = rData.filter(r => String(r?.courseId) === String(c?.id));
          const dR = cR.filter(r => r?.difficulty !== undefined);
          return { ...c, track: currentTrack, reviewCount: cR.length, difficulty: dR.length > 0 ? (dR.reduce((s, r) => s + r.difficulty, 0) / dR.length) : (c.difficulty || 0) * 2 };
        }));
      } catch (err) { console.error('Error fetching data:', err); }
    };
    fetchData();
  }, [user?.track, guestSelectedTrack]);

  useEffect(() => {
    const sync = async () => {
      const m = location.pathname.match(/\/course\/([^/]+)/);
      if (m) {
        const id = m[1];
        let c = allCourses.find(c => String(c.id) === String(id));
        if (!c) {
          try { const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/courses/${id}`); if (res.ok) c = await res.json(); } catch (err) { console.error('Error:', err); }        }
        if (c) { setSelectedCourse(c); if (user?.id && !user?.isGuest) logActivity(user.id, ActivityActions.VIEW_COURSE, { courseId: c.id, courseTitle: c.title }); } else if (allCourses.length > 0) setSelectedCourse(null);
      } else if (location.pathname === '/') setSelectedCourse(null);
    };
    sync();
  }, [location.pathname, allCourses]);

  useEffect(() => {
    if (!selectedCourse?.id) return;
    setReviews([]);
    setQuestions([]);
    setMaterials([]);
    const controller = new AbortController();
    const { signal } = controller;
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reviews?courseId=${selectedCourse.id}`, { signal })
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setReviews(d); })
      .catch(err => { if (err.name !== 'AbortError') console.error('Failed to load reviews:', err); });
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/questions?courseId=${selectedCourse.id}`, { signal })
      .then(r => r.json()).then(d => { if (Array.isArray(d)) setQuestions(d); }).catch(() => {});
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/materials?courseId=${selectedCourse.id}`, { signal })
      .then(r => r.json()).then(d => { if (Array.isArray(d)) setMaterials(d); }).catch(() => {});
    return () => controller.abort();
  }, [selectedCourse?.id]);

  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [newQuestionTitle, setNewQuestionTitle] = useState('');
  const [newQuestionText, setNewQuestionText] = useState('');
  const fileInputRef = useRef(null);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkType, setNewLinkType] = useState('drive');
  const [newMaterialTitle, setNewMaterialTitle] = useState('');
  const [newMaterialCategory, setNewMaterialCategory] = useState('summaries');
  const materialCategoryRef = useRef('summaries');
  const [newMaterialFile, setNewMaterialFile] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewSemester, setNewReviewSemester] = useState("סמסטר א'");
  const [newReviewYear, setNewReviewYear] = useState('תשפ"ו (2025-26)');
  const [newReviewIdentity, setNewReviewIdentity] = useState('initials');
  const [newReviewAttendance, setNewReviewAttendance] = useState(null);
  const [newReviewDifficulty, setNewReviewDifficulty] = useState(5);

  const handleLogin = (u) => {
    setUser(u);
    if (!u.isGuest) {
      localStorage.setItem('user', JSON.stringify(u));
      logActivity(u.id, ActivityActions.LOGIN, { name: u.name, track: u.track });
    }
  };
  const handleLogout = () => {
    if (user?.id && !user?.isGuest) logActivity(user.id, ActivityActions.LOGOUT);
    setUser(null); localStorage.removeItem('user'); setSelectedCourse(null); navigate('/');
  };
  const handleChangeTrack = (t) => {
    if (user.isGuest) { setGuestSelectedTrack(t); setGuestTab('courses'); }
    else { const u = { ...user, track: t }; setUser(u); localStorage.setItem('user', JSON.stringify(u)); }
    setIsChangingTrack(false); setTrackSearch(''); setSelectedCourse(null); navigate('/');
  };

  const filteredTracks = (studyTracks || []).filter(t => t.label.includes(trackSearch));
  const suggestions = searchQuery.length > 1 ? allCourses.filter(c => c.title.includes(searchQuery) || c.code.includes(searchQuery)).slice(0, 5) : [];

  const filteredCourses = allCourses.filter(c => {
    if (!user) return false;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (c.title && c.title.toLowerCase().includes(q)) || (c.code && c.code.toLowerCase().includes(q));
    const matchesFilter = courseFilter === 'All' || c.type === courseFilter;
    const sQ = filterSemester.replace(/'/g, '');
    const matchesSemester = filterSemester === 'הכל' || (c.semester && ((filterSemester === "סמסטר א'" && (c.semester.includes('א') || c.semester.includes('1'))) || (filterSemester === "סמסטר ב'" && (c.semester.includes('ב') || c.semester.includes('2'))) || c.semester.includes(sQ)));
    const matchesCampus = filterCampus === 'הכל' || (c.campus && c.campus.includes(filterCampus === 'קרית א"י ספרא' ? 'ספרא' : filterCampus));
    const matchesLanguage = filterLanguage === 'הכל' || (c.language && c.language.includes(filterLanguage));
    const map = { "שנה א'": "א", "שנה ב'": "ב", "שנה ג'": "ג", "שנה ד'": "ד" };
    const matchesYear = filterYear === 'הכל' || c.year === map[filterYear];
    const passes = matchesSemester && matchesCampus && matchesLanguage && matchesYear;
    if (user.isGuest) return guestSelectedTrack && c.track === guestSelectedTrack && matchesSearch && matchesFilter && passes;
    return (user.track === 'General' || !user.track || c.track === user.track) && matchesSearch && matchesFilter && passes;
  });

  const getAuthorDisplayName = (n, t) => { if (!n) return 'אורח/ת'; if (t === 'anon') return 'אנונימי/ת'; if (t === 'initials') return n.trim().split(/\s+/).map(x => x[0] + '.').join(' '); return n; };

  const handlePostReview = async () => {
    if (!newReviewComment) return;
    const data = { 
      courseId: selectedCourse.id, 
      userId: user.isGuest ? null : user.id, 
      difficulty: newReviewDifficulty, 
      comment: newReviewComment, 
      semester: newReviewSemester, 
      year: newReviewYear, 
      attendanceEnforced: newReviewAttendance, 
      visibility: newReviewIdentity 
    };
    try {
      const res = editingReviewId ? await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reviews/${editingReviewId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }) : await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reviews`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const saved = await res.json();
      if (!res.ok) throw new Error(saved.message || 'שגיאה בשמירת הביקורת');
      if (editingReviewId) {
        setReviews(reviews.map(r => r.id === editingReviewId ? saved : r));
        setAllReviews(allReviews.map(r => r.id === editingReviewId ? saved : r));
      } else {
        const alreadyExists = reviews.some(r => r.id === saved.id);
        if (alreadyExists) {
          setReviews(reviews.map(r => r.id === saved.id ? saved : r));
          setAllReviews(allReviews.map(r => r.id === saved.id ? saved : r));
        } else {
          setReviews([saved, ...reviews]);
          setAllReviews([saved, ...allReviews]);
          setAllCourses(allCourses.map(c => c.id === selectedCourse.id ? { ...c, reviewCount: (c.reviewCount || 0) + 1 } : c));
        }
      }
      logActivity(user.id, ActivityActions.POST_REVIEW, { courseId: selectedCourse.id, courseTitle: selectedCourse.title });
      setNewReviewComment(''); setEditingReviewId(null); setIsReviewModalOpen(false); alert('הביקורת נשמרה בהצלחה!');
    } catch (err) { alert('שגיאה בשמירת הביקורת: ' + err.message); }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('האם למחוק?')) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reviews/${id}`, { method: 'DELETE' });
      logActivity(user.id, ActivityActions.DELETE_REVIEW, { reviewId: id, courseId: selectedCourse?.id });
      setReviews(reviews.filter(r => r.id !== id));
      setAllReviews(allReviews.filter(r => r.id !== id));
      setAllCourses(allCourses.map(c => c.id === selectedCourse?.id ? { ...c, reviewCount: Math.max(0, (c.reviewCount || 0) - 1) } : c));
      alert('נמחק בהצלחה');
    } catch (err) { alert('שגיאה'); }
  };

  const [inlineEditComment, setInlineEditComment] = useState('');
  const handleEditReview = (r) => { setEditingReviewId(r.id); setInlineEditComment(r.comment); };
  const handleCancelInlineEdit = () => { setEditingReviewId(null); setInlineEditComment(''); };
  const handleSaveInlineEdit = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reviews/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comment: inlineEditComment }) });
      const saved = await res.json();
      setReviews(reviews.map(r => r.id === id ? saved : r));
      setAllReviews(allReviews.map(r => r.id === id ? saved : r));
      setEditingReviewId(null); setInlineEditComment(''); alert('עודכן בהצלחה');
    } catch (err) { alert('שגיאה'); }
  };

  const handlePostQuestion = async () => {
    if (!newQuestionTitle.trim()) return alert('יש להזין כותרת לשאלה');
    if (!newQuestionText.trim()) return alert('יש להזין תוכן לשאלה');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/questions`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          courseId: selectedCourse.id, 
          userId: user.isGuest ? null : user.id, 
          title: newQuestionTitle, 
          content: newQuestionText 
        }) 
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
      const saved = await res.json();
      logActivity(user.id, ActivityActions.POST_QUESTION, { courseId: selectedCourse.id, courseTitle: selectedCourse.title });
      setQuestions([saved, ...questions]);
      setNewQuestionTitle('');
      setNewQuestionText('');
      setIsQuestionModalOpen(false);
    } catch (err) { alert('שגיאה בפרסום השאלה: ' + err.message); }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('האם למחוק את השאלה?')) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/questions/${id}`, { method: 'DELETE' });
      setQuestions(questions.filter(q => q.id !== id));
    } catch { alert('שגיאה במחיקת השאלה'); }
  };

  const handlePostAnswer = async (questionId, content) => {
    if (!content || content.trim().length < 2) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/questions/${questionId}/answers`, {
      method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.isGuest ? null : user.id, content })
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
      const saved = await res.json();
      logActivity(user.id, ActivityActions.POST_ANSWER, { questionId, courseId: selectedCourse?.id });
      setQuestions(questions.map(q => q.id === questionId
        ? { ...q, answers: [...(q.answers || []), saved] }
        : q
      ));
    } catch (err) { alert('שגיאה בפרסום התשובה: ' + err.message); }
  };

  const handleDeleteAnswer = async (questionId, answerId) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/questions/${questionId}/answers/${answerId}`, { method: 'DELETE' });      setQuestions(questions.map(q => q.id === questionId
        ? { ...q, answers: (q.answers || []).filter(a => a.id !== answerId) }
        : q
      ));
    } catch { alert('שגיאה במחיקת התשובה'); }
  };

  const handleLikeReview = async (id) => {
    const r = reviews.find(rev => rev.id === id);
    if (!r || !user?.id || user.isGuest || r.authorId === user.id) return;
    const likedBy = r.likedBy || [];
    const isLiked = likedBy.includes(user.id);
    const updatedLikedBy = isLiked ? likedBy.filter(uid => uid !== user.id) : [...likedBy, user.id];
    setReviews(reviews.map(rev => rev.id === id ? { ...rev, likedBy: updatedLikedBy } : rev));
    setAllReviews(allReviews.map(rev => rev.id === id ? { ...rev, likedBy: updatedLikedBy } : rev));
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reviews/${id}/vote`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id }) });
    } catch (err) {
      setReviews(reviews.map(rev => rev.id === id ? r : rev));
      setAllReviews(allReviews.map(rev => rev.id === id ? r : rev));
    }
  };


  const handlePostRating = async () => {
    const data = { courseId: selectedCourse.id, authorId: user.id, difficulty: newReviewDifficulty, attendanceEnforced: newReviewAttendance, comment: null, semester: newReviewSemester, year: newReviewYear, visibility: newReviewIdentity };
    try { const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reviews`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); const saved = await res.json(); setReviews([saved, ...reviews]); setAllReviews([saved, ...allReviews]); setAllCourses(allCourses.map(c => c.id === selectedCourse.id ? { ...c, reviewCount: (c.reviewCount || 0) + 1 } : c)); setIsRatingModalOpen(false); alert('תודה על הדירוג!'); } catch (err) { alert('שגיאה'); }
  };

  const handlePostMaterial = async () => {
    if (!newMaterialFile || !newMaterialTitle.trim()) return alert('נא למלא כותרת ולבחור קובץ');
    const category = _uploadCategory;
    alert(`מעלה לקטגוריה: ${category}`);
    try {
      const fileExt = newMaterialFile.name.split('.').pop().toLowerCase();
      const filePath = `${selectedCourse.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('course-files').upload(filePath, newMaterialFile);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('course-files').getPublicUrl(filePath);
      const data = { courseId: selectedCourse.id, userId: user.id, title: newMaterialTitle, materialType: 'file', url: publicUrl, fileExtension: fileExt, fileSizeBytes: newMaterialFile.size, category };
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/materials`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const saved = await res.json();
      logActivity(user.id, ActivityActions.UPLOAD_MATERIAL, { courseId: selectedCourse.id, category, title: newMaterialTitle });
      setMaterials([saved, ...materials]); setNewMaterialTitle(''); setNewMaterialFile(null); setIsMaterialModalOpen(false); alert('הועלה בהצלחה');
    } catch (err) { alert('שגיאה בהעלאה: ' + err.message); }
  };

  const handlePostLink = async () => {
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return alert('נא למלא כותרת וכתובת');
    try { const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/materials`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ courseId: selectedCourse.id, userId: user.id, title: newLinkTitle, materialType: 'link', url: newLinkUrl }) }); const saved = await res.json(); logActivity(user.id, ActivityActions.UPLOAD_MATERIAL, { courseId: selectedCourse.id, category: 'links', title: newLinkTitle }); setMaterials([saved, ...materials]); setNewLinkTitle(''); setNewLinkUrl(''); setIsLinkModalOpen(false); alert('נוסף בהצלחה'); } catch (err) { alert('שגיאה'); }
  };

  const handleDeleteMaterial = async (id) => { if (window.confirm('למחוק?')) try { await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/materials/${id}`, { method: 'DELETE' }); setMaterials(materials.filter(m => m.id !== id)); alert('נמחק'); } catch (err) { alert('שגיאה'); } };
  const handleOpenMaterialUpload = (categoryId) => { _uploadCategory = categoryId; setIsMaterialModalOpen(true); };
  const handleUpdateMaterial = async (id, data) => { try { const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/materials/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); const saved = await res.json(); setMaterials(materials.map(m => m.id === id ? saved : m)); alert('נשמר'); } catch (err) { alert('שגיאה'); } };

  const handleToggleFollow = async (id, title, status) => {
    logActivity(user.id, status ? ActivityActions.FOLLOW_COURSE : ActivityActions.UNFOLLOW_COURSE, { courseId: id, courseTitle: title });
    // Optimistic update
    if (status) {
      setFollowedCourseIds(prev => [...prev, id]);
      setNotifications(prev => [
        { id: `follow-${id}`, text: `מערכת העדכונים הופעלה בהצלחה עבור קורס ${title}!`, read: false, date: "עכשיו", courseId: id },
        ...prev
      ]);
    } else {
      setFollowedCourseIds(prev => prev.filter(fId => String(fId) !== String(id)));
      setNotifications(prev => prev.filter(n => n.courseId !== id));
    }
    // Persist to DB
    try {
      if (status) {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/follows`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, courseId: id })
        });
      } else {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/follows`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, courseId: id })
        });
      }
    } catch {
      // Revert optimistic update on error
      if (status) {
        setFollowedCourseIds(prev => prev.filter(fId => String(fId) !== String(id)));
      } else {
        setFollowedCourseIds(prev => [...prev, id]);
      }
    }
  };

  const hasUserRated = reviews.some(r =>
    (r.authorId !== undefined && String(r.authorId) === String(user?.id)) ||
    (r.author === user?.name)
  );

  if (!user) return <AuthPage onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col" dir="rtl">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 transition-all">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex gap-2 sm:gap-4 items-center flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-4 bg-slate-50 px-2 sm:px-5 py-2 rounded-2xl border border-slate-100">
              <div className="hidden md:block text-right">
                <div className="text-sm font-black text-slate-900 leading-none">{user.name} {user.isGuest && <span className="text-[10px] text-indigo-400 mr-1 font-black underline">(אורח/ת)</span>}</div>
                {!user.isGuest && <button onClick={() => setIsChangingTrack(!isChangingTrack)} className="text-[10px] text-indigo-600 font-black uppercase mt-1 tracking-tighter hover:underline">{(studyTracks || []).find(t => t.value === user.track)?.label || user.track}</button>}
              </div>
              <button onClick={handleLogout} className="bg-white text-slate-400 px-2 sm:px-3 py-2 rounded-xl hover:text-rose-500 hover:bg-rose-50 transition-all shadow-sm flex items-center gap-2 group"><span className="text-[10px] font-black uppercase hidden lg:block">התנתקות</span><X className="h-4 w-4" /></button>
            </div>
            {!user.isGuest && <div className="relative" ref={notifyRef}>
              <button onClick={() => setIsNotifyOpen(!isNotifyOpen)} className="bg-white p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm active:scale-95 relative cursor-pointer">{notifications.some(n => !n.read) ? <><BellDot className="h-5 w-5 text-indigo-600" /><span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black h-4 w-4 rounded-full flex items-center justify-center border-2 border-white">{notifications.filter(n => !n.read).length}</span></> : <Bell className="h-5 w-5" />}</button>
              {isNotifyOpen && (
                <div className="absolute top-14 right-0 w-80 bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-6 border-b border-slate-50 flex justify-between items-center"><h4 className="font-black text-slate-900 text-sm">התראות</h4><button onClick={() => { setNotifications(notifications.map(n => ({ ...n, read: true }))); fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/notifications/read`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id }) }).catch(() => {}); }} className="text-[10px] font-black text-indigo-600 hover:underline">סמן הכל כנקרא</button></div>
                  <div className="max-h-96 overflow-y-auto">{notifications.length > 0 ? notifications.map(n => (<div key={n.id} className={`p-5 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer relative ${!n.read ? 'bg-indigo-50/30' : ''}`} onClick={() => { setNotifications(notifications.map(notif => notif.id === n.id ? { ...notif, read: true } : notif)); setIsNotifyOpen(false); if (n.forumId) { setShowForumView(true); setForumViewId(n.forumId); navigate('/'); } }}>{!n.read && <div className="absolute top-6 right-2 w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>}<p className={`text-sm leading-relaxed mb-1 ${!n.read ? 'font-black text-slate-900' : 'font-medium text-slate-600'}`}>{n.text}</p><span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{n.date}</span></div>)) : <div className="p-12 text-center"><div className="bg-slate-50 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300"><Bell className="h-6 w-6" /></div><p className="text-slate-400 font-bold text-xs">אין התראות חדשות</p></div>}</div>
                  {notifications.length > 0 && <div className="p-4 bg-slate-50/50 text-center"><button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">צפה בכל ההיסטוריה</button></div>}
                </div>
              )}
            </div>}
          </div>
          <div className="flex-1"></div>
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => { setSelectedCourse(null); if (user?.isGuest) setGuestTab('forum'); }}><span className="text-2xl font-black text-slate-900 tracking-tight">CourseMate</span><img src="/logo.png" alt="CourseMate Logo" className="h-10 w-10 object-contain group-hover:scale-110 transition-transform" /></div>
        </div>
        {isChangingTrack && (
          <div className="absolute top-20 left-6 bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 w-72 animate-in fade-in slide-in-from-top-2 duration-200 z-[60]" dir="rtl">
            <div className="flex items-center gap-3 mb-3 px-2"><button onClick={() => setIsChangingTrack(false)} className="text-slate-400 hover:text-rose-500 transition-colors"><X className="h-4 w-4" /></button><p className="text-xs font-black text-slate-400 uppercase tracking-widest">חפש מסלול לימוד חדש</p></div>
            <div className="relative mb-4"><input autoFocus type="text" placeholder="חפש מסלול..." value={trackSearch} onChange={(e) => setTrackSearch(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-4 outline-none focus:border-indigo-500/20 text-sm font-bold text-right font-medium" /></div>
            <div className="space-y-1 max-h-72 overflow-y-auto">{(studyTracks || []).filter(t => t.label.includes(trackSearch)).map(t => (<button key={t.value} onClick={() => { handleChangeTrack(t.value); }} className={`w-full text-right px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${(user?.isGuest ? guestSelectedTrack : user?.track) === t.value ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}>{t.label}</button>))}{(studyTracks || []).filter(t => t.label.includes(trackSearch)).length === 0 && <p className="text-xs text-slate-400 text-center py-2">לא נמצאו מסלולים</p>}</div>
          </div>
        )}
      </nav>
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <Routes>
          <Route path="/lecturer/:id" element={<LecturerProfile user={user} onDepartmentClick={(dept) => { const tT = (studyTracks || []).find(t => t?.label === dept || t?.value === dept)?.value || dept; handleChangeTrack(tT); navigate('/'); }} />} />
          <Route path="/course/:id" element={<CourseDetail selectedCourse={selectedCourse} navigate={navigate} activeTab={activeTab} setActiveTab={setActiveTab} reviews={reviews} user={user} setIsReviewModalOpen={setIsReviewModalOpen} setIsRatingModalOpen={setIsRatingModalOpen} handleLogout={handleLogout} handleLikeReview={handleLikeReview} handleDeleteReview={handleDeleteReview} handleEditReview={handleEditReview} editingReviewId={editingReviewId} inlineEditComment={inlineEditComment} setInlineEditComment={setInlineEditComment} handleSaveInlineEdit={handleSaveInlineEdit} handleCancelInlineEdit={handleCancelInlineEdit} questions={questions} setIsQuestionModalOpen={setIsQuestionModalOpen} handleDeleteQuestion={handleDeleteQuestion} handlePostAnswer={handlePostAnswer} handleDeleteAnswer={handleDeleteAnswer} onOpenMaterialUpload={handleOpenMaterialUpload} setIsLinkModalOpen={setIsLinkModalOpen} materials={materials} onUpdateMaterial={handleUpdateMaterial} onDeleteMaterial={handleDeleteMaterial} isFollowing={selectedCourse ? followedCourseIds.includes(selectedCourse.id) : false} onToggleFollow={handleToggleFollow} />} />
          <Route path="/" element={<>{user.isGuest && <div className="flex gap-4 p-1.5 bg-slate-100 rounded-2xl w-fit mb-12 mr-auto ml-0 transition-all animate-in fade-in slide-in-from-top-4 duration-500"><button onClick={() => setGuestTab('forum')} className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${guestTab === 'forum' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>פורום שילובים</button><button onClick={() => setGuestTab('courses')} className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${guestTab === 'courses' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>צפייה בקורסים</button></div>}{(user.isGuest && guestTab === 'forum') || showForumView ? <CombinationForum user={user} onLogout={handleLogout} onTrackSelect={handleChangeTrack} STUDY_TRACKS={studyTracks} initialForumId={forumViewId} userCombination={!user?.isGuest ? ((studyTracks || []).find(t => t.value === user?.track)?.label || '') : ''} onBack={() => { setShowForumView(false); setForumViewId(null); }} /> : <Dashboard user={user} guestSelectedTrack={guestSelectedTrack} setIsGuestDrawerOpen={setIsGuestDrawerOpen} allCourses={allCourses} filteredCourses={filteredCourses} courseFilter={courseFilter} setCourseFilter={setCourseFilter} searchQuery={searchQuery} setSearchQuery={setSearchQuery} showSuggestions={showSuggestions} setShowSuggestions={setShowSuggestions} suggestions={suggestions} navigate={navigate} studyTracks={studyTracks} filterSemester={filterSemester} setFilterSemester={setFilterSemester} filterCampus={filterCampus} setFilterCampus={setFilterCampus} filterLanguage={filterLanguage} setFilterLanguage={setFilterLanguage} filterYear={filterYear} setFilterYear={setFilterYear} studentForums={studentForums} studentForumQuestions={studentForumQuestions} newStudentForumQ={newStudentForumQ} setNewStudentForumQ={setNewStudentForumQ} onPostStudentForumQ={handlePostStudentForumQ} onPostStudentForumA={handlePostStudentForumA} expandedStudentQs={expandedStudentQs} onToggleStudentQ={toggleStudentQ} activeStudentForumId={activeStudentForumId} setActiveStudentForumId={setActiveStudentForumId} onOpenForumPage={() => { logActivity(user.id, ActivityActions.OPEN_FORUM, { track: user.track }); setShowForumView(true); setForumViewId(null); }} />}</>} />
        </Routes>
      </main>
      {isRatingModalOpen && <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm" dir="rtl" onClick={() => setIsRatingModalOpen(false)}><div className="bg-white w-full max-w-md rounded-[40px] p-6 shadow-2xl overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}><div className="flex items-center gap-3 mb-3"><button onClick={() => setIsRatingModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors"><X className="h-6 w-6" /></button><h3 className="text-xl font-black text-slate-900">דירוג קורס מהיר</h3></div><div className="space-y-3"><div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 relative"><div className="flex justify-between items-center mb-2"><label className="text-sm font-black text-slate-700 block">רמת קושי הקורס (1-10)</label>{hasUserRated && <span className="text-[10px] font-black text-amber-500 bg-amber-50 px-2 py-1 rounded-lg">כבר דירגת רכיב זה בעבר.</span>}</div><div className="flex items-center gap-4"><input type="range" min="1" max="10" step="1" value={newReviewDifficulty} onChange={(e) => setNewReviewDifficulty(parseInt(e.target.value))} disabled={hasUserRated} className={`flex-1 h-2 bg-slate-200 rounded-lg appearance-none accent-rose-500 ${hasUserRated ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`} /><div className={`h-10 w-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center font-black text-base border-2 border-rose-100 shadow-sm shrink-0 ${hasUserRated ? 'opacity-50' : ''}`}>{newReviewDifficulty}</div></div><div className="flex justify-between mt-2 px-1"><span className={`text-[10px] font-black uppercase tracking-tighter ${hasUserRated ? 'text-slate-300' : 'text-slate-400'}`}>קל מאוד</span><span className={`text-[10px] font-black uppercase tracking-tighter ${hasUserRated ? 'text-rose-300' : 'text-rose-600'}`}>{newReviewDifficulty <= 2 ? "קל מאוד" : newReviewDifficulty === 3 ? "קל" : newReviewDifficulty <= 7 ? "בינוני" : newReviewDifficulty <= 9 ? "קשה" : "קשה מאוד"}</span></div></div><div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100"><label className="text-sm font-black text-slate-700 mb-2 block">סמסטר</label><div className="grid grid-cols-2 gap-2">{[{ id: "סמסטר א'", label: "סמסטר א'" }, { id: "סמסטר ב'", label: "סמסטר ב'" }, { id: "סמסטר קיץ", label: "סמסטר קיץ" }, { id: "שנתי", label: "שנתי" }].map(o => (<button key={o.id} onClick={() => setNewReviewSemester(o.id)} className={`py-2 rounded-xl font-black text-xs border-2 transition-all ${newReviewSemester === o.id ? 'bg-indigo-600 text-white border-transparent shadow-md' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200 hover:shadow-sm'}`}>{o.label}</button>))}</div></div><div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 relative"><div className="flex justify-between items-center mb-2"><label className="text-sm font-black text-slate-700 block">האם נבדקה נוכחות?</label>{hasUserRated && <span className="text-[10px] font-black text-amber-500 bg-amber-50 px-2 py-1 rounded-lg">כבר דירגת רכיב זה בעבר.</span>}</div><div className="grid grid-cols-3 gap-3">{[{ id: true, label: 'כן', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' }, { id: false, label: 'לא', color: 'bg-rose-50 text-rose-600 border-rose-100' }, { id: null, label: 'לא יודע/ת', color: 'bg-slate-100 text-slate-500 border-slate-200' }].map(o => (<button key={String(o.id)} onClick={() => setNewReviewAttendance(o.id)} disabled={hasUserRated} className={`py-2 rounded-xl font-black text-xs border-2 transition-all ${newReviewAttendance === o.id ? `${o.id === true ? 'bg-emerald-600' : o.id === false ? 'bg-rose-600' : 'bg-slate-600'} text-white border-transparent shadow-md` : `${o.color} hover:shadow-sm`} ${hasUserRated ? 'cursor-not-allowed opacity-50' : ''}`}>{o.label}</button>))}</div></div><button onClick={handlePostRating} className="w-full bg-indigo-600 text-white py-3 rounded-2xl font-black text-sm hover:bg-indigo-700 shadow-lg active:scale-95 transition-all">שלח דירוג</button></div></div></div>}
      {isReviewModalOpen && <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm" dir="rtl" onClick={() => setIsReviewModalOpen(false)}><div className="bg-white w-full max-w-4xl rounded-[40px] p-10 shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}><ReviewForm comment={newReviewComment} semester={newReviewSemester} year={newReviewYear} identityType={newReviewIdentity} attendanceEnforced={newReviewAttendance} difficulty={newReviewDifficulty} onCommentChange={setNewReviewComment} onSemesterChange={setNewReviewSemester} onYearChange={setNewReviewYear} onIdentityChange={setNewReviewIdentity} onAttendanceChange={setNewReviewAttendance} onDifficultyChange={setNewReviewDifficulty} onSubmit={handlePostReview} onClose={() => setIsReviewModalOpen(false)} hasRated={hasUserRated} /></div></div>}
      {isQuestionModalOpen && <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm" dir="rtl" onClick={() => { setIsQuestionModalOpen(false); setNewQuestionTitle(''); setNewQuestionText(''); }}><div className="bg-white w-full max-w-lg rounded-[40px] p-10 text-right animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}><div className="flex justify-between items-start mb-8 gap-4"><button onClick={() => { setIsQuestionModalOpen(false); setNewQuestionTitle(''); setNewQuestionText(''); }} className="p-2 text-slate-400 hover:text-rose-500 transition-colors shrink-0 -mt-2 -mr-2"><X className="h-8 w-8" /></button><div className="text-right flex-1"><h3 className="text-3xl font-black text-slate-900">שאל שאלה</h3><p className="text-slate-500 font-bold text-sm mt-1">שאלה קצרה וקולעת שיכולה לעזור לסטודנטים נוספים</p></div></div><div className="mb-5"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">כותרת השאלה</label><input type="text" value={newQuestionTitle} onChange={e => setNewQuestionTitle(e.target.value)} className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 rounded-2xl px-6 py-4 outline-none text-right font-bold transition-all" placeholder="למשל: איך מגישים את העבודה הסופית?" /></div><div className="mb-8"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">פירוט השאלה</label><textarea value={newQuestionText} onChange={e => setNewQuestionText(e.target.value)} className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 rounded-[24px] p-6 h-36 outline-none text-right font-medium resize-none" placeholder="הרחיבו על השאלה שלכם..."></textarea></div><button onClick={handlePostQuestion} className="w-full bg-indigo-600 text-white py-5 rounded-[28px] font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-[0.98]">פרסם שאלה</button></div></div>}
      {isMaterialModalOpen && <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm" dir="rtl" onClick={() => setIsMaterialModalOpen(false)}><div className="bg-white w-full max-w-lg rounded-[40px] p-10 text-right animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}><div className="flex flex-col gap-1 mb-8"><div className="flex items-center gap-4"><button onClick={() => setIsMaterialModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors"><X className="h-8 w-8" /></button><h3 className="text-3xl font-black text-slate-900">העלאת חומר לימוד</h3></div><p className="text-slate-500 font-bold text-sm mt-1 pr-12">כאן תמצאו חומרים שיכולים לעזור לכם בקורס. יש לכם חומר שיכול לעזור? העלו אותו כדי שהמאגר ימשיך לגדול.</p></div><div className="space-y-6"><div><label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">כותרת החומר</label><input type="text" value={newMaterialTitle} onChange={(e) => setNewMaterialTitle(e.target.value)} className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-right" placeholder="למשל: מבחן מועד א 2023" /></div><div><label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">בחירת קובץ</label><div onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-[32px] p-8 text-center cursor-pointer transition-all ${newMaterialFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-200 hover:border-indigo-200 bg-slate-50'}`}><input ref={fileInputRef} type="file" className="hidden" onChange={(e) => setNewMaterialFile(e.target.files[0])} />{newMaterialFile ? <div className="flex flex-col items-center text-emerald-600 font-bold"><CheckCircle className="h-10 w-10 mb-2" /><span className="text-sm truncate w-full px-4">{newMaterialFile.name}</span></div> : <div className="flex flex-col items-center text-slate-400"><Upload className="h-10 w-10 mb-2" /><span className="text-sm font-black uppercase tracking-widest text-center">לחץ לבחירת קובץ</span></div>}</div></div><button onClick={handlePostMaterial} className="w-full bg-indigo-600 text-white py-5 rounded-[28px] font-black text-lg hover:bg-indigo-700 shadow-xl active:scale-95 transition-all mt-4">פרסם חומר לימוד</button></div></div></div>}
      {isLinkModalOpen && <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm" dir="rtl" onClick={() => setIsLinkModalOpen(false)}><div className="bg-white w-full max-w-lg rounded-[40px] p-10 text-right animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}><div className="flex items-center gap-4 mb-8"><button onClick={() => setIsLinkModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors"><X className="h-8 w-8" /></button><h3 className="text-3xl font-black text-slate-900">הוספת קישור</h3></div><div className="space-y-6"><div><label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">כותרת הקישור</label><input type="text" value={newLinkTitle} onChange={(e) => setNewLinkTitle(e.target.value)} className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-right" placeholder="למשל: קבוצת וואטסאפ של הקורס" /></div><div><label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">כתובת הקישור (URL)</label><input type="text" value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)} className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-right" placeholder="https://..." /></div><div><label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">סוג הקישור</label><div className="grid grid-cols-3 gap-3">{[{ id: 'drive', label: 'Google Drive', icon: LinkIcon }, { id: 'whatsapp', label: 'WhatsApp', icon: Share2 }, { id: 'other', label: 'אחר', icon: ExternalLink }].map(t => (<button key={t.id} onClick={() => setNewLinkType(t.id)} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all font-bold text-xs ${newLinkType === t.id ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}><t.icon className="h-5 w-5" /><span>{t.label}</span></button>))}</div></div><button onClick={handlePostLink} className="w-full bg-indigo-600 text-white py-5 rounded-[28px] font-black text-lg hover:bg-indigo-700 shadow-xl active:scale-95 transition-all mt-4">הוסף קישור</button></div></div></div>}
      <footer className="bg-white border-t border-slate-200 py-16 mt-20 text-center"><p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">&copy; 2026 COURSEMATE ISRAEL 🇮🇱 מיוצר על ידי סטודנטים</p></footer>
      <div className={`fixed inset-0 z-[110] transition-opacity duration-300 ${isGuestDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} dir="rtl"><div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsGuestDrawerOpen(false)}></div><div className={`absolute top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-out transform ${isGuestDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}><div className="p-8 h-full flex flex-col"><div className="flex items-center gap-4 mb-8"><button onClick={() => setIsGuestDrawerOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors"><X className="h-8 w-8" /></button><h2 className="text-2xl font-black text-slate-900">בחירת מסלול לימוד</h2></div><div className="relative mb-6"><input type="text" placeholder="חפש חוג/מסלול..." value={trackSearch} onChange={(e) => setTrackSearch(e.target.value)} className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 rounded-2xl py-3 px-10 outline-none text-right font-bold transition-all" /><Search className="absolute right-3 top-3.5 h-4 w-4 text-slate-400" /></div><div className="flex-1 overflow-y-auto space-y-2 pr-1">{(studyTracks || []).filter(t => t.label.includes(trackSearch)).map(t => (<button key={t.value} onClick={() => { handleChangeTrack(t.value); setIsGuestDrawerOpen(false); }} className={`w-full text-right px-6 py-4 rounded-2xl font-bold transition-all ${guestSelectedTrack === t.value ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}>{t.label}</button>))}{(studyTracks || []).filter(t => t.label.includes(trackSearch)).length === 0 && <div className="text-center py-10"><p className="text-slate-400 font-bold">לא נמצאו מסלולים תואמים</p></div>}</div><div className="mt-8 pt-6 border-t border-slate-100 text-center"><p className="text-xs text-slate-400 font-medium">לא מוצאים את החוג שלכם? <br/>נסו לחפש "אחר" או פנו אלינו.</p></div></div></div></div>
    </div>
  );
};

export default App;
