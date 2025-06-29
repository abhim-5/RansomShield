// 📁 /utils/fileUtils.js
// Utility to extract and filter valid code/log files for analysis

const fs = require('fs-extra');
const path = require('path');

// 📜 Define valid file extensions to analyze
const VALID_EXTENSIONS = ['.js', '.ts', '.py', '.sh', '.log', '.env', '.html', '.json', '.yml', '.yaml'];

/**
 * Recursively walks through a directory and returns paths of all valid files
 * @param {string} dirPath - Root directory to start walking
 * @param {Array} fileList - Aggregator array
 * @returns {Promise<string[]>} Array of full file paths
 */
async function walkDirectory(dirPath, fileList = []) {
  const entries = await fs.readdir(dirPath);

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry);
    const stat = await fs.stat(fullPath);

    if (stat.isDirectory()) {
      await walkDirectory(fullPath, fileList); // Recurse
    } else {
      const ext = path.extname(fullPath).toLowerCase();
      if (VALID_EXTENSIONS.includes(ext)) {
        fileList.push(fullPath);
      }
    }
  }
  return fileList;
}

/**
 * Extract and return all valid file paths in a directory for AI analysis
 * @param {string} extractPath - Path to extracted/unzipped directory
 * @returns {Promise<string[]>} Valid files to analyze
 */
async function extractAndFilterFiles(extractPath) {
  try {
    const validFiles = await walkDirectory(extractPath);
    return validFiles;
  } catch (err) {
    console.error('❌ File filtering error:', err);
    throw new Error('Failed to extract and filter valid files.');
  }
}

module.exports = { extractAndFilterFiles };
