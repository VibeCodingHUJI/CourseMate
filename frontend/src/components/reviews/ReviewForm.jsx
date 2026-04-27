import { useState } from 'react';
import { Star, Send } from 'lucide-react';

const ReviewForm = ({ courseId }) => {
  const [rating, setRating] = useState(0);
  const [difficulty, setDifficulty] = useState(3);
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('הביקורת נשלחה בהצלחה!');
    setRating(0);
    setComment('');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-bold text-secondary-800 mb-6">הוספת ביקורת</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">דירוג הקורס</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`transition-transform hover:scale-110 ${star <= rating ? 'text-primary-500' : 'text-slate-200'}`}
              >
                <Star className={`h-8 w-8 ${star <= rating ? 'fill-current' : ''}`} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">רמת קושי (1-5)</label>
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={difficulty}
            onChange={(e) => setDifficulty(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-2 px-1">
            <span>קל</span>
            <span className="font-bold text-slate-700">{difficulty}</span>
            <span>מאתגר</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">הביקורת שלך</label>
          <textarea
            required
            rows="4"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="מה דעתך על הקורס? רמת המבחנים? איכות המרצה/ית?"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none"
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full bg-primary-600 text-white font-bold py-3 rounded-xl hover:bg-primary-700 transition-all flex items-center justify-center gap-2"
        >
          <Send className="h-4 w-4" />
          פרסום ביקורת
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
