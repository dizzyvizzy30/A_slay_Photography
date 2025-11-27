# Libraries and Dependencies Documentation

## AI Photography Coach MVP - Complete Package List

This document provides detailed information about all libraries and dependencies used in the project.

---

## Backend Dependencies

### Core Framework

#### express
- **Version**: ^4.18.0
- **Purpose**: Web application framework for Node.js
- **Usage**: HTTP server, routing, middleware
- **Why**: Lightweight, flexible, perfect for REST APIs
- **Documentation**: https://expressjs.com/

```bash
npm install express
```

---

### TypeScript Support

#### typescript
- **Version**: ^5.3.0
- **Purpose**: TypeScript compiler
- **Usage**: Compile TypeScript to JavaScript
- **Why**: Type safety across the application

#### ts-node
- **Version**: ^10.9.0
- **Purpose**: TypeScript execution engine
- **Usage**: Run TypeScript files directly without compilation
- **Why**: Faster development workflow

#### @types/node
- **Version**: ^20.10.0
- **Purpose**: TypeScript type definitions for Node.js
- **Usage**: Type safety for Node.js APIs
- **Why**: Better IDE support and error checking

#### @types/express
- **Version**: ^4.17.0
- **Purpose**: TypeScript type definitions for Express
- **Usage**: Type safety for Express APIs
- **Why**: Autocomplete and type checking for Express

```bash
npm install --save-dev typescript ts-node @types/node @types/express
```

---

### HTTP and Networking

#### cors
- **Version**: ^2.8.5
- **Purpose**: Cross-Origin Resource Sharing middleware
- **Usage**: Allow mobile app to make requests to backend
- **Why**: Required for mobile-to-server communication
- **Configuration**:
  ```typescript
  app.use(cors({
    origin: '*', // For local development
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }));
  ```

#### @types/cors
- **Version**: ^2.8.0
- **Purpose**: TypeScript types for cors
- **Usage**: Type safety for cors configuration

```bash
npm install cors
npm install --save-dev @types/cors
```

---

### File Upload Handling

#### multer
- **Version**: ^1.4.5
- **Purpose**: Middleware for handling multipart/form-data
- **Usage**: Handle image uploads from mobile app
- **Why**: Industry standard for file uploads in Express
- **Features**:
  - File size limits
  - File type filtering
  - Custom storage destinations
  - Multiple file uploads

#### @types/multer
- **Version**: ^1.4.0
- **Purpose**: TypeScript types for multer
- **Usage**: Type safety for file upload handling

**Example Configuration**:
```typescript
import multer from 'multer';

const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed'));
    }
  }
});
```

```bash
npm install multer
npm install --save-dev @types/multer
```

---

### AI Integration

#### @anthropic-ai/sdk
- **Version**: ^0.17.0
- **Purpose**: Official Anthropic Claude API SDK
- **Usage**: Communicate with Claude AI for image analysis and text generation
- **Why**: Official SDK with best support and features
- **Features**:
  - Message API support
  - Vision API for image analysis
  - Streaming responses
  - Type-safe TypeScript SDK
- **Documentation**: https://docs.anthropic.com/

**Example Usage**:
```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

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
          data: imageBase64
        }
      },
      {
        type: 'text',
        text: 'Analyze this photo setup and suggest camera settings'
      }
    ]
  }]
});
```

```bash
npm install @anthropic-ai/sdk
```

---

### Environment Variables

#### dotenv
- **Version**: ^16.3.0
- **Purpose**: Load environment variables from .env file
- **Usage**: Store API keys and configuration securely
- **Why**: Keep secrets out of code
- **Usage**:
  ```typescript
  import 'dotenv/config';
  const apiKey = process.env.ANTHROPIC_API_KEY;
  ```

```bash
npm install dotenv
```

---

### Development Tools

#### nodemon
- **Version**: ^3.0.0
- **Purpose**: Auto-restart server on file changes
- **Usage**: Development workflow
- **Why**: Faster development, no manual restarts
- **Configuration** (package.json):
  ```json
  {
    "scripts": {
      "dev": "nodemon --exec ts-node src/index.ts"
    }
  }
  ```

```bash
npm install --save-dev nodemon
```

---

## Mobile App Dependencies

### Core Framework

#### expo
- **Version**: ~50.0.0
- **Purpose**: React Native development platform
- **Usage**: Build and run the mobile app
- **Why**: Best developer experience for React Native
- **Includes**:
  - React Native
  - Metro bundler
  - Native module APIs
  - Development server

```bash
npx create-expo-app mobile
```

---

### React and React Native

#### react
- **Version**: 18.2.0
- **Purpose**: UI library
- **Usage**: Build user interfaces with components
- **Why**: Industry standard, huge ecosystem

#### react-native
- **Version**: 0.73.0
- **Purpose**: Mobile app framework
- **Usage**: Native mobile components
- **Why**: Cross-platform mobile development

**Note**: These are installed automatically with Expo

---

### Image Handling

#### expo-image-picker
- **Version**: ~14.7.0
- **Purpose**: Access device photo library and camera
- **Usage**: Let users select photos to upload
- **Why**: Official Expo package, well-maintained
- **Features**:
  - Photo library access
  - Camera access
  - Image cropping
  - Multiple image selection
  - Configurable quality

**Example Usage**:
```typescript
import * as ImagePicker from 'expo-image-picker';

const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (!result.canceled) {
    return result.assets[0].uri;
  }
};
```

```bash
npx expo install expo-image-picker
```

---

### HTTP Client

#### axios
- **Version**: ^1.6.0
- **Purpose**: HTTP client for API requests
- **Usage**: Send requests to backend API
- **Why**: Better than fetch, supports upload progress
- **Features**:
  - Promise-based
  - Request/response interceptors
  - Upload progress tracking
  - Automatic JSON parsing
  - Error handling

**Example Usage**:
```typescript
import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.100:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Upload image
const uploadImage = async (uri: string, prompt: string) => {
  const formData = new FormData();
  formData.append('image', {
    uri,
    type: 'image/jpeg',
    name: 'photo.jpg'
  } as any);
  formData.append('prompt', prompt);

  const response = await api.post('/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
};
```

```bash
npm install axios
```

---

### UI Components (Optional)

#### react-native-paper
- **Version**: ^5.11.0
- **Purpose**: Material Design components for React Native
- **Usage**: Pre-built UI components (buttons, inputs, cards)
- **Why**: Fast UI development, consistent design
- **When to Use**: If you want ready-made components
- **Features**:
  - Material Design 3
  - Theming support
  - Accessibility built-in
  - TypeScript support

**Example Components**:
```typescript
import { Button, TextInput, Card } from 'react-native-paper';

<Card>
  <Card.Title title="AI Photography Coach" />
  <Card.Content>
    <TextInput
      label="Ask anything..."
      mode="outlined"
      value={prompt}
      onChangeText={setPrompt}
    />
    <Button mode="contained" onPress={handleSubmit}>
      Get AI Advice
    </Button>
  </Card.Content>
</Card>
```

```bash
npm install react-native-paper
```

---

## Development Dependencies (Both Projects)

### Code Quality

#### eslint
- **Version**: ^8.54.0
- **Purpose**: JavaScript/TypeScript linter
- **Usage**: Enforce code quality standards
- **Why**: Catch bugs, maintain consistency

#### prettier
- **Version**: ^3.1.0
- **Purpose**: Code formatter
- **Usage**: Auto-format code
- **Why**: Consistent code style

```bash
npm install --save-dev eslint prettier
```

---

## Complete Package.json Files

### Backend package.json

```json
{
  "name": "ai-photography-coach-backend",
  "version": "1.0.0",
  "description": "AI Photography Coach Backend API",
  "main": "src/index.ts",
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "multer": "^1.4.5-lts.1",
    "@anthropic-ai/sdk": "^0.17.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "ts-node": "^10.9.2",
    "@types/node": "^20.10.6",
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/multer": "^1.4.11",
    "nodemon": "^3.0.2"
  }
}
```

### Mobile package.json

```json
{
  "name": "ai-photography-coach-mobile",
  "version": "1.0.0",
  "main": "node_modules/expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "expo": "~50.0.0",
    "expo-status-bar": "~1.11.1",
    "react": "18.2.0",
    "react-native": "0.73.0",
    "expo-image-picker": "~14.7.0",
    "axios": "^1.6.5",
    "react-native-paper": "^5.11.6"
  },
  "devDependencies": {
    "@babel/core": "^7.23.7",
    "@types/react": "~18.2.45",
    "typescript": "^5.3.3"
  }
}
```

---

## Installation Commands Summary

### Backend Setup

```bash
# Navigate to backend folder
cd backend

# Initialize project
npm init -y

# Install dependencies
npm install express cors multer @anthropic-ai/sdk dotenv

# Install dev dependencies
npm install --save-dev typescript ts-node @types/node @types/express @types/cors @types/multer nodemon

# Initialize TypeScript
npx tsc --init
```

### Mobile Setup

```bash
# Create Expo app
npx create-expo-app mobile

# Navigate to mobile folder
cd mobile

# Install additional dependencies
npx expo install expo-image-picker
npm install axios
npm install react-native-paper  # Optional
```

---

## Dependency Size Analysis

| Package | Size | Category | Essential? |
|---------|------|----------|-----------|
| express | ~200KB | Backend | ✅ Yes |
| @anthropic-ai/sdk | ~150KB | Backend | ✅ Yes |
| multer | ~100KB | Backend | ✅ Yes |
| cors | ~10KB | Backend | ✅ Yes |
| expo | ~50MB | Mobile | ✅ Yes |
| axios | ~500KB | Mobile | ✅ Yes |
| expo-image-picker | ~5MB | Mobile | ✅ Yes |
| react-native-paper | ~2MB | Mobile | ❌ Optional |

---

## Security Considerations

1. **API Keys**: Never commit .env files to git
2. **Dependencies**: Regularly update to patch security vulnerabilities
3. **File Uploads**: Validate file types and sizes in multer
4. **CORS**: Restrict origins in production
5. **Rate Limiting**: Add in production (not needed for MVP)

---

## Future Libraries (Not in MVP)

These will be added as the project scales:

- **Database**: Prisma, pg (PostgreSQL)
- **Authentication**: jsonwebtoken, bcrypt
- **Caching**: ioredis
- **Job Queue**: bull
- **Testing**: jest, supertest, @testing-library/react-native
- **State Management**: zustand or redux-toolkit
- **Navigation**: @react-navigation/native
- **Image Processing**: sharp
- **Logging**: winston or pino
- **Monitoring**: @sentry/node, @sentry/react-native

---

## Troubleshooting Common Issues

### Expo Image Picker Not Working

```bash
# Rebuild app after installing
npx expo prebuild
```

### TypeScript Errors

```bash
# Regenerate types
rm -rf node_modules
npm install
```

### CORS Errors

Ensure CORS is configured properly in backend:
```typescript
app.use(cors({ origin: '*' }));
```

---

**Last Updated**: November 2025
**Document Owner**: Development Team