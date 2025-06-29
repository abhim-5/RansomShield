// 📁 /utils/ibmAuth.js
// Handles IBM IAM token generation securely and efficiently

const axios = require('axios');
const qs = require('querystring');
require('dotenv').config();
console.log("🔍 IBM_API_KEY:", !!process.env.IBM_API_KEY ? "[OK]" : "[MISSING]");
const IBM_API_KEY = process.env.IBM_API_KEY;
const IBM_REGION = process.env.IBM_REGION || 'us-south';
const IAM_URL = 'https://iam.cloud.ibm.com/identity/token';

let cachedToken = null;
let tokenExpiry = 0; // Epoch in ms

/**
 * Generates or returns cached IBM IAM access token
 * Ensures we don't hit rate limits by caching valid tokens
 * @returns {Promise<string>} access_token
 */
async function getIAMToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry - 60000) {
    return cachedToken; // Token still valid, return it
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
    console.log('🔐 Fetched new IBM IAM token');
    return cachedToken;
  } catch (err) {
    console.error('❌ IBM IAM token error:', err.response?.data || err.message);
    throw new Error('Failed to obtain IBM access token');
  }
}

module.exports = getIAMToken;
