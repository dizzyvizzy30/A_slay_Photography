import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
});

export async function analyzePhoto(imagePaths: string[], userPrompt: string): Promise<string> {
  try {
    // Read all image files and convert to base64
    const imageContents = await Promise.all(
      imagePaths.map(async (imagePath) => {
        const imageBuffer = await fs.readFile(imagePath);
        const base64Image = imageBuffer.toString('base64');
        return {
          type: 'image' as const,
          source: {
            type: 'base64' as const,
            media_type: 'image/jpeg' as const,
            data: base64Image
          }
        };
      })
    );

    // Build content array: images first, then text prompt
    const content = [
      ...imageContents,
      {
        type: 'text' as const,
        text: `As a professional photography coach, analyze ${imagePaths.length > 1 ? 'these environment/setup photos' : 'this environment/setup photo'} and recommend ideal camera settings AND shot suggestions for shooting in ${imagePaths.length > 1 ? 'these locations' : 'this location'}.

User's request: ${userPrompt}

CRITICAL FIRST STEP: Before providing recommendations, assess if you have enough information:
- If the user's request is too vague (e.g., just "help me" or "what settings?") or the image doesn't provide enough context, start your response with "## Need More Details" and ask 3-5 specific questions about:
  * What type of shoot is this? (portrait, landscape, event, product, etc.)
  * Who/what is the subject?
  * What time of day will they be shooting?
  * What mood or style are they going for?
  * Any specific challenges they're concerned about?

- If you have enough information (clear image + specific request), proceed with recommendations.

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

Focus on what settings to USE and what shots to CAPTURE, not on analyzing the photo quality itself. Use markdown formatting.${imagePaths.length > 1 ? '\n\nNote: Analyze ALL provided images together and provide comprehensive recommendations that consider all the different angles/locations shown.' : ''}`
      }
    ];

    // Call Claude API
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 3072,
      messages: [{
        role: 'user',
        content
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

    CRITICAL FIRST STEP: Before providing recommendations, assess if you have enough information:
    - If the event type, lighting, or subject is too vague (e.g., "general photography", "help", "anything"), start your response with "## Need More Details" and ask 3-5 specific questions about:
      * What specific type of shoot is this? (wedding, portrait session, sports, product, etc.)
      * What is the exact lighting condition? (direct sunlight, overcast, indoor artificial, mixed, etc.)
      * Who/what exactly is the subject? (individual, group, moving subjects, stationary objects, etc.)
      * What time of day?
      * What mood or style are they going for?
      * Any specific challenges or constraints?

    - If you have enough information, proceed with recommendations.

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
