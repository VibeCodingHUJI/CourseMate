const { Client } = require('pg');

const client = new Client({
  host: 'aws-0-us-west-2.pooler.supabase.com',
  port: 6543,
  user: 'postgres.svptqoqazjtxsosgokou',
  password: 'coursmatEhuji12345!',
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function test() {
  try {
    console.log('Connecting...');
    await client.connect();
    console.log('Connected!');
    const res = await client.query('SELECT NOW()');
    console.log(res.rows[0]);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

test();
