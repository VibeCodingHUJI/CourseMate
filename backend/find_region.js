const { Client } = require('pg');

const regions = [
  'eu-central-1',
  'us-east-1',
  'us-west-1',
  'ap-southeast-1',
  'ap-northeast-1',
  'eu-west-1',
  'sa-east-1',
  'ap-southeast-2',
  'us-east-2',
  'eu-west-2',
  'eu-west-3',
  'eu-north-1',
  'me-central-1',
  'ap-northeast-2'
];

async function checkRegion(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  const connectionString = `postgresql://postgres.svptqoqazjtxsosgokou:coursmatEhuji12345!@${host}:6543/postgres`;
  
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  });

  try {
    await client.connect();
    console.log(`SUCCESS: Found project in region ${region}`);
    await client.end();
    return true;
  } catch (err) {
    if (err.message.includes('self-signed certificate') || err.message.includes('authentication failed')) {
      console.log(`SUCCESS: Found project in region ${region} (Error "${err.message}" confirms connectivity)`);
      return true;
    }
    // console.log(`Region ${region}: ${err.message}`);
    return false;
  }
}

async function run() {
  console.log('Searching for the correct Supabase region...');
  for (const region of regions) {
    const found = await checkRegion(region);
    if (found) {
      console.log(`The correct region is: ${region}`);
      process.exit(0);
    }
  }
  console.log('Could not find the correct region.');
}

run();
