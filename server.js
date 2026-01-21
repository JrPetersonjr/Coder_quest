// ============================================================
// AI BACKEND SERVER - For Render Deployment
// Simple proxy to Claude API with protected key
// ============================================================

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Configuration
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_MODEL = 'claude-3-5-haiku-20241022';
const PORT = process.env.PORT || 3000;

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
    
    if (error.response?.status === 401) {
      return res.status(401).json({ 
        error: 'Authentication failed - check CLAUDE_API_KEY'
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
      message: error.message
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
    endpoints: [
      'POST /api/generate',
      'POST /api/narrative',
      'GET /api/stats',
      'GET /health'
    ]
  });
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
  console.log(`[AI Backend] Endpoints:`);
  console.log(`  - POST /api/generate - Raw generation`);
  console.log(`  - POST /api/narrative - Narrative generation`);
  console.log(`  - GET /api/stats - Server status`);
  console.log(`  - GET /health - Health check`);
});
