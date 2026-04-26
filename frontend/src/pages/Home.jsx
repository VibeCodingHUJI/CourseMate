import { useState } from 'react';
import CourseCard from '../components/courses/CourseCard';

const MOCK_COURSES = [
  { id: '1', title: 'מבוא למדעי המחשב', code: '67101', avgRating: 4.5, difficulty: 4.8 },
  { id: '2', title: 'אלגברה ליניארית 1', code: '80134', avgRating: 3.8, difficulty: 4.5 },
  { id: '3', title: 'מבני נתונים', code: '67109', avgRating: 4.2, difficulty: 4.2 },
  { id: '4', title: 'אינפי 1', code: '80131', avgRating: 3.2, difficulty: 5.0 },
];

const Home = () => {
  const [courses] = useState(MOCK_COURSES);

  return (
    <div>
      <header className="mb-10 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold text-secondary-800 mb-4">מצאו את הקורס המושלם עבורכם</h1>
        <p className="text-slate-600">ביקורות, סיכומים ושאלות ותשובות מסטודנטים לסטודנטים.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
};

export default Home;
