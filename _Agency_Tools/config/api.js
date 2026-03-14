const axios = require('axios');

// We rely on dotenv loading the environment variables BEFORE this is called.
const HUBSPOT_TOKEN = process.env.HUBSPOT_TOKEN;

if (!HUBSPOT_TOKEN) {
  console.error('Error: HUBSPOT_TOKEN is not defined in the .env file of the current directory.');
  process.exit(1);
}

const client = axios.create({
  baseURL: 'https://api.hubapi.com/marketing/v3/emails',
  headers: {
    Authorization: `Bearer ${HUBSPOT_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

module.exports = client;