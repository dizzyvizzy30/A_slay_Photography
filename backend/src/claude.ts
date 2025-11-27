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
      model: 'claude-haiku-4-5-20251001',
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
            text: `As a professional photography coach, analyze this environment/setup photo and recommend ideal camera settings for shooting in this location.

User's request: ${userPrompt}

Based on the lighting, environment, and conditions you see in this image, provide:
1. Recommended ISO range
2. Recommended aperture (f-stop)
3. Recommended shutter speed
4. Focus mode suggestions
5. White balance recommendations
6. Any additional tips for shooting in this environment

Focus on what settings to USE, not on analyzing the photo quality itself.`
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
      model: 'claude-haiku-4-5-20251001',
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
