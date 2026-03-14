const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { createClient } = require('../../_Agency_Tools/core_logic/hubspot_core');
const { generateSenderReport } = require('../../_Agency_Tools/core_logic/reporting');

// Load environment from the secure Sidecar directory
const envPath = 'C:\\Users\\micha_txj2ety\\Documents\\Agency_Secrets\\ambrook.env';
const firecrawlPath = 'C:\\Users\\micha_txj2ety\\Documents\\Agency_Secrets\\firecrawl.env';

dotenv.config({ path: envPath });
dotenv.config({ path: firecrawlPath });

const HUBSPOT_TOKEN = process.env.HUBSPOT_TOKEN;
const HUBSPOT_PORTAL_ID = process.env.HUBSPOT_PORTAL_ID || '24270685';

const client = createClient(HUBSPOT_TOKEN);

async function run() {
  const senderEmail = 'emeline@ambrook.com';
  console.log('Searching for automated emails from ' + senderEmail + '...');

  try {
    const reportData = await generateSenderReport(client, HUBSPOT_PORTAL_ID, senderEmail);
    const csvContent = 'Name,Edit Link\n' + reportData.map(item => `\"${item.name.replace(/\"/g, '\"\"')}\",${item.editLink}`).join('\n');
    fs.writeFileSync('emeline_emails_links.csv', csvContent);
    console.log('Successfully regenerated emeline_emails_links.csv with ' + reportData.length + ' automated emails.');
  } catch (error) {
    console.error(error.message);
  }
}

run();
