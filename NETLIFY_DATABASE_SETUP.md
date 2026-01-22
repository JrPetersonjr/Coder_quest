# 🗂️ NETLIFY DATABASE FUNCTIONS SETUP

## 📋 **REQUIRED NETLIFY FUNCTIONS**

Create these files in your Netlify project under `netlify/functions/`:

### 1. 🎤 **Voice Cache Function** (`voice-cache.js`)

```javascript
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/technomancer';
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedDb = client.db();
  return cachedDb;
}

exports.handler = async (event, context) => {
  const { httpMethod, path, queryStringParameters, body } = event;
  
  try {
    const db = await connectToDatabase();
    const voiceCollection = db.collection('voice_cache');
    
    switch (httpMethod) {
      case 'POST':
        if (path.includes('/store')) {
          const { characterName, voiceData, timestamp, source } = JSON.parse(body);
          
          await voiceCollection.replaceOne(
            { characterName },
            {
              characterName,
              voiceData,
              timestamp,
              source,
              popularity: 1,
              lastAccessed: Date.now()
            },
            { upsert: true }
          );
          
          return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ success: true })
          };
        }
        
        if (path.includes('/popularity')) {
          const { cacheKey } = JSON.parse(body);
          
          await voiceCollection.updateOne(
            { characterName: cacheKey },
            { 
              $inc: { popularity: 1 },
              $set: { lastAccessed: Date.now() }
            }
          );
          
          return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ success: true })
          };
        }
        break;
        
      case 'GET':
        if (path.includes('/retrieve')) {
          const { key } = queryStringParameters;
          
          const voice = await voiceCollection.findOne({ characterName: key });
          
          return {
            statusCode: voice ? 200 : 404,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(voice)
          };
        }
        
        if (path.includes('/popular')) {
          const limit = parseInt(queryStringParameters.limit) || 20;
          
          const popularVoices = await voiceCollection
            .find({})
            .sort({ popularity: -1, lastAccessed: -1 })
            .limit(limit)
            .toArray();
          
          return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(popularVoices)
          };
        }
        break;
    }
    
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
  
  return {
    statusCode: 404,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: 'Not found' })
  };
};
```

### 2. 💾 **User Data Function** (`user-data.js`)

```javascript
const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedDb = client.db();
  return cachedDb;
}

function getUserFromToken(token) {
  if (!token || token === 'anonymous') return { userId: 'anonymous' };
  
  try {
    return jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
  } catch {
    return { userId: 'anonymous' };
  }
}

exports.handler = async (event, context) => {
  const { httpMethod, path, headers, body } = event;
  const auth = headers.authorization;
  const user = getUserFromToken(auth);
  
  try {
    const db = await connectToDatabase();
    const userDataCollection = db.collection('user_data');
    
    switch (httpMethod) {
      case 'POST':
        if (path.includes('/save')) {
          const { userData } = JSON.parse(body);
          
          await userDataCollection.replaceOne(
            { userId: user.userId },
            {
              userId: user.userId,
              userData,
              lastSaved: Date.now()
            },
            { upsert: true }
          );
          
          return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ success: true })
          };
        }
        break;
        
      case 'GET':
        if (path.includes('/load')) {
          const userDoc = await userDataCollection.findOne({ userId: user.userId });
          
          return {
            statusCode: userDoc ? 200 : 404,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userDoc?.userData || null)
          };
        }
        break;
    }
    
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
  
  return {
    statusCode: 404,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: 'Not found' })
  };
};
```

### 3. 🎭 **Character Cache Function** (`character-cache.js`)

```javascript
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedDb = client.db();
  return cachedDb;
}

exports.handler = async (event, context) => {
  const { httpMethod, path, queryStringParameters, body } = event;
  
  try {
    const db = await connectToDatabase();
    const characterCollection = db.collection('character_cache');
    
    switch (httpMethod) {
      case 'POST':
        if (path.includes('/store')) {
          const { character, timestamp, source } = JSON.parse(body);
          
          await characterCollection.replaceOne(
            { 'character.name': character.name },
            {
              character,
              timestamp,
              source,
              popularity: 1
            },
            { upsert: true }
          );
          
          return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ success: true })
          };
        }
        break;
        
      case 'GET':
        if (path.includes('/retrieve')) {
          const { name } = queryStringParameters;
          
          const character = await characterCollection.findOne({ 
            'character.name': name 
          });
          
          return {
            statusCode: character ? 200 : 404,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(character)
          };
        }
        break;
    }
    
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
  
  return {
    statusCode: 404,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: 'Not found' })
  };
};
```

### 4. 🔐 **Authentication Function** (`auth.js`)

```javascript
const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedDb = client.db();
  return cachedDb;
}

exports.handler = async (event, context) => {
  const { httpMethod, path, body } = event;
  
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');
    
    switch (httpMethod) {
      case 'POST':
        if (path.includes('/login')) {
          const { username, password } = JSON.parse(body);
          
          const user = await usersCollection.findOne({ username });
          
          if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign(
              { userId: user._id, username: user.username },
              JWT_SECRET,
              { expiresIn: '7d' }
            );
            
            return {
              statusCode: 200,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                token,
                userId: user._id,
                username: user.username,
                expiry: Date.now() + (7 * 24 * 60 * 60 * 1000)
              })
            };
          }
          
          return {
            statusCode: 401,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Invalid credentials' })
          };
        }
        
        if (path.includes('/register')) {
          const { username, password, email } = JSON.parse(body);
          
          const existingUser = await usersCollection.findOne({ username });
          if (existingUser) {
            return {
              statusCode: 409,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ error: 'Username already exists' })
            };
          }
          
          const hashedPassword = await bcrypt.hash(password, 10);
          const newUser = await usersCollection.insertOne({
            username,
            password: hashedPassword,
            email,
            createdAt: Date.now()
          });
          
          const token = jwt.sign(
            { userId: newUser.insertedId, username },
            JWT_SECRET,
            { expiresIn: '7d' }
          );
          
          return {
            statusCode: 201,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token,
              userId: newUser.insertedId,
              username,
              expiry: Date.now() + (7 * 24 * 60 * 60 * 1000)
            })
          };
        }
        break;
    }
    
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
  
  return {
    statusCode: 404,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: 'Not found' })
  };
};
```

### 5. ❤️ **Health Check Function** (`health.js`)

```javascript
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'healthy',
      timestamp: Date.now(),
      service: 'Technomancer Database API'
    })
  };
};
```

## 🔧 **Environment Variables**

Add these to your Netlify environment:

```
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/technomancer
JWT_SECRET=your-super-secret-jwt-key-here
```

## 📦 **Package.json for Functions**

```json
{
  "dependencies": {
    "mongodb": "^6.0.0",
    "jsonwebtoken": "^9.0.0",
    "bcrypt": "^5.1.0"
  }
}
```

## 🚀 **Deployment Steps**

1. **Create Netlify Site**: Deploy your game to Netlify
2. **Set Up MongoDB**: Create a free MongoDB Atlas cluster
3. **Add Functions**: Upload the function files to `netlify/functions/`
4. **Configure Environment**: Add MongoDB URI and JWT secret
5. **Test**: Use the health endpoint to verify connectivity

## 💾 **Database Collections**

- **`voice_cache`**: Stores trained voice profiles for sharing
- **`user_data`**: Persistent user game saves and login data  
- **`character_cache`**: Generated characters for multi-agentic content
- **`users`**: User authentication and account data

## 🎯 **Benefits**

✅ **Shared Voice Library**: Users access pre-trained voices instantly  
✅ **Persistent Login**: No more resetting authentication  
✅ **Character Sharing**: AI-generated characters available to all  
✅ **Reduced Overhead**: No need to run multiple models locally  
✅ **Scalable Architecture**: Supports thousands of concurrent users  

This creates a **shared content ecosystem** where one player's AI-generated content benefits everyone!