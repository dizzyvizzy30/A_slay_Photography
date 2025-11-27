# Application Architecture Documentation

## AI Photography Coach MVP - System Design and Structure

This document describes the application architecture, file structure, and how different components interact.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     User's Phone                        │
│  ┌────────────────────────────────────────────────┐    │
│  │         Expo Mobile App (React Native)         │    │
│  │  - UI Components (screens, buttons, inputs)    │    │
│  │  - Image Picker (select photos from gallery)   │    │
│  │  - API Client (axios)                          │    │
│  └─────────────────┬──────────────────────────────┘    │
└────────────────────┼───────────────────────────────────┘
                     │
                     │ HTTP/HTTPS
                     │ WiFi Network (Same Network)
                     │
┌────────────────────▼───────────────────────────────────┐
│               Your Computer (Localhost)                 │
│  ┌────────────────────────────────────────────────┐    │
│  │       Express.js Backend API (Node.js)         │    │
│  │  - REST API Endpoints                          │    │
│  │  - File Upload Handler (multer)                │    │
│  │  - Image Storage (local /uploads folder)       │    │
│  │  - Claude API Integration                      │    │
│  └─────────────────┬──────────────────────────────┘    │
└────────────────────┼───────────────────────────────────┘
                     │
                     │ HTTPS API Call
                     │
┌────────────────────▼───────────────────────────────────┐
│              Anthropic Claude API                       │
│  ┌────────────────────────────────────────────────┐    │
│  │         Claude 3.5 Sonnet Model                │    │
│  │  - Image Analysis (Vision)                     │    │
│  │  - Text Generation                             │    │
│  │  - Photography Recommendations                 │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## Request Flow Diagram

### Example: User Uploads Photo for Setup Analysis

```
1. User Action
   │
   ├─> Mobile App: User selects photo from gallery
   │
   ├─> Mobile App: expo-image-picker returns image URI
   │
   ├─> Mobile App: User enters prompt "Analyze my setup"
   │
   ├─> Mobile App: User taps "Get AI Advice" button
   │
2. API Request
   │
   ├─> Mobile App: Create FormData with image + prompt
   │
   ├─> Mobile App: axios sends POST to http://192.168.1.100:3000/api/analyze
   │
3. Backend Processing
   │
   ├─> Backend: multer receives file upload
   │
   ├─> Backend: Save image to ./uploads/12345-photo.jpg
   │
   ├─> Backend: Read image file, convert to base64
   │
   ├─> Backend: Call Claude API with image + prompt
   │
4. AI Processing
   │
   ├─> Claude API: Analyze image (lighting, composition, setup)
   │
   ├─> Claude API: Generate recommendations
   │
   ├─> Claude API: Return response text
   │
5. Response
   │
   ├─> Backend: Receive Claude response
   │
   ├─> Backend: Send JSON response to mobile app
   │
   ├─> Mobile App: Display AI recommendations to user
   │
   └─> Mobile App: User sees advice on screen
```

---

## Project File Structure

### Complete Directory Layout

```
ai-photography-coach-mvp/
│
├── backend/                           # Backend API Server
│   ├── src/                           # Source code
│   │   ├── index.ts                   # Main server entry point
│   │   ├── routes.ts                  # API route definitions
│   │   ├── claude.ts                  # Claude AI integration
│   │   ├── types.ts                   # TypeScript interfaces
│   │   └── utils/                     # Helper functions
│   │       ├── imageProcessor.ts      # Image handling utilities
│   │       └── validators.ts          # Input validation
│   │
│   ├── uploads/                       # Uploaded images (gitignored)
│   │   └── .gitkeep                   # Keep folder in git
│   │
│   ├── .env                           # Environment variables (gitignored)
│   ├── .env.example                   # Example env file (committed)
│   ├── .gitignore                     # Git ignore rules
│   ├── package.json                   # Dependencies
│   ├── tsconfig.json                  # TypeScript configuration
│   └── README.md                      # Backend documentation
│
├── mobile/                            # Mobile App (Expo)
│   ├── App.tsx                        # Main app component
│   ├── api.ts                         # API client configuration
│   │
│   ├── components/                    # Reusable UI components (optional)
│   │   ├── ImageUploader.tsx          # Image picker component
│   │   ├── PromptInput.tsx            # Text input component
│   │   └── ResponseCard.tsx           # Display AI response
│   │
│   ├── constants/                     # App constants
│   │   └── config.ts                  # API URL, settings
│   │
│   ├── types/                         # TypeScript types
│   │   └── index.ts                   # Shared type definitions
│   │
│   ├── assets/                        # Images, fonts, icons
│   │   ├── icon.png                   # App icon
│   │   └── splash.png                 # Splash screen
│   │
│   ├── app.json                       # Expo configuration
│   ├── package.json                   # Dependencies
│   ├── tsconfig.json                  # TypeScript config
│   ├── .gitignore                     # Git ignore rules
│   └── README.md                      # Mobile app documentation
│
└── docs/                              # Documentation
    ├── 01_technology_stack.md         # This file
    ├── 02_libraries_and_dependencies.md
    ├── 03_application_architecture.md
    ├── 04_database_storage.md
    ├── 05_ui_design.md
    ├── 06_features_functionality.md
    ├── 07_setup_guide.md
    └── gpt_requirements.md            # Original requirements
```

---

## Backend Architecture

### Layer Breakdown

```
┌─────────────────────────────────────────────────┐
│              HTTP Request Layer                 │
│  - Express.js middleware                        │
│  - CORS handling                                │
│  - Body parsing                                 │
│  - File upload (multer)                         │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│              Routing Layer                      │
│  - Route definitions                            │
│  - Request validation                           │
│  - Error handling                               │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│           Business Logic Layer                  │
│  - Image processing                             │
│  - Prompt engineering                           │
│  - Response formatting                          │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│          External Services Layer                │
│  - Claude API client                            │
│  - File system operations                       │
└─────────────────────────────────────────────────┘
```

### Backend File Responsibilities

#### `src/index.ts` - Main Server

```typescript
/**
 * Responsibilities:
 * - Initialize Express app
 * - Configure middleware (CORS, body-parser)
 * - Mount routes
 * - Start HTTP server
 * - Error handling
 */

import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import routes from './routes';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

#### `src/routes.ts` - API Endpoints

```typescript
/**
 * Responsibilities:
 * - Define API endpoints
 * - Handle HTTP requests
 * - Input validation
 * - Call business logic
 * - Return responses
 */

import { Router } from 'express';
import multer from 'multer';
import { analyzePhoto, getCameraSettings, generateCaption } from './claude';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// POST /api/analyze - Analyze photo setup
router.post('/analyze', upload.single('image'), async (req, res) => {
  const { prompt } = req.body;
  const imagePath = req.file?.path;

  const result = await analyzePhoto(imagePath, prompt);
  res.json({ success: true, data: result });
});

// POST /api/camera-settings - Get camera recommendations
router.post('/camera-settings', async (req, res) => {
  const { eventType, lighting, subject } = req.body;

  const settings = await getCameraSettings(eventType, lighting, subject);
  res.json({ success: true, data: settings });
});

// POST /api/caption - Generate Instagram caption
router.post('/caption', upload.single('image'), async (req, res) => {
  const { style, mood } = req.body;
  const imagePath = req.file?.path;

  const caption = await generateCaption(imagePath, style, mood);
  res.json({ success: true, data: caption });
});

export default router;
```

#### `src/claude.ts` - AI Integration

```typescript
/**
 * Responsibilities:
 * - Initialize Claude client
 * - Format prompts for photography use cases
 * - Make API calls to Claude
 * - Process and return responses
 * - Handle errors
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export async function analyzePhoto(imagePath: string, userPrompt: string) {
  // Read image and convert to base64
  const imageBuffer = await fs.readFile(imagePath);
  const base64Image = imageBuffer.toString('base64');

  // Create Claude message
  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/jpeg',
            data: base64Image
          }
        },
        {
          type: 'text',
          text: `As a professional photography coach, ${userPrompt}`
        }
      ]
    }]
  });

  return response.content[0].text;
}
```

---

## Mobile App Architecture

### Component Hierarchy

```
App.tsx (Root)
│
├─── Screen Container (SafeAreaView)
│    │
│    ├─── Header
│    │    └─── Title "AI Photography Coach"
│    │
│    ├─── Main Content (ScrollView)
│    │    │
│    │    ├─── Image Uploader Component
│    │    │    ├─── Button: "Pick Photo"
│    │    │    └─── Image Preview
│    │    │
│    │    ├─── Prompt Input Component
│    │    │    └─── TextInput: "Ask anything..."
│    │    │
│    │    ├─── Action Button
│    │    │    └─── Button: "Get AI Advice"
│    │    │
│    │    └─── Response Display Component
│    │         ├─── Loading Indicator
│    │         └─── AI Response Text
│    │
│    └─── Footer (Optional)
```

### Mobile App File Responsibilities

#### `App.tsx` - Main Component

```typescript
/**
 * Responsibilities:
 * - App layout and structure
 * - State management (useState)
 * - Image picker integration
 * - API calls to backend
 * - Display results
 */

import React, { useState } from 'react';
import { View, Button, TextInput, Text, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { analyzePhoto } from './api';

export default function App() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!imageUri || !prompt) return;

    setLoading(true);
    try {
      const result = await analyzePhoto(imageUri, prompt);
      setResponse(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Button title="Pick Photo" onPress={pickImage} />
      {imageUri && <Image source={{ uri: imageUri }} />}

      <TextInput
        placeholder="Ask anything..."
        value={prompt}
        onChangeText={setPrompt}
      />

      <Button
        title="Get AI Advice"
        onPress={handleSubmit}
        disabled={loading || !imageUri || !prompt}
      />

      {loading && <Text>Loading...</Text>}
      {response && <Text>{response}</Text>}
    </View>
  );
}
```

#### `api.ts` - API Client

```typescript
/**
 * Responsibilities:
 * - Configure axios instance
 * - Define API endpoints
 * - Handle request/response
 * - Error handling
 */

import axios from 'axios';

// IMPORTANT: Replace with your computer's IP address
const API_BASE_URL = 'http://192.168.1.100:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export async function analyzePhoto(imageUri: string, prompt: string) {
  const formData = new FormData();

  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'photo.jpg',
  } as any);

  formData.append('prompt', prompt);

  const response = await api.post('/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data;
}
```

---

## Data Flow Patterns

### Pattern 1: Image Upload and Analysis

```
[Mobile App]
    │
    ├─ 1. User selects image → expo-image-picker
    │
    ├─ 2. Get image URI → file://path/to/image.jpg
    │
    ├─ 3. User enters prompt → "Analyze lighting"
    │
    ├─ 4. Create FormData → { image: File, prompt: string }
    │
    ├─ 5. POST to /api/analyze → axios
    │
    ▼
[Backend API]
    │
    ├─ 6. Receive multipart request → multer
    │
    ├─ 7. Save file to uploads/ → ./uploads/123.jpg
    │
    ├─ 8. Read file → fs.readFile()
    │
    ├─ 9. Convert to base64 → Buffer.toString('base64')
    │
    ├─ 10. Call Claude API → client.messages.create()
    │
    ▼
[Claude API]
    │
    ├─ 11. Process image with Vision API
    │
    ├─ 12. Generate text response
    │
    ├─ 13. Return response → { content: [...] }
    │
    ▼
[Backend API]
    │
    ├─ 14. Extract text from response
    │
    ├─ 15. Format JSON response → { success: true, data: "..." }
    │
    ├─ 16. Send to mobile app
    │
    ▼
[Mobile App]
    │
    ├─ 17. Receive response → axios response
    │
    ├─ 18. Update state → setResponse(...)
    │
    └─ 19. Display to user → <Text>{response}</Text>
```

---

## Network Configuration

### Local Development Setup

```
┌──────────────────────────────────────────┐
│         WiFi Router (192.168.1.1)        │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │  Your Computer                   │   │
│  │  IP: 192.168.1.100              │   │
│  │  Backend: http://192.168.1.100:3000   │
│  └──────────────────────────────────┘   │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │  Your Phone (Expo Go)            │   │
│  │  IP: 192.168.1.101              │   │
│  │  Connects to: 192.168.1.100:3000│   │
│  └──────────────────────────────────┘   │
└──────────────────────────────────────────┘
```

### Important Network Notes

1. **Same WiFi Required**: Both devices must be on the same network
2. **Firewall**: Ensure your computer's firewall allows incoming connections on port 3000
3. **IP Address**: Use your computer's local IP, NOT `localhost` or `127.0.0.1`
4. **Port**: Backend runs on port 3000, Expo Metro on port 8081 (separate)

---

## State Management

### For MVP: Simple useState

```typescript
// Mobile App State
const [imageUri, setImageUri] = useState<string | null>(null);
const [prompt, setPrompt] = useState<string>('');
const [response, setResponse] = useState<string>('');
const [loading, setLoading] = useState<boolean>(false);
const [error, setError] = useState<string | null>(null);
```

### Future: Advanced State Management

When the app grows:
- **Zustand**: Lightweight global state
- **Redux Toolkit**: Complex state with many features
- **React Context**: Share data across components

---

## Error Handling Strategy

### Backend Error Handling

```typescript
// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});
```

### Mobile Error Handling

```typescript
try {
  const result = await analyzePhoto(imageUri, prompt);
  setResponse(result);
} catch (error) {
  setError('Failed to get AI response. Please try again.');
  console.error(error);
}
```

---

## Security Architecture

### Current (MVP)

- ✅ CORS enabled for all origins (development only)
- ✅ API key stored in .env (server-side)
- ✅ File type validation in multer
- ❌ No authentication
- ❌ No rate limiting

### Future (Production)

- JWT authentication
- Rate limiting per user
- CORS restricted to specific origins
- Input sanitization
- File size limits
- HTTPS only

---

## Scalability Considerations

### Current MVP Limitations

- Single server process
- In-memory data (no persistence)
- Local file storage
- No caching
- No load balancing

### Future Improvements

1. **Database**: Add PostgreSQL for data persistence
2. **Cloud Storage**: Move to S3 for images
3. **Caching**: Add Redis for frequently requested data
4. **Horizontal Scaling**: Deploy multiple server instances
5. **CDN**: Serve static assets via CDN
6. **Message Queue**: Handle AI requests asynchronously

---

**Last Updated**: November 2025
**Document Owner**: Development Team
