import React, { useState } from 'react';
import { MessageSquare, ChevronDown, Send, User, ChevronLeft, X as XIcon } from 'lucide-react';

const StudentForumWidget = ({ 
  forum, 
  questions = [], 
  user, 
  isExpanded, 
  onToggleExpand,
  newQuestion = '',
  setNewQuestion,
  onPostQuestion,
  onPostAnswer,
  expandedQs = {},
  onToggleQ,
  hideHeader = false
}) => {
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  
  if (!forum) return null;
  const safeQuestions = Array.isArray(questions) ? questions : [];

  const handlePost = async () => {
    if (!String(newQuestion || '').trim()) return;
    await onPostQuestion?.();
    setIsAskingQuestion(false);
  };

  return (
    <div className={`${hideHeader ? '' : 'mb-12 bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden'} text-right animate-in fade-in slide-in-from-top-4 duration-500`}>
      {!hideHeader && (
        <div 
          onClick={onToggleExpand}
          className="p-8 bg-indigo-600 text-white flex justify-between items-center cursor-pointer hover:bg-indigo-700 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black">הפורום של השילוב שלך</h2>
              <p className="text-white/70 font-bold text-sm">{forum.title} • {forum.academicYear}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-black bg-white/20 px-4 py-1.5 rounded-xl uppercase tracking-widest">
              {safeQuestions.length} שאלות
            </span>
            <ChevronDown className={`h-6 w-6 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
      )}

      {(isExpanded || hideHeader) && (
        <div className={`${hideHeader ? '' : 'p-8'} space-y-8 animate-in slide-in-from-top-2 duration-300`}>
          {/* 2. Questions List First */}
          <div className="space-y-6">
            {safeQuestions.map(q => (
              <div key={q.id} className="bg-slate-50 rounded-[32px] border border-slate-100 overflow-hidden text-right">
                <div 
                  onClick={() => onToggleQ?.(q.id)}
                  className="p-6 flex justify-between items-center cursor-pointer hover:bg-slate-100/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-black text-xs">
                      {q.author?.[0] || 'א'}
                    </div>
                    <div className="font-bold text-slate-800">{q.question}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase">{q.date}</span>
                    <ChevronLeft className={`h-4 w-4 text-slate-400 transition-transform ${expandedQs[q.id] ? '-rotate-90' : ''}`} />
                  </div>
                </div>

                {expandedQs[q.id] && (
                  <div className="px-6 pb-6 pt-2 space-y-4">
                    <div className="space-y-4">
                      {(q.answers || []).map((a, i) => (
                        <div key={i} className="flex gap-4 bg-white p-4 rounded-2xl border border-slate-100">
                          <div className="h-8 w-8 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                            <User className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-slate-600 text-sm font-medium">{a.text}</p>
                            <div className="text-[9px] font-black text-slate-400 mt-1">מאת {a.author} • {a.date}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3 pt-2">
                      <input 
                        type="text" 
                        placeholder="הוסף תגובה..."
                        onKeyDown={(e) => { 
                          if (e.key === 'Enter') { 
                            onPostAnswer?.(q.id, e.target.value); 
                            e.target.value = ''; 
                          } 
                        }}
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-500 text-right"
                        dir="rtl"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 3. Conditional Question Input */}
          {!isAskingQuestion ? (
            <button 
              onClick={() => setIsAskingQuestion(true)}
              className="w-full bg-white border-2 border-dashed border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 py-6 rounded-[32px] text-slate-400 hover:text-indigo-600 transition-all font-black text-sm flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <Send className="h-5 w-5" />
              <span>שאל שאלה על השילוב</span>
            </button>
          ) : (
            <div className="bg-slate-50 p-8 rounded-[40px] border-2 border-indigo-100 animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-6">
                 <h4 className="text-xl font-black text-slate-900">פרסום שאלה חדשה</h4>
                 <button onClick={() => setIsAskingQuestion(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                    <XIcon className="h-6 w-6" />
                 </button>
              </div>
              <textarea 
                autoFocus
                value={newQuestion}
                onChange={(e) => setNewQuestion?.(e.target.value)}
                placeholder="יש לך שאלה על השילוב? זה המקום!"
                className="w-full bg-white border-2 border-transparent focus:border-indigo-500/20 rounded-[24px] p-6 h-32 outline-none text-right font-medium text-slate-700 resize-none transition-all mb-6 shadow-sm"
              />
              <div className="flex justify-end gap-3">
                 <button 
                    onClick={() => setIsAskingQuestion(false)}
                    className="px-8 py-3 rounded-2xl text-slate-500 font-black hover:bg-slate-200 transition-all text-sm"
                  >
                    ביטול
                  </button>
                  <button 
                    onClick={handlePost}
                    disabled={!String(newQuestion || '').trim()}
                    className="bg-indigo-600 text-white px-10 py-3 rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    פרסם שאלה
                  </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentForumWidget;
