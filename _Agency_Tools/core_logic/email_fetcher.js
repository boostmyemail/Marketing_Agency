const axios = require('axios');

const cleanHtml = (html) => {
  if (!html) return '';
  return html
    .replace(/<p[^>]*>/gi, '\n')
    .replace(/<\/p>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]+>/g, '')
    .trim();
};

const fetchEmailDetails = async (client, id) => {
  try {
    const response = await client.get(`/${id}`);
    const data = response.data;
    
    const widgets = data.content ? data.content.widgets : {};
    const subject = data.subject || '';
    let previewText = '';
    if (widgets.preview_text && widgets.preview_text.body) {
      previewText = widgets.preview_text.body.value.split('\n')[0].trim();
    }

    let mainBody = '';
    let ctaText = '';
    let ctaLink = '';

    Object.keys(widgets).forEach(key => {
      const widget = widgets[key];
      const body = widget.body || {};
      const moduleId = body.module_id || widget.module_id;

      if (moduleId === 1155639) {
        const html = body.html || '';
        if (html.length > mainBody.length) {
          mainBody = html;
        }
      }

      if (moduleId === 1976948) {
        ctaText = body.text || '';
        ctaLink = body.destination || '';
      }
    });

    return {
      id,
      name: data.name,
      subject,
      previewText,
      body: cleanHtml(mainBody),
      ctaText,
      ctaLink,
      rawMainBody: mainBody
    };
  } catch (error) {
    throw new Error(`Failed to fetch email ${id}: ` + (error.response ? JSON.stringify(error.response.data) : error.message));
  }
};

module.exports = {
  fetchEmailDetails,
  cleanHtml
};
