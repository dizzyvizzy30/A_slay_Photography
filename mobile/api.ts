import axios from 'axios';

// Local network connection (firewall must allow port 8080 or be turned off)
// Replace with your computer's IP address when testing on physical device
const BASE_URL = 'http://192.168.0.97:8080/api';

export interface AnalyzePhotoRequest {
  image: any; // Will be FormData
  prompt: string;
}

export interface CameraSettingsRequest {
  eventType: string;
  lighting: string;
  subject: string;
}

export interface ApiResponse {
  success: boolean;
  data?: string;
  error?: string;
}

// Analyze photo with AI (uploads image)
export const analyzePhoto = async (imageUri: string, prompt: string): Promise<ApiResponse> => {
  try {
    const formData = new FormData();

    // Extract filename from URI
    const filename = imageUri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    // Append image file
    formData.append('image', {
      uri: imageUri,
      name: filename,
      type,
    } as any);

    // Append prompt
    formData.append('prompt', prompt);

    const response = await axios.post(`${BASE_URL}/analyze`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 second timeout
    });

    return response.data;
  } catch (error: any) {
    console.error('Error analyzing photo:', error);

    // Better error messages
    if (error.code === 'ECONNABORTED') {
      return {
        success: false,
        error: 'Request timeout. Check if backend is running and accessible on your network.',
      };
    }
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      return {
        success: false,
        error: `Cannot reach backend at ${BASE_URL}. Make sure:\n1. Backend is running\n2. Phone and computer on same Wi-Fi\n3. Firewall allows port 3000`,
      };
    }

    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to analyze photo',
    };
  }
};

// Get camera settings recommendations (text only, no image)
export const getCameraSettings = async (
  eventType: string,
  lighting: string,
  subject: string
): Promise<ApiResponse> => {
  try {
    const response = await axios.post(`${BASE_URL}/camera-settings`, {
      eventType,
      lighting,
      subject,
    }, {
      timeout: 60000, // 60 second timeout
    });

    return response.data;
  } catch (error: any) {
    console.error('Error getting camera settings:', error);

    // Better error messages
    if (error.code === 'ECONNABORTED') {
      return {
        success: false,
        error: 'Request timeout. Check if backend is running and accessible on your network.',
      };
    }
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      return {
        success: false,
        error: `Cannot reach backend at ${BASE_URL}. Make sure:\n1. Backend is running\n2. Phone and computer on same Wi-Fi\n3. Firewall allows port 3000`,
      };
    }

    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to get camera settings',
    };
  }
};

// Simple AI prompt - accepts text input and optional image
export const sendPrompt = async (text: string, imageUri?: string): Promise<ApiResponse> => {
  if (imageUri) {
    // If image is provided, use analyze endpoint
    return analyzePhoto(imageUri, text);
  } else {
    // If no image, extract event info from text and use camera-settings endpoint
    // For now, we'll use generic values - you can improve this parsing later
    return getCameraSettings(
      text || 'general photography',
      'natural light',
      'general'
    );
  }
};
