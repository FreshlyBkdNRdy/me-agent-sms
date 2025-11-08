# FOOLPROOF RAILWAY SETUP - JUST COPY & PASTE

## Part 1: Set Up Railway Environment Variables (5 minutes)

### Step 1: Open Your Railway Project
1. Go to: https://railway.com/project/5134d47b-71f0-44bf-a27a-51f53ed20db5
2. You should see your service listed

### Step 2: Click on the Variables Tab
1. Click on your service (the box that says "me-agent-sms" or similar)
2. Look for a tab that says **"Variables"** at the top
3. Click it

### Step 3: Add Variables ONE BY ONE

**Click "New Variable" and copy/paste these EXACTLY:**

#### Variable 1:
```
Name: PORT
Value: 3000
```

#### Variable 2:
```
Name: TWILIO_ACCOUNT_SID
Value: ACef247d623267efe0559119778e7db3b5
```

#### Variable 3:
```
Name: TWILIO_AUTH_TOKEN
Value: 7e2215f29f865cc81dba8f51a05b3dfa
```

#### Variable 4:
```
Name: TWILIO_FROM
Value: +18504701575
```

#### Variable 5:
```
Name: MARCOS_NUMBER
Value: +18507762260
```

#### Variable 6:
```
Name: ANTHROPIC_API_KEY
Value: sk-ant-api03-dysxHiQfoKWFORfxiYHndhhWTImSP6FJMyS39dU6C0zOBfsOMabL_9h8jlKLF-i8BpwYQD71NsCs7oUkdlNn2Q-1O6vdgA
```

### Step 4: Deploy
Railway should automatically redeploy. Wait for it to finish (you'll see a green checkmark).

### Step 5: Get Your Railway URL
1. In your Railway service, look for "Domains" or "Settings"
2. Find your public URL (looks like: `https://me-agent-sms-production-XXXX.up.railway.app`)
3. **COPY THIS URL** - you'll need it for Twilio

---

## Part 2: Configure Twilio Webhook (2 minutes)

### Step 1: Log into Twilio
Go to: https://console.twilio.com/

### Step 2: Go to Phone Numbers
1. Click **"Phone Numbers"** in the left sidebar
2. Click **"Manage"** → **"Active Numbers"**
3. Click on your number: **+1 850 470 1575**

### Step 3: Configure Messaging
Scroll down to the **"Messaging Configuration"** section.

Under **"A MESSAGE COMES IN"**:
1. Select **"Webhook"** from the dropdown
2. In the URL field, paste: `YOUR_RAILWAY_URL/sms/inbound`

   For example: `https://me-agent-sms-production-XXXX.up.railway.app/sms/inbound`

3. Make sure the dropdown next to it says **"HTTP POST"**

### Step 4: Save
Click **"Save"** at the bottom of the page.

---

## Part 3: TEST IT! 🎉

**Send a text message to: +1 850 470 1575**

Say something like: "Hey, is this working?"

**You should get a response back from your AI agent!**

---

## If Something Goes Wrong

### Check 1: Railway Health Endpoint
Visit this in your browser: `YOUR_RAILWAY_URL/health`

You should see:
```json
{"status":"ok","service":"ME Agent SMS","timestamp":"..."}
```

If you get an error, check Railway logs for what went wrong.

### Check 2: Railway Logs
1. In Railway, click on your service
2. Click the **"Deployments"** or **"Logs"** tab
3. Look for any red error messages

### Check 3: Twilio Debugger
1. Go to: https://console.twilio.com/us1/monitor/logs/debugger
2. Send another test message
3. Look for any error messages

---

## Common Issues

**Issue: "Cannot POST /sms/inbound"**
- Fix: Make sure you added `/sms/inbound` to the end of your Railway URL in Twilio

**Issue: No response at all**
- Fix 1: Check Railway is actually running (green status)
- Fix 2: Double-check all 6 environment variables are set in Railway
- Fix 3: Make sure Twilio webhook URL is correct

**Issue: "Claude API error"**
- Fix: Your ANTHROPIC_API_KEY might be wrong or out of credits
- Check at: https://console.anthropic.com/

---

## That's It!

Literally just:
1. Copy/paste 6 variables into Railway
2. Copy your Railway URL into Twilio webhook
3. Text yourself

You got this! 🚀
