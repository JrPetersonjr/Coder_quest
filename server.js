// ============================================================
// AI BACKEND SERVER - For Render Deployment
// Simple proxy to Claude API with protected key
// ============================================================

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Configuration
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';  // Updated to latest model
const PORT = process.env.PORT || 3000;

// TTS Provider API Keys (optional - enables neural TTS)
const AZURE_TTS_KEY = process.env.AZURE_TTS_KEY;
const AZURE_TTS_REGION = process.env.AZURE_TTS_REGION || 'eastus';
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

// ============================================================
// USER DATABASE (In-memory with file persistence)
// In production, use a real database (PostgreSQL, MongoDB, etc.)
// ============================================================
const DATA_DIR = process.env.DATA_DIR || './data';
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load users from file
let users = {};
try {
  if (fs.existsSync(USERS_FILE)) {
    users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    console.log(`[Database] Loaded ${Object.keys(users).length} users`);
  }
} catch (e) {
  console.log('[Database] Starting with empty user database');
}

// Save users to file (debounced)
let saveTimer = null;
function saveUsers() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
      console.log('[Database] Users saved to disk');
    } catch (e) {
      console.error('[Database] Failed to save users:', e.message);
    }
  }, 1000);
}

// Hash password
function hashPassword(password, salt = null) {
  salt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

// Verify password
function verifyPassword(password, salt, hash) {
  const result = hashPassword(password, salt);
  return result.hash === hash;
}

// Generate session token
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// ============================================================
// USER ENDPOINTS
// ============================================================

// Check if username is available
app.post('/api/user/check-name', (req, res) => {
  const { username } = req.body;
  
  if (!username) {
    return res.status(400).json({ error: 'Username required' });
  }

  const normalized = username.toLowerCase().trim();
  const available = !users[normalized];

  res.json({ 
    available,
    username: normalized
  });
});

// Register new user
app.post('/api/user/register', (req, res) => {
  const { username, password, characterClass, stats } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username and password required' });
  }

  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ success: false, error: 'Username must be 3-20 characters' });
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({ success: false, error: 'Username can only contain letters, numbers, and underscores' });
  }

  if (password.length < 4) {
    return res.status(400).json({ success: false, error: 'Password must be at least 4 characters' });
  }

  const normalized = username.toLowerCase().trim();

  // Check if username exists
  if (users[normalized]) {
    return res.status(409).json({ success: false, error: 'Username already taken' });
  }

  // Hash password
  const { salt, hash } = hashPassword(password);

  // Generate token
  const token = generateToken();

  // Create user
  users[normalized] = {
    username: username.trim(),  // Preserve original case for display
    passwordHash: hash,
    passwordSalt: salt,
    token: token,
    tokenExpiry: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    characterClass: characterClass || 'codeweaver',
    stats: stats || { hp: 50, mp: 50 },
    gameState: {
      level: 1,
      experience: 0,
      hp: stats?.hp || 50,
      maxHp: stats?.hp || 50,
      mp: stats?.mp || 50,
      maxMp: stats?.mp || 50,
      zone: 'intro',
      inventory: [],
      spells: [],
      quests: [],
      introComplete: false
    }
  };

  // Save to disk
  saveUsers();

  console.log(`[User] Registered: ${username} (${characterClass})`);

  res.json({
    success: true,
    token: token,
    username: username.trim(),
    message: 'Account created successfully'
  });
});

// Login
app.post('/api/user/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username and password required' });
  }

  const normalized = username.toLowerCase().trim();
  const user = users[normalized];

  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid username or password' });
  }

  // Verify password
  if (!verifyPassword(password, user.passwordSalt, user.passwordHash)) {
    return res.status(401).json({ success: false, error: 'Invalid username or password' });
  }

  // Generate new token
  const token = generateToken();
  user.token = token;
  user.tokenExpiry = Date.now() + (30 * 24 * 60 * 60 * 1000);
  user.lastLogin = new Date().toISOString();
  saveUsers();

  console.log(`[User] Login: ${user.username}`);

  res.json({
    success: true,
    token: token,
    username: user.username,
    characterClass: user.characterClass,
    stats: user.stats,
    gameState: user.gameState
  });
});

// Verify token (for auto-login)
app.post('/api/user/verify', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, error: 'Token required' });
  }

  // Find user with this token
  const user = Object.values(users).find(u => u.token === token && u.tokenExpiry > Date.now());

  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }

  res.json({
    success: true,
    username: user.username,
    characterClass: user.characterClass,
    stats: user.stats,
    gameState: user.gameState
  });
});

// Get save data
app.get('/api/user/save/:username', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const normalized = req.params.username.toLowerCase();
  const user = users[normalized];

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  // Verify token
  if (!token || user.token !== token) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  res.json({
    success: true,
    username: user.username,
    characterClass: user.characterClass,
    stats: user.stats,
    gameState: user.gameState,
    lastSaved: user.lastSaved || user.lastLogin
  });
});

// Save game data
app.post('/api/user/save', (req, res) => {
  const { token, gameState } = req.body;

  if (!token || !gameState) {
    return res.status(400).json({ success: false, error: 'Token and gameState required' });
  }

  // Find user with this token
  const user = Object.values(users).find(u => u.token === token);

  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }

  // Update game state
  user.gameState = { ...user.gameState, ...gameState };
  user.lastSaved = new Date().toISOString();
  saveUsers();

  console.log(`[User] Save: ${user.username}`);

  res.json({
    success: true,
    message: 'Game saved',
    lastSaved: user.lastSaved
  });
});

// ============================================================
// HEALTH CHECK
// ============================================================
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    claude_configured: !!CLAUDE_API_KEY
  });
});

// ============================================================
// GENERATE ENDPOINT
// Main endpoint for game AI requests
// ============================================================
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, systemPrompt = null, maxTokens = 256, temperature = 0.7 } = req.body;

    // Validate input
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!CLAUDE_API_KEY) {
      return res.status(500).json({ 
        error: 'Claude API key not configured on server',
        hint: 'Set CLAUDE_API_KEY environment variable'
      });
    }

    // Build request to Claude
    const messages = [
      { 
        role: 'user', 
        content: prompt 
      }
    ];

    const requestBody = {
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      temperature: temperature,
      messages: messages
    };

    // Add system prompt if provided
    if (systemPrompt) {
      requestBody.system = systemPrompt;
    }

    // Call Claude API
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        timeout: 30000
      }
    );

    // Extract response
    const text = response.data.content[0].text;

    res.json({
      success: true,
      response: text,
      model: CLAUDE_MODEL,
      usage: {
        input_tokens: response.data.usage.input_tokens,
        output_tokens: response.data.usage.output_tokens
      }
    });

  } catch (error) {
    console.error('[ERROR] Generation failed:', error.message);
    console.error('[ERROR] Full error:', error.response?.data || error);
    
    if (error.response?.status === 401) {
      return res.status(401).json({ 
        error: 'Authentication failed - check CLAUDE_API_KEY'
      });
    }

    if (error.response?.status === 404) {
      return res.status(404).json({ 
        error: 'Model not found or API endpoint invalid',
        model: CLAUDE_MODEL,
        hint: 'Check if model name is valid or API key has access to this model'
      });
    }

    if (error.response?.status === 429) {
      return res.status(429).json({ 
        error: 'Rate limited - please try again later',
        retry_after: error.response.headers['retry-after']
      });
    }

    res.status(500).json({
      error: 'Generation failed',
      message: error.message,
      details: error.response?.data?.error || null
    });
  }
});

// ============================================================
// NARRATIVE ENDPOINT
// Specialized for game narrative generation
// ============================================================
app.post('/api/narrative', async (req, res) => {
  try {
    const { type = 'discovery', context = '', gameState = {} } = req.body;

    // System prompts for different narrative types
    const prompts = {
      discovery: `You are a mysterious presence communicating through ancient terminals. 
        The player is starting to remember fragments of their identity.
        Generate a short, cryptic email (2-3 sentences) that hints at their true nature.
        Stay mysterious. Use metaphors.`,
      
      boss_intro: `You are a warning system detecting approaching danger.
        Generate an ominous alert message (2-3 sentences) about an incoming boss encounter.
        Create dread and anticipation.`,
      
      mentor: `You are Dr. Kessler, a mentor reaching through time.
        Generate an encouraging email (2-3 sentences) acknowledging the player's progress.
        Build trust. Hint at larger secrets.`,
      
      restoration: `You are the awakening world itself.
        Generate an excited message (2-3 sentences) about a terminal coming back online.
        Show life and energy returning.`,
      
      mystery: `You are an unknown presence.
        Generate a cryptic, sparse message (1-2 sentences) asking mysterious questions.
        Reference "others like them".`
    };

    const systemPrompt = prompts[type] || prompts.discovery;
    const prompt = context || 'Generate a message.';

    // Call generate endpoint
    const response = await axios.post('http://localhost:' + PORT + '/api/generate', {
      prompt: prompt,
      systemPrompt: systemPrompt,
      maxTokens: 200,
      temperature: 0.8
    });

    res.json({
      success: true,
      type: type,
      narrative: response.data.response,
      usage: response.data.usage
    });

  } catch (error) {
    console.error('[ERROR] Narrative generation failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// STATS ENDPOINT
// Check API usage and server status
// ============================================================
app.get('/api/stats', (req, res) => {
  res.json({
    server_status: 'running',
    uptime: process.uptime(),
    claude_configured: !!CLAUDE_API_KEY,
    model: CLAUDE_MODEL,
    tts_enabled: !!(AZURE_TTS_KEY || ELEVENLABS_API_KEY),
    registered_users: Object.keys(users).length,
    endpoints: [
      'POST /api/generate',
      'POST /api/narrative',
      'POST /api/user/register',
      'POST /api/user/login',
      'POST /api/user/verify',
      'POST /api/user/save',
      'GET /api/user/save/:username',
      'POST /api/tts/synthesize',
      'GET /api/tts/status',
      'GET /api/stats',
      'GET /health'
    ]
  });
});

// ============================================================
// TTS STATUS ENDPOINT
// Check if neural TTS is available
// ============================================================
app.get('/api/tts/status', (req, res) => {
  res.json({
    enabled: !!(AZURE_TTS_KEY || ELEVENLABS_API_KEY),
    providers: {
      azure: !!AZURE_TTS_KEY,
      elevenlabs: !!ELEVENLABS_API_KEY
    },
    defaultProvider: AZURE_TTS_KEY ? 'azure' : (ELEVENLABS_API_KEY ? 'elevenlabs' : null)
  });
});

// ============================================================
// TTS SYNTHESIZE ENDPOINT
// Generate speech audio from text/SSML
// ============================================================
app.post('/api/tts/synthesize', async (req, res) => {
  try {
    const { text, ssml, provider = 'azure', options = {} } = req.body;

    if (!text && !ssml) {
      return res.status(400).json({ error: 'Text or SSML is required' });
    }

    // Route to appropriate TTS provider
    let audioBuffer;

    if (provider === 'azure' && AZURE_TTS_KEY) {
      audioBuffer = await synthesizeAzure(text, ssml, options);
    } else if (provider === 'elevenlabs' && ELEVENLABS_API_KEY) {
      audioBuffer = await synthesizeElevenLabs(text, options);
    } else {
      // No TTS configured
      return res.status(503).json({ 
        error: 'TTS not configured',
        hint: 'Set AZURE_TTS_KEY or ELEVENLABS_API_KEY environment variables'
      });
    }

    // Return audio as binary
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length
    });
    res.send(audioBuffer);

  } catch (error) {
    console.error('[TTS ERROR]', error.message);
    res.status(500).json({ 
      error: 'TTS synthesis failed',
      message: error.message 
    });
  }
});

// ============================================================
// AZURE NEURAL TTS
// ============================================================
async function synthesizeAzure(text, ssml, options = {}) {
  const voice = options.voice || 'en-US-JennyNeural';
  
  // Use SSML if provided, otherwise wrap text in basic SSML
  const speechData = ssml || `
    <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
      <voice name="${voice}">
        ${text}
      </voice>
    </speak>
  `;

  const response = await axios.post(
    `https://${AZURE_TTS_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
    speechData,
    {
      headers: {
        'Ocp-Apim-Subscription-Key': AZURE_TTS_KEY,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3'
      },
      responseType: 'arraybuffer',
      timeout: 30000
    }
  );

  return Buffer.from(response.data);
}

// ============================================================
// ELEVENLABS TTS
// ============================================================
async function synthesizeElevenLabs(text, options = {}) {
  const voiceId = options.voice_id || 'EXAVITQu4vr4xnSDxMaL';  // Sarah voice
  const modelId = options.model_id || 'eleven_monolingual_v1';

  const response = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      text: text,
      model_id: modelId,
      voice_settings: {
        stability: options.stability || 0.5,
        similarity_boost: options.similarity_boost || 0.75
      }
    },
    {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      responseType: 'arraybuffer',
      timeout: 30000
    }
  );

  return Buffer.from(response.data);
}

// ============================================================
// GENERATE SSML WITH CLAUDE
// Have Claude generate emotional SSML for dialogue
// ============================================================
app.post('/api/tts/generate-ssml', async (req, res) => {
  try {
    const { text, character = 'oracle', context = '' } = req.body;

    if (!CLAUDE_API_KEY) {
      return res.status(503).json({ error: 'Claude API not configured' });
    }

    const systemPrompt = `You are an SSML generator for a fantasy RPG game's text-to-speech system.
Convert the given dialogue into expressive SSML for Azure Neural TTS.

Rules:
- Use the <mstts:express-as> tag with appropriate style (calm, sad, angry, cheerful, terrified, whispering, newscast)
- Use <prosody> for rate and pitch adjustments
- Add <break> tags for dramatic pauses
- Keep the original text meaning intact
- Output ONLY the SSML, no explanation

Character: ${character}
Context: ${context}

Available styles: calm, cheerful, sad, angry, terrified, whispering, friendly, hopeful`;

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: CLAUDE_MODEL,
        max_tokens: 500,
        system: systemPrompt,
        messages: [{ role: 'user', content: `Convert to SSML: "${text}"` }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      }
    );

    res.json({
      success: true,
      ssml: response.data.content[0].text,
      original: text
    });

  } catch (error) {
    console.error('[SSML ERROR]', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// ERROR HANDLING
// ============================================================
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    endpoints: [
      'POST /api/generate',
      'POST /api/narrative',
      'GET /api/stats',
      'GET /health'
    ]
  });
});

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, () => {
  console.log(`[AI Backend] Server running on port ${PORT}`);
  console.log(`[AI Backend] Claude API: ${CLAUDE_API_KEY ? 'Configured ✓' : 'NOT configured ✗'}`);
  console.log(`[AI Backend] Model: ${CLAUDE_MODEL}`);
  console.log(`[AI Backend] TTS Providers:`);
  console.log(`  - Azure TTS: ${AZURE_TTS_KEY ? 'Configured ✓' : 'Not configured'}`);
  console.log(`  - ElevenLabs: ${ELEVENLABS_API_KEY ? 'Configured ✓' : 'Not configured'}`);
  console.log(`[AI Backend] Endpoints:`);
  console.log(`  - POST /api/generate - Raw generation`);
  console.log(`  - POST /api/narrative - Narrative generation`);
  console.log(`  - POST /api/tts/synthesize - Neural TTS`);
  console.log(`  - POST /api/tts/generate-ssml - Claude SSML generation`);
  console.log(`  - GET /api/tts/status - TTS availability`);
  console.log(`  - GET /api/stats - Server status`);
  console.log(`  - GET /health - Health check`);
});
