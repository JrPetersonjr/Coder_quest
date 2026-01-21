## DEPLOY TO RENDER (2 Minutes)

### What You Need

✅ Render account (free at render.com)  
✅ Claude API key (from console.anthropic.com/keys)  
✅ Files ready (server.js, package.json, .env.example)  

---

## Step 1: Push Code to GitHub

```bash
cd "h:\AIRLOCK\Choose Your Own Code\LIVE\Quest_For_The_Code_LIVE"

# Initialize git (if not already)
git init
git add server.js package.json .env.example
git commit -m "Add AI backend for Render"
git push origin main
```

---

## Step 2: Create Render Service

1. Go to: https://render.com/dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Choose the repository
5. Fill in settings:

```
Name: technomancer-ai-backend
Environment: Node
Build Command: npm install
Start Command: npm start
```

6. Click "Create Web Service"

---

## Step 3: Add Environment Variable

In Render Dashboard:

1. Go to your service → "Environment"
2. Click "Add Environment Variable"
3. Key: `CLAUDE_API_KEY`
4. Value: `sk-ant-your-actual-key`
5. Click "Save"

---

## Step 4: Deploy

Render auto-deploys when you push to GitHub, or manually:
- Click "Deploy" button in Render dashboard
- Wait ~2 minutes
- You'll get a URL like: `https://technomancer-ai-backend.onrender.com`

---

## Step 5: Connect Game to Backend

In your game's index.html or console:

```javascript
// Tell game to use Render backend
AIConfig.config.backendUrl = 'https://technomancer-ai-backend.onrender.com';
AIConfig.config.useBackend = true;

// Test it
AIConfig.generateContent("lore", "test").then(r => console.log(r));
```

---

## Step 6: Verify It's Working

**Check backend health:**
```
https://technomancer-ai-backend.onrender.com/health
```

Should return:
```json
{
  "status": "healthy",
  "claude_configured": true
}
```

**Test generation:**
```
https://technomancer-ai-backend.onrender.com/api/stats
```

Should show endpoints available.

---

## That's It! 🎉

Your game now:
- ✅ Has protected API key (safe on backend)
- ✅ Works for all players online
- ✅ Never exposes your key
- ✅ Uses Claude Haiku for all AI

---

## Troubleshooting

**Backend not responding?**
- Check Render dashboard for errors
- Verify CLAUDE_API_KEY environment variable is set
- Try manually redeploying

**Game still not using backend?**
- Make sure `AIConfig.config.useBackend = true`
- Check browser console for errors
- Verify backendUrl is correct

**Getting 401 error?**
- CLAUDE_API_KEY might be wrong
- Regenerate key at console.anthropic.com/keys
- Update in Render environment

---

## Render URLs

Your backend will be at:
```
https://technomancer-ai-backend.onrender.com
```

Endpoints:
```
POST  /api/generate      - Raw generation
POST  /api/narrative     - Narrative type
GET   /api/stats        - Server stats
GET   /health           - Health check
```

---

## Cost

**Render:**
- Free tier: 750 hours/month (enough for 24/7)
- No credit card required
- Auto-sleeps after 15 min inactivity (wake on request)

**Claude Haiku:**
- ~$0.80 per 1M input tokens
- ~$4.00 per 1M output tokens
- Roughly $1-5/month for normal gameplay

**Total: Free Render + $1-5/month Claude = ~$5/month for full AI game**

---

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Create Render service
3. ✅ Add CLAUDE_API_KEY env var
4. ✅ Deploy
5. ✅ Test /health endpoint
6. ✅ Update game config
7. ✅ Play with live AI! 🚀

Questions? Check Render docs: https://render.com/docs
