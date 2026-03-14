const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { createClient } = require('../../_Agency_Tools/core_logic/hubspot_core');
const { fetchEmailDetails } = require('../../_Agency_Tools/core_logic/email_fetcher');

// Load environment from the secure Sidecar directory
const envPath = 'C:\\Users\\micha_txj2ety\\Documents\\Agency_Secrets\\ambrook.env';
const firecrawlPath = 'C:\\Users\\micha_txj2ety\\Documents\\Agency_Secrets\\firecrawl.env';

dotenv.config({ path: envPath });
dotenv.config({ path: firecrawlPath });

const HUBSPOT_TOKEN = process.env.HUBSPOT_TOKEN;
const EMAIL_IDS = [
  "205468468264",
  "205592629174",
  "205592629604",
  "205592663187",
  "205592414778"
];

if (!HUBSPOT_TOKEN) {
  console.error('Error: HUBSPOT_TOKEN is not defined in the .env file.');
  process.exit(1);
}

const client = createClient(HUBSPOT_TOKEN);

const fetchAndSaveEmails = async () => {
  const results = [];
  for (const id of EMAIL_IDS) {
    try {
      console.log(`Fetching email ${id}...`);
      const emailContent = await fetchEmailDetails(client, id);
      results.push(emailContent);

      const fileName = `email_${id}.md`;
      const filePath = path.join(__dirname, '..', fileName);
      const markdown = `# Email: ${emailContent.name} (${id})\n\n` +
        `**Subject:** ${emailContent.subject}\n` +
        `**Preview Text:** ${emailContent.previewText}\n\n` +
        `## Content\n\n${emailContent.body}\n\n` +
        `**CTA:** [${emailContent.ctaText}](${emailContent.ctaLink})\n\n` +
        `---\n\n`;

      fs.writeFileSync(filePath, markdown);
      console.log(`Saved ${fileName}`);

    } catch (error) {
      console.error(error.message);
    }
  }
  
  fs.writeFileSync(path.join(__dirname, 'email_contents.json'), JSON.stringify(results, null, 2));
};

fetchAndSaveEmails();
