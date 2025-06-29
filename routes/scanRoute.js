// 📁 /routes/scanRoute.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const unzipper = require('unzipper');

const { extractAndFilterFiles } = require('../utils/fileUtils');
const analyzeFileWithGranite = require('../utils/graniteAnalyzer');

const upload = multer({ dest: 'uploads/' });

/**
 * @route POST /api/scan
 * @desc Handles zip upload → extract → analyze files via Granite AI
 */
router.post('/', upload.single('zipfile'), async (req, res) => {
  const zipPath = req.file?.path;
  const extractPath = `unzipped/${Date.now()}`;
  const results = [];

  try {
    if (!zipPath) {
      return res.status(400).json({ success: false, error: 'No file uploaded.' });
    }

    // Step 1: Unzip the uploaded file
    await fs.createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: extractPath }))
      .promise();

    // Step 2: Filter valid code/log/email files
    const codeFiles = await extractAndFilterFiles(extractPath);
    if (!codeFiles.length) {
      throw new Error('No valid code or text files found in archive.');
    }

    // Step 3: Analyze each file via Granite
    for (const filePath of codeFiles) {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const analysis = await analyzeFileWithGranite(filePath, fileContent);
      results.push(analysis);
    }

    // Step 4: Send structured output
    res.status(200).json({
      success: true,
      totalFiles: codeFiles.length,
      timestamp: new Date().toISOString(),
      reports: results,
    });
  } catch (err) {
    console.error('❌ Scan error:', err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    // Step 5: Cleanup
    if (zipPath) await fs.remove(zipPath);
    await fs.remove(extractPath);
  }
});

module.exports = router;