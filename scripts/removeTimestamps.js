/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

/**
 * Recursively find all HTML files in a directory
 * @param {String} dir - Directory to search
 * @param {Array} fileList - Accumulated file list
 * @returns {Array} Array of file paths
 */
function findHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findHtmlFiles(filePath, fileList);
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Remove timestamp from HTML file content
 * @param {String} content - HTML file content
 * @returns {String} Modified content
 */
function removeTimestamp(content) {
  // Remove the timestamp text "at YYYY-MM-DDTHH:MM:SS.SSSZ"
  return content.replace(/\s*at \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/g, '');
}

/**
 * Main function to process all HTML files in coverage folder
 */
function main() {
  const coverageDir = path.join(__dirname, '..', 'coverage');

  if (!fs.existsSync(coverageDir)) {
    console.log('Coverage folder not found. Skipping timestamp removal.');
    return;
  }

  const htmlFiles = findHtmlFiles(coverageDir);

  if (htmlFiles.length === 0) {
    console.log('No HTML files found in coverage folder.');
    return;
  }

  let filesModified = 0;

  htmlFiles.forEach((file) => {
    try {
      let content = fs.readFileSync(file, 'utf8');
      const originalContent = content;

      content = removeTimestamp(content);

      if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        filesModified += 1;
      }
    } catch (error) {
      console.error(`Error processing file ${file}:`, error.message);
    }
  });

  console.log(`Removed timestamps from ${filesModified} file(s).`);
  console.log('✅ Coverage report ready at coverage/index.html!');
}

main();
