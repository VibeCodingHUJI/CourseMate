import { MessageSquare, User } from 'lucide-react';

const MOCK_QNA = [
  { 
    id: '1', 
    question: 'יש המלצה על ספר עזר טוב למבחן?', 
    answers: [
      { id: '1a', text: 'הספר "Introduction to Algorithms" של CLRS מעולה, אבל עמוס. לסיכומים של דור עדיף.', date: '2024-01-20' }
    ],
    date: '2024-01-18' 
  },
  { 
    id: '2', 
    question: 'המבחן בדרך כלל דומה למבחני דוגמה?', 
    answers: [
      { id: '2a', text: 'כן, רוב השאלות הן באותו סגנון, חוץ מאחת קשה בסוף.', date: '2023-11-05' },
      { id: '2b', text: 'ממש לא, השנה הם שינו הכל. תזהרו.', date: '2023-11-06' }
    ],
    date: '2023-11-04' 
  },
];

const QnAList = () => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-secondary-800">שאלות ותשובות ({MOCK_QNA.length})</h2>
        <button className="text-primary-600 text-sm font-bold border-2 border-primary-100 px-4 py-2 rounded-lg hover:bg-primary-50 transition-all">
          שאלו שאלה חדשה
        </button>
      </div>

      {MOCK_QNA.map(q => (
        <div key={q.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 bg-slate-50/50">
            <div className="flex gap-4">
              <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-secondary-800 mb-1">{q.question}</h4>
                <p className="text-xs text-slate-400 font-mono">{q.date}</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {q.answers.map(a => (
              <div key={a.id} className="flex gap-4 border-r-2 border-slate-100 pr-6">
                <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-slate-700 text-sm leading-relaxed mb-1">{a.text}</p>
                  <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">{a.date}</p>
                </div>
              </div>
            ))}
            
            <div className="pt-2 pr-12">
              <input 
                type="text" 
                placeholder="הוסיפו תשובה..."
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QnAList;
