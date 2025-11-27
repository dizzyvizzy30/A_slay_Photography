# Setup and Development Guide

## AI Photography Coach MVP - Complete Setup Instructions

This guide walks you through setting up the entire project from scratch and running it on your phone.

**Estimated Time**: 1-2 hours
**Difficulty**: Beginner-friendly

---

## Prerequisites

### Required Software

1. **Node.js** (v18 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **npm** (comes with Node.js)
   - Verify: `npm --version`

3. **Code Editor** (VS Code recommended)
   - Download: https://code.visualstudio.com/

4. **Expo Go App** (on your phone)
   - iOS: https://apps.apple.com/app/expo-go/id982107779
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent

### Required Accounts

1. **Anthropic Account** (for Claude API)
   - Sign up: https://console.anthropic.com/
   - Get API key from dashboard

---

## Part 1: Project Setup

### Step 1: Create Project Folder

```bash
# Navigate to your projects directory
cd ~/Desktop

# Create main project folder
mkdir ai-photography-coach-mvp
cd ai-photography-coach-mvp
```

---

## Part 2: Backend Setup

### Step 2: Initialize Backend

```bash
# Create backend folder
mkdir backend
cd backend

# Initialize Node.js project
npm init -y
```

### Step 3: Install Backend Dependencies

```bash
# Install production dependencies
npm install express cors multer @anthropic-ai/sdk dotenv

# Install development dependencies
npm install --save-dev typescript ts-node @types/node @types/express @types/cors @types/multer nodemon
```

### Step 4: Initialize TypeScript

```bash
# Create TypeScript configuration
npx tsc --init
```

Edit `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### Step 5: Create Backend File Structure

```bash
# Create folders
mkdir src
mkdir uploads

# Create source files
touch src/index.ts
touch src/claude.ts
touch src/types.ts
touch .env
touch .env.example
touch .gitignore
```

### Step 6: Configure Environment Variables

Create `.env` file:
```bash
# .env
ANTHROPIC_API_KEY=your_api_key_here
PORT=3000
```

Create `.env.example` (for git):
```bash
# .env.example
ANTHROPIC_API_KEY=sk-ant-xxx...
PORT=3000
```

### Step 7: Create .gitignore

```bash
# .gitignore
node_modules/
dist/
.env
uploads/*.jpg
uploads/*.jpeg
uploads/*.png
*.log
.DS_Store
```

### Step 8: Write Backend Code

**src/types.ts**:
```typescript
export interface AnalyzeRequest {
  prompt: string;
}

export interface AnalyzeResponse {
  success: boolean;
  data?: string;
  error?: string;
}
```

**src/claude.ts**:
```typescript
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
});

export async function analyzePhoto(imagePath: string, userPrompt: string): Promise<string> {
  try {
    // Read image file
    const imageBuffer = await fs.readFile(imagePath);
    const base64Image = imageBuffer.toString('base64');

    // Call Claude API
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

    // Extract text from response
    const textContent = response.content.find(c => c.type === 'text');
    return textContent?.type === 'text' ? textContent.text : 'No response generated';
  } catch (error) {
    console.error('Claude API Error:', error);
    throw new Error('Failed to analyze photo');
  }
}

export async function getCameraSettings(eventType: string, lighting: string, subject: string): Promise<string> {
  try {
    const prompt = `As a professional photography coach, recommend camera settings for:
    Event Type: ${eventType}
    Lighting: ${lighting}
    Subject: ${subject}

    Provide specific recommendations for ISO, aperture, shutter speed, focus mode, and white balance. Explain why each setting is recommended.`;

    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const textContent = response.content.find(c => c.type === 'text');
    return textContent?.type === 'text' ? textContent.text : 'No response generated';
  } catch (error) {
    console.error('Claude API Error:', error);
    throw new Error('Failed to generate camera settings');
  }
}
```

**src/index.ts**:
```typescript
import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import 'dotenv/config';
import { analyzePhoto, getCameraSettings } from './claude';
import { AnalyzeRequest, AnalyzeResponse } from './types';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG images allowed'));
    }
  }
});

// Routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.post('/api/analyze', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    const imagePath = req.file?.path;

    if (!imagePath || !prompt) {
      return res.status(400).json({
        success: false,
        error: 'Image and prompt are required'
      });
    }

    const result = await analyzePhoto(imagePath, prompt);

    res.json({
      success: true,
      data: result
    } as AnalyzeResponse);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze photo'
    } as AnalyzeResponse);
  }
});

app.post('/api/camera-settings', async (req: Request, res: Response) => {
  try {
    const { eventType, lighting, subject } = req.body;

    if (!eventType || !lighting || !subject) {
      return res.status(400).json({
        success: false,
        error: 'Event type, lighting, and subject are required'
      });
    }

    const result = await getCameraSettings(eventType, lighting, subject);

    res.json({
      success: true,
      data: result
    } as AnalyzeResponse);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate camera settings'
    } as AnalyzeResponse);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});
```

### Step 9: Update package.json Scripts

Edit `backend/package.json` and add scripts:
```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

### Step 10: Get Your Anthropic API Key

1. Go to https://console.anthropic.com/
2. Sign in or create account
3. Navigate to API Keys
4. Click "Create Key"
5. Copy the key
6. Paste into `backend/.env` file

### Step 11: Test Backend

```bash
# From backend/ folder
npm run dev
```

You should see:
```
✅ Server running on http://localhost:3000
📡 API available at http://localhost:3000/api
```

Test health endpoint:
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{"status":"ok","message":"Server is running"}
```

---

## Part 3: Mobile App Setup

### Step 12: Create Expo App

```bash
# Go back to project root
cd ..

# Create Expo app
npx create-expo-app mobile

# Navigate to mobile folder
cd mobile
```

### Step 13: Install Mobile Dependencies

```bash
# Install image picker
npx expo install expo-image-picker

# Install axios
npm install axios
```

### Step 14: Get Your Computer's IP Address

**On Mac**:
```bash
ipconfig getifaddr en0
```

**On Windows**:
```bash
ipconfig
```
Look for "IPv4 Address" (e.g., `192.168.1.100`)

**Important**: Write this down! You'll need it in the next step.

### Step 15: Create API Configuration

Create `mobile/api.ts`:
```typescript
import axios from 'axios';

// IMPORTANT: Replace with YOUR computer's IP address
const API_BASE_URL = 'http://192.168.1.100:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export interface AnalyzePhotoParams {
  imageUri: string;
  prompt: string;
}

export async function analyzePhoto({ imageUri, prompt }: AnalyzePhotoParams): Promise<string> {
  const formData = new FormData();

  // Append image
  const filename = imageUri.split('/').pop() || 'photo.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  formData.append('image', {
    uri: imageUri,
    name: filename,
    type,
  } as any);

  // Append prompt
  formData.append('prompt', prompt);

  // Make request
  const response = await api.post('/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data;
}

export async function getCameraSettings(
  eventType: string,
  lighting: string,
  subject: string
): Promise<string> {
  const response = await api.post('/camera-settings', {
    eventType,
    lighting,
    subject,
  });

  return response.data.data;
}
```

### Step 16: Create Main App Component

Replace `mobile/App.tsx` with:
```typescript
import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput, ScrollView, ActivityIndicator, SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { analyzePhoto } from './api';

export default function App() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickImage = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setError(null);
      setResponse('');
    }
  };

  const handleSubmit = async () => {
    if (!imageUri || !prompt) {
      setError('Please select an image and enter a prompt');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await analyzePhoto({ imageUri, prompt });
      setResponse(result);
    } catch (err) {
      console.error(err);
      setError('Failed to get AI response. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Photography Coach</Text>
        <Text style={styles.subtitle}>Your AI-powered photography assistant</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Image Preview */}
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>📷 No photo selected</Text>
          </View>
        )}

        {/* Pick Image Button */}
        <TouchableOpacity style={styles.pickButton} onPress={pickImage}>
          <Text style={styles.buttonText}>📷 Pick Photo from Gallery</Text>
        </TouchableOpacity>

        {/* Prompt Input */}
        <TextInput
          style={styles.input}
          placeholder="What would you like to know about this photo?"
          placeholderTextColor="#999"
          value={prompt}
          onChangeText={setPrompt}
          multiline
          numberOfLines={3}
        />

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, (loading || !imageUri || !prompt) && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading || !imageUri || !prompt}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Get AI Advice →</Text>
          )}
        </TouchableOpacity>

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Analyzing your photo...</Text>
          </View>
        )}

        {/* Error Display */}
        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        {/* Response Display */}
        {response && (
          <View style={styles.responseCard}>
            <Text style={styles.responseLabel}>AI Response:</Text>
            <Text style={styles.responseText}>{response}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#6200EE',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 16,
  },
  emptyState: {
    width: '100%',
    height: 300,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#9E9E9E',
  },
  pickButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#6200EE',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#757575',
  },
  responseCard: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  responseLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  responseText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#212121',
  },
  errorCard: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#F44336',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#C62828',
    textAlign: 'center',
  },
});
```

---

## Part 4: Running the App

### Step 17: Start Backend Server

```bash
# Terminal 1 - In backend/ folder
npm run dev
```

Keep this terminal open.

### Step 18: Start Expo Development Server

```bash
# Terminal 2 - In mobile/ folder
npx expo start
```

You should see a QR code in the terminal.

### Step 19: Run on Your Phone

1. Open **Expo Go** app on your phone
2. Scan the QR code displayed in terminal
3. Wait for app to load
4. App should open on your phone!

---

## Part 5: Testing the App

### Test Flow:

1. **Tap "Pick Photo from Gallery"**
2. **Select a photo** (any photo works for testing)
3. **Enter a prompt** like: "Analyze the lighting in this photo"
4. **Tap "Get AI Advice"**
5. **Wait 5-10 seconds**
6. **See AI response** in green card!

---

## Troubleshooting

### Issue: Mobile app can't connect to backend

**Solution**:
1. Make sure both devices are on same WiFi
2. Check your computer's IP address again
3. Update `API_BASE_URL` in `mobile/api.ts`
4. Restart backend server
5. Reload Expo app (shake phone → Reload)

### Issue: "Network request failed"

**Solution**:
1. Check firewall settings - allow port 3000
2. Verify backend is running (`curl http://localhost:3000/api/health`)
3. Try using your computer's IP instead of localhost

### Issue: Anthropic API error

**Solution**:
1. Verify API key in `backend/.env`
2. Check your API credits at console.anthropic.com
3. Make sure API key has no extra spaces

### Issue: Image upload fails

**Solution**:
1. Check `backend/uploads/` folder exists
2. Verify multer configuration
3. Try smaller image file
4. Check file type (JPEG/PNG only)

### Issue: Expo Go not scanning QR code

**Solution**:
1. Make sure camera permissions are enabled
2. Try typing the URL manually in Expo Go
3. Use `npx expo start --tunnel` for external access

---

## Project Structure Summary

```
ai-photography-coach-mvp/
├── backend/
│   ├── src/
│   │   ├── index.ts          ← Express server
│   │   ├── claude.ts          ← AI integration
│   │   └── types.ts           ← TypeScript types
│   ├── uploads/               ← Uploaded images
│   ├── .env                   ← API key (don't commit!)
│   ├── package.json
│   └── tsconfig.json
│
└── mobile/
    ├── App.tsx                ← Main UI
    ├── api.ts                 ← API client
    ├── app.json               ← Expo config
    └── package.json
```

---

## Next Steps

After successfully running the MVP:

1. **Test different features**: Try camera settings endpoint
2. **Refine prompts**: Improve AI responses
3. **Add more features**: Implement caption generator
4. **Improve UI**: Add styling, animations
5. **Add error handling**: Better user feedback
6. **Deploy backend**: Move to Railway or Render
7. **Build standalone app**: Create production build

---

## Useful Commands Reference

### Backend
```bash
npm run dev          # Start development server
npm run build        # Compile TypeScript
npm start            # Run compiled code
```

### Mobile
```bash
npx expo start       # Start Expo dev server
npx expo start --tunnel  # Use tunnel for external access
npx expo start -c    # Clear cache and start
```

### Debugging
```bash
# Check backend
curl http://localhost:3000/api/health

# Check your IP
ipconfig getifaddr en0  # Mac
ipconfig                # Windows

# View backend logs
# Check Terminal 1 output

# View mobile logs
# Shake phone → "Debug Remote JS"
```

---

## Getting Help

1. **Read error messages carefully** - They usually tell you what's wrong
2. **Check both terminals** - Backend and Expo logs
3. **Console.log debugging** - Add logs to track data flow
4. **Anthropic docs**: https://docs.anthropic.com/
5. **Expo docs**: https://docs.expo.dev/

---

**Congratulations!** 🎉

You now have a working AI Photography Coach MVP running on your phone!

---

**Last Updated**: November 2025
**Document Owner**: Development Team
