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

const mapLecturerReview = (r) => ({
  id: r.lecturer_review_id,
  authorId: r.user_id,
  author: r.full_name || 'סטודנט/ית אנונימי/ת',
  rating: r.rating_general,
  comment: r.review_text,
  date: r.created_at ? new Date(r.created_at).toLocaleDateString('he-IL') : '',
});

const mapReview = (r) => {
  let author = 'אנונימי/ת';
  if (r.visibility === 'full_name' && r.full_name) author = r.full_name;
  else if (r.visibility === 'initials' && r.full_name)
    author = r.full_name.trim().split(/\s+/).map(w => w[0] + '.').join(' ');
  return {
    id: r.id,
    courseId: r.course_id,
    authorId: r.user_id,
    author,
    difficulty: r.difficulty,
    attendanceEnforced: r.attendance_enforced,
    comment: r.comment,
    visibility: r.visibility,
    semester: r.semester,
    year: r.year,
    date: r.created_at ? new Date(r.created_at).toLocaleDateString('he-IL') : '',
    likedBy: r.liked_by || [],
  };
};

app.get('/api/reviews', async (req, res) => {
  try {
    const { courseId } = req.query;

    let reviewQuery = supabase.from('course_reviews').select('*').order('created_at', { ascending: false });
    if (courseId) reviewQuery = reviewQuery.eq('course_id', courseId);

    const { data: reviewData, error: reviewError } = await reviewQuery;
    if (reviewError) {
      console.error('🔴 Supabase error fetching reviews:', reviewError);
      return res.status(500).json({ message: reviewError.message });
    }

    let rows = reviewData || [];

    // Fetch user full_names
    try {
      const userIds = [...new Set(rows.map(r => r.user_id).filter(Boolean))];
      if (userIds.length > 0) {
        const { data: userData } = await supabase.from('users').select('id, full_name').in('id', userIds);
        const userMap = {};
        (userData || []).forEach(u => { userMap[u.id] = u.full_name; });
        rows = rows.map(r => ({ ...r, full_name: userMap[r.user_id] || null }));
      }
    } catch (userErr) {
      console.error('⚠️ Could not fetch user names:', userErr.message);
    }

    // Fetch votes
    try {
      const ids = rows.map(r => r.id);
      if (ids.length > 0) {
        const { data: voteData } = await supabase
          .from('course_review_votes')
          .select('review_id, user_id')
          .in('review_id', ids)
          .eq('vote_type', 1);
        const voteMap = {};
        (voteData || []).forEach(v => {
          if (!voteMap[v.review_id]) voteMap[v.review_id] = [];
          voteMap[v.review_id].push(String(v.user_id));
        });
        rows = rows.map(r => ({ ...r, liked_by: voteMap[r.id] || [] }));
      }
    } catch (_) {
      rows = rows.map(r => ({ ...r, liked_by: [] }));
    }

    res.json(rows.map(mapReview));
  } catch (err) {
    console.error('🔴 Unexpected error fetching reviews:', err.stack || err.message);
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const { courseId, authorId, difficulty, attendanceEnforced, comment, semester, year, visibility } = req.body;

    // Check for existing review by this user for this course
    const { data: existing } = await supabase
      .from('course_reviews')
      .select('id')
      .eq('user_id', authorId)
      .eq('course_id', courseId)
      .maybeSingle();

    let saved;
    if (existing) {
      const { data, error } = await supabase
        .from('course_reviews')
        .update({ comment: comment || null, visibility: visibility || 'full_name', semester, year })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      saved = data;
    } else {
      const { data, error } = await supabase
        .from('course_reviews')
        .insert({ user_id: authorId, course_id: courseId, difficulty, attendance_enforced: attendanceEnforced ?? null, comment: comment || null, visibility: visibility || 'full_name', semester, year })
        .select()
        .single();
      if (error) throw new Error(error.message);
      saved = data;
    }

    const { data: userData } = await supabase.from('users').select('full_name').eq('id', authorId).maybeSingle();
    res.status(201).json(mapReview({ ...saved, full_name: userData?.full_name || null }));
  } catch (err) {
    console.error('Error creating review:', err);
    res.status(500).json({ message: err.message });
  }
});

app.patch('/api/reviews/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, difficulty, attendanceEnforced } = req.body;
    const updates = {};
    if (comment !== undefined) updates.comment = comment;
    if (difficulty !== undefined) updates.difficulty = difficulty;
    if (attendanceEnforced !== undefined) updates.attendance_enforced = attendanceEnforced;

    if (Object.keys(updates).length === 0) return res.status(400).json({ message: 'No updates provided' });

    const { data, error } = await supabase
      .from('course_reviews')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    if (!data) return res.status(404).json({ message: 'Review not found' });

    const { data: userData } = await supabase.from('users').select('full_name').eq('id', data.user_id).maybeSingle();
    res.json(mapReview({ ...data, full_name: userData?.full_name || null }));
  } catch (err) {
    console.error('Error updating review:', err);
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/reviews/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error, count } = await supabase.from('course_reviews').delete({ count: 'exact' }).eq('id', id);
    if (error) throw new Error(error.message);
    if (count === 0) return res.status(404).json({ message: 'Review not found' });
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/reviews/:id/vote', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId required' });

    const { data: existing } = await supabase
      .from('course_review_votes')
      .select('review_id')
      .eq('review_id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      await supabase.from('course_review_votes').delete().eq('review_id', id).eq('user_id', userId);
      res.json({ liked: false });
    } else {
      await supabase.from('course_review_votes').insert({ review_id: id, user_id: userId, vote_type: 1 });
      res.json({ liked: true });
    }
  } catch (err) {
    console.error('Error toggling vote:', err);
    res.status(500).json({ message: err.message });
  }
});

// --- Questions Routes ---

const mapQuestion = (q, answers = []) => ({
  id: q.question_id,
  courseId: q.course_id,
  authorId: q.user_id,
  author: q.full_name || 'סטודנט/ית אנונימי/ת',
  title: q.title,
  content: q.content,
  date: q.created_at ? new Date(q.created_at).toLocaleDateString('he-IL') : '',
  answers,
});

const mapAnswer = (a) => ({
  id: a.answer_id,
  questionId: a.question_id,
  authorId: a.user_id,
  author: a.full_name || 'סטודנט/ית אנונימי/ת',
  content: a.content,
  date: a.created_at ? new Date(a.created_at).toLocaleDateString('he-IL') : '',
});

app.get('/api/questions', async (req, res) => {
  try {
    const { courseId } = req.query;
    let qQuery = supabase.from('forum_questions').select('*').order('created_at', { ascending: false });
    if (courseId) qQuery = qQuery.eq('course_id', courseId);
    const { data, error } = await qQuery;
    if (error) throw new Error(error.message);
    let rows = data || [];

    // Collect all user IDs (questions)
    const qUserIds = [...new Set(rows.map(r => r.user_id).filter(Boolean))];
    const qIds = rows.map(r => r.question_id);

    // Fetch user names and answers in parallel
    const [userRes, answersRes] = await Promise.allSettled([
      qUserIds.length > 0
        ? supabase.from('users').select('id, full_name').in('id', qUserIds)
        : Promise.resolve({ data: [] }),
      qIds.length > 0
        ? supabase.from('forum_answers').select('*').in('question_id', qIds).order('created_at', { ascending: true })
        : Promise.resolve({ data: [] }),
    ]);

    // Build question author map
    const qUserMap = {};
    if (userRes.status === 'fulfilled') {
      (userRes.value.data || []).forEach(u => { qUserMap[u.id] = u.full_name; });
    }

    // Build answers + fetch answer author names
    let answersMap = {}; // question_id → mapped answers[]
    if (answersRes.status === 'fulfilled') {
      const rawAnswers = answersRes.value.data || [];
      const aUserIds = [...new Set(rawAnswers.map(a => a.user_id).filter(Boolean))];
      let aUserMap = {};
      if (aUserIds.length > 0) {
        try {
          const { data: aUsers } = await supabase.from('users').select('id, full_name').in('id', aUserIds);
          (aUsers || []).forEach(u => { aUserMap[u.id] = u.full_name; });
        } catch {}
      }
      rawAnswers.forEach(a => {
        const mapped = mapAnswer({ ...a, full_name: aUserMap[a.user_id] || null });
        if (!answersMap[a.question_id]) answersMap[a.question_id] = [];
        answersMap[a.question_id].push(mapped);
      });
    }

    res.json(rows.map(r => mapQuestion(
      { ...r, full_name: qUserMap[r.user_id] || null },
      answersMap[r.question_id] || []
    )));
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/questions/:id/answers', async (req, res) => {
  try {
    const { id } = req.params; // question_id
    const { userId, content } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId required' });
    if (!content || content.trim().length < 2) return res.status(400).json({ message: 'התשובה חייבת להכיל לפחות 2 תווים' });
    const { data, error } = await supabase
      .from('forum_answers')
      .insert({ question_id: id, user_id: userId, content })
      .select()
      .single();
    if (error) throw new Error(error.message);
    const { data: userData } = await supabase.from('users').select('full_name').eq('id', userId).maybeSingle();
    res.status(201).json(mapAnswer({ ...data, full_name: userData?.full_name || null }));
  } catch (err) {
    console.error('Error creating answer:', err);
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/answers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('forum_answers').delete().eq('answer_id', id);
    if (error) throw new Error(error.message);
    res.json({ message: 'Answer deleted successfully' });
  } catch (err) {
    console.error('Error deleting answer:', err);
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/questions', async (req, res) => {
  try {
    const { courseId, userId, title, content } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId required' });
    if (!title || title.trim().length < 5) return res.status(400).json({ message: 'הכותרת חייבת להכיל לפחות 5 תווים' });
    if (!content || content.trim().length < 10) return res.status(400).json({ message: 'תוכן השאלה חייב להכיל לפחות 10 תווים' });
    const { data, error } = await supabase
      .from('forum_questions')
      .insert({ course_id: courseId || null, user_id: userId, title, content })
      .select()
      .single();
    if (error) throw new Error(error.message);
    const { data: userData } = await supabase.from('users').select('full_name').eq('id', userId).maybeSingle();
    res.status(201).json(mapQuestion({ ...data, full_name: userData?.full_name || null }, []));
  } catch (err) {
    console.error('Error creating question:', err);
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/questions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('forum_questions').delete().eq('question_id', id);
    if (error) throw new Error(error.message);
    res.json({ message: 'Question deleted successfully' });
  } catch (err) {
    console.error('Error deleting question:', err);
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
    const { data, error } = await supabase
      .from('lecturer_reviews')
      .select('*')
      .eq('lecturer_id', id)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    let rows = data || [];
    try {
      const userIds = [...new Set(rows.map(r => r.user_id).filter(Boolean))];
      if (userIds.length > 0) {
        const { data: userData } = await supabase.from('users').select('id, full_name').in('id', userIds);
        const userMap = {};
        (userData || []).forEach(u => { userMap[u.id] = u.full_name; });
        rows = rows.map(r => ({ ...r, full_name: userMap[r.user_id] || null }));
      }
    } catch {}
    res.json(rows.map(mapLecturerReview));
  } catch (err) {
    console.error(`Error fetching reviews for lecturer ${req.params.id}:`, err);
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/lecturers/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, rating, comment } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId required' });
    if (!comment || comment.trim().length < 10) return res.status(400).json({ message: 'הביקורת חייבת להכיל לפחות 10 תווים' });

    const { data, error } = await supabase
      .from('lecturer_reviews')
      .insert({ lecturer_id: parseInt(id), user_id: userId, rating_general: rating, review_text: comment })
      .select()
      .single();
    if (error) throw new Error(error.message);

    const { data: userData } = await supabase.from('users').select('full_name').eq('id', userId).maybeSingle();
    res.status(201).json(mapLecturerReview({ ...data, full_name: userData?.full_name || null }));
  } catch (err) {
    console.error('Error creating lecturer review:', err);
    res.status(500).json({ message: err.message });
  }
});

app.patch('/api/lecturers/:lecturerId/reviews/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const updates = {};
    if (rating !== undefined) updates.rating_general = rating;
    if (comment !== undefined) updates.review_text = comment;
    if (Object.keys(updates).length === 0) return res.status(400).json({ message: 'No updates provided' });

    const { data, error } = await supabase
      .from('lecturer_reviews')
      .update(updates)
      .eq('lecturer_review_id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    if (!data) return res.status(404).json({ message: 'Review not found' });

    const { data: userData } = await supabase.from('users').select('full_name').eq('id', data.user_id).maybeSingle();
    res.json(mapLecturerReview({ ...data, full_name: userData?.full_name || null }));
  } catch (err) {
    console.error(`Error updating lecturer review ${req.params.id}:`, err);
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/lecturers/:lecturerId/reviews/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('lecturer_reviews').delete().eq('lecturer_review_id', id);
    if (error) throw new Error(error.message);
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error(`Error deleting review ${req.params.id}:`, err);
    res.status(500).json({ message: err.message });
  }
});

// --- Saved Courses (Follows) Routes ---

app.get('/api/follows/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from('saved_courses')
      .select('course_id')
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
    res.json((data || []).map(r => r.course_id));
  } catch (err) {
    console.error('Error fetching follows:', err);
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/follows', async (req, res) => {
  try {
    const { userId, courseId } = req.body;
    if (!userId || !courseId) return res.status(400).json({ message: 'userId and courseId required' });
    const { error } = await supabase
      .from('saved_courses')
      .insert({ user_id: userId, course_id: courseId });
    // Ignore duplicate-key errors (user already follows this course)
    if (error && !error.message.toLowerCase().includes('duplicate') && !error.code === '23505') {
      throw new Error(error.message);
    }
    res.json({ followed: true });
  } catch (err) {
    console.error('Error following course:', err);
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/follows', async (req, res) => {
  try {
    const { userId, courseId } = req.body;
    if (!userId || !courseId) return res.status(400).json({ message: 'userId and courseId required' });
    const { error } = await supabase
      .from('saved_courses')
      .delete()
      .eq('user_id', userId)
      .eq('course_id', courseId);
    if (error) throw new Error(error.message);
    res.json({ followed: false });
  } catch (err) {
    console.error('Error unfollowing course:', err);
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

    let userId;

    if (authError) {
      if (!authError.message.toLowerCase().includes('already registered')) {
        return res.status(400).json({ message: authError.message });
      }
      // Email exists in auth.users — check if public.users profile is complete
      const profileCheck = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND full_name IS NOT NULL', [email]
      );
      if (profileCheck.rows.length > 0) {
        return res.status(409).json({ message: 'משתמש עם אימייל זה כבר קיים במערכת' });
      }
      // Zombie user — get their auth ID and re-use it
      const authUserRow = await pool.query('SELECT id FROM auth.users WHERE email = $1', [email]);
      if (authUserRow.rows.length === 0) {
        return res.status(400).json({ message: authError.message });
      }
      userId = authUserRow.rows[0].id;
      // Update their password to the one they just chose
      await supabase.auth.admin.updateUserById(userId, { password });
    } else {
      if (!authData.user) {
        return res.status(400).json({ message: 'לא ניתן ליצור משתמש, נסה שנית' });
      }
      userId = authData.user.id;
    }

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
