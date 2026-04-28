import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, ChevronLeft, X, Send, User, BookOpen, Search
} from 'lucide-react';

const CombinationForum = ({ user, onLogout, onTrackSelect }) => {
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

  const STUDY_TRACKS = [
    { id: 'cs', label: "מדעי המחשב", value: "Computer Science" },
    { id: 'ba', label: "מנהל עסקים", value: "Business Administration" },
    { id: 'eco', label: "כלכלה", value: "Economics" },
    { id: 'psy', label: "פסיכולוגיה", value: "Psychology" },
    { id: 'oth', label: "אחר", value: "Other" }
  ];

  // Filters
  const [filterA, setFilterA] = useState('');
  const [filterB, setFilterB] = useState('');

  useEffect(() => {
    fetch('http://localhost:3000/combinations')
      .then(res => res.json())
      .then(data => setCombinations(data.reverse()))
      .catch(err => console.error('Error fetching combinations:', err));
  }, []);

  useEffect(() => {
    if (selectedCombination) {
      fetch(`http://localhost:3000/combinationQuestions?combinationId=${selectedCombination.id}`)
        .then(res => res.json())
        .then(data => setCombinationQuestions(data.reverse()))
        .catch(err => console.error('Error fetching combination questions:', err));
    }
  }, [selectedCombination]);

  const handlePostCombination = async () => {
    if (!majorA || !majorB || !initialQuestion) return alert('נא למלא את כל השדות');
    
    const labelA = STUDY_TRACKS.find(t => t.value === majorA)?.label || majorA;
    const labelB = STUDY_TRACKS.find(t => t.value === majorB)?.label || majorB;

    const newComb = {
      majorA, majorB,
      title: `${labelA} + ${labelB}`,
      date: new Date().toLocaleDateString('he-IL'),
      replies: 1
    };

    try {
      const res = await fetch('http://localhost:3000/combinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newComb)
      });
      const savedComb = await res.json();
      
      const newQ = {
        combinationId: savedComb.id,
        question: initialQuestion,
        answers: [],
        date: new Date().toLocaleDateString('he-IL'),
        author: 'אורח/ת'
      };
      
      await fetch('http://localhost:3000/combinationQuestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQ)
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
    const newQ = {
      combinationId: selectedCombination.id,
      question: newQText,
      answers: [],
      date: new Date().toLocaleDateString('he-IL'),
      author: 'אורח/ת'
    };

    try {
      const res = await fetch('http://localhost:3000/combinationQuestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQ)
      });
      const savedQ = await res.json();
      setCombinationQuestions([savedQ, ...combinationQuestions]);
      setNewQText('');
      setIsNewQModalOpen(false);
    } catch (err) {
      alert('שגיאה בפרסום השאלה');
    }
  };

  const handlePostAnswer = async (qId, text) => {
    if (!text) return;
    const question = combinationQuestions.find(q => q.id === qId);
    const updatedAnswers = [...question.answers, { 
      text, date: new Date().toLocaleDateString('he-IL'), author: 'אורח/ת' 
    }];

    try {
      const res = await fetch(`http://localhost:3000/combinationQuestions/${qId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: updatedAnswers })
      });
      const updatedQ = await res.json();
      setCombinationQuestions(combinationQuestions.map(q => q.id === qId ? updatedQ : q));
    } catch (err) {
      alert('שגיאה בפרסום התשובה');
    }
  };

  const filteredCombinations = combinations.filter(c => 
    (!filterA || c.majorA === filterA || c.majorB === filterA) && 
    (!filterB || c.majorA === filterB || c.majorB === filterB)
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12" dir="rtl">
      {!selectedCombination ? (
        <>
          <header className="text-right">
            <h1 className="text-5xl font-black text-slate-900 mb-4">פורום שילובים</h1>
            <p className="text-xl text-slate-500 font-medium">כאן תוכלו להתייעץ על שילובים בין חוגים ולקבל טיפים מסטודנטים אחרים.</p>
          </header>

          {/* Filters Bar */}
          <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 w-full text-right">
              <label className="text-xs font-black text-slate-400 mb-3 block">חוג א'</label>
              <select 
                value={filterA}
                onChange={(e) => setFilterA(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:bg-white transition-all font-bold text-right cursor-pointer"
              >
                <option value="">הכל...</option>
                {STUDY_TRACKS.map(t => <option key={t.id} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="bg-indigo-50 h-12 w-12 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
              <X className="h-6 w-6 rotate-45" />
            </div>
            <div className="flex-1 w-full text-right">
              <label className="text-xs font-black text-slate-400 mb-3 block">חוג ב'</label>
              <select 
                value={filterB}
                onChange={(e) => setFilterB(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:bg-white transition-all font-bold text-right cursor-pointer"
              >
                <option value="">הכל...</option>
                {STUDY_TRACKS.map(t => <option key={t.id} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <button 
              onClick={() => setIsNewCombModalOpen(true)}
              className="md:self-end bg-indigo-600 text-white px-10 py-4 rounded-[24px] font-black hover:bg-indigo-700 shadow-xl active:scale-95 transition-all"
            >
              פתח דיון חדש על שילוב
            </button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredCombinations.map(c => (
              <div 
                key={c.id} 
                onClick={() => setSelectedCombination(c)}
                className="bg-white p-8 rounded-[40px] border border-slate-100 hover:border-indigo-200 hover:shadow-xl transition-all group cursor-pointer text-right"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-indigo-50 text-indigo-700 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {c.replies} תגובות
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.date}</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-6 group-hover:text-indigo-600 transition-colors">{c.title}</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-600 font-black text-sm">
                    <span>קרא את הדיון המלא</span>
                    <ChevronLeft className="h-4 w-4" />
                  </div>
                  <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                    {[
                      { val: c.majorA, label: STUDY_TRACKS.find(t => t.value === c.majorA)?.label },
                      { val: c.majorB, label: STUDY_TRACKS.find(t => t.value === c.majorB)?.label }
                    ].map((m, i) => (
                      <button
                        key={i}
                        onClick={() => onTrackSelect(m.val)}
                        className="bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-600 px-4 py-2 rounded-xl text-xs font-black transition-all"
                      >
                        צפה בקורסי {m.label}
                      </button>
                    ))}
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
                <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <MessageSquare className="h-6 w-6 text-indigo-400" />
                    <div className="text-xl font-bold">{q.question}</div>
                  </div>
                  <div className="text-xs text-white/50">פורסם ב-{q.date} על ידי {q.author}</div>
                </div>
                <div className="p-8 space-y-6">
                  {q.answers.map((a, i) => (
                    <div key={i} className="flex gap-6 border-r-4 border-slate-50 pr-6">
                      <div className="h-10 w-10 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 shrink-0"><User className="h-5 w-5" /></div>
                      <div>
                        <p className="text-slate-700 font-medium">{a.text}</p>
                        <div className="text-[10px] text-slate-400 font-black mt-1">מאת {a.author || 'אורח/ת'} • {a.date}</div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 mr-16">
                    <input 
                      type="text" 
                      placeholder="הוסף תשובה..."
                      onKeyDown={(e) => { if (e.key === 'Enter') { handlePostAnswer(q.id, e.target.value); e.target.value = ''; } }}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 rounded-2xl px-6 py-3 outline-none text-right font-medium"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Discussion Modal */}
      {isNewCombModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsNewCombModalOpen(false)}>
          <div className="bg-white w-full max-w-lg rounded-[40px] p-10 text-right animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-black text-slate-900">פתח דיון חדש</h3>
              <button onClick={() => setIsNewCombModalOpen(false)}><X className="h-8 w-8 text-slate-400" /></button>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase mb-2 block">חוג א'</label>
                  <select value={majorA} onChange={(e) => setMajorA(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-right font-bold appearance-none">
                    <option value="">בחירה...</option>
                    {STUDY_TRACKS.map(t => <option key={t.id} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase mb-2 block">חוג ב'</label>
                  <select value={majorB} onChange={(e) => setMajorB(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-right font-bold appearance-none">
                    <option value="">בחירה...</option>
                    {STUDY_TRACKS.map(t => <option key={t.id} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsNewQModalOpen(false)}>
          <div className="bg-white w-full max-w-lg rounded-[40px] p-10 text-right animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <h3 className="text-3xl font-black mb-8 text-slate-900">שאל שאלה</h3>
            <textarea 
              value={newQText} 
              onChange={(e) => setNewQText(e.target.value)} 
              className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 rounded-[32px] p-6 h-48 outline-none mb-8 text-right font-medium transition-all" 
              placeholder="מה השאלה?"
            ></textarea>
            <div className="flex gap-4 flex-row-reverse">
              <button onClick={handlePostQuestion} className="flex-1 bg-indigo-600 text-white py-5 rounded-[28px] font-black hover:bg-indigo-700 transition-all">פרסם שאלה</button>
              <button onClick={() => setIsNewQModalOpen(false)} className="px-8 bg-slate-100 rounded-[28px] font-black hover:bg-slate-200">ביטול</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CombinationForum;
