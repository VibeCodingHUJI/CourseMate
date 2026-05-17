const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const DB_PATH = path.join(__dirname, 'huji_data.db');

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Helper to standardize course data
const mapCourse = (row) => {
    // Standardize Year
    let year = row.year;
    if (year && (year.includes('1') || year.includes('א'))) year = 'א';
    else if (year && (year.includes('2') || year.includes('ב'))) year = 'ב';
    else if (year && (year.includes('3') || year.includes('ג'))) year = 'ג';
    else year = 'א';

    // Standardize Course Type
    let type = 'בחירה';
    const rawType = row.type || '';
    if (rawType.includes('יסוד')) type = 'קורסי יסוד';
    else if (rawType.includes('חובת בחירה')) type = 'חובת בחירה';
    else if (rawType.includes('חובה')) type = 'חובה';

    // Standardize Semester
    let semester = row.semester || '';
    if (semester.includes('א') && semester.includes('ב')) semester = 'א וב';
    else if (semester.includes('א')) semester = 'א';
    else if (semester.includes('ב')) semester = 'ב';

    // Literal Attendance (Take exactly what's in the table)
    const rawAttendance = String(row.attendance || row.attendanceValue || row.attendanceMandatory || '').trim();
    
    // Determine style: grey for 'אין', '0', 'none', or empty. Blue for everything else.
    const isNone = !rawAttendance || 
                   rawAttendance === '0' || 
                   rawAttendance === 'אין' || 
                   rawAttendance.toLowerCase() === 'none';
    
    const attendanceMandatory = !isNone;

    // Standardize Instructors
    let instructors = [];
    try {
        if (row.instructors) {
            instructors = JSON.parse(row.instructors);
        } else if (row.lecturers) {
            instructors = row.lecturers.split(',').map(name => ({ id: 0, name: name.trim() }));
        }
    } catch (e) {
        console.error('Error parsing instructors', e);
    }
    const instructor = instructors.length > 0 ? instructors[0].name : 'לא ידוע';

    return {
        ...row,
        code: row.code || row.course_code,
        title: row.title || row.name,
        year,
        type,
        semester,
        attendanceMandatory,
        attendanceValue: rawAttendance || 'אין',
        instructor,
        instructors,
        language: row.language || 'עברית'
    };
};

// Routes
app.get('/api/combinations', (req, res) => {
  const query = 'SELECT roadmap_code as value, name as label FROM combinations ORDER BY name ASC';
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ message: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/courses', (req, res) => {
  const query = 'SELECT * FROM courses';
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ message: err.message });
      return;
    }
    res.json(rows.map(mapCourse));
  });
});

app.get('/api/combinations/:code/courses', (req, res) => {
  const { code } = req.params;
  const query = `
    SELECT 
        c.id, 
        c.course_code as code, 
        c.name as title, 
        c.credits, 
        cc.category_type as type, 
        cc.year,
        c.description,
        c.semester,
        c.language,
        c.campus,
        (SELECT '[' || GROUP_CONCAT('{"id":' || l.id || ',"name":"' || REPLACE(l.name, '"', '\"') || '"}') || ']'
         FROM lecturers l 
         JOIN course_lecturers cl ON l.id = cl.lecturer_id 
         WHERE cl.course_id = c.id) as instructors,
        c.attendance as attendanceValue,
        c.requirements as assessmentType
    FROM courses c
    JOIN combination_courses cc ON c.id = cc.course_id
    JOIN combinations comb ON cc.combination_id = comb.id
    WHERE comb.roadmap_code = ?
  `;
  
  db.all(query, [code], (err, rows) => {
    if (err) {
      res.status(500).json({ message: err.message });
      return;
    }
    res.json(rows.map(mapCourse));
  });
});

app.get('/api/courses/:id', (req, res) => {
  const query = `
    SELECT c.*, 
    (SELECT '[' || GROUP_CONCAT('{"id":' || l.id || ',"name":"' || REPLACE(l.name, '"', '\"') || '"}') || ']'
     FROM lecturers l 
     JOIN course_lecturers cl ON l.id = cl.lecturer_id 
     WHERE cl.course_id = c.id) as instructors
    FROM courses c WHERE c.id = ?
  `;
  db.get(query, [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ message: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }
    res.json(mapCourse(row));
  });
});

// Lecturer Routes
app.get('/api/lecturers/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM lecturers WHERE id = ?';
  db.get(query, [id], (err, lecturer) => {
    if (err) {
      res.status(500).json({ message: err.message });
      return;
    }
    if (!lecturer) {
      res.status(404).json({ message: 'Lecturer not found' });
      return;
    }
    res.json(lecturer);
  });
});

app.get('/api/lecturers/:id/courses', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT c.id, c.course_code as code, c.name as title, c.credits
    FROM courses c
    JOIN course_lecturers cl ON c.id = cl.course_id
    WHERE cl.lecturer_id = ?
  `;
  db.all(query, [id], (err, rows) => {
    if (err) {
      res.status(500).json({ message: err.message });
      return;
    }
    res.json(rows.map(mapCourse));
  });
});

app.get('/api/lecturers/:id/reviews', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM lecturer_reviews WHERE lecturer_id = ? ORDER BY id DESC';
  db.all(query, [id], (err, rows) => {
    if (err) {
      res.status(500).json({ message: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/lecturers/:id/reviews', (req, res) => {
  const { id } = req.params;
  const { course_id, author, author_id, rating, comment, date, semester, year } = req.body;
  const query = `
    INSERT INTO lecturer_reviews (lecturer_id, course_id, author, author_id, rating, comment, date, semester, year)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.run(query, [id, course_id, author, author_id, rating, comment, date, semester, year], function(err) {
    if (err) {
      res.status(500).json({ message: err.message });
      return;
    }
    db.get('SELECT * FROM lecturer_reviews WHERE id = ?', [this.lastID], (err, row) => {
      if (err) {
        res.status(500).json({ message: err.message });
        return;
      }
      res.status(201).json(row);
    });
  });
});

app.patch('/api/lecturer_reviews/:id/like', (req, res) => {
  const { id } = req.params;
  const { increment } = req.body; // true to like, false to unlike
  const delta = increment ? 1 : -1;
  
  const query = 'UPDATE lecturer_reviews SET likes = MAX(0, likes + ?) WHERE id = ?';
  db.run(query, [delta, id], function(err) {
    if (err) {
      res.status(500).json({ message: err.message });
      return;
    }
    db.get('SELECT * FROM lecturer_reviews WHERE id = ?', [id], (err, row) => {
      if (err) {
        res.status(500).json({ message: err.message });
        return;
      }
      res.json(row);
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
