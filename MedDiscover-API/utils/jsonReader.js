const fs = require('fs').promises;

async function readJson(filePath) {
  try {
    const fileContents = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContents);
  } catch (error) {
    throw new Error(`Unable to read or parse JSON file at ${filePath}: ${error.message}`);
  }
}

module.exports = { readJson };
