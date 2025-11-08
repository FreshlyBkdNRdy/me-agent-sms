#!/usr/bin/env node
/**
 * ONE COMMAND SETUP - Just run this and paste your Railway URL
 */

require('dotenv').config();
const twilio = require('twilio');
const readline = require('readline');

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_FROM
} = process.env;

async function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

async function setup() {
  console.log('🚀 ONE-STEP TWILIO SETUP\n');
  console.log('I just need your Railway URL and I\'ll handle the rest.\n');

  const url = await askQuestion('Paste your Railway URL here: ');

  const cleanUrl = url.trim().replace(/\/+$/, ''); // Remove trailing slashes

  if (!cleanUrl.startsWith('http')) {
    console.error('\n❌ That doesn\'t look like a URL. It should start with https://');
    process.exit(1);
  }

  console.log(`\n✅ Got it: ${cleanUrl}`);
  console.log('\n🔧 Configuring Twilio...\n');

  const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  const webhookUrl = `${cleanUrl}/sms/inbound`;

  try {
    // Get all phone numbers
    const phoneNumbers = await client.incomingPhoneNumbers.list();

    // Find our number
    const ourNumber = phoneNumbers.find(num =>
      num.phoneNumber === TWILIO_FROM ||
      num.phoneNumber.replace(/\D/g, '') === TWILIO_FROM.replace(/\D/g, '')
    );

    if (!ourNumber) {
      console.error(`❌ Could not find ${TWILIO_FROM} in your Twilio account`);
      process.exit(1);
    }

    // Update the webhook
    await client.incomingPhoneNumbers(ourNumber.sid)
      .update({
        smsUrl: webhookUrl,
        smsMethod: 'POST'
      });

    console.log('✅ DONE! Twilio webhook configured!\n');
    console.log('=' .repeat(60));
    console.log('📱 Phone: ' + TWILIO_FROM);
    console.log('🌐 Webhook: ' + webhookUrl);
    console.log('=' .repeat(60));
    console.log('\n🎉 Text ' + TWILIO_FROM + ' to test it!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

setup();
