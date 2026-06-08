process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// טעינת משתני סביבה רק בסביבת פיתוח מקומית
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const app = express();
const PORT = process.env.PORT || 5000;

// PostgreSQL Connection Pool - עם הגנה למקרה שהמשתנה חסר או כולל מרכאות
const dbUrl = process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/^['"]|['"]$/g, '') : '';

const pool = new Pool({
  connectionString: dbUrl,
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

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
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

const mapLecturerReview = (r) => {
  let author = 'סטודנט/ית אנונימי/ת';
  if (r.visibility === 'initials' && r.full_name)
    author = r.full_name.trim().split(/\s+/).map(w => w[0] + '.').join(' ');
  else if (r.full_name)
    author = r.full_name;
  return {
    id: r.lecturer_review_id,
    authorId: r.user_id,
    author,
    visibility: r.visibility || 'full_name',
    rating: r.rating_general,
    comment: r.review_text,
    date: r.created_at ? new Date(r.created_at).toLocaleDateString('he-IL') : '',
  };
};

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
    const { courseId, userId, difficulty, attendanceEnforced, comment, semester, year, visibility } = req.body;

    // Check for existing review by this user for this course (skip for guests)
    let existing = null;
    if (userId) {
      const { data } = await supabase
        .from('course_reviews')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .maybeSingle();
      existing = data;
    }

    let saved;
    if (existing) {
      const updateFields = { comment: comment || null, visibility: visibility || 'full_name', semester, year };
      if (difficulty !== undefined && difficulty !== null) updateFields.difficulty = difficulty;
      if (attendanceEnforced !== undefined) updateFields.attendance_enforced = attendanceEnforced ?? null;
      const { data, error } = await supabase
        .from('course_reviews')
        .update(updateFields)
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      saved = data;
    } else {
      const { data, error } = await supabase
        .from('course_reviews')
        .insert({ user_id: userId || null, course_id: courseId, difficulty, attendance_enforced: attendanceEnforced ?? null, comment: comment || null, visibility: visibility || 'full_name', semester, year })
        .select()
        .single();
      if (error) {
        // If insert failed due to duplicate (e.g. delete didn't propagate), fall back to update
        if (userId && (error.code === '23505' || error.message.includes('duplicate') || error.message.includes('unique'))) {
          const { data: existingRow } = await supabase.from('course_reviews').select('id').eq('user_id', userId).eq('course_id', courseId).maybeSingle();
          if (existingRow) {
            const updateFields = { comment: comment || null, visibility: visibility || 'full_name', semester, year };
            if (difficulty !== undefined && difficulty !== null) updateFields.difficulty = difficulty;
            if (attendanceEnforced !== undefined) updateFields.attendance_enforced = attendanceEnforced ?? null;
            const { data: updated, error: updateError } = await supabase.from('course_reviews').update(updateFields).eq('id', existingRow.id).select().single();
            if (updateError) throw new Error(updateError.message);
            saved = updated;
          } else {
            throw new Error(error.message);
          }
        } else {
          throw new Error(error.message);
        }
      } else {
        saved = data;
      }
    }

    let fullName = null;
    if (userId) {
      const { data: userData } = await supabase.from('users').select('full_name').eq('id', userId).maybeSingle();
      if (userData) fullName = userData.full_name;
    }

    // Notify followers only on new reviews (not edits)
    if (!existing) {
      try {
        const courseResult = await pool.query('SELECT name FROM courses WHERE id = $1', [courseId]);
        const courseName = courseResult.rows[0]?.name || 'קורס';

        const { data: followers } = await supabase
          .from('saved_courses')
          .select('user_id')
          .eq('course_id', courseId)
          .neq('user_id', userId || '');

        if (followers && followers.length > 0) {
          await supabase.from('notifications').insert(
            followers.map(f => ({
              user_id: f.user_id,
              text: `ביקורת חדשה נוספה לקורס "${courseName}" שאתה עוקב אחריו`
            }))
          );
        }
      } catch (notifErr) {
        console.error('Error sending review notifications:', notifErr);
      }
    }

    res.status(201).json(mapReview({ ...saved, full_name: fullName }));
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
    if (!userId) return res.json({ liked: false });

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

// --- Questions Routes (forum_questions + forum_answers) ---

const mapQuestion = (q, answers = []) => ({
  id: q.question_id,
  courseId: q.course_id,
  authorId: q.user_id,
  author: q.full_name || 'אורח/ת',
  title: q.title,
  content: q.content,
  date: q.created_at ? new Date(q.created_at).toLocaleDateString('he-IL') : '',
  answers,
});

const mapAnswer = (a) => ({
  id: a.answer_id,
  questionId: a.question_id,
  authorId: a.user_id,
  author: a.full_name || 'אורח/ת',
  content: a.content,
  date: a.created_at ? new Date(a.created_at).toLocaleDateString('he-IL') : '',
});

app.get('/api/questions', async (req, res) => {
  try {
    const { courseId } = req.query;
    let qQuery = supabase.from('forum_questions').select('*').order('question_id', { ascending: false });
    if (courseId) qQuery = qQuery.eq('course_id', courseId);
    const { data, error } = await qQuery;
    if (error) throw new Error(error.message);
    const rows = data || [];

    const qIds = rows.map(r => r.question_id);
    const qUserIds = [...new Set(rows.map(r => r.user_id).filter(Boolean))];

    const [userRes, answersRes] = await Promise.allSettled([
      qUserIds.length > 0
        ? supabase.from('users').select('id, full_name').in('id', qUserIds)
        : Promise.resolve({ data: [] }),
      qIds.length > 0
        ? supabase.from('forum_answers').select('*').in('question_id', qIds).order('created_at', { ascending: true })
        : Promise.resolve({ data: [] }),
    ]);

    const qUserMap = {};
    if (userRes.status === 'fulfilled') {
      (userRes.value.data || []).forEach(u => { qUserMap[u.id] = u.full_name; });
    }

    let answersMap = {};
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

app.post('/api/questions', async (req, res) => {
  try {
    const { courseId, userId, title, content } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ message: 'יש להזין כותרת לשאלה' });
    if (!content || !content.trim()) return res.status(400).json({ message: 'יש להזין תוכן לשאלה' });

    const { data, error } = await supabase
      .from('forum_questions')
      .insert({ course_id: courseId || null, user_id: userId || null, title, content })
      .select()
      .single();
    if (error) throw new Error(error.message);

    let fullName = null;
    if (userId) {
      const { data: userData } = await supabase.from('users').select('full_name').eq('id', userId).maybeSingle();
      if (userData) fullName = userData.full_name;
    }

    res.status(201).json(mapQuestion({ ...data, full_name: fullName }, []));
  } catch (err) {
    console.error('Error creating question:', err);
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/questions/:id/answers', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, content } = req.body;
    if (!content || content.trim().length < 2) return res.status(400).json({ message: 'התשובה חייבת להכיל לפחות 2 תווים' });

    const { data, error } = await supabase
      .from('forum_answers')
      .insert({ question_id: id, user_id: userId || null, content })
      .select()
      .single();
    if (error) throw new Error(error.message);

    let fullName = null;
    if (userId) {
      const { data: userData } = await supabase.from('users').select('full_name').eq('id', userId).maybeSingle();
      if (userData) fullName = userData.full_name;
    }

    res.status(201).json(mapAnswer({ ...data, full_name: fullName }));
  } catch (err) {
    console.error('Error creating answer:', err);
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/questions/:questionId/answers/:answerId', async (req, res) => {
  try {
    const { answerId } = req.params;
    const { error } = await supabase.from('forum_answers').delete().eq('answer_id', answerId);
    if (error) throw new Error(error.message);
    res.json({ message: 'Answer deleted' });
  } catch (err) {
    console.error('Error deleting answer:', err);
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

// --- Combination Forum Questions Routes (forum_questions + forum_answers) ---

app.get('/api/combinationQuestions', async (req, res) => {
  try {
    const { combinationId } = req.query;
    if (!combinationId) return res.status(400).json({ message: 'combinationId is required' });

    const { data: questions, error: qErr } = await supabase
      .from('forum_questions')
      .select('*')
      .eq('course_id', combinationId)
      .order('question_id', { ascending: false });
    if (qErr) throw qErr;
    if (!questions || questions.length === 0) return res.json([]);

    const questionIds = questions.map(q => q.question_id);
    const { data: answers } = await supabase
      .from('forum_answers')
      .select('*')
      .in('question_id', questionIds);

    const userIds = [...new Set([
      ...questions.map(q => q.user_id).filter(Boolean),
      ...(answers || []).map(a => a.user_id).filter(Boolean),
    ])];
    let userMap = {};
    if (userIds.length > 0) {
      const { data: users } = await supabase.from('users').select('id, full_name').in('id', userIds);
      (users || []).forEach(u => { userMap[u.id] = u.full_name; });
    }

    const answersMap = {};
    (answers || []).forEach(a => {
      if (!answersMap[a.question_id]) answersMap[a.question_id] = [];
      answersMap[a.question_id].push({
        id: a.answer_id,
        text: a.content,
        author: userMap[a.user_id] || 'אורח/ת',
        authorId: a.user_id,
        date: a.created_at ? new Date(a.created_at).toLocaleDateString('he-IL') : '',
        likedBy: [],
      });
    });

    res.json(questions.map(q => ({
      id: q.question_id,
      combinationId: q.course_id,
      question: q.title,
      author: userMap[q.user_id] || 'אורח/ת',
      authorId: q.user_id,
      date: q.created_at ? new Date(q.created_at).toLocaleDateString('he-IL') : '',
      answers: answersMap[q.question_id] || [],
    })));
  } catch (err) {
    console.error('Error fetching combination questions:', err);
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/combinationQuestions', async (req, res) => {
  try {
    const { combinationId, question, author, userId } = req.body;
    if (!combinationId || !question) return res.status(400).json({ message: 'combinationId and question are required' });

    const { data, error } = await supabase
      .from('forum_questions')
      .insert({ course_id: combinationId, user_id: userId || null, title: question, content: '' })
      .select()
      .single();
    if (error) throw error;

    res.status(201).json({
      id: data.question_id,
      combinationId: data.course_id,
      question: data.title,
      author: author || 'אורח/ת',
      authorId: data.user_id,
      date: data.created_at ? new Date(data.created_at).toLocaleDateString('he-IL') : new Date().toLocaleDateString('he-IL'),
      answers: [],
    });
  } catch (err) {
    console.error('Error creating combination question:', err);
    res.status(500).json({ message: err.message });
  }
});

app.patch('/api/combinationQuestions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;

    await supabase.from('forum_answers').delete().eq('question_id', id);

    if (answers && answers.length > 0) {
      await supabase.from('forum_answers').insert(
        answers.map(a => ({ question_id: id, user_id: a.authorId || null, content: a.text || a.content || '' }))
      );
    }

    const { data: q, error: qErr } = await supabase.from('forum_questions').select('*').eq('question_id', id).single();
    if (qErr) throw qErr;

    const { data: updatedAnswers } = await supabase
      .from('forum_answers').select('*').eq('question_id', id).order('created_at', { ascending: true });

    const userIds = [...new Set([q.user_id, ...(updatedAnswers || []).map(a => a.user_id)].filter(Boolean))];
    let userMap = {};
    if (userIds.length > 0) {
      const { data: users } = await supabase.from('users').select('id, full_name').in('id', userIds);
      (users || []).forEach(u => { userMap[u.id] = u.full_name; });
    }

    res.json({
      id: q.question_id,
      combinationId: q.course_id,
      question: q.title,
      author: userMap[q.user_id] || 'אורח/ת',
      authorId: q.user_id,
      date: q.created_at ? new Date(q.created_at).toLocaleDateString('he-IL') : '',
      answers: (updatedAnswers || []).map((a, idx) => ({
        id: a.answer_id,
        text: a.content,
        author: answers?.[idx]?.author || userMap[a.user_id] || 'אורח/ת',
        authorId: a.user_id,
        date: a.created_at ? new Date(a.created_at).toLocaleDateString('he-IL') : (answers?.[idx]?.date || ''),
        likedBy: answers?.[idx]?.likedBy || [],
      })),
    });
  } catch (err) {
    console.error('Error updating combination question:', err);
    res.status(500).json({ message: err.message });
  }
});

// --- Materials Routes ---

const mapMaterial = (m) => ({
  id: m.material_id,
  courseId: m.course_id,
  userId: m.user_id,
  title: m.title,
  materialType: m.material_type,
  isLink: m.material_type === 'link',
  url: m.url,
  fileExtension: m.file_extension,
  type: m.file_extension ? m.file_extension.toUpperCase() : (m.material_type === 'link' ? 'LINK' : 'FILE'),
  fileSizeBytes: m.file_size_bytes,
  date: m.created_at ? new Date(m.created_at).toLocaleDateString('he-IL') : '',
  category: m.category || (m.material_type === 'link' ? 'links' : 'misc'),
  likedBy: []
});

app.get('/api/materials', async (req, res) => {
  try {
    const { courseId } = req.query;
    let query = 'SELECT * FROM course_materials';
    let params = [];
    if (courseId) { query += ' WHERE course_id = $1'; params.push(courseId); }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows.map(mapMaterial));
  } catch (err) {
    console.error('Error fetching materials:', err);
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/materials', async (req, res) => {
  try {
    const { courseId, userId, title, materialType, url, fileExtension, fileSizeBytes, category } = req.body;
    console.log('POST /api/materials - received category:', category);
    const query = `
      INSERT INTO course_materials (course_id, user_id, title, material_type, url, file_extension, file_size_bytes, category)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const result = await pool.query(query, [courseId, userId, title, materialType, url, fileExtension || null, fileSizeBytes || null, category || 'misc']);
    res.status(201).json(mapMaterial(result.rows[0]));
  } catch (err) {
    console.error('Error creating material:', err);
    res.status(500).json({ message: err.message });
  }
});

app.patch('/api/materials/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, url } = req.body;
    let updates = [];
    let params = [];
    let index = 1;
    if (title !== undefined) { updates.push(`title = $${index++}`); params.push(title); }
    if (url !== undefined) { updates.push(`url = $${index++}`); params.push(url); }
    if (updates.length === 0) return res.status(400).json({ message: 'No updates provided' });
    params.push(id);
    const result = await pool.query(`UPDATE course_materials SET ${updates.join(', ')} WHERE material_id = $${index} RETURNING *`, params);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Material not found' });
    res.json(mapMaterial(result.rows[0]));
  } catch (err) {
    console.error('Error updating material:', err);
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/materials/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const check = await pool.query('SELECT material_type, url FROM course_materials WHERE material_id = $1', [id]);
    if (check.rows.length === 0) return res.status(404).json({ message: 'Material not found' });
    const { material_type, url } = check.rows[0];
    if (material_type === 'file') {
      const path = url.split('/course-files/')[1];
      if (path) await supabase.storage.from('course-files').remove([decodeURIComponent(path)]);
    }
    await pool.query('DELETE FROM course_materials WHERE material_id = $1', [id]);
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
    const { userId, rating, comment, visibility = 'full_name' } = req.body;
    if (!comment || comment.trim().length < 10) return res.status(400).json({ message: 'הביקורת חייבת להכיל לפחות 10 תווים' });

    const { data, error } = await supabase
      .from('lecturer_reviews')
      .insert({ lecturer_id: parseInt(id), user_id: userId || null, rating_general: rating, review_text: comment, visibility })
      .select()
      .single();
    if (error) throw new Error(error.message);

    let fullName = null;
    if (userId) {
      const { data: userData } = await supabase.from('users').select('full_name').eq('id', userId).maybeSingle();
      if (userData) fullName = userData.full_name;
    }
    res.status(201).json(mapLecturerReview({ ...data, full_name: fullName }));
  } catch (err) {
    console.error('Error creating lecturer review:', err);
    res.status(500).json({ message: err.message });
  }
});

app.patch('/api/lecturers/:lecturerId/reviews/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, visibility } = req.body;
    const updates = {};
    if (rating !== undefined) updates.rating_general = rating;
    if (comment !== undefined) updates.review_text = comment;
    if (visibility !== undefined) updates.visibility = visibility;
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
    if (!userId || !courseId) return res.json({ followed: false });
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
    if (!userId || !courseId) return res.json({ followed: false });
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

app.post('/api/auth/google-complete', async (req, res) => {
  try {
    const { access_token } = req.body;
    if (!access_token) return res.status(400).json({ message: 'access_token נדרש' });

    const { data: { user }, error } = await supabase.auth.getUser(access_token);
    if (error || !user) return res.status(401).json({ message: 'Token לא תקין' });

    if (!user.email || !user.email.endsWith('@mail.huji.ac.il')) {
      await supabase.auth.admin.deleteUser(user.id);
      return res.status(403).json({ message: 'נדרשת כתובת אימייל של האוניברסיטה העברית (@mail.huji.ac.il)' });
    }

    const result = await pool.query(
      `SELECT u.id, u.full_name, u.email, c.roadmap_code as track
       FROM users u
       LEFT JOIN combinations c ON u.combination_id = c.id
       WHERE u.id = $1`,
      [user.id]
    );

    if (result.rows.length > 0 && result.rows[0].full_name && result.rows[0].track) {
      const u = result.rows[0];
      return res.json({ id: u.id, name: u.full_name, email: u.email, track: u.track, isGuest: false });
    }

    const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0];
    return res.json({ needsProfile: true, userId: user.id, email: user.email, name });
  } catch (err) {
    console.error('Error in google-complete:', err);
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/auth/google-finalize', async (req, res) => {
  try {
    const { userId, access_token, name, track } = req.body;
    if (!userId || !access_token || !name || !track) {
      return res.status(400).json({ message: 'חסרים פרטים נדרשים' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(access_token);
    if (error || !user || user.id !== userId) {
      return res.status(401).json({ message: 'Token לא תקין' });
    }

    const combResult = await pool.query(
      'SELECT id FROM combinations WHERE roadmap_code = $1', [track]
    );
    if (combResult.rows.length === 0) {
      return res.status(400).json({ message: 'מסלול הלימוד לא נמצא' });
    }
    const combinationId = combResult.rows[0].id;

    const { error: upsertError } = await supabase
      .from('users')
      .upsert(
        { id: userId, email: user.email, full_name: name, combination_id: combinationId },
        { onConflict: 'id' }
      );

    if (upsertError) return res.status(500).json({ message: upsertError.message });

    res.json({ id: userId, name, email: user.email, track, isGuest: false });
  } catch (err) {
    console.error('Error in google-finalize:', err);
    res.status(500).json({ message: err.message });
  }
});

// ==== GENERAL FORUMS ====

const generateForumSlug = (title) =>
  title.replace(/\s+/g, '-').substring(0, 50) + '-' + Date.now();

const parseForumMeta = (description) => {
  try { return JSON.parse(description) || {}; } catch { return {}; }
};

app.get('/api/general-forums', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('general_forums')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;

    res.json((data || []).map(f => {
      const meta = parseForumMeta(f.description);
      return {
        id: f.forum_id,
        title: f.title,
        slug: f.slug,
        majorA: meta.majorA || '',
        majorB: meta.majorB || '',
        academicYear: meta.academicYear || '',
        date: new Date(f.created_at).toLocaleDateString('he-IL'),
        replies: 0
      };
    }));
  } catch (err) {
    console.error('Error fetching general forums:', err);
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/general-forums', async (req, res) => {
  try {
    const { title, majorA, majorB, academicYear } = req.body;
    if (!title) return res.status(400).json({ message: 'title is required' });

    const slug = generateForumSlug(title);
    const description = JSON.stringify({ majorA, majorB, academicYear });

    const { data, error } = await supabase
      .from('general_forums')
      .insert({ title, slug, description, major_a: majorA || null, major_b: majorB || null })
      .select()
      .single();
    if (error) throw error;

    // Notify registered users whose combination matches both departments
    if (majorA && majorB) {
      try {
        const words = `${majorA} ${majorB}`
          .split(/\s+/)
          .filter(w => w.length >= 3)
          .map(w => `%${w}%`);
        const conditions = words.map((_, i) => `name ILIKE $${i + 1}`).join(' OR ');
        const combResult = await pool.query(
          `SELECT DISTINCT id FROM combinations WHERE ${conditions}`,
          words
        );
        if (combResult.rows.length > 0) {
          const combinationIds = combResult.rows.map(r => r.id);
          const { data: matchedUsers } = await supabase
            .from('users')
            .select('id')
            .in('combination_id', combinationIds);

          if (matchedUsers && matchedUsers.length > 0) {
            await supabase.from('notifications').insert(
              matchedUsers.map(u => ({
                user_id: u.id,
                text: `פורום חדש נפתח עבור השילוב שלך: ${title}`,
                forum_id: data.forum_id
              }))
            );
          }
        }
      } catch (notifErr) {
        console.error('Error sending forum notifications:', notifErr);
        // Don't fail the whole request if notifications fail
      }
    }

    res.json({
      id: data.forum_id,
      title: data.title,
      slug: data.slug,
      majorA,
      majorB,
      academicYear,
      date: new Date(data.created_at).toLocaleDateString('he-IL'),
      replies: 0
    });
  } catch (err) {
    console.error('Error creating general forum:', err);
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/notifications', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.json([]);

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;

    res.json((data || []).map(n => ({
      id: n.id,
      text: n.text,
      read: n.read,
      forumId: n.forum_id,
      date: new Date(n.created_at).toLocaleDateString('he-IL', { hour: '2-digit', minute: '2-digit' })
    })));
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ message: err.message });
  }
});

app.patch('/api/notifications/read', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.json({ success: true });

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);
    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error('Error marking notifications as read:', err);
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/general-forum-questions', async (req, res) => {
  try {
    const { forumId } = req.query;
    if (!forumId) return res.status(400).json({ message: 'forumId is required' });

    const { data: questions, error: qErr } = await supabase
      .from('general_forum_questions')
      .select('*')
      .eq('forum_id', forumId)
      .order('created_at', { ascending: false });
    if (qErr) throw qErr;

    if (!questions || questions.length === 0) return res.json([]);

    const questionIds = questions.map(q => q.question_id);
    const { data: answers, error: aErr } = await supabase
      .from('general_forum_answers')
      .select('*')
      .in('question_id', questionIds)
      .order('created_at', { ascending: true });
    if (aErr) throw aErr;

    const answersMap = {};
    (answers || []).forEach(a => {
      if (!answersMap[a.question_id]) answersMap[a.question_id] = [];
      answersMap[a.question_id].push({
        id: a.answer_id,
        text: a.content,
        author: a.guest_nickname || 'אורח/ת',
        authorId: a.user_id,
        date: new Date(a.created_at).toLocaleDateString('he-IL'),
        likedBy: []
      });
    });

    res.json(questions.map(q => ({
      id: q.question_id,
      combinationId: q.forum_id,
      question: q.title,
      author: q.guest_nickname || 'אורח/ת',
      authorId: q.user_id,
      date: new Date(q.created_at).toLocaleDateString('he-IL'),
      answers: answersMap[q.question_id] || []
    })));
  } catch (err) {
    console.error('Error fetching forum questions:', err);
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/general-forum-questions', async (req, res) => {
  try {
    const { forumId, question, author, userId } = req.body;
    if (!forumId || !question) return res.status(400).json({ message: 'forumId and question are required' });

    const paddedContent = question.length >= 10 ? question : question + ' '.repeat(10 - question.length);

    const { data, error } = await supabase
      .from('general_forum_questions')
      .insert({
        forum_id: forumId,
        user_id: userId || null,
        guest_nickname: author || 'אורח/ת',
        title: question,
        content: paddedContent
      })
      .select()
      .single();
    if (error) throw error;

    // Notify users whose combination matches this forum
    try {
      const { data: forum, error: forumErr } = await supabase
        .from('general_forums')
        .select('title, description')
        .eq('forum_id', forumId)
        .single();

      console.log('[Q-NOTIF] forum:', forum, 'err:', forumErr);

      if (forum) {
        const meta = parseForumMeta(forum.description);
        const { majorA, majorB } = meta;
        console.log('[Q-NOTIF] majorA:', majorA, 'majorB:', majorB);

        if (majorA || majorB) {
          const words = `${majorA || ''} ${majorB || ''}`
            .split(/\s+/)
            .filter(w => w.length >= 3)
            .map(w => `%${w}%`);
          console.log('[Q-NOTIF] words:', words);

          const conditions = words.map((_, i) => `name ILIKE $${i + 1}`).join(' OR ');
          const combResult = await pool.query(
            `SELECT DISTINCT id FROM combinations WHERE ${conditions}`,
            words
          );
          console.log('[Q-NOTIF] matched combinations:', combResult.rows.length);

          if (combResult.rows.length > 0) {
            const combinationIds = combResult.rows.map(r => r.id);
            const { data: matchedUsers } = await supabase
              .from('users')
              .select('id')
              .in('combination_id', combinationIds)
              .neq('id', userId || '');

            console.log('[Q-NOTIF] matched users:', matchedUsers?.length);

            if (matchedUsers && matchedUsers.length > 0) {
              const { error: insertErr } = await supabase.from('notifications').insert(
                matchedUsers.map(u => ({
                  user_id: u.id,
                  text: `שאלה חדשה נשאלה בפורום "${forum.title}": ${question.substring(0, 60)}${question.length > 60 ? '...' : ''}`,
                  forum_id: forumId
                }))
              );
              console.log('[Q-NOTIF] insert error:', insertErr);
            }
          }
        }
      }
    } catch (notifErr) {
      console.error('[Q-NOTIF] Error sending question notifications:', notifErr);
    }

    res.json({
      id: data.question_id,
      combinationId: data.forum_id,
      question: data.title,
      author: data.guest_nickname,
      authorId: data.user_id,
      date: new Date(data.created_at).toLocaleDateString('he-IL'),
      answers: []
    });
  } catch (err) {
    console.error('Error creating forum question:', err);
    res.status(500).json({ message: err.message });
  }
});

app.patch('/api/general-forum-questions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { question } = req.body;
    if (!question) return res.status(400).json({ message: 'question text is required' });

    const { data, error } = await supabase
      .from('general_forum_questions')
      .update({ title: question })
      .eq('question_id', id)
      .select()
      .single();
    if (error) throw error;

    const { data: answers } = await supabase
      .from('general_forum_answers')
      .select('*')
      .eq('question_id', id)
      .order('created_at', { ascending: true });

    res.json({
      id: data.question_id,
      combinationId: data.forum_id,
      question: data.title,
      author: data.guest_nickname,
      authorId: data.user_id,
      date: new Date(data.created_at).toLocaleDateString('he-IL'),
      answers: (answers || []).map(a => ({
        id: a.answer_id,
        text: a.content,
        author: a.guest_nickname || 'אורח/ת',
        authorId: a.user_id,
        date: new Date(a.created_at).toLocaleDateString('he-IL'),
        likedBy: []
      }))
    });
  } catch (err) {
    console.error('Error updating forum question:', err);
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/general-forum-answers', async (req, res) => {
  try {
    const { questionId, text, author, userId } = req.body;
    if (!questionId || !text) return res.status(400).json({ message: 'questionId and text are required' });

    const { error: insertErr } = await supabase
      .from('general_forum_answers')
      .insert({
        question_id: questionId,
        user_id: userId || null,
        guest_nickname: author || 'אורח/ת',
        content: text
      });
    if (insertErr) throw insertErr;

    const { data: question } = await supabase
      .from('general_forum_questions')
      .select('*')
      .eq('question_id', questionId)
      .single();

    const { data: answers } = await supabase
      .from('general_forum_answers')
      .select('*')
      .eq('question_id', questionId)
      .order('created_at', { ascending: true });

    res.json({
      id: question.question_id,
      combinationId: question.forum_id,
      question: question.title,
      author: question.guest_nickname,
      authorId: question.user_id,
      date: new Date(question.created_at).toLocaleDateString('he-IL'),
      answers: (answers || []).map(a => ({
        id: a.answer_id,
        text: a.content,
        author: a.guest_nickname || 'אורח/ת',
        authorId: a.user_id,
        date: new Date(a.created_at).toLocaleDateString('he-IL'),
        likedBy: []
      }))
    });
  } catch (err) {
    console.error('Error adding forum answer:', err);
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/general-forums/relevant', async (req, res) => {
  try {
    const { track } = req.query;
    if (!track) return res.json([]);

    const combResult = await pool.query(
      'SELECT name FROM combinations WHERE roadmap_code = $1',
      [track]
    );
    if (combResult.rows.length === 0) return res.json([]);
    const combName = combResult.rows[0].name || '';
    // Split user's combination into individual majors (e.g. "מנהל עסקים + מט"ר" → ["מנהל עסקים", "מט"ר"])
    const userMajors = combName.split(/\s*\+\s*/).map(m => m.trim().toLowerCase()).filter(Boolean);

    const { data, error } = await supabase
      .from('general_forums')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;

    const relevant = (data || []).filter(f => {
      const meta = parseForumMeta(f.description);
      const titleParts = (f.title || '').split(/\s*\+\s*/);
      const mA = (f.major_a || meta.majorA || titleParts[0] || '').trim().toLowerCase();
      const mB = (f.major_b || meta.majorB || titleParts[1] || '').trim().toLowerCase();
      if (!mA && !mB) return false;
      return userMajors.some(m => m === mA || m === mB);
    });

    res.json(relevant.map(f => {
      const meta = parseForumMeta(f.description);
      return {
        id: f.forum_id,
        title: f.title,
        slug: f.slug,
        majorA: f.major_a || meta.majorA || '',
        majorB: f.major_b || meta.majorB || '',
        academicYear: meta.academicYear || '',
        date: new Date(f.created_at).toLocaleDateString('he-IL'),
        replies: 0
      };
    }));
  } catch (err) {
    console.error('Error fetching relevant forums:', err);
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});