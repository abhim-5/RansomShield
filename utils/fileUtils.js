// 📁 /utils/fileUtils.js

const fs = require('fs-extra');
const path = require('path');

/**
 * Allowed extensions for scanning (can be expanded as needed)
 */
const ALLOWED_EXTENSIONS = new Set([
  '.js', '.py', '.java', '.cpp', '.c', '.cs',
  '.log', '.txt', '.json', '.xml', '.sh',
  '.env', '.conf', '.cfg', '.html', '.php'
]);

/**
 * Recursively walk through a directory and collect file paths
 * @param {string} dir - Directory to walk
 * @returns {Promise<string[]>}
 */
async function walkDir(dir) {
  let results = [];

  const list = await fs.readdir(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);

    if (stat && stat.isDirectory()) {
      const subDirFiles = await walkDir(filePath);
      results = results.concat(subDirFiles);
    } else {
      results.push(filePath);
    }
  }

  return results;
}

/**
 * Filters and returns only supported file types from a directory tree
 * @param {string} extractPath - Path to unzipped directory
 * @returns {Promise<string[]>}
 */
async function extractAndFilterFiles(extractPath) {
  const allFiles = await walkDir(extractPath);

  const filtered = allFiles.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ALLOWED_EXTENSIONS.has(ext);
  });

  return filtered;
}

module.exports = {
  extractAndFilterFiles
};