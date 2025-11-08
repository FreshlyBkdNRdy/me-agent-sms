# Railway Deployment Setup Guide

## Quick Fix for Your Current Issue

Your Railway deployment is likely failing because environment variables aren't set correctly. Follow these steps:

### Step 1: Set Environment Variables in Railway

1. Go to your Railway project dashboard
2. Click on your service (me-agent-sms)
3. Go to the **Variables** tab
4. Add each of these variables:

```
PORT=3000
TWILIO_ACCOUNT_SID=ACef247d623267efe0559119778e7db3b5
TWILIO_AUTH_TOKEN=7e2215f29f865cc81dba8f51a05b3dfa
TWILIO_FROM=+18504701575
MARCOS_NUMBER=+18507762260
ANTHROPIC_API_KEY=sk-ant-api03-dysxHiQfoKWFORfxiYHndhhWTImSP6FJMyS39dU6C0zOBfsOMabL_9h8jlKLF-i8BpwYQD71NsCs7oUkdlNn2Q-1O6vdgA
```

**CRITICAL:** Make sure each variable is on its own line in Railway, entered as:
- Variable name: `TWILIO_ACCOUNT_SID`
- Value: `ACef247d623267efe0559119778e7db3b5`

### Step 2: Configure Twilio Webhook

Once your Railway service is deployed, you'll get a URL like:
```
https://your-service.railway.app
```

1. Go to Twilio Console → Phone Numbers → Manage → Active Numbers
2. Click on your number: **+18504701575**
3. Under "Messaging", set:
   - **A MESSAGE COMES IN**: Webhook
   - **URL**: `https://your-service.railway.app/sms/inbound`
   - **HTTP Method**: POST

### Step 3: Test Your Setup

Send a text to **+18504701575** from your phone. You should get a response!

## Common Issues & Solutions

### Issue: Server crashes on startup
**Cause:** Missing `system_prompt.txt` file or missing environment variables
**Solution:**
- Ensure `system_prompt.txt` exists in your repo
- Verify all environment variables are set in Railway

### Issue: "Cannot POST /sms"
**Cause:** Wrong webhook URL in Twilio
**Solution:** Make sure Twilio webhook is `https://your-service.railway.app/sms/inbound` (not just `/sms`)

### Issue: No response when texting
**Cause:** Railway service isn't running or Twilio webhook not configured
**Solution:**
1. Check Railway logs for errors
2. Verify webhook URL is correct in Twilio
3. Test the health endpoint: `https://your-service.railway.app/health`

### Issue: "Claude API error"
**Cause:** Invalid or missing ANTHROPIC_API_KEY
**Solution:** Verify the API key is correct and has credits

## Security Note

⚠️ **IMPORTANT:** Your Twilio credentials and API keys should NEVER be committed to GitHub. They should only exist in:
- Railway environment variables (production)
- Local `.env` file (development - git ignored)

The `.env.example` file in the repo should only have placeholder values.

## Testing Health Endpoint

Once deployed, visit:
```
https://your-service.railway.app/health
```

You should see:
```json
{
  "status": "ok",
  "service": "ME Agent SMS",
  "timestamp": "2025-11-08T..."
}
```

## Deployment Checklist

- [ ] All environment variables set in Railway
- [ ] `system_prompt.txt` exists in repo
- [ ] Railway service is deployed and running
- [ ] Health endpoint returns 200 OK
- [ ] Twilio webhook configured with Railway URL
- [ ] Test SMS sent and received response

## Next Steps After Deployment

1. Send yourself a test message
2. Check Railway logs to see the message processing
3. Verify the response comes back correctly
4. Test conversation memory by sending multiple messages

Good luck! 🚀
