#!/usr/bin/env node
/**
 * Try to find the Railway deployment URL by testing health endpoint
 */

const https = require('https');

// Common Railway URL patterns based on project structure
const possibleUrls = [
  'https://me-agent-sms-production.up.railway.app',
  'https://web-production.up.railway.app',
  'https://me-agent-sms.up.railway.app',
];

console.log('🔍 Searching for your Railway deployment URL...\n');

async function testUrl(url) {
  return new Promise((resolve) => {
    const healthUrl = `${url}/health`;
    https.get(healthUrl, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 && data.includes('ME Agent SMS')) {
          resolve({ url, success: true, data });
        } else {
          resolve({ url, success: false });
        }
      });
    }).on('error', () => {
      resolve({ url, success: false });
    });

    setTimeout(() => resolve({ url, success: false }), 5000);
  });
}

async function findDeploymentUrl() {
  console.log('Testing possible URLs:');

  for (const url of possibleUrls) {
    process.stdout.write(`   ${url} ... `);
    const result = await testUrl(url);

    if (result.success) {
      console.log('✅ FOUND!\n');
      console.log('=' .repeat(60));
      console.log('🎉 Your Railway URL is:');
      console.log(`   ${url}`);
      console.log('=' .repeat(60));
      console.log('\nNow run:');
      console.log(`   node setup-twilio-webhook.js ${url}\n`);
      return url;
    } else {
      console.log('❌');
    }
  }

  console.log('\n⚠️  Could not auto-detect URL.');
  console.log('\nPlease manually get your Railway URL:');
  console.log('1. Go to: https://railway.com/project/5134d47b-71f0-44bf-a27a-51f53ed20db5');
  console.log('2. Click on your service');
  console.log('3. Find the public URL in Settings or Deployments');
  console.log('4. Run: node setup-twilio-webhook.js <your-url>\n');

  return null;
}

findDeploymentUrl();
