import React, { useState } from 'react';
import { 
  Search, GraduationCap, Star, MessageSquare, 
  BookOpen, TrendingUp, Send, FileText, 
  Download, Upload, User, ChevronLeft,
  Filter, Award, Clock, X, CheckCircle, Lock,
  Camera, BarChart3
} from 'lucide-react';

// Components
import AuthPage from './components/AuthPage';
import CourseCard from './components/CourseCard';
import ReviewForm from './components/ReviewForm';

// Data
import projectData from './data.json';

const COURSE_MAP = projectData.courses;
const INITIAL_REVIEWS = projectData.initialReviews;
const INITIAL_QNA = projectData.initialQna;
const INITIAL_MATERIALS = projectData.initialMaterials;
const INITIAL_STATS = projectData.statistics;
const STUDY_TRACKS = projectData.tracks;

const MATERIAL_CATEGORIES = [
  { id: 'summaries', label: 'סיכומים', icon: FileText },
  { id: 'tests', label: 'מבחנים', icon: GraduationCap },
  { id: 'homework', label: 'מטלות בית', icon: BookOpen },
  { id: 'formulas', label: 'דפי נוסחאות', icon: TrendingUp },
  { id: 'misc', label: 'שונות', icon: MessageSquare }
];

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
  
  // Dynamic Content State
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [questions, setQuestions] = useState(INITIAL_QNA);
  const [classStats, setClassStats] = useState(INITIAL_STATS);
  const [materials, setMaterials] = useState(INITIAL_MATERIALS);
  
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');

  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [newStatsTitle, setNewStatsTitle] = useState('');
  const [newStatsFile, setNewStatsFile] = useState(null);

  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [newMaterialTitle, setNewMaterialTitle] = useState('');
  const [newMaterialCategory, setNewMaterialCategory] = useState('summaries');
  const [newMaterialFile, setNewMaterialFile] = useState(null);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewSemester, setNewReviewSemester] = useState("סמסטר א'");
  const [newReviewYear, setNewReviewYear] = useState('תשפ"ד');
  const [newReviewIdentity, setNewReviewIdentity] = useState('full'); // 'full', 'initials', 'anon'

  const [selectedImage, setSelectedImage] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setSelectedCourse(null);
  };

  const handleChangeTrack = (newTrack) => {
    const updatedUser = { ...user, track: newTrack };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setIsChangingTrack(false);
    setTrackSearch('');
    setSelectedCourse(null);
  };

  const filteredTracks = STUDY_TRACKS.filter(t => t.label.includes(trackSearch));

  const filteredCourses = (COURSE_MAP[user?.track] || []).filter(c => {
    const matchesSearch = c.title.includes(searchQuery) || c.code.includes(searchQuery);
    const matchesFilter = courseFilter === 'All' || c.type === courseFilter;
    return matchesSearch && matchesFilter;
  });

  const getAuthorDisplayName = (fullName, type) => {
    if (type === 'anon') return 'אנונימי/ת';
    if (type === 'initials') {
      return fullName.split(' ').map(n => n[0] + '.').join(' ');
    }
    return fullName;
  };

  const handlePostReview = () => {
    if (user?.isGuest) return alert('כדי להוסיף ביקורת יש להירשם למערכת');
    if (!newReviewComment) return alert('נא למלא את תוכן הביקורת');
    
    const newReview = {
      id: Date.now().toString(),
      difficulty: 4,
      comment: newReviewComment,
      semester: newReviewSemester,
      year: newReviewYear,
      date: new Date().toLocaleDateString('he-IL'),
      author: getAuthorDisplayName(user.name, newReviewIdentity),
      identityType: newReviewIdentity
    };
    
    setReviews([newReview, ...reviews]);
    setNewReviewComment('');
    setIsReviewModalOpen(false);
    alert('הביקורת פורסמה בהצלחה!');
  };

  const handlePostQuestion = () => {
    if (user?.isGuest) return alert('כדי לשאול שאלה יש להירשם למערכת');
    if (!newQuestionText) return;
    const newQ = {
      id: Date.now().toString(),
      question: newQuestionText,
      answers: [],
      date: new Date().toLocaleDateString('he-IL')
    };
    setQuestions([newQ, ...questions]);
    setNewQuestionText('');
    setIsQuestionModalOpen(false);
  };

  const handlePostAnswer = (qId, text) => {
    if (user?.isGuest) return alert('כדי להשיב לשאלה יש להירשם למערכת');
    if (!text) return;
    setQuestions(questions.map(q => 
      q.id === qId 
        ? { ...q, answers: [...q.answers, { text, date: new Date().toLocaleDateString('he-IL') }] }
        : q
    ));
  };

  const handlePostStats = () => {
    if (user?.isGuest) return alert('כדי להעלות נתונים יש להירשם למערכת');
    if (!newStatsTitle || !newStatsFile) return alert('נא למלא כותרת ולהוסיף תמונה');
    
    const newStat = {
      id: Date.now().toString(),
      title: newStatsTitle,
      date: new Date().toLocaleDateString('he-IL'),
      author: user.name,
      url: URL.createObjectURL(newStatsFile)
    };
    setClassStats([newStat, ...classStats]);
    setNewStatsTitle('');
    setNewStatsFile(null);
    setIsStatsModalOpen(false);
    alert('הנתונים הועלו בהצלחה!');
  };

  const handlePostMaterial = () => {
    if (user?.isGuest) return alert('כדי להעלות חומרים יש להירשם למערכת');
    if (!newMaterialTitle || !newMaterialFile) return alert('נא למלא כותרת ולבחור קובץ');

    const newMat = {
      id: Date.now().toString(),
      title: newMaterialTitle,
      category: newMaterialCategory,
      type: newMaterialFile.name.split('.').pop().toUpperCase(),
      author: user.name,
      date: new Date().toLocaleDateString('he-IL')
    };

    setMaterials([newMat, ...materials]);
    setNewMaterialTitle('');
    setNewMaterialFile(null);
    setIsMaterialModalOpen(false);
    alert('החומר הועלה בהצלחה!');
  };

  if (!user) return <AuthPage onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col" dir="rtl">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 transition-all">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setSelectedCourse(null)}>
            <div className="bg-indigo-600 p-2 rounded-xl group-hover:scale-110 transition-transform">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">CourseMate</span>
          </div>
          
          <div className="flex-1 max-w-xl mx-12 relative group">
            <input
              type="text"
              placeholder="חפש קורס..."
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100/50 border-2 border-transparent rounded-2xl py-3 px-12 focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none text-right font-medium"
            />
            <Search className="absolute right-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          </div>
          
          <div className="hidden md:flex gap-4 items-center">
            <div className="flex items-center gap-4 bg-slate-50 px-5 py-2 rounded-2xl border border-slate-100">
              <div className="text-right">
                <div className="text-sm font-black text-slate-900 leading-none">
                  {user.name} {user.isGuest && <span className="text-[10px] text-indigo-400 mr-1 font-black underline">(אורח/ת)</span>}
                </div>
                <button 
                  onClick={() => setIsChangingTrack(!isChangingTrack)}
                  className="text-[10px] text-indigo-600 font-black uppercase mt-1 tracking-tighter hover:underline"
                >
                  {STUDY_TRACKS.find(t => t.value === user.track)?.label || (user.isGuest && user.track === 'General' ? 'בחירת מסלול' : user.track)}
                </button>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-white text-slate-400 p-2 rounded-xl hover:text-rose-500 hover:bg-rose-50 transition-all shadow-sm"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Searchable Track Selection Popover */}
        {isChangingTrack && (
          <div className="absolute top-20 left-6 bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 w-72 animate-in fade-in slide-in-from-top-2 duration-200 z-[60]">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-2 text-right">חפש מסלול לימוד חדש</p>
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
                  onClick={() => handleChangeTrack(t.value)}
                  className={`w-full text-right px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${user.track === t.value ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
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
        {!selectedCourse ? (
          <div className="max-w-7xl mx-auto">
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="text-right">
                <h1 className="text-5xl font-black text-slate-900 mb-4 leading-tight">
                  {user.isGuest ? 'ברוכים הבאים ל-CourseMate' : `שלום ${user.name.split(' ')[0]}!`}
                </h1>
                <p className="text-xl text-slate-500 font-medium text-right">
                  {user.isGuest && user.track === 'General' 
                    ? 'בחרו מסלול לימוד כדי לראות את הקורסים הרלוונטיים עבורכם' 
                    : `ביקורות וסיכומים למסלול: ${STUDY_TRACKS.find(t => t.value === user.track)?.label || user.track}`}
                </p>
              </div>

              {/* Filter Chips */}
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
            
            {(user.isGuest && user.track === 'General') ? (
              <div className="relative">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-20 grayscale blur-[2px] pointer-events-none select-none">
                  {COURSE_MAP['Computer Science'].map(course => (
                    <CourseCard key={course.id} course={course} onClick={() => {}} />
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-auto z-10">
                  <div className="bg-white rounded-[40px] p-10 shadow-2xl border border-slate-100 text-center max-w-sm">
                    <Search className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-black text-slate-900 mb-2">בואו נתחיל</h3>
                    <p className="text-slate-500 mb-8 font-medium">כדי לראות קורסים וביקורות, יש לבחור מסלול לימוד בתפריט למעלה</p>
                    <button 
                      onClick={() => setIsChangingTrack(true)}
                      className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-indigo-700 transition-all"
                    >
                      בחירת מסלול
                    </button>
                  </div>
                </div>
              </div>
            ) : filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCourses.map(course => (
                  <CourseCard key={course.id} course={course} onClick={setSelectedCourse} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-200">
                <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800">לא נמצאו קורסים התואמים לחיפוש</h3>
                <p className="text-slate-500 mb-6">אנחנו עובדים על הוספת תכנים חדשים בקרוב.</p>
                <button 
                  onClick={() => { setCourseFilter('All'); setSearchQuery(''); }}
                  className="text-indigo-600 font-black hover:underline"
                >
                  נקה את כל הפילטרים
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            <button 
              onClick={() => setSelectedCourse(null)}
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
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4 justify-end">
                    <span className={`px-4 py-1.5 rounded-2xl text-xs font-black uppercase tracking-widest ${selectedCourse.type === 'חובה' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {selectedCourse.type}
                    </span>
                    <span className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-2xl text-xs font-black uppercase tracking-widest">
                      {selectedCourse.code}
                    </span>
                  </div>
                  <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">{selectedCourse.title}</h1>
                  <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl">{selectedCourse.description}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-[32px] flex md:flex-col gap-8 min-w-[180px]">
                  <div className="text-center">
                    <div className="text-4xl font-black text-indigo-600 mb-1">{selectedCourse.avgRating}</div>
                    <div className="text-xs text-slate-400 font-black uppercase text-center">דירוג</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-black text-rose-500 mb-1">{selectedCourse.difficulty}</div>
                    <div className="text-xs text-slate-400 font-black uppercase text-center">קושי</div>
                  </div>
                </div>
              </div>
            </header>

            <div className="flex gap-2 p-1.5 bg-slate-100 rounded-[28px] mb-10 w-fit">
              {[
                { id: 'reviews', label: 'ביקורות', icon: Star },
                { id: 'qna', label: 'שאלות ותשובות', icon: MessageSquare },
                { id: 'materials', label: 'חומרי לימוד', icon: BookOpen },
                { id: 'statistics', label: 'סטטיסטיקה כיתתית', icon: BarChart3 }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-8 py-4 rounded-[22px] transition-all font-black text-sm ${
                    activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'fill-indigo-600' : ''}`} />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className={`${user.isGuest ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                      {!user.isGuest ? (
                        <button 
                          onClick={() => setIsReviewModalOpen(true)}
                          className="bg-indigo-600 text-white px-6 py-2 rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-md active:scale-95 flex items-center gap-2"
                        >
                          <Send className="h-4 w-4" />
                          הוספת ביקורת
                        </button>
                      ) : (
                        <div /> // Empty for layout
                      )}
                      <h2 className="text-2xl font-black text-slate-900 text-right">ביקורות ({reviews.length})</h2>
                    </div>

                    {reviews.map(r => (
                      <div key={r.id} className="bg-white rounded-[32px] shadow-sm border border-slate-200 p-8 text-right">
                        <div className="flex justify-between items-center mb-6">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-black">
                              {r.author[0]}
                            </div>
                            <div className="font-black text-slate-900">{r.author}</div>
                          </div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{r.date}</div>
                        </div>
                        <p className="text-slate-600 text-lg font-medium leading-relaxed italic mb-6">"{r.comment}"</p>
                        
                        <div className="flex items-center justify-between border-t border-slate-100 pt-6 flex-row-reverse">
                          <div className="flex items-center gap-4 flex-row-reverse">
                            <div className="text-xs font-black text-slate-400 bg-slate-50 px-4 py-1.5 rounded-xl uppercase tracking-widest">
                              {r.semester}, {r.year}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'qna' && (
                  <div className="space-y-6 text-right">
                    <div className="flex justify-between items-center mb-4">
                      <button onClick={() => setIsQuestionModalOpen(true)} className="bg-white border-2 border-slate-200 px-6 py-2 rounded-2xl font-black text-sm hover:border-indigo-500 transition-all">שאל שאלה</button>
                      <h2 className="text-2xl font-black text-slate-900">שאלות מהקהילה</h2>
                    </div>
                    {questions.map(q => (
                      <div key={q.id} className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden text-right">
                        <div className="p-8 bg-slate-900 text-white flex items-center gap-4 flex-row-reverse">
                          <MessageSquare className="h-6 w-6 text-indigo-400" />
                          <div className="flex-1 text-xl font-bold">{q.question}</div>
                        </div>
                        <div className="p-8 space-y-6">
                          {q.answers.map((a, i) => (
                            <div key={i} className="flex gap-6 border-r-4 border-slate-50 pr-6 flex-row-reverse">
                              <div className="h-10 w-10 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 shrink-0"><User className="h-5 w-5" /></div>
                              <p className="text-slate-700 font-medium">{a.text}</p>
                            </div>
                          ))}
                          <div className="pt-4 mr-16 flex gap-3 flex-row-reverse">
                            <input 
                              type="text" 
                              placeholder="תשובה..."
                              onKeyDown={(e) => { if (e.key === 'Enter') { handlePostAnswer(q.id, e.target.value); e.target.value = ''; } }}
                              className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 rounded-2xl px-6 py-3 outline-none text-right font-medium"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'materials' && (
                  <div className="space-y-10 text-right">
                    <div className="flex justify-between items-center mb-6">
                      {!user.isGuest && (
                        <button 
                          onClick={() => setIsMaterialModalOpen(true)}
                          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          העלאת חומר לימוד
                        </button>
                      )}
                      <h2 className="text-2xl font-black text-slate-900">חומרי לימוד</h2>
                    </div>

                    {user.isGuest ? (
                      <div className="bg-white rounded-[40px] border-2 border-dashed border-slate-200 p-12 text-center">
                        <div className="bg-slate-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-400">
                          <Lock className="h-10 w-10" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">התוכן נעול</h3>
                        <p className="text-slate-500 mb-8 font-medium">צפייה בסיכומים וחומרי לימוד זמינה למשתמשים רשומים בלבד</p>
                        <button 
                          onClick={handleLogout}
                          className="bg-indigo-600 text-white px-10 py-4 rounded-[24px] font-black hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
                        >
                          להרשמה וצפייה בסיכומים
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-12">
                        {MATERIAL_CATEGORIES.map(category => {
                          const categoryMaterials = materials.filter(m => m.category === category.id);
                          return (
                            <div key={category.id} className="space-y-4">
                              <div className="flex items-center gap-3 flex-row-reverse border-b-2 border-slate-100 pb-3">
                                <category.icon className="h-6 w-6 text-indigo-600" />
                                <h3 className="text-xl font-black text-slate-800">{category.label}</h3>
                                <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-black">{categoryMaterials.length}</span>
                              </div>
                              
                              <div className="grid grid-cols-1 gap-4">
                                {categoryMaterials.length > 0 ? (
                                  categoryMaterials.map(m => (
                                    <div key={m.id} className="flex items-center justify-between p-6 bg-white rounded-[32px] border border-slate-200 flex-row-reverse hover:border-indigo-200 hover:shadow-md transition-all group">
                                      <div className="flex items-center gap-6 flex-row-reverse">
                                        <div className="h-14 w-14 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all"><FileText className="h-6 w-6" /></div>
                                        <div>
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

                {activeTab === 'statistics' && (
                  <div className="space-y-6 text-right animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center mb-6">
                      {!user.isGuest && (
                        <button 
                          onClick={() => setIsStatsModalOpen(true)}
                          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-2"
                        >
                          <Camera className="h-4 w-4" />
                          העלאת ממוצע סמסטריאלי
                        </button>
                      )}
                      <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                        <BarChart3 className="h-6 w-6 text-indigo-600" />
                        סטטיסטיקה כיתתית
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {classStats.map(stat => (
                        <div 
                          key={stat.id} 
                          onClick={() => setSelectedImage(stat)}
                          className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-200 group cursor-pointer hover:shadow-xl hover:border-indigo-500/20 transition-all"
                        >
                          <div className="aspect-video relative overflow-hidden bg-slate-100">
                            <img src={stat.url} alt={stat.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Search className="text-white h-8 w-8" />
                            </div>
                          </div>
                          <div className="p-6">
                            <h4 className="font-black text-slate-900 mb-1">{stat.title}</h4>
                            <div className="flex items-center justify-between flex-row-reverse">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.date}</span>
                              <span className="text-[10px] font-black text-indigo-600 uppercase">מאת {stat.author}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {user.isGuest && (
                <div className="lg:col-span-1">
                  <div className="bg-slate-900 text-white rounded-[40px] p-8 sticky top-28 shadow-2xl shadow-slate-900/20 text-center">
                    <Award className="h-12 w-12 text-indigo-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-black mb-4">רוצה להשפיע?</h3>
                    <p className="text-slate-400 font-medium mb-8 leading-relaxed">כדי להוסיף ביקורות, לשאול שאלות ולשתף סיכומים, עליך להצטרף לקהילה שלנו.</p>
                    <button 
                      onClick={handleLogout}
                      className="w-full bg-indigo-600 text-white py-4 rounded-3xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/10"
                    >
                      הרשמה בחינם
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm" dir="rtl" onClick={() => setIsReviewModalOpen(false)}>
          <div className="bg-white w-full max-w-4xl rounded-[40px] p-10 animate-in zoom-in-95 duration-200 shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <ReviewForm 
              comment={newReviewComment}
              semester={newReviewSemester}
              year={newReviewYear}
              identityType={newReviewIdentity}
              onCommentChange={setNewReviewComment}
              onSemesterChange={setNewReviewSemester}
              onYearChange={setNewReviewYear}
              onIdentityChange={setNewReviewIdentity}
              onSubmit={handlePostReview}
              onClose={() => setIsReviewModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Question Modal */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm" dir="rtl">
          <div className="bg-white w-full max-w-lg rounded-[40px] p-10 text-right">
            <h3 className="text-3xl font-black mb-8 text-slate-900">שאל שאלה</h3>
            <textarea 
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 rounded-[32px] p-6 h-48 outline-none mb-8 text-right font-medium" 
              placeholder="מה השאלה?"
            ></textarea>
            <div className="flex gap-4 flex-row-reverse">
              <button onClick={handlePostQuestion} className="flex-1 bg-indigo-600 text-white py-5 rounded-[28px] font-black hover:bg-indigo-700 transition-all">פרסם שאלה</button>
              <button onClick={() => setIsQuestionModalOpen(false)} className="px-8 bg-slate-100 rounded-[28px] font-black hover:bg-slate-200 transition-all">ביטול</button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-white border-t border-slate-200 py-16 mt-20 text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">&copy; 2026 COURSEMATE ISRAEL 🇮🇱 מיוצר על ידי סטודנטים</p>
      </footer>

      {/* Material Upload Modal */}
      {isMaterialModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm" dir="rtl" onClick={() => setIsMaterialModalOpen(false)}>
          <div className="bg-white w-full max-w-lg rounded-[40px] p-10 text-right animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8 flex-row-reverse">
              <h3 className="text-3xl font-black text-slate-900">העלאת חומר לימוד</h3>
              <button onClick={() => setIsMaterialModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                <X className="h-8 w-8" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">כותרת החומר</label>
                <input 
                  type="text" 
                  value={newMaterialTitle}
                  onChange={(e) => setNewMaterialTitle(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-right"
                  placeholder="למשל: סיכום הרצאה 1-5"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">סוג החומר</label>
                <div className="grid grid-cols-2 gap-3">
                  {MATERIAL_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setNewMaterialCategory(cat.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all font-bold text-sm flex-row-reverse ${newMaterialCategory === cat.id ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                    >
                      <cat.icon className="h-4 w-4" />
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">בחירת קובץ</label>
                <div 
                  onClick={() => document.getElementById('materialFile').click()}
                  className={`border-2 border-dashed rounded-[32px] p-8 text-center cursor-pointer transition-all ${newMaterialFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-200 hover:border-indigo-200 bg-slate-50'}`}
                >
                  <input 
                    id="materialFile"
                    type="file" 
                    className="hidden" 
                    onChange={(e) => setNewMaterialFile(e.target.files[0])}
                  />
                  {newMaterialFile ? (
                    <div className="flex flex-col items-center text-emerald-600 font-bold">
                      <CheckCircle className="h-10 w-10 mb-2" />
                      <span className="text-sm truncate w-full px-4">{newMaterialFile.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-slate-400">
                      <Upload className="h-10 w-10 mb-2" />
                      <span className="text-sm font-black uppercase tracking-widest text-center">לחץ לבחירת קובץ מהמחשב</span>
                    </div>
                  )}
                </div>
              </div>

              <button 
                onClick={handlePostMaterial}
                className="w-full bg-indigo-600 text-white py-5 rounded-[28px] font-black text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all mt-4"
              >
                פרסם חומר לימוד
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Upload Modal */}
      {isStatsModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm" dir="rtl">
          <div className="bg-white w-full max-w-lg rounded-[40px] p-10 text-right">
            <div className="flex justify-between items-center mb-8 flex-row-reverse">
              <h3 className="text-3xl font-black text-slate-900">העלאת נתונים</h3>
              <button onClick={() => setIsStatsModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                <X className="h-8 w-8" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">כותרת (למשל: סמסטר א - תשפ"ד)</label>
                <input 
                  type="text" 
                  value={newStatsTitle}
                  onChange={(e) => setNewStatsTitle(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-right"
                  placeholder="הזינו כותרת לנתונים"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">צילום מסך מהאובריט</label>
                <div 
                  onClick={() => document.getElementById('statsFile').click()}
                  className={`border-2 border-dashed rounded-[32px] p-10 text-center cursor-pointer transition-all ${newStatsFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-200 hover:border-indigo-200 bg-slate-50'}`}
                >
                  <input 
                    id="statsFile"
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => setNewStatsFile(e.target.files[0])}
                  />
                  {newStatsFile ? (
                    <div className="flex flex-col items-center text-emerald-600 font-bold">
                      <CheckCircle className="h-12 w-12 mb-3" />
                      <span className="text-sm truncate w-full px-4">{newStatsFile.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-slate-400">
                      <Camera className="h-12 w-12 mb-3" />
                      <span className="text-sm font-black uppercase tracking-widest">לחץ להעלאת תמונה</span>
                    </div>
                  )}
                </div>
              </div>

              <button 
                onClick={handlePostStats}
                className="w-full bg-indigo-600 text-white py-5 rounded-[28px] font-black text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all mt-4"
              >
                פרסם סטטיסטיקה
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[110] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X className="h-10 w-10" />
          </button>
          
          <div className="max-w-5xl w-full flex flex-col items-center gap-8 animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <img 
              src={selectedImage.url} 
              alt={selectedImage.title} 
              className="rounded-[40px] shadow-2xl max-h-[70vh] object-contain border border-white/10"
            />
            <div className="text-center text-white">
              <h3 className="text-3xl font-black mb-2">{selectedImage.title}</h3>
              <p className="text-white/60 font-bold">הועלה בתאריך {selectedImage.date} על ידי {selectedImage.author}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
