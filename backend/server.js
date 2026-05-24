process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// PostgreSQL Connection Pool
// We use the connectionString from .env
// We also add explicit host/port/user if possible, but let's try standard first
const pool = new Pool({
  connectionString: process.env.DATABASE_URL.trim().replace(/^"/, '').replace(/"$/, ''),
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('connect', () => {
  console.log('Connected to Supabase PostgreSQL database.');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

app.use(cors());
app.use(express.json());

// Helper to standardize course data
const mapCourse = (row) => {
    if (!row) return null;

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

    // Standardize Attendance
    const rawAttendance = String(row.attendance || row.attendancevalue || row.attendancemandatory || '').trim();
    const isNone = !rawAttendance || 
                   rawAttendance === '0' || 
                   rawAttendance === 'אין' || 
                   rawAttendance.toLowerCase() === 'none';
    
    const attendanceMandatory = !isNone;

    // Standardize Instructors
    let instructors = [];
    if (row.instructors) {
        instructors = typeof row.instructors === 'string' ? JSON.parse(row.instructors) : row.instructors;
    } else if (row.lecturers) {
        instructors = row.lecturers.split(',').map(name => ({ id: 0, name: name.trim() }));
    }
    const instructor = (instructors && instructors.length > 0) ? instructors[0].name : 'לא ידוע';

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
        instructors: instructors || [],
        language: row.language || 'עברית'
    };
};

// --- Routes ---

app.get('/api/combinations', async (req, res) => {
  console.log('GET /api/combinations request received');
  try {
    const query = 'SELECT roadmap_code as value, name as label FROM combinations ORDER BY name ASC';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching combinations:', err);
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/courses', async (req, res) => {
  try {
    const query = 'SELECT * FROM courses';
    const result = await pool.query(query);
    res.json(result.rows.map(mapCourse));
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/combinations/:code/courses', async (req, res) => {
  try {
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
          (SELECT json_agg(json_build_object('id', l.id, 'name', l.name))
           FROM lecturers l 
           JOIN course_lecturers cl ON l.id = cl.lecturer_id 
           WHERE cl.course_id = c.id) as instructors,
          c.attendance as attendanceValue,
          c.requirements as assessmentType
      FROM courses c
      JOIN combination_courses cc ON c.id = cc.course_id
      JOIN combinations comb ON cc.combination_id = comb.id
      WHERE comb.roadmap_code = $1
    `;
    const result = await pool.query(query, [code]);
    res.json(result.rows.map(mapCourse));
  } catch (err) {
    console.error(`Error fetching courses for combination ${req.params.code}:`, err);
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/courses/:id', async (req, res) => {
  try {
    const query = `
      SELECT c.*, 
      (SELECT json_agg(json_build_object('id', l.id, 'name', l.name))
       FROM lecturers l 
       JOIN course_lecturers cl ON l.id = cl.lecturer_id 
       WHERE cl.course_id = c.id) as instructors
      FROM courses c WHERE c.id = $1
    `;
    const result = await pool.query(query, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(mapCourse(result.rows[0]));
  } catch (err) {
    console.error(`Error fetching course ${req.params.id}:`, err);
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/lecturers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM lecturers WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Lecturer not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(`Error fetching lecturer ${req.params.id}:`, err);
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/lecturers/:id/courses', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT c.id, c.course_code as code, c.name as title, c.credits
      FROM courses c
      JOIN course_lecturers cl ON c.id = cl.course_id
      WHERE cl.lecturer_id = $1
    `;
    const result = await pool.query(query, [id]);
    res.json(result.rows.map(mapCourse));
  } catch (err) {
    console.error(`Error fetching courses for lecturer ${id}:`, err);
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/lecturers/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM lecturer_reviews WHERE lecturer_id = $1 ORDER BY id DESC';
    const result = await pool.query(query, [id]);
    res.json(result.rows);
  } catch (err) {
    console.error(`Error fetching reviews for lecturer ${id}:`, err);
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/lecturers/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    const { course_id, author, author_id, rating, comment, date, semester, year } = req.body;
    const query = `
      INSERT INTO lecturer_reviews (lecturer_id, course_id, author, author_id, rating, comment, date, semester, year)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const result = await pool.query(query, [id, course_id, author, author_id, rating, comment, date, semester, year]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating review:', err);
    res.status(500).json({ message: err.message });
  }
});

app.patch('/api/lecturer_reviews/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const { increment } = req.body;
    const delta = increment ? 1 : -1;
    
    const query = 'UPDATE lecturer_reviews SET likes = GREATEST(0, likes + $1) WHERE id = $2 RETURNING *';
    const result = await pool.query(query, [delta, id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(`Error updating likes for review ${id}:`, err);
    res.status(500).json({ message: err.message });
  }
});

app.patch('/api/lecturers/:lecturerId/reviews/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, semester, year, course_id } = req.body;
    
    const query = `
      UPDATE lecturer_reviews 
      SET rating = $1, comment = $2, semester = $3, year = $4, course_id = $5 
      WHERE id = $6 
      RETURNING *
    `;
    const result = await pool.query(query, [rating, comment, semester, year, course_id, id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(`Error updating review ${id}:`, err);
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/lecturers/:lecturerId/reviews/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM lecturer_reviews WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error(`Error deleting review ${req.params.id}:`, err);
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
