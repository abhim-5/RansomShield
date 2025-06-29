// // // 📁 /utils/graniteAnalyzer.js
// // console.log("📦 Granite Analyzer loaded");
// // const axios = require('axios');
// // const path = require('path');
// // const getIAMToken = require('./ibmAuth');

// // const GRANITE_API_URL = 'https://us-south.ml.cloud.ibm.com/ml/v1/text/chat?version=2023-05-29';
// // const GRANITE_MODEL_ID = 'ibm/granite-3-2-8b-instruct';
// // const PROJECT_ID = process.env.IBM_PROJECT_ID;

// // /**
// //  * Builds a clear prompt to evaluate ransomware threat in a file
// //  */
// // function buildRansomwarePrompt(filename, fileContent) {
// //   const safeContent = fileContent.slice(0, 3500);

// //   return `You are a cybersecurity assistant trained to detect ransomware behavior in code.

// // File: ${path.basename(filename)}

// // Analyze the code below and return:

// // 1. A threat score from 1 (low risk) to 10 (very high risk)
// // 2. List of suspicious code patterns
// // 3. Suggestions to mitigate any threats

// // --- Code ---

// // ${safeContent}
// // `;
// // }

// // /**
// //  * Sends the prompt to Granite LLM via IBM Watsonx Chat API
// //  */
// // module.exports = async function analyzeFileWithGranite(filename, codeText) {
// //   const prompt = buildRansomwarePrompt(filename, codeText);

// //   console.log(`\n🚨 Scanning file: ${filename}`);
// //   console.log("📄 Prompt being sent:\n", prompt);

// //   let accessToken;
// //   try {
// //     accessToken = await getIAMToken();
// //     console.log("🔑 Access token obtained: ", accessToken.slice(0, 20) + "...");
// //   } catch (authErr) {
// //     console.error("❌ Failed to get IAM token:", authErr.message);
// //     return {
// //       file: path.basename(filename),
// //       analysis: '❌ Failed to obtain IAM token.',
// //       error: authErr.message
// //     };
// //   }

// //   try {
// //     const requestBody = {
// //       model_id: GRANITE_MODEL_ID,
// //       project_id: PROJECT_ID,
// //       messages: [
// //         {
// //           role: 'system',
// //           content: prompt,
// //         }
// //       ],
// //       temperature: 0.3,
// //       top_p: 1,
// //       max_tokens: 1000,
// //       frequency_penalty: 0,
// //       presence_penalty: 0,
// //       seed: null,
// //       stop: []
// //     };

// //     console.log("📦 Request payload:\n", JSON.stringify(requestBody, null, 2));

// //     const response = await axios.post(GRANITE_API_URL, requestBody, {
// //       headers: {
// //         Authorization: `Bearer ${accessToken}`,
// //         'Content-Type': 'application/json',
// //         Accept: 'application/json',
// //       }
// //     });

// //     console.log("✅ Granite API raw response:");
// //     console.dir(response.data, { depth: null });

// //     const output = response.data?.results?.[0]?.generated_text;

// //     if (!output || output.trim() === '') {
// //       console.warn("⚠️ Granite returned empty output. Possibly due to input formatting or model constraints.");
// //       return {
// //         file: path.basename(filename),
// //         raw_prompt: prompt,
// //         analysis: '⚠️ Granite returned empty output. Try modifying the input file or simplifying it.'
// //       };
// //     }

// //     console.log("🧠 Final AI Output:\n", output);

// //     return {
// //       file: path.basename(filename),
// //       raw_prompt: prompt,
// //       analysis: output
// //     };

// //   } catch (err) {
// //     console.error('❌ Granite API error:', err.response?.data || err.message);
// //     return {
// //       file: path.basename(filename),
// //       analysis: '⚠️ Error calling Granite API',
// //       error: err.response?.data || err.message
// //     };
// //   }
// // };






// // 📁 /utils/graniteAnalyzer.js
// // 🔒 Fake Granite AI Analysis for demo/testing purposes

// const path = require("path");

// /**
//  * Fake threat report generator based on file name
//  * @param {string} filename - The name of the file
//  * @param {string} codeText - The content of the file (not used in mock)
//  * @returns {Promise<Object>} Simulated analysis object
//  */
// module.exports = async function analyzeFileWithGranite(filename, codeText) {
//   const name = path.basename(filename).toLowerCase();

//   let threatScore = 2;
//   let suspicious = ["No significant threat patterns detected."];
//   let suggestions = ["No changes necessary."];

//   if (name.includes("stealer") || name.includes("malware")) {
//     threatScore = 9;
//     suspicious = [
//       "Detected credential harvesting patterns",
//       "Access to browser storage and autofill APIs",
//       "Exfiltration endpoint hardcoded"
//     ];
//     suggestions = [
//       "Block access to sensitive directories",
//       "Use endpoint protection monitoring file behavior",
//       "Add input sanitization and logging"
//     ];
//   } else if (name.includes("encrypt") || codeText.includes("crypto")) {
//     threatScore = 8;
//     suspicious = [
//       "Encryption functions used with no user confirmation",
//       "File overwrite detected",
//       "No error handling on destructive ops"
//     ];
//     suggestions = [
//       "Add confirmation dialogs before encryption/deletion",
//       "Use secure libraries with audit trails",
//       "Prevent overwriting existing files"
//     ];
//   } else if (name.includes(".env") || codeText.includes("DB_PASSWORD")) {
//     threatScore = 7;
//     suspicious = [
//       "Sensitive credentials exposed",
//       "Environment file included in public upload",
//     ];
//     suggestions = [
//       "Never expose .env files in production",
//       "Move credentials to secrets manager"
//     ];
//   }

//   const analysis = `
// 🔒 Threat Score: ${threatScore}

// ❌ Suspicious Patterns:
// ${suspicious.map((item) => `- ${item}`).join("\n")}

// 🛡️ AI Suggestions:
// ${suggestions.map((item) => `- ${item}`).join("\n")}
// `;

//   return {
//     file: path.basename(filename),
//     raw_prompt: "[FAKE_PROMPT] This is a simulated analysis, not real AI output.",
//     analysis: analysis.trim()
//   };
// };