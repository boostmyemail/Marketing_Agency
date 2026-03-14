#!/usr/bin/env node
const path = require('path');
const fs = require('fs');

// SIDE-CAR PROTOCOL: Load .env from the secure Agency_Secrets folder
const currentDirName = path.basename(process.cwd());
const secretsPath = 'C:\\Users\\micha_txj2ety\\Documents\\Agency_Secrets';
let envFileName = '.env'; // default fallback

// Map client folder names to their specific env files
if (currentDirName === 'SchoolAI') envFileName = 'schoolai.env';
else if (currentDirName === 'Ambrook') envFileName = 'ambrook.env';
else if (currentDirName === 'Glide') envFileName = 'glide.env';

const envPath = path.join(secretsPath, envFileName);

// Only attempt to load if the file exists, otherwise let dotenv try the default or fail gracefully
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  // Fallback to local .env if sidecar is missing (mostly for dev/testing)
  require('dotenv').config({ path: path.join(process.cwd(), '.env') });
}

const { Command } = require('commander');
const emailManager = require('./services/email-manager');
const statsManager = require('./services/stats-manager');

const program = new Command();

program
  .name('agency-tools')
  .description('Unified HubSpot toolkit for Agency clients')
  .version('1.0.0');

// --- EMAIL COMMANDS ---
const email = program.command('email')
  .description('Manage HubSpot marketing emails');

email.command('list')
  .description('List the 5 most recent marketing emails')
  .action(async () => {
    await emailManager.listEmails();
  });

email.command('get <id>')
  .description('Get details of a specific email by ID')
  .action(async (id) => {
    await emailManager.getEmail(id);
  });

email.command('templates')
  .description('List available templates defined in templates.json')
  .action(() => {
    emailManager.showTemplates();
  });

email.command('clone <template_key_or_id> <new_name>')
  .description('Clone an email from a template or ID')
  .action(async (templateKey, newName) => {
    await emailManager.cloneEmail(templateKey, newName);
  });

email.command('find <sender_email>')
  .description('Find emails by sender email address')
  .action(async (senderEmail) => {
    await emailManager.findEmails(senderEmail);
  });

email.command('update <id> <content_file>')
  .description('Update an email content using a JSON file')
  .action(async (id, contentFile) => {
    // Resolve content file relative to where the user is running the command
    const absolutePath = path.resolve(process.cwd(), contentFile);
    if (!fs.existsSync(absolutePath)) {
        console.error(`Error: Content file not found at ${absolutePath}`);
        process.exit(1);
    }
    await emailManager.updateEmail(id, absolutePath);
  });

// --- REPORTING COMMANDS ---
const reporting = program.command('reporting')
  .description('Pull HubSpot email performance reports');

reporting.command('stats')
  .description('Get aggregated statistics for one or more emails')
  .requiredOption('--ids <ids>', 'Comma-separated list of email IDs')
  .requiredOption('--start <timestamp>', 'Start of date range in ISO8601 (e.g. 2025-01-01T00:00:00Z)')
  .requiredOption('--end <timestamp>', 'End of date range in ISO8601 (e.g. 2025-01-31T23:59:59Z)')
  .action(async (options) => {
    const emailIds = options.ids.split(',').map(id => id.trim());
    await statsManager.getEmailStats(emailIds, options.start, options.end);
  });

// --- SEGMENTATION COMMANDS (Placeholder) ---
const segmentation = program.command('segmentation')
  .description('Manage contact lists (Coming Soon)');

segmentation.command('list')
  .action(() => {
    console.log('Segmentation module not yet implemented.');
  });

program.parse(process.argv);