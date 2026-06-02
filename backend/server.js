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

// --- כאן יבוא כל שאר הקוד המקורי שלך (ה-mapCourse, ה-Routes וכו') ---
// השארתי אותו ריק כדי שתדביקי פה את הפונקציות המקוריות שלך בדיוק כמו שהיו

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});