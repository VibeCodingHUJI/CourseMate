import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, ChevronLeft, X, User, Heart, ChevronDown
} from 'lucide-react';

const FIXED_DEPARTMENTS = [
  "סיעוד", "אגרו-אינפורמטיקה (חטיבת לימודים)", "אגרואקולוגיה ובריאות הצמח", 
  "אגרואקולוגיה ובריאות הצמח וכלכלת סביבה וניהול", "אגרואקולוגיה, בריאות הצמח וביוטכנולוגיה", 
  "אדריכלות נוף", "אמירים", "אנגלית", "ארכאולוגיה והמזרח הקרוב הקדום", "ביוכימיה ומדעי המזון", 
  "ביוכימיה, מדעי המזון וביוטכנולוגיה", "בלשנות", "גאוגרפיה, סביבה וגאואינפורמטיקה", 
  "היסטוריה", "היסטוריה של עם ישראל ויהדות זמננו", "הלשון העברית", "הנדסת חשמל ומדעי המחשב", 
  "הנדסת חשמל ופיזיקה יישומית", "התכנית הרב תחומית במדעי הרוח", "התמחויות בביוטכנולוגיה בחקלאות", 
  "חינוך", "חשבונאות", "יחסים בין-לאומיים", "כימיה", "כלכלה", "כלכלת סביבה וניהול", 
  "כלכלת סביבה וניהול וביוטכנולוגיה בחקלאות", "לימודי אסיה", "לימודי האסלאם והמזרח התיכון", 
  "לימודי רווחה חברתית", "לימודים ספרדיים ולטינו-אמריקניים", "לימודים קלאסיים", 
  "לימודים רומאניים", "לימודים רוסיים וסלאווים", "מדע הדתות", "מדע המדינה", "מדעי המדינה", "מדעי בעלי החיים", 
  "מדעי בעלי החיים וכלכלת סביבה וניהול", "מדעי בעלי חיים וביוטכנולוגיה", "מדעי החיים", 
  "מדעי היהדות", "מדעי הכימיה והביולוגיה", "מדעי המחשב", "ביולוגיה חישובית", 
  "מדעי הצמח בחקלאות", "מדעי הצמח בחקלאות וביוטכנולוגיה", "מדעי הצמח בחקלאות וכלכלת סביבה וניהול", 
  "מדעי הקוגניציה והמוח", "מדעי הקרקע והמים", "מדעי הקרקע והמים וכלכלת סביבה וניהול", 
  "מדעי התזונה", "מדעי כדור הארץ", "מדעים ביורפואיים", "מוסיקולוגיה", "מחשבת ישראל", 
  "מט\"ר", "מכפיל במשפטים", "מנהל עסקים", "מקרא", "משפטים", "מתמטיקה", 
  "סוציולוגיה ואנתרופולוגיה", "סטטיסטיקה ומדע הנתונים", "ספרות כללית והשוואתית", 
  "ספרות עברית", "עבודה סוציאלית", "פילוסופיה", "פכ\"מ", "פיסיקה", "פיזיקה", "פסיכולוגיה", 
  "קרימינולוגיה", "רוקחות", "ריפוי בעיסוק", "רפואה", "רפואת שיניים", 
  "שמירת טבע ומנהל שטחים פתוחים", "שפה וספרות גרמנית", "שפה וספרות ערבית", 
  "תוכנית רביבים", "תולדות האמנות", "תולדות התאטרון", "תלמוד והלכה", "תקשורת ועיתונאות"
].sort().map(d => ({ value: d, label: d }));

const SearchableSelect = ({ options, value, onChange, placeholder, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));
  const selectedLabel = options.find(o => o.value === value)?.label || '';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex-1 w-full text-right relative" ref={dropdownRef}>
      <label className="text-xs font-black text-slate-400 mb-3 block">{label}</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-white transition-all font-bold text-right"
      >
        <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        <div className="flex-1 text-right overflow-hidden">
          {isOpen ? (
            <input 
              autoFocus
              type="text"
              placeholder="חפש..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="bg-transparent outline-none w-full text-right font-bold"
            />
          ) : (
            <span className={`truncate block ${selectedLabel ? 'text-slate-900' : 'text-slate-400'}`}>
              {selectedLabel || placeholder}
            </span>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filtered.length > 0 ? (
              filtered.map(o => (
                <div 
                  key={o.value}
                  onClick={() => {
                    onChange(o.value);
                    setSearch('');
                    setIsOpen(false);
                  }}
                  className="px-6 py-4 hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors group"
                >
                  {value === o.value && <Check className="h-4 w-4 text-indigo-600 shrink-0" />}
                  <span className={`font-bold text-right flex-1 text-sm ${value === o.value ? 'text-indigo-600' : 'text-slate-700 group-hover:text-indigo-600'}`}>
                    {o.label}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-6 py-4 text-slate-400 text-sm text-center font-bold">לא נמצאו תוצאות</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CombinationForum = ({ user, onLogout, onTrackSelect, STUDY_TRACKS, initialForumId, onBack, userCombination, relevantForums }) => {
  const [combinations, setCombinations] = useState([]);
  const [selectedCombination, setSelectedCombination] = useState(null);
  const [combinationQuestions, setCombinationQuestions] = useState([]);
  
  // New Discussion Modal State
  const [isNewCombModalOpen, setIsNewCombModalOpen] = useState(false);
  const [majorA, setMajorA] = useState('');
  const [majorB, setMajorB] = useState('');
  const [initialQuestion, setInitialQuestion] = useState('');

  // New Question Modal State
  const [isNewQModalOpen, setIsNewQModalOpen] = useState(false);
  const [newQText, setNewQText] = useState('');

  // Filters
  const [filterA, setFilterA] = useState('');
  const [filterB, setFilterB] = useState('');
  const [filterYear, setFilterYear] = useState('תשפ"ו (2025-26)');

  const ACADEMIC_YEARS = [
    { value: 'תשפ"ד (2023-24)', label: 'תשפ"ד (2023-24)' },
    { value: 'תשפ"ה (2024-25)', label: 'תשפ"ה (2024-25)' },
    { value: 'תשפ"ו (2025-26)', label: 'תשפ"ו (2025-26)' },
    { value: 'תשפ"ז (2026-27)', label: 'תשפ"ז (2026-27)' }
  ];

  // Collapsible logic
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [answerTexts, setAnswerTexts] = useState({});

  const toggleQuestion = (qId) => {
    setExpandedQuestions(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  useEffect(() => {
    fetch(`${API}/api/general-forums`)
      .then(res => res.json())
      .then(data => {
        setCombinations(data);
        if (initialForumId) {
          const target = data.find(f => f.id === initialForumId);
          if (target) setSelectedCombination(target);
        }
      })
      .catch(err => console.error('Error fetching forums:', err));
  }, []);

  useEffect(() => {
    if (selectedCombination) {
      fetch(`${API}/api/general-forum-questions?forumId=${selectedCombination.id}`)
        .then(res => res.json())
        .then(data => {
          setCombinationQuestions(data);
          const allExpanded = {};
          data.forEach(q => { allExpanded[q.id] = true; });
          setExpandedQuestions(allExpanded);
        })
        .catch(err => console.error('Error fetching forum questions:', err));
    }
  }, [selectedCombination]);

  const handlePostCombination = async () => {
    if (!majorA || !majorB || !initialQuestion) return alert('נא למלא את כל השדות');

    try {
      const forumRes = await fetch(`${API}/api/general-forums`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${majorA} + ${majorB}`,
          majorA, majorB,
          academicYear: filterYear
        })
      });
      const savedComb = await forumRes.json();

      await fetch(`${API}/api/general-forum-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          forumId: savedComb.id,
          question: initialQuestion,
          author: user.isGuest ? 'אורח/ת' : user.name,
          userId: user.isGuest ? null : user.id
        })
      });

      setCombinations([savedComb, ...combinations]);
      setIsNewCombModalOpen(false);
      setMajorA(''); setMajorB(''); setInitialQuestion('');
      alert('הדיון נפתח בהצלחה!');
    } catch (err) {
      alert('שגיאה בפתיחת הדיון');
    }
  };

  const handlePostQuestion = async () => {
    if (!newQText) return;
    try {
      const res = await fetch(`${API}/api/general-forum-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          forumId: selectedCombination.id,
          question: newQText,
          author: user.isGuest ? 'אורח/ת' : user.name,
          userId: user.isGuest ? null : user.id
        })
      });
      const savedQ = await res.json();
      setCombinationQuestions([savedQ, ...combinationQuestions]);
      setNewQText('');
      setIsNewQModalOpen(false);
    } catch (err) {
      alert('שגיאה בפרסום השאלה');
    }
  };

  const handlePostAnswer = async (qId) => {
    const text = (answerTexts[qId] || '').trim();
    if (!text) return;
    try {
      const res = await fetch(`${API}/api/general-forum-answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: qId,
          text,
          author: user.isGuest ? 'אורח/ת' : user.name,
          userId: user.isGuest ? null : user.id
        })
      });
      const updatedQ = await res.json();
      setCombinationQuestions(combinationQuestions.map(q => q.id === qId ? updatedQ : q));
      setAnswerTexts(prev => ({ ...prev, [qId]: '' }));
      setExpandedQuestions(prev => ({ ...prev, [qId]: true }));
    } catch (err) {
      alert('שגיאה בפרסום התשובה');
    }
  };

  const handleLikeAnswer = (qId, answerIndex) => {
    const question = combinationQuestions.find(q => q.id === qId);
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

    setCombinationQuestions(combinationQuestions.map(q =>
      q.id === qId ? { ...q, answers: updatedAnswers } : q
    ));
  };

  const relevantIds = (!user?.isGuest && Array.isArray(relevantForums))
    ? new Set(relevantForums.map(f => String(f.id)))
    : null;

  const filteredCombinations = combinations.filter(c => {
    if (relevantIds && !relevantIds.has(String(c.id))) return false;
    return (
      (!filterA || c.majorA === filterA || c.majorB === filterA || (c.title && c.title.includes(filterA))) &&
      (!filterB || c.majorA === filterB || c.majorB === filterB || (c.title && c.title.includes(filterB))) &&
      (!filterYear || c.academicYear === filterYear)
    );
  });

  const existingCombination = combinations.find(c => 
    filterA && filterB && 
    ((c.majorA === filterA && c.majorB === filterB) || (c.majorA === filterB && c.majorB === filterA) || 
     (c.title && c.title.includes(filterA) && c.title.includes(filterB))) &&
    (c.academicYear === filterYear)
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12" dir="rtl">
      {onBack && !user?.isGuest && (
        <button
          onClick={onBack}
          className="group flex items-center gap-3 text-slate-500 font-black hover:text-indigo-600 transition-all"
        >
          <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 group-hover:border-indigo-100">
            <ChevronLeft className="h-4 w-4 rotate-180" />
          </div>
          <span>חזרה לדף הבית</span>
        </button>
      )}
      {!selectedCombination ? (
        <>
          <header className="text-right">
            <h1 className="text-5xl font-black text-slate-900 mb-4">{user?.isGuest ? 'פורום שילובים' : 'פורומים שרלוונטיים לחוגים שלך'}</h1>
            <p className="text-xl text-slate-500 font-medium">{user?.isGuest ? 'כאן תוכלו להתייעץ על שילובים בין חוגים ולקבל טיפים מסטודנטים אחרים.' : 'כאן תוכלו לשאול שאלות על השילוב שלכם ולענות על שאלות של אנשים שעומדים להיות סטודנטים לגבי השילוב שלכם והחוגים שלכם.'}</p>
          </header>

          {/* Filters Bar */}
          <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 w-full text-right relative">
              <label className="text-xs font-black text-slate-400 mb-3 block">שנת לימודים</label>
              <select 
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none hover:bg-white focus:border-indigo-500 transition-all font-bold text-right appearance-none"
              >
                {ACADEMIC_YEARS.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}
              </select>
            </div>
            
            <SearchableSelect 
              label="חוג א'"
              placeholder="הכל..."
              options={FIXED_DEPARTMENTS}
              value={filterA}
              onChange={setFilterA}
            />
            <div className="bg-indigo-50 h-12 w-12 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
              <X className="h-6 w-6 rotate-45" />
            </div>
            <SearchableSelect 
              label="חוג ב'"
              placeholder="הכל..."
              options={FIXED_DEPARTMENTS}
              value={filterB}
              onChange={setFilterB}
            />

            <div className="md:self-end flex flex-col gap-2 min-w-[240px]">
              {existingCombination ? (
                <button 
                  onClick={() => setSelectedCombination(existingCombination)}
                  className="w-full bg-emerald-600 text-white px-10 py-4 rounded-[24px] font-black hover:bg-emerald-700 shadow-xl active:scale-95 transition-all"
                >
                  צפה בדיון קיים
                </button>
              ) : (
                <>
                  {(!filterA || !filterB) ? (
                    <div className="bg-slate-50 text-slate-400 px-6 py-4 rounded-2xl text-xs font-black text-center border-2 border-dashed border-slate-200">
                      בחרו שני חוגים לחיפוש/פתיחה
                    </div>
                  ) : (
                    <button 
                      onClick={() => {
                        setMajorA(filterA);
                        setMajorB(filterB);
                        setIsNewCombModalOpen(true);
                      }}
                      className="w-full bg-indigo-600 text-white px-10 py-4 rounded-[24px] font-black hover:bg-indigo-700 shadow-xl active:scale-95 transition-all"
                    >
                      פתח דיון חדש
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredCombinations.map(c => (
              <div 
                key={c.id} 
                onClick={() => setSelectedCombination(c)}
                className="bg-white p-8 rounded-[40px] border border-slate-100 hover:border-indigo-200 hover:shadow-xl transition-all group cursor-pointer text-right"
              >
                <div className="flex justify-end mb-6">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.date}</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-6 group-hover:text-indigo-600 transition-colors">{c.title}</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-600 font-black text-sm">
                    <span>קרא את הדיון המלא</span>
                    <ChevronLeft className="h-4 w-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <button 
            onClick={() => setSelectedCombination(null)}
            className="group flex items-center gap-3 text-slate-500 font-black hover:text-indigo-600 transition-all mb-8"
          >
            <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 group-hover:border-indigo-100">
              <ChevronLeft className="h-4 w-4 rotate-180" />
            </div>
            <span>חזרה לפורום שילובים</span>
          </button>

          <div className="flex justify-between items-end mb-12">
             <h1 className="text-4xl font-black text-slate-900 text-right">{selectedCombination.title}</h1>
             <button 
              onClick={() => setIsNewQModalOpen(true)}
              className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-indigo-700 shadow-lg active:scale-95 transition-all"
            >
              שאל שאלה על השילוב
            </button>
          </div>

          <div className="space-y-6">
            {combinationQuestions.map(q => (
              <div key={q.id} className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden text-right">
                <div
                  onClick={() => toggleQuestion(q.id)}
                  className="p-8 bg-slate-900 text-white flex justify-between items-center cursor-pointer hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <MessageSquare className={`h-6 w-6 transition-colors ${expandedQuestions[q.id] ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <div className="text-xl font-bold">{q.question}</div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-xs text-white/50">פורסם ב-{q.date}</div>
                    <ChevronLeft className={`h-5 w-5 text-slate-500 transition-transform duration-300 ${expandedQuestions[q.id] ? '-rotate-90' : 'rotate-0'}`} />
                  </div>
                </div>

                <div className="p-6 border-b border-slate-100" style={{ backgroundColor: '#f0f2f5' }}>
                  <div className="flex items-center gap-4" dir="rtl">
                    <input
                      type="text"
                      value={answerTexts[q.id] || ''}
                      onChange={(e) => setAnswerTexts(prev => ({ ...prev, [q.id]: e.target.value }))}
                      placeholder="הוסף תגובה..."
                      onKeyDown={(e) => { if (e.key === 'Enter') handlePostAnswer(q.id); }}
                      className="flex-1 bg-white border border-slate-200 rounded-2xl py-3 px-6 outline-none text-right font-medium focus:border-indigo-500 transition-all"
                      style={{ direction: 'rtl' }}
                    />
                    <button
                      onClick={() => handlePostAnswer(q.id)}
                      className="bg-indigo-600 text-white px-10 py-3 rounded-2xl font-black hover:bg-indigo-700 transition-all active:scale-95 shadow-md"
                    >
                      שלח
                    </button>
                  </div>
                </div>
                
                {expandedQuestions[q.id] && (
                  <div className="p-8 space-y-6 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-6">
                      {q.answers.map((a, i) => (
                        <div key={i} className="flex gap-6 border-r-4 border-slate-50 pr-6 group/ans">
                          <div className="h-10 w-10 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 shrink-0"><User className="h-5 w-5" /></div>
                          <div className="flex-1 flex justify-between items-start">
                            <div>
                              <p className="text-slate-700 font-medium">{a.text}</p>
                              <div className="text-[10px] text-slate-400 font-black mt-1">{a.date}</div>
                            </div>
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
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Discussion Modal */}
      {isNewCombModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsNewCombModalOpen(false)}>
          <div className="bg-white w-full max-w-lg rounded-[40px] p-10 text-right animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setIsNewCombModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                <X className="h-8 w-8" />
              </button>
              <h3 className="text-3xl font-black text-slate-900">פתח דיון חדש</h3>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <SearchableSelect 
                  label="חוג א'"
                  placeholder="בחירה..."
                  options={FIXED_DEPARTMENTS}
                  value={majorA}
                  onChange={setMajorA}
                />
                <SearchableSelect 
                  label="חוג ב'"
                  placeholder="בחירה..."
                  options={FIXED_DEPARTMENTS}
                  value={majorB}
                  onChange={setMajorB}
                />
              </div>
              <div>
                <label className="text-xs font-black text-slate-400 uppercase mb-2 block">שאל שאלה</label>
                <textarea 
                  value={initialQuestion} 
                  onChange={(e) => setInitialQuestion(e.target.value)} 
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 rounded-[24px] p-6 h-32 text-right font-medium outline-none transition-all" 
                  placeholder="מה תרצה לדעת על השילוב הזה?"
                ></textarea>
              </div>
              <button onClick={handlePostCombination} className="w-full bg-indigo-600 text-white py-5 rounded-[28px] font-black text-lg hover:bg-indigo-700 active:scale-95 transition-all">פתח את הדיון</button>
            </div>
          </div>
        </div>
      )}

      {/* New Question Modal */}
      {isNewQModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm" dir="rtl" onClick={() => setIsNewQModalOpen(false)}>
          <div className="bg-white w-full max-w-lg rounded-[40px] p-10 text-right animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setIsNewQModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                <X className="h-8 w-8" />
              </button>
              <h3 className="text-3xl font-black text-slate-900">שאל שאלה</h3>
            </div>
            <textarea 
              value={newQText} 
              onChange={(e) => setNewQText(e.target.value)} 
              className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 rounded-[32px] p-6 h-48 outline-none mb-8 text-right font-medium transition-all" 
              placeholder="מה השאלה?"
            ></textarea>
            <button onClick={handlePostQuestion} className="w-full bg-indigo-600 text-white py-5 rounded-[28px] font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-[0.98]">
              פרסם שאלה
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CombinationForum;
