const client = require('../config/api');

const getEmailStats = async (emailIds, startTimestamp, endTimestamp) => {
  try {
    const params = new URLSearchParams();
    emailIds.forEach(id => params.append('emailIds', id));
    if (startTimestamp) params.append('startTimestamp', startTimestamp);
    if (endTimestamp) params.append('endTimestamp', endTimestamp);

    const response = await client.get(`/statistics/list?${params.toString()}`);
    const data = response.data;

    console.log('\n--- Email Statistics Report ---');
    console.log(`Date Range: ${startTimestamp || 'N/A'} → ${endTimestamp || 'N/A'}`);
    console.log(`Email IDs:  ${emailIds.join(', ')}`);

    if (data.aggregate) {
      const { counters, ratios } = data.aggregate;

      console.log('\n[ Counters ]');
      if (counters && Object.keys(counters).length > 0) {
        Object.entries(counters).forEach(([key, value]) => {
          console.log(`  ${key}: ${value}`);
        });
      } else {
        console.log('  No counter data returned.');
      }

      console.log('\n[ Rates ]');
      if (ratios && Object.keys(ratios).length > 0) {
        Object.entries(ratios).forEach(([key, value]) => {
          console.log(`  ${key}: ${parseFloat(value).toFixed(2)}%`);
        });
      } else {
        console.log('  No ratio data returned.');
      }
    }

    if (data.emails && data.emails.length > 0) {
      console.log('\n[ Emails Sent During Period ]');
      data.emails.forEach(id => console.log(`  - ${id}`));
    }

    console.log('');
  } catch (error) {
    const msg = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error('Failed to fetch email statistics:', msg);
  }
};

module.exports = { getEmailStats };
