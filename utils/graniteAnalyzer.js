// 📁 /utils/graniteAnalyzer.js

const axios = require('axios');
const path = require('path');
const getIAMToken = require('./ibmAuth');

// IBM Watsonx endpoint and model info
const GRANITE_API_URL = 'https://us-south.ml.cloud.ibm.com/ml/v1/text/chat?version=2023-05-29';
const GRANITE_MODEL_ID = 'ibm/granite-3-8b-instruct'; // ✅ More stable than deprecated granite-20b
const PROJECT_ID = process.env.IBM_PROJECT_ID;

/**
 * Builds a simplified prompt for ransomware risk analysis.
 * @param {string} filename - Name of the file for context
 * @param {string} fileContent - The code or text content of the file
 * @returns {string} - Prompt to send to the LLM
 */
function buildRansomwarePrompt(filename, fileContent) {
  const safeContent = fileContent.slice(0, 4000); // Token safety

  return `You are a cybersecurity AI assistant. Analyze the following code from "${path.basename(filename)}" for ransomware behavior.

Focus on:
- File deletion, encryption routines, or renaming
- Suspicious filesystem commands
- Hardcoded ransom messages or IP addresses

Return:
- 🔒 Threat Score (1–10)
- ❌ Detected red flags
- ✅ Suggested mitigations

--- Begin Code ---
${safeContent}
--- End Code ---`;
}

/**
 * Calls IBM Watsonx Granite Chat API to evaluate a file
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

    console.log(`🧠 Granite response for: ${filename}`);
    console.dir(response.data, { depth: null });

    const output = response.data?.results?.[0]?.generated_text;

    if (!output || output.trim() === '') {
      return {
        file: path.basename(filename),
        raw_prompt: prompt,
        analysis: '⚠️ Granite returned empty output. Try simplifying the input file.',
      };
    }

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