#!/usr/bin/env node

/**
 * Configuration Update Script
 * 
 * This script helps you easily update the backend URL across all configuration files.
 * 
 * Usage:
 * node scripts/update-config.js <new-backend-url>
 * 
 * Example:
 * node scripts/update-config.js https://new-backend-url.onrender.com
 */

const fs = require('fs');
const path = require('path');

// Get the new URL from command line arguments
const newBackendUrl = process.argv[2];

if (!newBackendUrl) {
  console.error('❌ Please provide a new backend URL');
  console.log('Usage: node scripts/update-config.js <new-backend-url>');
  console.log('Example: node scripts/update-config.js https://new-backend-url.onrender.com');
  process.exit(1);
}

// Validate URL format
if (!newBackendUrl.startsWith('http://') && !newBackendUrl.startsWith('https://')) {
  console.error('❌ Invalid URL format. URL must start with http:// or https://');
  process.exit(1);
}

// Remove trailing slash if present
const cleanUrl = newBackendUrl.replace(/\/$/, '');

console.log(`🔄 Updating backend URL to: ${cleanUrl}`);

// Files to update
const filesToUpdate = [
  {
    path: 'src/config/constants.js',
    patterns: [
      {
        search: /BASE_URL: ['"`][^'"`]*['"`]/,
        replace: `BASE_URL: '${cleanUrl}'`
      },
      {
        search: /API_BASE_URL: ['"`][^'"`]*['"`]/,
        replace: `API_BASE_URL: '${cleanUrl}'`
      }
    ]
  },
  {
    path: 'netlify.toml',
    patterns: [
      {
        search: /VITE_API_URL = ['"`][^'"`]*['"`]/,
        replace: `VITE_API_URL = "${cleanUrl}"`
      }
    ]
  },
  {
    path: 'DEPLOYMENT.md',
    patterns: [
      {
        search: /https:\/\/s85-moksh-capstone-skillbridge\.onrender\.com/g,
        replace: cleanUrl
      }
    ]
  },
  {
    path: 'DEPLOYMENT_CHECKLIST.md',
    patterns: [
      {
        search: /https:\/\/s85-moksh-capstone-skillbridge\.onrender\.com/g,
        replace: cleanUrl
      }
    ]
  }
];

// Update each file
let successCount = 0;
let errorCount = 0;

filesToUpdate.forEach(fileConfig => {
  const filePath = path.join(process.cwd(), fileConfig.path);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${fileConfig.path}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    fileConfig.patterns.forEach(pattern => {
      if (pattern.search.test(content)) {
        content = content.replace(pattern.search, pattern.replace);
        updated = true;
      }
    });

    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${fileConfig.path}`);
      successCount++;
    } else {
      console.log(`ℹ️  No changes needed: ${fileConfig.path}`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${fileConfig.path}:`, error.message);
    errorCount++;
  }
});

// Summary
console.log('\n📊 Update Summary:');
console.log(`✅ Successfully updated: ${successCount} files`);
if (errorCount > 0) {
  console.log(`❌ Errors: ${errorCount} files`);
}

if (successCount > 0) {
  console.log('\n🎉 Configuration updated successfully!');
  console.log('\n📝 Next steps:');
  console.log('1. Review the changes in the updated files');
  console.log('2. Test your application with the new URL');
  console.log('3. Update your deployment environment variables if needed');
  console.log('4. Commit and push your changes');
} else {
  console.log('\n⚠️  No files were updated. Please check the URL format and try again.');
} 