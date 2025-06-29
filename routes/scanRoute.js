// // 📁 /routes/scanRoute.js

// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs-extra');
// const unzipper = require('unzipper');

// const { extractAndFilterFiles } = require('../utils/fileUtils');
// // const analyzeFileWithGranite = require('../utils/graniteAnalyzer');

// const upload = multer({ dest: 'uploads/' });

// /**
//  * @route POST /api/scan
//  * @desc Handles zip upload → extract → analyze files via Granite AI
//  */
// router.post('/', upload.single('zipfile'), async (req, res) => {
//   const zipPath = req.file?.path;
//   const extractPath = `unzipped/${Date.now()}`;
//   const results = [];

//   try {
//     if (!zipPath) {
//       return res.status(400).json({ success: false, error: 'No file uploaded.' });
//     }

//     console.log(`📦 Received ZIP file at: ${zipPath}`);
//     console.log(`📂 Extracting to: ${extractPath}`);

//     // Step 1: Extract ZIP
//     await fs.createReadStream(zipPath)
//       .pipe(unzipper.Extract({ path: extractPath }))
//       .promise();

//     console.log('✅ ZIP extracted successfully');

//     // Step 2: Filter files
//     const codeFiles = await extractAndFilterFiles(extractPath);
//     console.log(`📑 Filtered ${codeFiles.length} files for analysis:`);

//     codeFiles.forEach(f => console.log('  -', f));

//     if (!codeFiles.length) {
//       throw new Error('No valid code or text files found in archive.');
//     }

//     // Step 3: Analyze each file
//     for (const filePath of codeFiles) {
//       console.log(`🔍 Reading: ${filePath}`);
//       const fileContent = await fs.readFile(filePath, 'utf-8');

//       console.log(`📏 Content length: ${fileContent.length}`);
//       if (!fileContent.trim()) {
//         console.warn(`⚠️ Skipping empty file: ${filePath}`);
//         continue;
//       }

//       const analysis = await analyzeFileWithGranite(filePath, fileContent);
//       results.push(analysis);
//     }

//     // Step 4: Return response
//     console.log('✅ Analysis complete, sending results');
//     res.status(200).json({
//       success: true,
//       totalFiles: results.length,
//       timestamp: new Date().toISOString(),
//       reports: results,
//     });

//   } catch (err) {
//     console.error('❌ Scan error:', err);
//     res.status(500).json({ success: false, error: err.message });
//   } finally {
//     // Step 5: Cleanup
//     if (zipPath) await fs.remove(zipPath);
//     await fs.remove(extractPath);
//   }
// });

// module.exports = router;



// 📁 /routes/scanRoute.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const unzipper = require('unzipper');
const { extractAndFilterFiles } = require('../utils/fileUtils');

const upload = multer({ dest: 'uploads/' });

// Fake analysis generator
function generateFakeReport(filePath) {
  return {
    file: path.basename(filePath),
    analysis: `
Threat Score: 8/10

Suspicious Patterns:
- Detected use of fs.unlinkSync() indicating file deletion
- AES encryption logic found
- No user interaction before file modifications
- Signs of obfuscation and eval()

AI Suggestions:
- Remove automatic file operations
- Avoid encryption without user consent
- Use environment-based configuration
- Log every access and action
    `.trim()
  };
}

router.post('/', upload.single('zipfile'), async (req, res) => {
  const zipPath = req.file?.path;
  const extractPath = `unzipped/${Date.now()}`;
  const results = [];

  try {
    if (!zipPath) {
      return res.status(400).json({ success: false, error: 'No file uploaded.' });
    }

    // Extract zip
    await fs.createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: extractPath }))
      .promise();

    const codeFiles = await extractAndFilterFiles(extractPath);
    if (!codeFiles.length) {
      throw new Error('No valid code files found.');
    }

    // Simulate AI report for each file
    for (const filePath of codeFiles) {
      const report = generateFakeReport(filePath);
      results.push(report);
    }

    res.status(200).json({
      success: true,
      totalFiles: codeFiles.length,
      timestamp: new Date().toISOString(),
      reports: results
    });
  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    if (zipPath) await fs.remove(zipPath);
    await fs.remove(extractPath);
  }
});

module.exports = router;