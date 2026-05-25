process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const express = require('express');
const { Pool, Client } = require('pg');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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

// --- Reviews Routes ---

app.get('/api/reviews', async (req, res) => {
  try {
    const { courseId } = req.query;
    let query = 'SELECT * FROM course_reviews';
    let params = [];
    if (courseId) {
      query += ' WHERE course_id = $1';
      params.push(courseId);
    }
    query += ' ORDER BY id DESC';
    const result = await pool.query(query, params);
    res.json(result.rows.map(r => ({
      ...r,
      courseId: r.course_id,
      authorId: r.author_id,
      identityType: r.identity_type,
      attendanceEnforced: r.attendance_enforced,
      likedBy: r.liked_by || []
    })));
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const { courseId, rating, difficulty, comment, date, author, authorId, semester, year, attendanceEnforced, identityType } = req.body;
    const query = `
      INSERT INTO course_reviews (course_id, rating, difficulty, comment, date, author, author_id, semester, year, attendance_enforced, identity_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    const params = [courseId, rating, difficulty, comment, date, author, authorId, semester, year, attendanceEnforced, identityType];
    const result = await pool.query(query, params);
    const saved = result.rows[0];
    res.status(201).json({
      ...saved,
      courseId: saved.course_id,
      authorId: saved.author_id,
      identityType: saved.identity_type,
      attendanceEnforced: saved.attendance_enforced,
      likedBy: saved.liked_by || []
    });
  } catch (err) {
    console.error('Error creating review:', err);
    res.status(500).json({ message: err.message });
  }
});

app.patch('/api/reviews/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, difficulty, rating, likedBy } = req.body;
    
    let updates = [];
    let params = [];
    let index = 1;

    if (comment !== undefined) { updates.push(`comment = $${index++}`); params.push(comment); }
    if (difficulty !== undefined) { updates.push(`difficulty = $${index++}`); params.push(difficulty); }
    if (rating !== undefined) { updates.push(`rating = $${index++}`); params.push(rating); }
    if (likedBy !== undefined) { updates.push(`liked_by = $${index++}`); params.push(likedBy); }

    if (updates.length === 0) return res.status(400).json({ message: 'No updates provided' });

    params.push(id);
    const query = `UPDATE course_reviews SET ${updates.join(', ')} WHERE id = $${index} RETURNING *`;
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) return res.status(404).json({ message: 'Review not found' });
    
    const saved = result.rows[0];
    res.json({
      ...saved,
      courseId: saved.course_id,
      authorId: saved.author_id,
      identityType: saved.identity_type,
      attendanceEnforced: saved.attendance_enforced,
      likedBy: saved.liked_by || []
    });
  } catch (err) {
    console.error('Error updating review:', err);
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/reviews/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM course_reviews WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Review not found' });
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).json({ message: err.message });
  }
});

// --- Questions Routes ---

app.get('/api/questions', async (req, res) => {
  try {
    const { courseId } = req.query;
    let query = 'SELECT * FROM course_questions';
    let params = [];
    if (courseId) {
      query += ' WHERE course_id = $1';
      params.push(courseId);
    }
    query += ' ORDER BY id DESC';
    const result = await pool.query(query, params);
    res.json(result.rows.map(q => ({
      ...q,
      courseId: q.course_id
    })));
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/questions', async (req, res) => {
  try {
    const { courseId, question, answers, date } = req.body;
    const query = `
      INSERT INTO course_questions (course_id, question, answers, date)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [courseId, question, JSON.stringify(answers || []), date]);
    const saved = result.rows[0];
    res.status(201).json({ ...saved, courseId: saved.course_id });
  } catch (err) {
    console.error('Error creating question:', err);
    res.status(500).json({ message: err.message });
  }
});

app.patch('/api/questions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;
    const result = await pool.query(
      'UPDATE course_questions SET answers = $1 WHERE id = $2 RETURNING *',
      [JSON.stringify(answers), id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Question not found' });
    const saved = result.rows[0];
    res.json({ ...saved, courseId: saved.course_id });
  } catch (err) {
    console.error('Error updating question:', err);
    res.status(500).json({ message: err.message });
  }
});

// --- Materials Routes ---

app.get('/api/materials', async (req, res) => {
  try {
    const { courseId } = req.query;
    let query = 'SELECT * FROM course_materials';
    let params = [];
    if (courseId) {
      query += ' WHERE course_id = $1';
      params.push(courseId);
    }
    const result = await pool.query(query, params);
    res.json(result.rows.map(m => ({
      ...m,
      courseId: m.course_id,
      isLink: m.is_link,
      likedBy: m.liked_by || []
    })));
  } catch (err) {
    console.error('Error fetching materials:', err);
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/materials', async (req, res) => {
  try {
    const { courseId, title, category, type, author, date, url, isLink } = req.body;
    const query = `
      INSERT INTO course_materials (course_id, title, category, type, author, date, url, is_link)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const result = await pool.query(query, [courseId, title, category, type, author, date, url, isLink || false]);
    const saved = result.rows[0];
    res.status(201).json({ ...saved, courseId: saved.course_id, isLink: saved.is_link, likedBy: saved.liked_by || [] });
  } catch (err) {
    console.error('Error creating material:', err);
    res.status(500).json({ message: err.message });
  }
});

app.patch('/api/materials/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, url, likedBy } = req.body;
    let updates = [];
    let params = [];
    let index = 1;
    if (title !== undefined) { updates.push(`title = $${index++}`); params.push(title); }
    if (url !== undefined) { updates.push(`url = $${index++}`); params.push(url); }
    if (likedBy !== undefined) { updates.push(`liked_by = $${index++}`); params.push(likedBy); }
    
    if (updates.length === 0) return res.status(400).json({ message: 'No updates provided' });
    params.push(id);
    const query = `UPDATE course_materials SET ${updates.join(', ')} WHERE id = $${index} RETURNING *`;
    const result = await pool.query(query, params);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Material not found' });
    const saved = result.rows[0];
    res.json({ ...saved, courseId: saved.course_id, isLink: saved.is_link, likedBy: saved.liked_by || [] });
  } catch (err) {
    console.error('Error updating material:', err);
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/materials/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM course_materials WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Material not found' });
    res.json({ message: 'Material deleted successfully' });
  } catch (err) {
    console.error('Error deleting material:', err);
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

// --- Auth Routes ---

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, track } = req.body;

    const combResult = await pool.query('SELECT id FROM combinations WHERE roadmap_code = $1', [track]);
    if (combResult.rows.length === 0) {
      return res.status(400).json({ message: 'מסלול הלימוד לא נמצא' });
    }
    const combinationId = combResult.rows[0].id;

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    if (authError) {
      const message = authError.message.toLowerCase().includes('already registered')
        ? 'משתמש עם אימייל זה כבר קיים במערכת'
        : authError.message;
      return res.status(400).json({ message });
    }

    if (!authData.user) {
      return res.status(400).json({ message: 'משתמש עם אימייל זה כבר קיים במערכת' });
    }

    const userId = authData.user.id;

    const { error: updateError } = await supabase
      .from('users')
      .update({ full_name: name, combination_id: combinationId })
      .eq('id', userId);

    if (updateError) return res.status(500).json({ message: updateError.message });

    res.status(201).json({ id: userId, name, email, track, isGuest: false });
  } catch (err) {
    console.error('Error signing up:', err);
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      return res.status(401).json({ message: 'אימייל או סיסמה שגויים' });
    }

    const userId = authData.user.id;

    const result = await pool.query(
      `SELECT u.id, u.full_name, u.email, c.roadmap_code as track
       FROM users u
       JOIN combinations c ON u.combination_id = c.id
       WHERE u.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'משתמש לא נמצא' });
    }

    const user = result.rows[0];
    res.json({ id: user.id, name: user.full_name, email: user.email, track: user.track, isGuest: false });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
