const { Client } = require('pg');
require('dotenv').config();

// Clean the connection string from potential trailing commas or quotes
const connectionString = process.env.DATABASE_URL;

const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function test() {
  try {
    console.log('Connecting to:', connectionString.replace(/:[^@:]+@/, ':***@'));
    await client.connect();
    console.log('Connected successfully!');
    const res = await client.query('SELECT NOW()');
    console.log('Database time:', res.rows[0]);
  } catch (err) {
    console.error('Connection failed:', err.message);
  } finally {
    await client.end();
  }
}

test();
