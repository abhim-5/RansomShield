// 📁 /utils/graniteAnalyzer.js

const axios = require('axios');
const path = require('path');
const getIAMToken = require('./ibmAuth');

const GRANITE_API_URL = 'https://us-south.ml.cloud.ibm.com/v2/inference';
const GRANITE_MODEL_ID = 'granite-code-20b-instruct'; // Change if needed
const PROJECT_ID = process.env.IBM_PROJECT_ID;

function buildRansomwarePrompt(filename, fileContent) {
  const safeContent = fileContent.slice(0, 4000);
  return `You are a cybersecurity AI assistant.

Analyze the following file: ${path.basename(filename)} for potential ransomware behavior.

Check for:
- Suspicious encryption routines
- Renaming of files
- File deletion patterns
- Use of file system libraries for malicious purposes
- Commands or code that could encrypt or lock files
- Hardcoded ransom messages, IPs, suspicious links

Return:
- 🔒 Ransomware Threat Score (1 to 10)
- ❌ Red Flags (list suspicious code behaviors)
- 🧠 AI Suggestions (how to improve or secure it)

--- Begin Code ---
${safeContent}
--- End Code ---`;
}

module.exports = async function analyzeFileWithGranite(filename, codeText) {
  const prompt = buildRansomwarePrompt(filename, codeText);
  const accessToken = await getIAMToken();

  try {
    const response = await axios.post(
      GRANITE_API_URL,
      {
        model_id: GRANITE_MODEL_ID,
        input: [prompt],
        parameters: {
          decoding_method: "greedy",
          max_new_tokens: 350
        },
        project_id: PROJECT_ID
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    const output = response.data.results?.[0]?.generated_text || '[No response from model]';

    return {
      file: path.basename(filename),
      raw_prompt: prompt,
      analysis: output
    };
  } catch (err) {
    console.error('❌ Granite API error for file', filename, err.response?.data || err.message);
    return {
      file: path.basename(filename),
      analysis: '⚠️ Error calling Granite API',
      error: err.response?.data || err.message
    };
  }
};