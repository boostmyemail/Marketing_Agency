const axios = require('axios');
const fs = require('fs');

const getAutomatedEmailsWithSends = async (client, days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startTimestamp = startDate.toISOString();
  const endTimestamp = new Date().toISOString();

  try {
    let allAutomated = [];
    let after = undefined;

    // 1. Fetch ALL automated emails
    do {
      const url = '?limit=100&type=AUTOMATED_EMAIL' + (after ? '&after=' + after : '');
      const response = await client.get(url);
      allAutomated.push(...response.data.results);
      after = (response.data.paging && response.data.paging.next) ? response.data.paging.next.after : undefined;
    } while (after);

    const reportData = [];
    const batchSize = 10;
    for (let i = 0; i < allAutomated.length; i += batchSize) {
      const batch = allAutomated.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (email) => {
        try {
          const statsResponse = await client.get(`/statistics/list?emailIds=${email.id}&startTimestamp=${startTimestamp}&endTimestamp=${endTimestamp}`);
          const stats = statsResponse.data;

          if (stats.aggregate && stats.aggregate.counters && stats.aggregate.counters.sent > 0) {
            return {
              name: email.name,
              id: email.id,
              counters: stats.aggregate.counters,
              ratios: stats.aggregate.ratios
            };
          }
        } catch (err) {
          return null;
        }
      });

      const results = await Promise.all(batchPromises);
      reportData.push(...results.filter(r => r !== null));
    }

    reportData.sort((a, b) => b.counters.sent - a.counters.sent);
    return reportData;
  } catch (error) {
    throw new Error('Error fetching report data: ' + (error.response ? JSON.stringify(error.response.data) : error.message));
  }
};

const generateSenderReport = async (client, portalId, senderEmail) => {
  let allMatched = [];
  let after = undefined;

  try {
    do {
      const url = '?limit=100' + (after ? '&after=' + after : '');
      const response = await client.get(url);
      const emails = response.data.results;
      
      for (const email of emails) {
        if (email.from && email.from.replyTo && email.from.replyTo.toLowerCase() === senderEmail.toLowerCase()) {
           const isAutomated = email.type === 'AUTOMATED_EMAIL' || email.subcategory === 'automated';
           if (isAutomated) {
             const editLink = `https://app.hubspot.com/email/${portalId}/edit/${email.id}/content`;
             allMatched.push({
               name: email.name,
               editLink: editLink
             });
           }
        }
      }
      after = (response.data.paging && response.data.paging.next) ? response.data.paging.next.after : undefined;
    } while (after);

    return allMatched;
  } catch (error) {
    throw new Error('Error generating sender report: ' + (error.response ? JSON.stringify(error.response.data) : error.message));
  }
};

module.exports = {
  getAutomatedEmailsWithSends,
  generateSenderReport
};
