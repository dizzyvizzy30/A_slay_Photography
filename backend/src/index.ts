import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import 'dotenv/config';
import { analyzePhoto, getCameraSettings } from './claude';
import { AnalyzeRequest, AnalyzeResponse } from './types';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

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

// Start server - Listen on all network interfaces (0.0.0.0)
app.listen(PORT, '0.0.0.0', () => {
  // Get the actual network IP
  const networkInterfaces = require('os').networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(networkInterfaces)) {
    for (const net of networkInterfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push(net.address);
      }
    }
  }
  const localIP = addresses[0] || '192.168.0.97';

  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📡 Network access: http://${localIP}:${PORT}/api`);
  console.log(`🔑 API Key loaded: ${process.env.ANTHROPIC_API_KEY ? 'Yes' : 'No - CHECK .env FILE!'}`);
});
