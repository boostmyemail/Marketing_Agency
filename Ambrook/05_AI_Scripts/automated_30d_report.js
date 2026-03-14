const path = require('path');
const dotenv = require('dotenv');
const { createClient } = require('../../_Agency_Tools/core_logic/hubspot_core');
const { getAutomatedEmailsWithSends } = require('../../_Agency_Tools/core_logic/reporting');

// Load environment from the secure Sidecar directory
const envPath = 'C:\\Users\\micha_txj2ety\\Documents\\Agency_Secrets\\ambrook.env';
const firecrawlPath = 'C:\\Users\\micha_txj2ety\\Documents\\Agency_Secrets\\firecrawl.env';

dotenv.config({ path: envPath });
dotenv.config({ path: firecrawlPath });

const HUBSPOT_TOKEN = process.env.HUBSPOT_TOKEN;

if (!HUBSPOT_TOKEN) {
  console.error('Error: HUBSPOT_TOKEN not found in ' + envPath);
  process.exit(1);
}

const client = createClient(HUBSPOT_TOKEN);

async function run() {
  console.log('--- Ambrook Automated Email Report (Last 30 Days) ---');
  try {
    const reportData = await getAutomatedEmailsWithSends(client);
    
    if (reportData.length === 0) {
      console.log('No automated emails had sends in the last 30 days.');
    } else {
      reportData.forEach(item => {
        console.log(`Email: ${item.name} (ID: ${item.id})`);
        console.log(`  Sent:      ${item.counters.sent}`);
        console.log(`  Delivered: ${item.counters.delivered || 0}`);
        console.log(`  Opens:     ${item.counters.open || 0} (${(item.ratios.openRate * 100).toFixed(2)}%)`);
        console.log(`  Clicks:    ${item.counters.click || 0} (${(item.ratios.clickRate * 100).toFixed(2)}%)`);
        console.log('-------------------------------------------');
      });
      console.log(`\nTotal Active Automated Emails: ${reportData.length}`);
    }
  } catch (error) {
    console.error(error.message);
  }
}

run();
