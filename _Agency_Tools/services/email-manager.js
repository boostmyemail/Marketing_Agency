const fs = require('fs');
const path = require('path');
const client = require('../config/api'); // Use the configured Axios client

const TEMPLATES_FILE = path.join(process.cwd(), 'templates.json');
const HUBSPOT_PORTAL_ID = process.env.HUBSPOT_PORTAL_ID; // Loaded from .env

const statsManager = require('./stats-manager');
const hubspotCore = require('../core_logic/hubspot_core');

const loadTemplates = () => {
  if (fs.existsSync(TEMPLATES_FILE)) {
    try {
      const data = fs.readFileSync(TEMPLATES_FILE, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading templates.json:', e.message);
      return {};
    }
  }
  return {};
};

const getEmail = async (id) => {
  try {
    const response = await client.get(`/${id}`);
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    const msg = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error('Failed to fetch email:', msg);
  }
};

const listEmails = async () => {
  try {
    const response = await client.get('?limit=5&sort=-createdAt');
    const emails = response.data.results;
    if (!emails || emails.length === 0) {
      console.log('No marketing emails found.');
      return;
    }
    console.log('--- 5 Most Recent Marketing Emails ---');
    emails.forEach((email, index) => {
      console.log(`${index + 1}. Name: ${email.name} (ID: ${email.id})`);
    });
  } catch (error) {
    const msg = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error('Failed to fetch emails:', msg);
  }
};

const cloneEmail = async (idOrKey, newName) => {
  try {
    const templates = loadTemplates();
    const originalId = templates[idOrKey] ? templates[idOrKey].id : idOrKey;
    
    const payload = {
      id: originalId
    };
    console.log(`Cloning email ID: ${originalId}...`);
    const response = await client.post('/clone', payload);
    const clonedEmailId = response.data.id;
    console.log(`Cloned ID: ${clonedEmailId}. Renaming to "${newName}"...`);
    
    const patchResponse = await client.patch(`/${clonedEmailId}`, { name: newName });
    const email = patchResponse.data;
    
    console.log('Email cloned and renamed successfully!');
    console.log(`New Name: ${email.name}`);
    console.log(`New ID:   ${email.id}`);
    console.log(`Edit Link: https://app.hubspot.com/email/${HUBSPOT_PORTAL_ID}/content/${email.id}/edit/main`);
  } catch (error) {
    const msg = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error('Failed to clone/rename email:', msg);
  }
};

const updateEmail = async (id, filePath) => {
  try {
    const contentData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // 1. GET current state (Read)
    console.log(`Fetching current state of email ${id}...`);
    const currentResponse = await client.get(`/${id}`);
    const emailData = currentResponse.data;
    
    // 2. Resolve mapping
    const templates = loadTemplates();
    let mapping = {};
    const templateKey = Object.keys(templates).find(k => templates[k].id === emailData.clonedFrom);
    if (templateKey && templates[templateKey].mapping) {
      mapping = templates[templateKey].mapping;
      console.log(`Using mapping for template: ${templateKey}`);
    }

    // 3. Modify the local copy
    if (contentData.subject) {
        emailData.subject = contentData.subject;
    }
    if (contentData.fromName) {
      emailData.from = emailData.from || {};
      emailData.from.fromName = contentData.fromName;
    }

    Object.keys(contentData).forEach(key => {
      if (key === 'previewText' && emailData.content && emailData.content.widgets && emailData.content.widgets.preview_text) {
        emailData.content.widgets.preview_text.body.value = contentData[key];
        return;
      }
      if (['subject', 'fromName', 'previewText'].includes(key)) return;

      const targetKey = mapping[key] || key;
      if (emailData.content && emailData.content.widgets && emailData.content.widgets[targetKey]) {
        const widget = emailData.content.widgets[targetKey];
        const type = widget.type || '';
        const path = widget.path || (widget.body ? widget.body.path : '') || '';
        const moduleId = widget.module_id || (widget.body ? widget.body.module_id : 0);
        const newValue = contentData[key];

        console.log(`DEBUG: Updating widget ${targetKey} (key: ${key})`);
        
        const isRichText = path.includes('rich_text') || type === 'text' || moduleId === 1155639;
        const isImage = path.includes('image') || moduleId === 1367093;
        const isButton = path.includes('button') || moduleId === 1976948;

        if (isRichText) {
           console.log(`  Updating Rich Text: ${targetKey}`);
           widget.body.html = newValue;
        } else if (isImage) {
           console.log(`  Updating Image: ${targetKey}`);
           widget.body.img = widget.body.img || {};
           widget.body.img.src = newValue;
        } else if (isButton) {
           console.log(`  Updating Button: ${targetKey}`);
           if (typeof newValue === 'string') {
             widget.body.text = newValue;
           } else {
             // If newValue is an object, it might contain text and url
             if (newValue.text) widget.body.text = newValue.text;
             if (newValue.url) {
               widget.body.url = newValue.url;
               widget.body.destination = newValue.url; // Often used in DND
               if (widget.body.link) {
                 widget.body.link.url = newValue.url;
               }
             }
             // Fallback for other potential properties
             Object.assign(widget.body, newValue);
           }
        }
      } else {
        console.log(`DEBUG: Skipping key ${key} - no widget ${targetKey} found`);
      }
    });

    // 4. Send the updated JSON back (Write)
    const updatePayload = {
      subject: emailData.subject,
      from: emailData.from,
      content: emailData.content
    };

    console.log(`Pushing full update to email ${id}...`);
    const response = await client.patch(`/${id}`, updatePayload);
    console.log('Email updated successfully!');
    console.log(`Edit Link: https://app.hubspot.com/email/${HUBSPOT_PORTAL_ID}/content/${id}/edit/main`);
  } catch (error) {
    const msg = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error('Failed to update email:', msg);
  }
};

const showTemplates = () => {
  const templates = loadTemplates();
  const keys = Object.keys(templates);
  if (keys.length === 0) {
    console.log('No templates found in templates.json.');
    return;
  }
  console.log('--- Stored Templates ---');
  keys.forEach(key => {
    const t = templates[key];
    console.log(`Key: ${key}`);
    console.log(`  Name: ${t.name}`);
    console.log(`  ID:   ${t.id}`);
    console.log(`  Desc: ${t.description}`);
    console.log('---');
  });
};

const findEmails = async (senderEmail) => {
  try {
    console.log(`Searching for emails from sender: ${senderEmail}...`);
    const results = await hubspotCore.findBySender(client, senderEmail);
    if (results.length === 0) {
      console.log('No emails found from that sender.');
    } else {
      console.log(`--- ${results.length} Emails from ${senderEmail} ---`);
      results.forEach((email, index) => {
        console.log(`${index + 1}. Name: ${email.name} (ID: ${email.id})`);
      });
    }
  } catch (error) {
    console.error('Failed to search emails:', error.message);
  }
};

module.exports = {
  getEmail,
  listEmails,
  cloneEmail,
  updateEmail,
  showTemplates,
  findEmails
};