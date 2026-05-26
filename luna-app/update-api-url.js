/**
 * Run this script to update the backend API URL before building:
 * node update-api-url.js https://your-backend.onrender.com
 */
const fs = require('fs');
const path = require('path');

const newUrl = process.argv[2];
if (!newUrl) {
  console.error('Usage: node update-api-url.js https://your-backend-url.com');
  process.exit(1);
}

const apiFile = path.join(__dirname, 'frontend/src/services/api.js');
let content = fs.readFileSync(apiFile, 'utf8');

content = content.replace(
  /const BASE_URL = ['"`].*['"`];/,
  `const BASE_URL = '${newUrl}/api';`
);

fs.writeFileSync(apiFile, content);
console.log(`✅ API URL updated to: ${newUrl}/api`);
