#!/usr/bin/env node
require('dotenv').config();
const twilio = require('twilio');

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_FROM
} = process.env;

console.log('Testing Twilio credentials...\n');
console.log('Account SID:', TWILIO_ACCOUNT_SID);
console.log('Auth Token:', TWILIO_AUTH_TOKEN ? '***' + TWILIO_AUTH_TOKEN.slice(-4) : 'MISSING');
console.log('Phone:', TWILIO_FROM);
console.log('');

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

async function test() {
  try {
    console.log('Fetching phone numbers from your account...');
    const phoneNumbers = await client.incomingPhoneNumbers.list({ limit: 5 });

    console.log('\n✅ Authentication successful!\n');
    console.log('Phone numbers in your account:');
    phoneNumbers.forEach(num => {
      console.log(`  - ${num.phoneNumber} (${num.friendlyName || 'No name'})`);
    });

  } catch (error) {
    console.error('\n❌ Authentication failed!');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('\nThis means your TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN is incorrect.');
    console.error('Get the correct values from: https://console.twilio.com/');
  }
}

test();
