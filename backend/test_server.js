const express = require('express');
const { Client } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const connectionString = process.env.DATABASE_URL.replace(/^"/, '').replace(/"$/, '').replace(/[\?&]sslmode=[^&]*/, '');

app.get('/api/test', async (req, res) => {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  try {
    await client.connect();
    const result = await client.query('SELECT NOW()');
    res.json({ success: true, time: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  } finally {
    await client.end();
  }
});

app.listen(PORT, () => console.log('Test server on 5000'));
