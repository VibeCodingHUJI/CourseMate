import { Star, TrendingUp } from 'lucide-react';

const MOCK_REVIEWS = [
  { id: '1', rating: 5, difficulty: 4, comment: 'קורס מאתגר אבל מרתק. המרצה מעולה ומעביר את החומר בצורה ברורה.', date: '2024-03-15' },
  { id: '2', rating: 4, difficulty: 5, comment: 'עמוס מאוד בשיעורי בית, אבל לומדים המון. מומלץ למי שיש לו זמן להשקיע.', date: '2024-02-10' },
  { id: '3', rating: 3, difficulty: 3, comment: 'חומר מעניין, אבל המבחן היה קשה משמעותית מהתרגולים.', date: '2023-12-05' },
];

const ReviewList = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-secondary-800">ביקורות סטודנטים ({MOCK_REVIEWS.length})</h2>
      {MOCK_REVIEWS.map(review => (
        <div key={review.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 ${i < review.rating ? 'text-primary-500 fill-current' : 'text-slate-200'}`} 
                />
              ))}
            </div>
            <span className="text-xs text-slate-400 font-mono">{review.date}</span>
          </div>
          
          <p className="text-slate-700 leading-relaxed mb-4">{review.comment}</p>
          
          <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg w-fit">
            <TrendingUp className="h-4 w-4 text-orange-500" />
            <span>דירוג קושי: <b>{review.difficulty}/5</b></span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
