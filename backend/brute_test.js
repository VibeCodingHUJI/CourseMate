const { Client } = require('pg');
require('dotenv').config();

// Try common regions
const regions = ['eu-central-1', 'us-east-1', 'ap-northeast-2'];

async function testRegions() {
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    // Try with and without URL encoding for the !
    const passwords = ['coursmatEhuji12345!', 'coursmatEhuji12345%21'];
    
    for (const pwd of passwords) {
      const connStr = `postgresql://postgres.svptqoqazjtxsosgokou:${pwd}@${host}:6543/postgres`;
      const client = new Client({
        connectionString: connStr,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 2000
      });

      try {
        console.log(`Testing: ${region} with pwd variant...`);
        await client.connect();
        console.log(`✅ SUCCESS! Region: ${region}, Password variant used.`);
        await client.end();
        process.exit(0);
      } catch (err) {
        if (!err.message.includes('not found')) {
           console.log(`   Result: ${err.message}`);
        }
      }
    }
  }
  console.log('❌ All attempts failed.');
}

testRegions();
