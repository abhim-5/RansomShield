// 📁 /utils/ibmAuth.js

const axios = require('axios');
const qs = require('querystring');
require('dotenv').config();

const IBM_API_KEY = process.env.IBM_API_KEY;
const IAM_URL = 'https://iam.cloud.ibm.com/identity/token';

let cachedToken = null;
let tokenExpiry = 0;

/**
 * Gets a fresh IBM IAM token or returns cached token if valid.
 * @returns {Promise<string>} access_token
 */
async function getIAMToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry - 60000) {
    return cachedToken;
  }

  try {
    const response = await axios.post(
      IAM_URL,
      qs.stringify({
        grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
        apikey: IBM_API_KEY,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    cachedToken = response.data.access_token;
    tokenExpiry = now + response.data.expires_in * 1000;
    console.log('🔐 New IAM token acquired');
    return cachedToken;
  } catch (err) {
    console.error('❌ IAM token error:', err.response?.data || err.message);
    throw new Error('Failed to obtain IBM access token');
  }
}

module.exports = getIAMToken;