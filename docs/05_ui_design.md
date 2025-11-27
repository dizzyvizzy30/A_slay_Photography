# UI/UX Design Documentation

## AI Photography Coach MVP - User Interface Design

This document describes the user interface design, components, and user experience flow for the mobile app.

---

## Design Philosophy

### MVP Principles

1. **Simplicity First**: Single-screen app, minimal navigation
2. **Fast Iteration**: Easy to test and modify
3. **Mobile-First**: Optimized for phone screens
4. **Clear Feedback**: Show loading states, errors clearly
5. **Conversational**: Chat-like interface for AI interactions

### Design Goals

- User can start using the app in under 30 seconds
- No learning curve - intuitive interface
- Fast response to user actions
- Professional look despite simplicity

---

## Screen Layout

### Single Screen Structure

```
┌─────────────────────────────────────┐
│  ┌─────────────────────────────┐   │  ← Status Bar
│  │  9:41  ○○○  ☰  🔋            │   │
│  └─────────────────────────────┘   │
│                                      │
│  ┌─────────────────────────────┐   │  ← Header
│  │  AI Photography Coach  📸     │   │
│  └─────────────────────────────┘   │
│                                      │
├──────────────────────────────────────┤
│                                      │  ← Scrollable Content Area
│  ┌─────────────────────────────┐   │
│  │  [Photo Preview]            │   │  Image Display
│  │  (or empty state)           │   │
│  └─────────────────────────────┘   │
│                                      │
│  ┌─────────────────────────────┐   │
│  │  📷  Pick Photo from Gallery │   │  Upload Button
│  └─────────────────────────────┘   │
│                                      │
│  ┌─────────────────────────────┐   │
│  │  What would you like to     │   │  Prompt Input
│  │  know about this photo?     │   │
│  │  ________________________   │   │
│  └─────────────────────────────┘   │
│                                      │
│  ┌─────────────────────────────┐   │
│  │     Get AI Advice  →        │   │  Submit Button
│  └─────────────────────────────┘   │
│                                      │
│  ┌─────────────────────────────┐   │
│  │  AI Response:               │   │  Response Card
│  │                             │   │
│  │  [AI generated advice       │   │
│  │   appears here...]          │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                      │
├──────────────────────────────────────┤
│  Safe Area (iPhone notch/bar)       │
└─────────────────────────────────────┘
```

---

## Component Breakdown

### 1. Header Component

**Purpose**: App branding and navigation (future)

```typescript
<View style={styles.header}>
  <Text style={styles.title}>AI Photography Coach</Text>
  <Text style={styles.subtitle}>Your AI-powered photography assistant</Text>
</View>
```

**Styling**:
- Background: Gradient or solid color (#6200EE purple suggested)
- Text: White, bold, 24px
- Padding: 20px vertical, 16px horizontal
- Safe area aware (avoid notch)

---

### 2. Image Preview Component

**States**:
1. **Empty State** (no image selected)
2. **Image Selected** (show preview)
3. **Loading** (uploading indicator)

```typescript
{imageUri ? (
  <Image
    source={{ uri: imageUri }}
    style={styles.imagePreview}
    resizeMode="cover"
  />
) : (
  <View style={styles.emptyState}>
    <Text style={styles.emptyStateText}>
      📷 No photo selected
    </Text>
  </View>
)}
```

**Styling**:
- Size: Full width, 300px height
- Border radius: 12px
- Border: 1px solid #E0E0E0
- Empty state: Light gray background (#F5F5F5)

---

### 3. Photo Picker Button

**Purpose**: Trigger expo-image-picker

```typescript
<TouchableOpacity
  style={styles.pickButton}
  onPress={pickImage}
>
  <Text style={styles.buttonText}>
    📷 Pick Photo from Gallery
  </Text>
</TouchableOpacity>
```

**Styling**:
- Background: Light blue (#2196F3)
- Text: White, 16px, medium weight
- Padding: 16px vertical, 24px horizontal
- Border radius: 8px
- Full width with margins

**Interaction**:
- Press → Opens photo gallery
- Haptic feedback on press (optional)
- Disabled state while loading

---

### 4. Prompt Input Component

**Purpose**: User enters what they want to know

```typescript
<TextInput
  style={styles.input}
  placeholder="What would you like to know about this photo?"
  placeholderTextColor="#999"
  value={prompt}
  onChangeText={setPrompt}
  multiline
  numberOfLines={3}
  maxLength={500}
/>
```

**Styling**:
- Background: White
- Border: 1px solid #DDD
- Border radius: 8px
- Padding: 12px
- Font size: 16px
- Min height: 80px (multiline)

**Behavior**:
- Auto-focus after image selected (optional)
- Character counter (optional)
- Clear button (optional)

---

### 5. Submit Button

**Purpose**: Send request to backend

```typescript
<TouchableOpacity
  style={[
    styles.submitButton,
    (loading || !imageUri || !prompt) && styles.buttonDisabled
  ]}
  onPress={handleSubmit}
  disabled={loading || !imageUri || !prompt}
>
  {loading ? (
    <ActivityIndicator color="#FFF" />
  ) : (
    <Text style={styles.buttonText}>Get AI Advice →</Text>
  )}
</TouchableOpacity>
```

**States**:
1. **Enabled**: Blue background, white text
2. **Disabled**: Gray background, light text
3. **Loading**: Show spinner, disable interaction

**Styling**:
- Background: #6200EE (enabled), #CCC (disabled)
- Text: White, 18px, bold
- Padding: 18px vertical
- Border radius: 8px
- Full width

---

### 6. Response Display Component

**Purpose**: Show AI-generated advice

```typescript
{response && (
  <View style={styles.responseCard}>
    <Text style={styles.responseLabel}>AI Response:</Text>
    <Text style={styles.responseText}>{response}</Text>
  </View>
)}
```

**Styling**:
- Background: Light green (#E8F5E9) or white with border
- Border: 1px solid #4CAF50
- Border radius: 12px
- Padding: 16px
- Margin top: 16px

**Response Text**:
- Font size: 15px
- Line height: 1.6
- Color: #212121
- Preserve formatting

---

### 7. Loading Indicator

**Purpose**: Show processing state

```typescript
{loading && (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#6200EE" />
    <Text style={styles.loadingText}>
      Analyzing your photo...
    </Text>
  </View>
)}
```

**Styling**:
- Centered overlay (optional)
- Or inline below submit button
- Loading text: Gray, 14px
- Spinner: Large size, brand color

---

### 8. Error Display Component

**Purpose**: Show errors clearly

```typescript
{error && (
  <View style={styles.errorCard}>
    <Text style={styles.errorIcon}>⚠️</Text>
    <Text style={styles.errorText}>{error}</Text>
    <TouchableOpacity onPress={() => setError(null)}>
      <Text style={styles.dismissText}>Dismiss</Text>
    </TouchableOpacity>
  </View>
)}
```

**Styling**:
- Background: Light red (#FFEBEE)
- Border: 1px solid #F44336
- Border radius: 8px
- Padding: 12px
- Icon: 24px
- Dismiss button: Underlined text

---

## Color Palette

### Primary Colors

```
Primary Purple:   #6200EE
Primary Dark:     #3700B3
Accent Blue:      #2196F3
Success Green:    #4CAF50
Error Red:        #F44336
Warning Orange:   #FF9800
```

### Neutral Colors

```
Background:       #FFFFFF
Surface:          #F5F5F5
Border:           #E0E0E0
Text Primary:     #212121
Text Secondary:   #757575
Text Disabled:    #9E9E9E
```

### Gradients (Optional)

```
Header Gradient:  #6200EE → #3700B3
Button Gradient:  #2196F3 → #1976D2
```

---

## Typography

### Font Sizes

```
Heading 1:        24px (Header title)
Heading 2:        20px (Section titles)
Body Large:       18px (Button text)
Body:             16px (Input text, labels)
Body Small:       15px (Response text)
Caption:          14px (Helper text)
Small:            12px (Metadata)
```

### Font Weights

```
Bold:             700 (Titles, buttons)
Medium:           500 (Labels)
Regular:          400 (Body text)
Light:            300 (Captions)
```

### Font Family

Use system default fonts for best performance:
- **iOS**: San Francisco
- **Android**: Roboto

Or use a custom font like **Inter** or **Poppins** for branding.

---

## Spacing System

### Padding/Margin Scale

```
XS:  4px
S:   8px
M:   12px
L:   16px
XL:  20px
XXL: 24px
```

### Component Spacing

```
Screen padding:       16px horizontal
Section spacing:      20px vertical
Component spacing:    12px vertical
Button spacing:       16px between buttons
```

---

## Complete StyleSheet Example

```typescript
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    padding: 16,
  },
  header: {
    backgroundColor: '#6200EE',
    padding: 20,
    paddingTop: 50, // Account for status bar
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
  imagePreview: {
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
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyStateText: {
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
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#C62828',
    marginBottom: 8,
  },
  dismissText: {
    fontSize: 14,
    color: '#1976D2',
    textDecorationLine: 'underline',
  },
});
```

---

## User Experience Flow

### Happy Path

```
1. User opens app
   ↓
2. Sees simple interface with "Pick Photo" button
   ↓
3. Taps "Pick Photo from Gallery"
   ↓
4. System photo picker opens
   ↓
5. User selects a photo
   ↓
6. Photo preview appears in app
   ↓
7. Input field shows: "What would you like to know?"
   ↓
8. User types: "Analyze the lighting in this setup"
   ↓
9. User taps "Get AI Advice"
   ↓
10. Button shows loading spinner
    ↓
11. AI response appears in green card below
    ↓
12. User reads advice
    ↓
13. Can repeat with new photo or new question
```

### Error Handling Flow

```
Error Scenario 1: No Internet
→ Show error: "No internet connection. Please check your network."

Error Scenario 2: Backend Down
→ Show error: "Cannot connect to server. Make sure the backend is running."

Error Scenario 3: File Too Large
→ Show error: "Image too large. Please select a smaller image."

Error Scenario 4: Invalid File Type
→ Show error: "Please select a valid image file (JPEG or PNG)."

Error Scenario 5: API Error
→ Show error: "Something went wrong. Please try again."
```

---

## Accessibility Considerations

### For MVP

1. **Touch Targets**: All buttons minimum 44x44 points
2. **Contrast**: Text meets WCAG AA standards
3. **Font Scaling**: Respect system font size settings
4. **Labels**: All images have alt text (future)

### Future Enhancements

- Screen reader support
- Voice input for prompts
- High contrast mode
- Reduced motion option
- Keyboard navigation

---

## Responsive Design

### Phone Sizes

**Small (iPhone SE, 320px width)**:
- Reduce image preview height to 250px
- Smaller font sizes (scale down 10%)
- Tighter padding (12px instead of 16px)

**Medium (iPhone 13, 390px width)**:
- Default sizes as specified

**Large (iPhone 14 Pro Max, 428px width)**:
- Same layout, more breathing room
- Optional: Show more response text without scrolling

---

## Animation and Micro-interactions

### Subtle Animations (Optional)

```typescript
import { Animated } from 'react-native';

// Fade in response card
const fadeAnim = useRef(new Animated.Value(0)).current;

useEffect(() => {
  if (response) {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }
}, [response]);

// Apply to response card
<Animated.View style={{ opacity: fadeAnim }}>
  {/* Response content */}
</Animated.View>
```

### Button Press Feedback

```typescript
<TouchableOpacity
  activeOpacity={0.7}  // Dim on press
  onPress={handlePress}
>
```

---

## Dark Mode Support (Future)

```typescript
import { useColorScheme } from 'react-native';

const colorScheme = useColorScheme();
const isDark = colorScheme === 'dark';

const dynamicStyles = {
  background: isDark ? '#121212' : '#FFFFFF',
  text: isDark ? '#FFFFFF' : '#212121',
  // ... more color adjustments
};
```

---

## UI Component Libraries (Optional)

If you want to speed up UI development, consider:

### React Native Paper

- Material Design components
- Theme support
- Consistent styling

### React Native Elements

- Cross-platform components
- Highly customizable

### NativeBase

- Ready-made components
- Good documentation

**For MVP**: Native components are sufficient. Add libraries later if needed.

---

## Design Resources

### Tools

- **Figma**: For mockups and prototyping
- **Sketch**: Alternative design tool
- **Adobe XD**: Another option

### Inspiration

- **Dribbble**: Mobile app designs
- **Behance**: UI/UX portfolios
- **Mobbin**: Mobile design patterns

### Icons

- **Expo Icons**: Built-in icon sets
- **react-native-vector-icons**: More icon options
- **Heroicons**: Modern icon set

---

## Testing UI on Real Device

### Expo Go App

1. Install Expo Go from App Store / Play Store
2. Scan QR code from `npx expo start`
3. Test on actual device size
4. Check touch interactions
5. Verify colors and contrast

### Tips

- Test in different lighting conditions
- Test with one hand
- Check landscape orientation (if supported)
- Test with system font size changes

---

**Last Updated**: November 2025
**Document Owner**: Design/Development Team
