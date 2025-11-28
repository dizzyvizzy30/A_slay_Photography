import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import Markdown from 'react-native-markdown-display';
import Voice from '@react-native-voice/voice';
import { sendPrompt } from '../api';

type RootStackParamList = {
  Home: undefined;
  AboutMe: undefined;
};

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [shotSuggestions, setShotSuggestions] = useState<string[]>([]);
  const [currentShotPage, setCurrentShotPage] = useState(0);
  const [selectedCamera, setSelectedCamera] = useState('Canon EOS R5');
  const [selectedLens, setSelectedLens] = useState('24-70mm f/2.8');
  const [showCameraPicker, setShowCameraPicker] = useState(false);
  const [showLensPicker, setShowLensPicker] = useState(false);
  const [isToolsExpanded, setIsToolsExpanded] = useState(false);

  // Set up Voice recognition handlers
  useEffect(() => {
    try {
      if (Voice) {
        Voice.onSpeechStart = () => setIsRecording(true);
        Voice.onSpeechEnd = () => setIsRecording(false);
        Voice.onSpeechResults = (e) => {
          if (e.value && e.value[0]) {
            setPrompt(e.value[0]);
          }
        };
        Voice.onSpeechError = (e) => {
          console.error('Speech error:', e);
          setIsRecording(false);
        };
      }
    } catch (error) {
      console.log('Voice recognition not available in Expo Go');
    }

    return () => {
      try {
        if (Voice && Voice.destroy) {
          Voice.destroy().then(Voice.removeAllListeners).catch(() => {});
        }
      } catch (error) {
        // Ignore cleanup errors
      }
    };
  }, []);

  // Camera and Lens options
  const cameraOptions = [
    'Canon EOS R5', 'Canon EOS R6', 'Nikon Z9', 'Nikon Z6 III',
    'Sony A7 IV', 'Sony A7R V', 'Fujifilm X-T5', 'Panasonic GH6'
  ];

  const lensOptions = [
    '24-70mm f/2.8', '70-200mm f/2.8', '50mm f/1.4', '85mm f/1.8',
    '16-35mm f/4', '24mm f/1.4', '35mm f/1.4', '100mm f/2.8 Macro'
  ];

  // Parse response into summary and details
  const parseResponse = (response: string) => {
    const summaryMatch = response.match(/## Summary\n([\s\S]*?)(?=\n## |$)/);
    const detailsMatch = response.match(/## Detailed Recommendations\n([\s\S]*)/);

    return {
      summary: summaryMatch ? summaryMatch[1].trim() : '',
      details: detailsMatch ? `## Detailed Recommendations\n${detailsMatch[1].trim()}` : ''
    };
  };

  // Extract camera settings from response
  const extractSettings = (response: string) => {
    const isoMatch = response.match(/📊\s*\*\*ISO:\*\*\s*([^\n]+)/);
    const apertureMatch = response.match(/🎯\s*\*\*Aperture:\*\*\s*([^\n]+)/);
    const shutterMatch = response.match(/⚡\s*\*\*Shutter Speed:\*\*\s*([^\n]+)/);
    const focusMatch = response.match(/🔍\s*\*\*Focus Mode:\*\*\s*([^\n]+)/);
    const wbMatch = response.match(/🌡️\s*\*\*White Balance:\*\*\s*([^\n]+)/);

    return {
      iso: isoMatch ? isoMatch[1].trim() : 'N/A',
      aperture: apertureMatch ? apertureMatch[1].trim() : 'N/A',
      shutterSpeed: shutterMatch ? shutterMatch[1].trim() : 'N/A',
      focusMode: focusMatch ? focusMatch[1].trim() : 'N/A',
      whiteBalance: wbMatch ? wbMatch[1].trim() : 'N/A'
    };
  };

  // Extract shot suggestions from response
  const extractShotSuggestions = (response: string): string[] => {
    const shotSection = response.match(/### 📸 Shot & Pose Suggestions\n([\s\S]*?)(?=\n### |$)/);
    if (!shotSection) return [];

    const shots: string[] = [];
    const shotIdeasMatch = shotSection[1].match(/\*\*Shot Ideas:\*\*\s*([\s\S]*?)(?=\n- \*\*|$)/);

    if (shotIdeasMatch) {
      // Extract individual shots from the description
      const ideasText = shotIdeasMatch[1].trim();
      // Split by common delimiters and clean up
      const individualShots = ideasText
        .split(/[,;]|\d+\./)
        .map(s => s.trim())
        .filter(s => s.length > 10); // Filter out short/empty strings

      shots.push(...individualShots);
    }

    return shots;
  };

  // Extract tools/accessories section from response
  const extractToolsSection = (response: string): string => {
    const toolsMatch = response.match(/### 🎒 Recommended Camera Tools & Accessories\n([\s\S]*?)(?=\n### |$)/);
    return toolsMatch ? toolsMatch[1].trim() : '';
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const imageUris = result.assets.map(asset => asset.uri);
      setSelectedImages([...selectedImages, ...imageUris]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!prompt.trim() && selectedImages.length === 0) {
      Alert.alert('Input Required', 'Please enter a question or select an image.');
      return;
    }

    setIsLoading(true);
    setAiResponse(null);
    setShotSuggestions([]);
    setCurrentShotPage(0);

    try {
      // For now, use first image. Backend can be updated later for multiple images
      const response = await sendPrompt(
        prompt || 'Analyze this environment and recommend camera settings',
        selectedImages[0] || undefined
      );

      if (response.success && response.data) {
        setAiResponse(response.data);
        // Extract shot suggestions
        const shots = extractShotSuggestions(response.data);
        setShotSuggestions(shots);
      } else {
        Alert.alert('Error', response.error || 'Failed to get AI response');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const clearInputs = () => {
    setPrompt('');
    setSelectedImages([]);
    setAiResponse(null);
    setIsExpanded(false);
    setShotSuggestions([]);
    setCurrentShotPage(0);
  };

  const handleVoiceInput = async () => {
    try {
      // Check if Voice module exists (not available in Expo Go)
      if (!Voice || !Voice.isAvailable) {
        Alert.alert(
          'Voice Input Not Available',
          'Voice recognition is not available in Expo Go. Please type your question instead, or build the app as a standalone to use voice input.'
        );
        return;
      }

      // Check if Voice is available on device
      const isAvailable = await Voice.isAvailable();
      if (!isAvailable) {
        Alert.alert(
          'Voice Input Not Available',
          'Voice recognition is not available on this device. Please type your question instead.'
        );
        return;
      }

      if (isRecording) {
        // Stop recording
        await Voice.stop();
        setIsRecording(false);
      } else {
        // Request microphone permission and start recording
        await Voice.start('en-US');
      }
    } catch (error: any) {
      console.error('Voice input error:', error);

      // Provide helpful error messages
      let errorMessage = 'Voice recognition is not available in Expo Go. Please type your question instead.';
      if (error.message?.includes('permission')) {
        errorMessage = 'Microphone permission denied. Please enable microphone access in your device settings.';
      } else if (error.message?.includes('not available')) {
        errorMessage = 'Voice recognition is not available on this device.';
      } else {
        errorMessage = `${errorMessage} Please check your microphone permissions and try again.`;
      }

      Alert.alert('Voice Error', errorMessage);
      setIsRecording(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🤖📸</Text>
          <Text style={styles.appTitle}>AI Photography Coach</Text>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setIsMenuOpen(true)}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
        </View>

        {/* Burger Menu Modal */}
        <Modal
          visible={isMenuOpen}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsMenuOpen(false)}
        >
          <View style={styles.menuOverlay}>
            <View style={styles.menuContainer}>
              {/* Menu Header */}
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>Menu</Text>
                <TouchableOpacity onPress={() => setIsMenuOpen(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Menu Items */}
              <ScrollView style={styles.menuItems}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setIsMenuOpen(false);
                    navigation.navigate('AboutMe');
                  }}
                >
                  <Text style={styles.menuItemIcon}>👤</Text>
                  <Text style={styles.menuItemText}>About Me</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setIsMenuOpen(false);
                    Alert.alert('Services', 'Services page coming soon!');
                  }}
                >
                  <Text style={styles.menuItemIcon}>🛠️</Text>
                  <Text style={styles.menuItemText}>Additional Services</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setIsMenuOpen(false);
                    Alert.alert('Gallery', 'Gallery coming soon!');
                  }}
                >
                  <Text style={styles.menuItemIcon}>🖼️</Text>
                  <Text style={styles.menuItemText}>Portfolio Gallery</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setIsMenuOpen(false);
                    Alert.alert('Settings', 'Settings coming soon!');
                  }}
                >
                  <Text style={styles.menuItemIcon}>⚙️</Text>
                  <Text style={styles.menuItemText}>Settings</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Camera & Lens Selectors */}
        <View style={styles.selectorsContainer}>
          <TouchableOpacity
            style={styles.selectorButton}
            onPress={() => setShowCameraPicker(true)}
          >
            <Text style={styles.selectorLabel}>📷 Camera</Text>
            <Text style={styles.selectorValue}>{selectedCamera}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.selectorButton}
            onPress={() => setShowLensPicker(true)}
          >
            <Text style={styles.selectorLabel}>🔍 Lens</Text>
            <Text style={styles.selectorValue}>{selectedLens}</Text>
          </TouchableOpacity>
        </View>

        {/* Camera Picker Modal */}
        <Modal
          visible={showCameraPicker}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowCameraPicker(false)}
        >
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerContainer}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select Camera</Text>
                <TouchableOpacity onPress={() => setShowCameraPicker(false)}>
                  <Text style={styles.pickerClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView>
                {cameraOptions.map((camera) => (
                  <TouchableOpacity
                    key={camera}
                    style={styles.pickerOption}
                    onPress={() => {
                      setSelectedCamera(camera);
                      setShowCameraPicker(false);
                    }}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      selectedCamera === camera && styles.pickerOptionSelected
                    ]}>
                      {camera}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Lens Picker Modal */}
        <Modal
          visible={showLensPicker}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowLensPicker(false)}
        >
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerContainer}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select Lens</Text>
                <TouchableOpacity onPress={() => setShowLensPicker(false)}>
                  <Text style={styles.pickerClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView>
                {lensOptions.map((lens) => (
                  <TouchableOpacity
                    key={lens}
                    style={styles.pickerOption}
                    onPress={() => {
                      setSelectedLens(lens);
                      setShowLensPicker(false);
                    }}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      selectedLens === lens && styles.pickerOptionSelected
                    ]}>
                      {lens}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Hint Text */}
          <Text style={styles.hintText}>
            Try: "outdoor portrait", "low light concert", or upload a scene photo
          </Text>

          {/* Central Voice Input Button */}
          <View style={styles.centralMicContainer}>
            <TouchableOpacity
              style={[styles.centralMicButton, isRecording && styles.centralMicRecording]}
              onPress={handleVoiceInput}
            >
              <Text style={styles.centralMicIcon}>🎙️</Text>
            </TouchableOpacity>
            {isRecording && (
              <Text style={styles.recordingText}>Listening...</Text>
            )}
          </View>

          {/* Image Previews */}
          {selectedImages.length > 0 && (
            <ScrollView
              horizontal
              style={styles.imagePreviewScrollView}
              showsHorizontalScrollIndicator={false}
            >
              {selectedImages.map((uri, index) => (
                <View key={index} style={styles.imagePreviewContainer}>
                  <Image source={{ uri }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <Text style={styles.removeImageText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Compact Prompt Input Row */}
          <View style={styles.compactPromptRow}>
            <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
              <Text style={styles.cameraButtonText}>📷</Text>
            </TouchableOpacity>

            <TextInput
              style={[styles.compactPromptInput, isRecording && styles.recordingInput]}
              placeholder={isRecording ? "Listening..." : "How can I coach you today?"}
              placeholderTextColor={isRecording ? "#ff4444" : "#999999"}
              multiline
              value={prompt}
              onChangeText={setPrompt}
              editable={!isRecording}
            />

            <TouchableOpacity
              style={[styles.compactSendButton, isLoading && styles.sendButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.sendButtonText}>✨</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* AI Response */}
          {aiResponse && (() => {
            const { summary, details } = parseResponse(aiResponse);
            const settings = extractSettings(aiResponse);
            return (
              <View style={styles.responseContainer}>
                <View style={styles.responseHeader}>
                  <Text style={styles.responseLabel}>Recommended Settings</Text>
                  <TouchableOpacity onPress={clearInputs}>
                    <Text style={styles.clearText}>Clear</Text>
                  </TouchableOpacity>
                </View>

                {/* Settings Grid - Camera LCD Style */}
                <View style={styles.settingsGrid}>
                  <View style={styles.settingCard}>
                    <View style={styles.cameraIconBox}>
                      <Text style={styles.cameraIconText}>ISO</Text>
                    </View>
                    <Text style={styles.settingValue}>{settings.iso}</Text>
                  </View>

                  <View style={styles.settingCard}>
                    <View style={styles.cameraIconCircle}>
                      <Text style={styles.cameraIconText}>f/</Text>
                    </View>
                    <Text style={styles.settingValue}>{settings.aperture}</Text>
                  </View>

                  <View style={styles.settingCard}>
                    <Text style={styles.cameraIconLarge}>⚡</Text>
                    <Text style={styles.settingValue}>{settings.shutterSpeed}</Text>
                  </View>

                  <View style={styles.settingCard}>
                    <View style={styles.cameraIconBox}>
                      <Text style={styles.cameraIconText}>AF</Text>
                    </View>
                    <Text style={styles.settingValue}>{settings.focusMode}</Text>
                  </View>

                  <View style={styles.settingCard}>
                    <View style={styles.cameraIconBox}>
                      <Text style={styles.cameraIconText}>AWB</Text>
                    </View>
                    <Text style={styles.settingValue}>{settings.whiteBalance}</Text>
                  </View>
                </View>

                {/* Expandable Details */}
                {details && (
                  <View style={styles.expandableSection}>
                    <TouchableOpacity
                      style={styles.expandButton}
                      onPress={() => setIsExpanded(!isExpanded)}
                    >
                      <Text style={styles.expandText}>
                        {isExpanded ? '▼' : '▶'} expand for detailed understanding
                      </Text>
                    </TouchableOpacity>

                    {isExpanded && (
                      <View style={styles.detailsContainer}>
                        <Markdown style={markdownStyles}>{details}</Markdown>
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })()}

          {/* Shot Suggestions Grid */}
          {shotSuggestions.length > 0 && (
            <View style={styles.shotSuggestionsContainer}>
              <Text style={styles.shotSuggestionsTitle}>📸 Shot Suggestions</Text>
              <View style={styles.shotGrid}>
                {shotSuggestions
                  .slice(currentShotPage * 9, (currentShotPage + 1) * 9)
                  .map((shot, index) => (
                    <View key={index} style={styles.shotCard}>
                      <Text style={styles.shotNumber}>{currentShotPage * 9 + index + 1}</Text>
                      <Text style={styles.shotText}>{shot}</Text>
                    </View>
                  ))}
              </View>

              {/* Pagination */}
              {shotSuggestions.length > (currentShotPage + 1) * 9 && (
                <TouchableOpacity
                  style={styles.nextShotsButton}
                  onPress={() => setCurrentShotPage(currentShotPage + 1)}
                >
                  <Text style={styles.nextShotsText}>Next 9 Shots →</Text>
                </TouchableOpacity>
              )}

              {currentShotPage > 0 && (
                <TouchableOpacity
                  style={styles.prevShotsButton}
                  onPress={() => setCurrentShotPage(currentShotPage - 1)}
                >
                  <Text style={styles.prevShotsText}>← Previous 9</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logo: {
    fontSize: 48,
    marginBottom: 12,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  menuButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    padding: 8,
  },
  menuIcon: {
    fontSize: 28,
    color: '#1a1a1a',
    fontWeight: '300',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  closeButton: {
    fontSize: 28,
    color: '#666666',
    fontWeight: '300',
  },
  menuItems: {
    padding: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginVertical: 4,
    backgroundColor: '#f9f9f9',
  },
  menuItemIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  selectorsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectorButton: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectorLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
    fontWeight: '500',
  },
  selectorValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: '60%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  pickerClose: {
    fontSize: 24,
    color: '#666666',
    fontWeight: '300',
  },
  pickerOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  pickerOptionSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
    paddingBottom: 100,
  },
  hintText: {
    fontSize: 13,
    color: '#999999',
    opacity: 0.6,
    textAlign: 'center',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  centralMicContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  centralMicButton: {
    width: 80,
    height: 80,
    backgroundColor: '#ffffff',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  centralMicRecording: {
    borderColor: '#ff4444',
    backgroundColor: '#fff5f5',
    shadowColor: '#ff4444',
    shadowOpacity: 0.3,
  },
  centralMicIcon: {
    fontSize: 44,
  },
  recordingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#ff4444',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  imagePreviewScrollView: {
    marginBottom: 12,
    maxHeight: 120,
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  compactPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 8,
  },
  cameraButton: {
    width: 40,
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButtonText: {
    fontSize: 20,
  },
  compactPromptInput: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a1a',
    minHeight: 40,
    maxHeight: 80,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  recordingInput: {
    borderColor: '#ff4444',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: '#fff5f5',
  },
  compactSendButton: {
    width: 40,
    height: 40,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#999999',
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  responseContainer: {
    marginTop: 24,
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  responseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  responseLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  clearText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  settingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  settingCard: {
    width: '30%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 100,
    justifyContent: 'center',
  },
  cameraIconBox: {
    borderWidth: 2,
    borderColor: '#1a1a1a',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  cameraIconCircle: {
    borderWidth: 2,
    borderColor: '#1a1a1a',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  cameraIconText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  cameraIconLarge: {
    fontSize: 28,
    marginBottom: 10,
    color: '#1a1a1a',
  },
  settingValue: {
    fontSize: 13,
    color: '#1a1a1a',
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  summaryContainer: {
    marginBottom: 16,
  },
  expandableSection: {
    marginTop: 8,
  },
  expandButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  expandText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  detailsContainer: {
    marginTop: 12,
    paddingTop: 12,
  },
  shotSuggestionsContainer: {
    marginTop: 24,
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  shotSuggestionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  shotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  shotCard: {
    width: '31%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 100,
    justifyContent: 'center',
  },
  shotNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666666',
    marginBottom: 6,
  },
  shotText: {
    fontSize: 13,
    color: '#1a1a1a',
    lineHeight: 18,
  },
  nextShotsButton: {
    marginTop: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  nextShotsText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  prevShotsButton: {
    marginTop: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  prevShotsText: {
    color: '#1a1a1a',
    fontSize: 15,
    fontWeight: '600',
  },
});

// Markdown styles
const markdownStyles = {
  body: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 22,
  },
  heading2: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  heading3: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginTop: 12,
    marginBottom: 6,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 8,
    fontSize: 15,
    color: '#333333',
    lineHeight: 22,
  },
  strong: {
    fontWeight: '600',
  },
  bullet_list: {
    marginVertical: 8,
  },
  ordered_list: {
    marginVertical: 8,
  },
  list_item: {
    marginVertical: 4,
  },
  table: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginVertical: 8,
  },
  thead: {
    backgroundColor: '#f5f5f5',
  },
  tbody: {
    backgroundColor: '#ffffff',
  },
  th: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tr: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  td: {
    fontSize: 14,
    color: '#333333',
    padding: 12,
  },
};
