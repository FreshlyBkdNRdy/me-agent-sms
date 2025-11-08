#!/usr/bin/env node
/**
 * Automatically configure Twilio webhook for SMS
 */

require('dotenv').config();
const twilio = require('twilio');

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_FROM
} = process.env;

async function setupWebhook(deploymentUrl) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM) {
    console.error('❌ Missing Twilio credentials in environment variables');
    process.exit(1);
  }

  const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

  // The webhook URL
  const webhookUrl = `${deploymentUrl}/sms/inbound`;

  console.log(`🔧 Setting up Twilio webhook...`);
  console.log(`📱 Phone number: ${TWILIO_FROM}`);
  console.log(`🌐 Webhook URL: ${webhookUrl}`);

  try {
    // Get all phone numbers
    const phoneNumbers = await client.incomingPhoneNumbers.list();

    // Find our phone number
    const ourNumber = phoneNumbers.find(num =>
      num.phoneNumber === TWILIO_FROM ||
      num.phoneNumber.replace(/\D/g, '') === TWILIO_FROM.replace(/\D/g, '')
    );

    if (!ourNumber) {
      console.error(`❌ Could not find phone number ${TWILIO_FROM} in your Twilio account`);
      console.log('\n📋 Available numbers:');
      phoneNumbers.forEach(num => console.log(`   - ${num.phoneNumber}`));
      process.exit(1);
    }

    console.log(`✅ Found phone number: ${ourNumber.phoneNumber}`);

    // Update the webhook
    await client.incomingPhoneNumbers(ourNumber.sid)
      .update({
        smsUrl: webhookUrl,
        smsMethod: 'POST'
      });

    console.log(`\n✅ SUCCESS! Webhook configured!`);
    console.log(`\n📝 Configuration:`);
    console.log(`   Phone: ${ourNumber.phoneNumber}`);
    console.log(`   Webhook: ${webhookUrl}`);
    console.log(`   Method: POST`);
    console.log(`\n🎉 You can now text ${TWILIO_FROM} to test!`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) {
      console.error(`   Code: ${error.code}`);
    }
    process.exit(1);
  }
}

// Get deployment URL from command line or try to detect it
const deploymentUrl = process.argv[2];

if (!deploymentUrl) {
  console.error('❌ Please provide your Railway deployment URL');
  console.error('\nUsage:');
  console.error('  node setup-twilio-webhook.js <your-railway-url>');
  console.error('\nExample:');
  console.error('  node setup-twilio-webhook.js https://me-agent-sms-production-abc123.up.railway.app');
  process.exit(1);
}

// Validate URL format
if (!deploymentUrl.startsWith('http')) {
  console.error('❌ URL must start with http:// or https://');
  process.exit(1);
}

setupWebhook(deploymentUrl);
