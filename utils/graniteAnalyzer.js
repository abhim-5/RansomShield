// 📁 /utils/graniteAnalyzer.js
// Calls IBM Granite AI to analyze each code/log file for ransomware threats

const axios = require('axios');
const path = require('path');
const getIAMToken = require('./ibmAuth');

const GRANITE_API_URL = 'https://us-south.ml.cloud.ibm.com/ml/v1/text/generation';
const GRANITE_MODEL_ID = 'granite-code-20b-instruct';

/**
 * Builds an AI prompt for file-based ransomware analysis
 * @param {string} filename - Absolute or relative path to file
 * @param {string} fileContent - Code or script content to scan
 * @returns {string} AI-ready prompt
 */
function buildRansomwarePrompt(filename, fileContent) {
  const safeContent = fileContent.slice(0, 4000); // Trim for token limit

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

/**
 * Analyzes a single file using Granite LLM
 * @param {string} filename - File path (for labeling only)
 * @param {string} codeText - Code content to be analyzed
 * @returns {Promise<Object>} JSON result: file, score, flags, tips
 */
module.exports = async function analyzeFileWithGranite(filename, codeText) {
  const prompt = buildRansomwarePrompt(filename, codeText);
  const accessToken = await getIAMToken();

  try {
    const response = await axios.post(
      GRANITE_API_URL,
      {
        model_id: GRANITE_MODEL_ID,
        input: prompt,
        parameters: {
          max_new_tokens: 350,
          decoding_method: 'greedy'
        }
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const output = response.data.generated_text;
    return {
      file: path.basename(filename),
      raw_prompt: prompt,
      analysis: output
    };
  } catch (err) {
    console.error('❌ Granite API error for file', filename, err);
    return {
      file: path.basename(filename),
      analysis: '⚠️ Error calling Granite API',
      error: err.message
    };
  }
};
