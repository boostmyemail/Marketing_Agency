const axios = require('axios');
const fs = require('fs');
const path = require('path');

const createClient = (token) => {
  return axios.create({
    baseURL: 'https://api.hubapi.com/marketing/v3/emails',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

const getEmail = async (client, id) => {
  try {
    const response = await client.get(`/${id}`);
    return response.data;
  } catch (error) {
    const msg = error.response ? JSON.stringify(error.response.data) : error.message;
    throw new Error('Failed to fetch email: ' + msg);
  }
};

const listEmails = async (client) => {
  try {
    const response = await client.get('?limit=5&sort=-createdAt');
    return response.data.results;
  } catch (error) {
    const msg = error.response ? JSON.stringify(error.response.data) : error.message;
    throw new Error('Failed to fetch emails: ' + msg);
  }
};

const cloneEmail = async (client, portalId, originalId, newName) => {
  try {
    const payload = {
      id: originalId
    };
    const response = await client.post('/clone', payload);
    const clonedEmailId = response.data.id;
    const patchResponse = await client.patch(`/${clonedEmailId}`, { name: newName });
    return patchResponse.data;
  } catch (error) {
    const msg = error.response ? JSON.stringify(error.response.data) : error.message;
    throw new Error('Failed to clone/rename email: ' + msg);
  }
};

const updateEmail = async (client, portalId, id, contentData, templates) => {
  try {
    // 1. GET current state (Read)
    const currentResponse = await client.get(`/${id}`);
    const emailData = currentResponse.data;
    
    // 2. Resolve mapping
    let mapping = {};
    const templateKey = Object.keys(templates).find(k => templates[k].id === emailData.clonedFrom);
    if (templateKey && templates[templateKey].mapping) {
      mapping = templates[templateKey].mapping;
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

        const isRichText = path.includes('rich_text') || type === 'text' || moduleId === 1155639;
        const isImage = path.includes('image') || moduleId === 1367093;
        const isButton = path.includes('button') || moduleId === 1976948;

        if (isRichText) {
           widget.body.html = newValue;
        } else if (isImage) {
           widget.body.img = widget.body.img || {};
           widget.body.img.src = newValue;
        } else if (isButton) {
           if (typeof newValue === 'string') {
             widget.body.text = newValue;
           } else {
             Object.assign(widget.body, newValue);
           }
        }
      }
    });

    // 4. Send the updated JSON back (Write)
    const updatePayload = {
      subject: emailData.subject,
      from: emailData.from,
      content: emailData.content
    };

    const response = await client.patch(`/${id}`, updatePayload);
    return response.data;
  } catch (error) {
    const msg = error.response ? JSON.stringify(error.response.data) : error.message;
    throw new Error('Failed to update email: ' + msg);
  }
};

const findBySender = async (client, senderEmail) => {
  try {
    let allMatched = [];
    let after = undefined;

    do {
      const url = `?limit=100${after ? `&after=${after}` : ''}`;
      const response = await client.get(url);
      const emails = response.data.results;
      
      for (const email of emails) {
        if (email.from && email.from.replyTo && email.from.replyTo.toLowerCase() === senderEmail.toLowerCase()) {
           allMatched.push(email);
        }
      }
      after = response.data.paging ? response.data.paging.next.after : undefined;
    } while (after);

    return allMatched;
  } catch (error) {
    const msg = error.response ? JSON.stringify(error.response.data) : error.message;
    throw new Error('Failed to search emails: ' + msg);
  }
};

module.exports = {
  createClient,
  getEmail,
  listEmails,
  cloneEmail,
  updateEmail,
  findBySender
};
