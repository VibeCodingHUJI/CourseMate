import { useState } from 'react';
import { useParams } from 'react-router-dom';
import ReviewList from '../components/reviews/ReviewList';
import QnAList from '../components/qna/QnAList';
import MaterialsList from '../components/materials/MaterialsList';
import ReviewForm from '../components/reviews/ReviewForm';
import { Star, MessageSquare, BookOpen, PenTool } from 'lucide-react';

const CoursePage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('reviews');

  // Mock data for the specific course
  const course = {
    id,
    title: 'מבוא למדעי המחשב',
    code: '67101',
    credits: 7,
    semester: 'א',
    avgRating: 4.5,
    difficulty: 4.8,
    description: 'קורס המבוא הראשון למדעי המחשב, עוסק ביסודות התכנות בשפת Python, רקורסיה, אלגוריתמים ומבני נתונים בסיסיים.'
  };

  const tabs = [
    { id: 'reviews', label: 'ביקורות', icon: Star },
    { id: 'qna', label: 'שאלות ותשובות', icon: MessageSquare },
    { id: 'materials', label: 'חומרי לימוד', icon: BookOpen },
  ];

  return (
    <div className="max-w-4xl mx-auto" dir="rtl">
      <header className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8 text-right">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="w-full">
            <div className="flex gap-2 items-center mb-2 justify-start">
              {course.semester && (
                <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold inline-block">
                  {course.semester === 'א' ? 'סמסטר א׳' : 
                   course.semester === 'ב' ? 'סמסטר ב׳' : 
                   course.semester === 'א וב' ? 'סמסטר א׳ וב׳' : `סמסטר ${course.semester}`}
                </span>
              )}
              <span className="bg-primary-50 text-primary-600 px-3 py-1 rounded-full text-xs font-bold inline-block">
                {course.code}
              </span>
              <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-bold inline-block">
                {course.credits} נ"ז
              </span>
            </div>
            <h1 className="text-3xl font-bold text-secondary-800">{course.title}</h1>
            <p className="text-slate-600 mt-4 leading-relaxed">{course.description}</p>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{course.avgRating}</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider">דירוג ממוצע</div>
            </div>
            <div className="w-px h-10 bg-slate-200 self-center"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{course.difficulty}</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider">רמת קושי</div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex border-b border-slate-200 mb-8 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-primary-600 text-primary-600 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {activeTab === 'reviews' && <ReviewList />}
          {activeTab === 'qna' && <QnAList />}
          {activeTab === 'materials' && <MaterialsList />}
        </div>
        
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <ReviewForm courseId={id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePage;
