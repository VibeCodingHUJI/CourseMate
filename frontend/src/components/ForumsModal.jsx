import React from 'react';
import { MessageSquare, X, ChevronLeft } from 'lucide-react';
import StudentForumWidget from './StudentForumWidget';

const ForumsModal = ({
  isOpen,
  onClose,
  user,
  forumsList = [],
  activeForumId,
  onSetActiveForum,
  forumQuestions = [],
  newQuestion,
  setNewQuestion,
  onPostQuestion,
  onPostAnswer,
  expandedQs,
  onToggleQ,
  studyTracks = []
}) => {
  if (!isOpen || !user) return null;
  const safeList = Array.isArray(forumsList) ? forumsList : [];

  const activeForum = safeList.find(f => String(f.id) === String(activeForumId)) ||
                     (safeList.length > 0 ? safeList[0] : null);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6" dir="rtl">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="bg-white w-full max-w-6xl h-[85vh] rounded-[48px] shadow-2xl relative z-10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
        {/* Modal Header */}
        <div className="p-8 bg-indigo-600 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-6">
            <div className="bg-white/20 p-4 rounded-3xl">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-black mb-1">הפורומים של השילוב שלך</h2>
              <p className="text-white/70 font-bold">כאן תוכלו להתייעץ על השילוב שלכם עם סטודנטים נוספים.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-white/10 rounded-2xl transition-colors"
          >
            <X className="h-8 w-8" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
           {/* Right: Forums List Sidebar */}
           <div className="w-full lg:w-80 border-l border-slate-200 bg-white p-8 overflow-y-auto shrink-0">
              <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4 bg-indigo-50 px-3 py-1 rounded-lg w-fit">פורומים רלוונטיים לשילוב שלך</h3>
              {safeList.length > 0 ? (
                <div className="space-y-3">
                  {safeList.map(f => (
                    <div
                      key={f.id}
                      onClick={() => onSetActiveForum(f.id)}
                      className={`p-5 rounded-[28px] border-2 transition-all cursor-pointer ${String(f.id) === String(activeForumId) ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' : 'border-slate-100 bg-white hover:border-indigo-200'}`}
                    >
                      <h5 className={`font-black text-sm mb-1 ${String(f.id) === String(activeForumId) ? 'text-indigo-900' : 'text-slate-800'}`}>{f.title}</h5>
                      <p className="text-[10px] text-slate-400 font-bold">{f.academicYear}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-slate-300 font-bold italic">אין פורומים נוספים כרגע</p>
              )}
           </div>

           {/* Left: Active Forum Thread */}
           <div className="flex-1 overflow-y-auto p-10 bg-slate-50 custom-scrollbar">
              {activeForum ? (
                <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-200">
                  <div className="mb-10 flex items-end justify-between border-b border-slate-100 pb-6">
                    <div className="text-right">
                      <h3 className="text-3xl font-black text-slate-900 mb-2">
                        {activeForum.title}
                      </h3>
                      <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">{activeForum.academicYear}</p>
                    </div>
                    <div className="bg-indigo-50 px-4 py-2 rounded-2xl text-indigo-600 font-black text-xs">
                      {forumQuestions.length} שאלות פעילות
                    </div>
                  </div>

                  <StudentForumWidget 
                    forum={activeForum}
                    questions={forumQuestions}
                    user={user}
                    isExpanded={true}
                    onToggleExpand={() => {}} 
                    newQuestion={newQuestion}
                    setNewQuestion={setNewQuestion}
                    onPostQuestion={onPostQuestion}
                    onPostAnswer={onPostAnswer}
                    expandedQs={expandedQs}
                    onToggleQ={onToggleQ}
                    hideHeader={true}
                  />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12">
                  <div className="bg-white w-24 h-24 rounded-[32px] flex items-center justify-center mb-8 text-slate-300 shadow-sm border border-slate-100">
                    <MessageSquare className="h-12 w-12" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4">לא נמצאו פורומים מתאימים לשילוב שלך</h3>
                  <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
                    חיפשנו פורומים הכוללים את {majorA} {majorB ? `ו-${majorB}` : ''}, אך טרם נפתחו דיונים כאלו.
                  </p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ForumsModal;
