require('dotenv').config();
const axios = require('axios');
const getIAMToken = require('./utils/ibmAuth');

const GRANITE_API_URL = 'https://us-south.ml.cloud.ibm.com/ml/v1/text/chat?version=2023-05-29';
const GRANITE_MODEL_ID = 'ibm/granite-3-2-8b-instruct';
const PROJECT_ID = process.env.IBM_PROJECT_ID;

(async () => {
  try {
    const prompt = `You are a cybersecurity assistant. Analyze the following code for ransomware behavior:

--- Code ---
const fs = require('fs');
fs.writeFileSync('important.txt', 'Encrypted content!');
fs.unlinkSync('original.txt');

Return:
- Threat score (1–10)
- Suspicious patterns
- Suggested fixes`;

    const accessToken = await getIAMToken();
    console.log("🔐 Token OK");

    const response = await axios.post(
      GRANITE_API_URL,
      {
        model_id: GRANITE_MODEL_ID,
        project_id: PROJECT_ID,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    console.log("\n🧠 Response:");
    console.dir(response.data, { depth: null });
  } catch (err) {
    console.error("❌ Error:", err.response?.data || err.message);
  }
})();