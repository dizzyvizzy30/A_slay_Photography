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
      max_tokens: 3072,
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
            text: `As a professional photography coach, analyze this environment/setup photo and recommend ideal camera settings AND shot suggestions for shooting in this location.

User's request: ${userPrompt}

IMPORTANT: Format your response in this EXACT structure:

## Summary

**Recommended Settings:**
- 📊 **ISO:** [value]
- 🎯 **Aperture:** [value]
- ⚡ **Shutter Speed:** [value]
- 🔍 **Focus Mode:** [mode]
- 🌡️ **White Balance:** [setting]

**Shot & Pose Ideas:**
- 📸 [2-3 specific shot suggestions tailored to this environment]

NOTE: Only include a comparison table if the user explicitly mentions their current settings or asks for a comparison. If they do, add this table after the recommended settings:

| Setting | Your Current | Recommended |
|---------|-------------|-------------|
| ISO | [their value] | [recommended value] |
| Aperture | [their value] | [recommended value] |
| Shutter Speed | [their value] | [recommended value] |
| Focus Mode | [their mode] | [recommended mode] |
| White Balance | [their setting] | [recommended setting] |

## Detailed Recommendations

### 📊 ISO
[Detailed ISO recommendations and reasoning]

### 🎯 Aperture
[Detailed aperture (f-stop) recommendations and reasoning]

### ⚡ Shutter Speed
[Detailed shutter speed recommendations and reasoning]

### 🔍 Focus Mode
[Detailed focus mode suggestions and reasoning]

### 🌡️ White Balance
[Detailed white balance recommendations and reasoning]

### 📸 Shot & Pose Suggestions
Provide specific, actionable shot ideas based on this environment:
- **Shot Ideas:** [List 15-20 distinct, specific shot suggestions. Format as: "1. [shot description], 2. [shot description], etc." Include variety: wide angles, close-ups, portraits, environmental shots, detail shots, action shots, creative angles, etc. Each shot should be unique and actionable.]
- **Angles:** [Suggest camera angles - eye level, low angle, high angle, Dutch angle, bird's eye, etc.]
- **Poses (if applicable):** [If shooting people, suggest poses that work well in this environment]
- **Composition Tips:** [Rule of thirds, leading lines, framing, symmetry, etc. specific to this location]

### 💡 Additional Tips
[Any additional tips for shooting in this environment]

### 🎒 Recommended Camera Tools & Accessories
Provide brief, practical recommendations for helpful tools:
- **Flash/Lighting:** [External flash, reflector, LED panel, etc. - only if needed for this scenario]
- **Filters:** [ND filter, polarizer, UV filter, etc. - specify which and why]
- **Support:** [Tripod, monopod, gimbal - if beneficial for this shoot]
- **Other Gear:** [Remote trigger, extra batteries, lens cloth, etc. - practical items]

Focus on what settings to USE and what shots to CAPTURE, not on analyzing the photo quality itself. Use markdown formatting.`
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
    const prompt = `As a professional photography coach, recommend camera settings AND shot suggestions for:
    Event Type: ${eventType}
    Lighting: ${lighting}
    Subject: ${subject}

    IMPORTANT: Format your response in this EXACT structure:

## Summary

**Recommended Settings:**
- 📊 **ISO:** [value]
- 🎯 **Aperture:** [value]
- ⚡ **Shutter Speed:** [value]
- 🔍 **Focus Mode:** [mode]
- 🌡️ **White Balance:** [setting]

**Shot & Pose Ideas:**
- 📸 [2-3 specific shot suggestions tailored to this scenario]

NOTE: Only include a comparison table if the user explicitly mentions their current settings or asks for a comparison. If they do, add this table after the recommended settings:

| Setting | Your Current | Recommended |
|---------|-------------|-------------|
| ISO | [their value] | [recommended value] |
| Aperture | [their value] | [recommended value] |
| Shutter Speed | [their value] | [recommended value] |
| Focus Mode | [their mode] | [recommended mode] |
| White Balance | [their setting] | [recommended setting] |

## Detailed Recommendations

### 📊 ISO
[Detailed ISO recommendations and reasoning]

### 🎯 Aperture
[Detailed aperture (f-stop) recommendations and reasoning]

### ⚡ Shutter Speed
[Detailed shutter speed recommendations and reasoning]

### 🔍 Focus Mode
[Detailed focus mode suggestions and reasoning]

### 🌡️ White Balance
[Detailed white balance recommendations and reasoning]

### 📸 Shot & Pose Suggestions
Provide specific, actionable shot ideas for this scenario:
- **Shot Ideas:** [List 15-20 distinct, specific shot suggestions. Format as: "1. [shot description], 2. [shot description], etc." Include variety: wide angles, close-ups, portraits, environmental shots, action shots, detail shots, creative angles, etc. Each shot should be unique and actionable.]
- **Angles:** [Suggest camera angles - eye level, low angle, high angle, Dutch angle, bird's eye, etc.]
- **Poses (if applicable):** [If shooting people, suggest poses that work well for this event/subject]
- **Composition Tips:** [Rule of thirds, leading lines, framing, symmetry, depth, etc. specific to this scenario]

### 💡 Additional Tips
[Any additional tips for shooting in this scenario]

### 🎒 Recommended Camera Tools & Accessories
Provide brief, practical recommendations for helpful tools:
- **Flash/Lighting:** [External flash, reflector, LED panel, etc. - only if needed for this scenario]
- **Filters:** [ND filter, polarizer, UV filter, etc. - specify which and why]
- **Support:** [Tripod, monopod, gimbal - if beneficial for this shoot]
- **Other Gear:** [Remote trigger, extra batteries, lens cloth, etc. - practical items]

Use markdown formatting.`;

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 3072,
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
