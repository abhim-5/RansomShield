// 📁 /routes/scanRoute.js
// Core route for handling ransomware file scanning with IBM Granite AI

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const unzipper = require('unzipper');

const { extractAndFilterFiles } = require('../utils/fileUtils');
const analyzeFileWithGranite = require('../utils/graniteAnalyzer');

// 🗂️ Multer Storage Setup
const upload = multer({ dest: 'uploads/' });

/**
 * @route POST /api/scan
 * @desc Accepts a ZIP file, extracts contents, filters code files, analyzes each with Granite
 * @access Public
 */
router.post('/', upload.single('zipfile'), async (req, res) => {
  const zipPath = req.file?.path;
  const extractPath = `unzipped/${Date.now()}`;
  const results = [];

  try {
    if (!zipPath) {
      return res.status(400).json({ success: false, error: 'No file uploaded.' });
    }

    // 1. Extract uploaded ZIP file
    await fs.createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: extractPath }))
      .promise();

    // 2. Get valid files to scan
    const codeFiles = await extractAndFilterFiles(extractPath);

    if (!codeFiles.length) {
      throw new Error('No valid code or log files found inside the ZIP.');
    }

    // 3. Analyze each file using Granite
    for (const filePath of codeFiles) {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const analysis = await analyzeFileWithGranite(filePath, fileContent);
      results.push(analysis);
    }

    // 4. Send structured result back
    res.status(200).json({
      success: true,
      totalFiles: codeFiles.length,
      timestamp: new Date().toISOString(),
      reports: results
    });
  } catch (err) {
    console.error('❌ Error during file scan:', err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    // 5. Cleanup uploaded + extracted files
    if (zipPath) await fs.remove(zipPath);
    await fs.remove(extractPath);
  }
});

module.exports = router;
