#!/usr/bin/env node

/**
 * Script to update the API URL in the frontend
 * Usage: node update-api-url.js https://your-backend-url.com
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('\n❌ Error: Please provide your backend URL');
  console.log('\nUsage:');
  console.log('  node update-api-url.js https://your-backend-url.com');
  console.log('\nExample:');
  console.log('  node update-api-url.js https://luna-backend.onrender.com');
  console.log('');
  process.exit(1);
}

let backendUrl = args[0];

// Remove trailing slash if present
if (backendUrl.endsWith('/')) {
  backendUrl = backendUrl.slice(0, -1);
}

// Add /api if not present
const apiUrl = backendUrl.endsWith('/api') ? backendUrl : `${backendUrl}/api`;

// Validate URL
try {
  new URL(apiUrl);
} catch (e) {
  console.log('\n❌ Error: Invalid URL format');
  console.log('Please provide a valid URL starting with http:// or https://');
  console.log('');
  process.exit(1);
}

// Update the api.js file
const apiFilePath = path.join(__dirname, 'frontend', 'src', 'services', 'api.js');

try {
  let content = fs.readFileSync(apiFilePath, 'utf8');
  
  // Replace the BASE_URL line
  const regex = /const BASE_URL = ['"`].*?['"`];/;
  const newLine = `const BASE_URL = '${apiUrl}';`;
  
  if (regex.test(content)) {
    content = content.replace(regex, newLine);
    fs.writeFileSync(apiFilePath, content, 'utf8');
    
    console.log('\n✅ Success! API URL updated');
    console.log(`\n📍 New API URL: ${apiUrl}`);
    console.log('\n📝 Updated file: frontend/src/services/api.js');
    console.log('\n🚀 Next steps:');
    console.log('  1. Test the backend URL in your browser:');
    console.log(`     ${backendUrl}/health`);
    console.log('  2. Build your APK:');
    console.log('     cd frontend');
    console.log('     eas build -p android --profile preview');
    console.log('');
  } else {
    console.log('\n⚠️  Warning: Could not find BASE_URL in api.js');
    console.log('Please update it manually in: frontend/src/services/api.js');
    console.log('');
  }
} catch (error) {
  console.log('\n❌ Error updating file:', error.message);
  console.log('');
  process.exit(1);
}
