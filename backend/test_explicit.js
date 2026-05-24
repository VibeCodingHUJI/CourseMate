const { Client } = require('pg');

const client = new Client({
  host: '2406:da12:1f1:f802:80e3:309b:33ba:2125',
  port: 5432,
  user: 'postgres',
  password: 'coursmatEhuji12345!',
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function test() {
  try {
    console.log('Connecting with explicit config...');
    await client.connect();
    console.log('SUCCESS!');
    const res = await client.query('SELECT NOW()');
    console.log(res.rows[0]);
  } catch (err) {
    console.error('FAILED:', err);
  } finally {
    await client.end();
  }
}

test();
