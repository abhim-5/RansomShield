// 📁 /utils/graniteAnalyzer.js

const axios = require('axios');
const path = require('path');
const getIAMToken = require('./ibmAuth');

const GRANITE_API_URL = 'https://us-south.ml.cloud.ibm.com/ml/v1/text/chat?version=2023-05-29';
const GRANITE_MODEL_ID = 'ibm/granite-20b-code-instruct';
const PROJECT_ID = process.env.IBM_PROJECT_ID;

/**
 * Build a system message prompt for ransomware analysis
 * @param {string} filename - File name for context
 * @param {string} fileContent - Code or log contents
 * @returns {string}
 */
function buildRansomwarePrompt(filename, fileContent) {
  const safeContent = fileContent.slice(0, 4000);

  return `You are an intelligent AI programming assistant.

Analyze the following file: ${path.basename(filename)} for potential ransomware behavior.

Look for:
- Suspicious encryption routines
- File renaming or deletion
- Use of filesystem APIs for malicious intent
- Hardcoded IPs, ransom messages, URLs, or time bombs

Return:
- 🔒 Threat Score (1-10)
- ❌ Suspicious patterns found
- 🛡️ AI Suggestions to mitigate threats

--- Begin Code ---
${safeContent}
--- End Code ---`;
}

/**
 * Calls IBM Watsonx Granite chat API to analyze a single file
 * @param {string} filename
 * @param {string} codeText
 * @returns {Promise<Object>}
 */
module.exports = async function analyzeFileWithGranite(filename, codeText) {
  const prompt = buildRansomwarePrompt(filename, codeText);
  const accessToken = await getIAMToken();

  try {
    const response = await axios.post(
      GRANITE_API_URL,
      {
        model_id: GRANITE_MODEL_ID,
        project_id: PROJECT_ID,
        messages: [
          {
            role: 'system',
            content: prompt,
          },
        ],
        temperature: 0,
        top_p: 1,
        max_tokens: 1000,
        frequency_penalty: 0,
        presence_penalty: 0,
        stop: [],
        seed: null
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    const output = response.data?.results?.[0]?.generated_text || '[No output from model]';

    return {
      file: path.basename(filename),
      raw_prompt: prompt,
      analysis: output,
    };
  } catch (err) {
    console.error('❌ Granite API error for file', filename, err.response?.data || err.message);

    return {
      file: path.basename(filename),
      analysis: '⚠️ Error calling Granite API',
      error: err.response?.data || err.message,
    };
  }
};