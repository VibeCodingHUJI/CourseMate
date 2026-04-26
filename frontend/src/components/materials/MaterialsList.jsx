import { FileText, Download, Upload } from 'lucide-react';

const MOCK_MATERIALS = [
  { id: '1', title: 'סיכום מלא - מבוא למדעי המחשב 2023', type: 'PDF', author: 'דור לוי', date: '2023-12-01' },
  { id: '2', title: 'שחזור מבחן מועד א 2022', type: 'DOCX', author: 'אנונימי', date: '2022-07-15' },
  { id: '3', title: 'פתרון תרגילי בית 1-5', type: 'Link', author: 'נועה כהן', date: '2023-11-20' },
];

const MaterialsList = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-secondary-800">חומרי לימוד וסיכומים</h2>
        <button className="bg-primary-600 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-primary-700 transition-all flex items-center gap-2">
          <Upload className="h-4 w-4" />
          העלאת סיכום
        </button>
      </div>

      <div className="grid gap-4">
        {MOCK_MATERIALS.map(item => (
          <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-primary-100 transition-colors shadow-sm">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                <FileText className="h-5 w-5 text-primary-500" />
              </div>
              <div>
                <h4 className="font-bold text-secondary-800 text-sm">{item.title}</h4>
                <div className="flex gap-2 text-[10px] text-slate-400 font-mono mt-1">
                  <span>סוג: <b>{item.type}</b></span>
                  <span>•</span>
                  <span>הועלה ע"י: {item.author}</span>
                  <span>•</span>
                  <span>{item.date}</span>
                </div>
              </div>
            </div>
            
            <button className="h-8 w-8 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center hover:bg-primary-100 transition-all">
              <Download className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-6 bg-primary-50/30 rounded-2xl border border-dashed border-primary-200 text-center">
        <p className="text-sm text-slate-600 mb-4">יש לכם סיכום טוב שיכול לעזור לאחרים? שתפו אותו עכשיו!</p>
        <button className="text-primary-600 font-bold text-sm hover:underline">לחצו כאן להעלאה מהירה</button>
      </div>
    </div>
  );
};

export default MaterialsList;
