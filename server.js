/**
 * ME Agent SMS Server
 * Receives SMS via Twilio, processes with Claude AI (as Marcos), responds
 */

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const {
  PORT = 3000,
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_FROM,
  ANTHROPIC_API_KEY,
  MARCOS_NUMBER
} = process.env;

// Initialize clients
const app = express();
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

// Twilio sends application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Load system prompt
const systemPrompt = fs.readFileSync(
  path.join(__dirname, 'system_prompt.txt'),
  'utf8'
);

// Simple conversation memory (in production, use Redis or database)
const conversationMemory = new Map();

function getConversationHistory(phoneNumber) {
  if (!conversationMemory.has(phoneNumber)) {
    conversationMemory.set(phoneNumber, []);
  }
  return conversationMemory.get(phoneNumber);
}

function addToHistory(phoneNumber, role, content) {
  const history = getConversationHistory(phoneNumber);
  history.push({ role, content });
  
  // Keep only last 10 messages to stay within context limits
  if (history.length > 10) {
    history.shift();
  }
}

function isMarcos(phoneNumber) {
  if (!phoneNumber || !MARCOS_NUMBER) return false;
  const normalize = (num) => (num || '').replace(/\D/g, '');
  return normalize(phoneNumber) === normalize(MARCOS_NUMBER);
}

async function getMEAgentResponse(fromNumber, messageBody) {
  try {
    // Get conversation history
    const history = getConversationHistory(fromNumber);
    
    // Add context about who's texting
    let contextNote = '';
    if (isMarcos(fromNumber)) {
      contextNote = '\n\nNOTE: This message is from Marcos himself (your own phone number).\n';
    }
    
    // Build messages array
    const messages = [
      ...history,
      {
        role: 'user',
        content: contextNote + messageBody
      }
    ];
    
    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages
    });
    
    const responseText = response.content[0].text;
    
    // Save to history
    addToHistory(fromNumber, 'user', messageBody);
    addToHistory(fromNumber, 'assistant', responseText);
    
    return responseText;
    
  } catch (error) {
    console.error('Claude API error:', error);
    return "Hey, my system hit a snag. Can you text me again in a minute? - Marcos";
  }
}

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    service: 'ME Agent SMS',
    timestamp: new Date().toISOString()
  });
});

// Main SMS webhook
app.post('/sms/inbound', async (req, res) => {
  try {
    const from = req.body.From;
    const body = req.body.Body || '';
    
    console.log(`[SMS] From: ${from}, Message: ${body}`);
    
    // Get ME Agent response
    const responseMessage = await getMEAgentResponse(from, body);
    
    console.log(`[SMS] Response: ${responseMessage}`);
    
    // Create TwiML response
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(responseMessage);
    
    // Send response
    res.type('text/xml');
    res.status(200);
    res.send(twiml.toString());
    
  } catch (error) {
    console.error('Webhook error:', error);
    
    // Send error response
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message("Sorry, something went wrong. Text again in a moment.");
    res.type('text/xml').status(200).send(twiml.toString());
  }
});

// Clear conversation history endpoint (for testing)
app.post('/admin/clear-history/:phone', (req, res) => {
  const phone = req.params.phone;
  conversationMemory.delete(phone);
  res.json({ success: true, message: `Cleared history for ${phone}` });
});

// Start server
app.listen(PORT, () => {
  console.log(`🤖 ME Agent SMS Server running on port ${PORT}`);
  console.log(`📱 Twilio number: ${TWILIO_FROM}`);
  console.log(`👤 Marcos number: ${MARCOS_NUMBER}`);
  console.log(`\nWebhook URL: http://localhost:${PORT}/sms/inbound`);
  console.log(`\nReady to receive messages!`);
});