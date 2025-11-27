import React, { useState } from 'react';
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
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!prompt.trim() && !selectedImage) {
      Alert.alert('Input Required', 'Please enter a prompt or select an image.');
      return;
    }

    setIsLoading(true);
    setAiResponse(null);

    try {
      const response = await sendPrompt(
        prompt || 'Analyze this environment and recommend camera settings',
        selectedImage || undefined
      );

      if (response.success && response.data) {
        setAiResponse(response.data);
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
    setSelectedImage(null);
    setAiResponse(null);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>A Slay Photography</Text>
        <Text style={styles.subtitle}>AI Photography Coach</Text>
      </View>

      {/* AI Prompt Section */}
      <View style={styles.aiSection}>
        <Text style={styles.aiTitle}>Ask AI Photography Coach</Text>
        <Text style={styles.aiSubtitle}>
          Get camera settings recommendations based on your environment or situation
        </Text>

        {/* Text Input */}
        <TextInput
          style={styles.promptInput}
          placeholder="Describe your shooting environment or upload a photo..."
          placeholderTextColor="#999999"
          multiline
          numberOfLines={4}
          value={prompt}
          onChangeText={setPrompt}
          textAlignVertical="top"
        />

        {/* Image Preview */}
        {selectedImage && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => setSelectedImage(null)}
            >
              <Text style={styles.removeImageText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <Text style={styles.uploadButtonText}>📷 Upload Image</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>Get Recommendations</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* AI Response */}
        {aiResponse && (
          <View style={styles.responseContainer}>
            <View style={styles.responseHeader}>
              <Text style={styles.responseTitle}>AI Recommendations</Text>
              <TouchableOpacity onPress={clearInputs}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.responseText}>{aiResponse}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Welcome</Text>
        <Text style={styles.description}>
          Transform your special moments into timeless memories.
          From weddings to portraits, events to landscapes -
          we capture the essence of every story.
        </Text>

        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>Our Services</Text>

          <View style={styles.serviceCard}>
            <Text style={styles.serviceIcon}>💍</Text>
            <Text style={styles.serviceTitle}>Wedding Photography</Text>
            <Text style={styles.serviceDescription}>
              Capture every moment of your special day with elegance and artistry
            </Text>
          </View>

          <View style={styles.serviceCard}>
            <Text style={styles.serviceIcon}>👤</Text>
            <Text style={styles.serviceTitle}>Portrait Sessions</Text>
            <Text style={styles.serviceDescription}>
              Professional portraits that showcase your unique personality
            </Text>
          </View>

          <View style={styles.serviceCard}>
            <Text style={styles.serviceIcon}>🎉</Text>
            <Text style={styles.serviceTitle}>Event Coverage</Text>
            <Text style={styles.serviceDescription}>
              Document your corporate events, parties, and celebrations
            </Text>
          </View>

          <View style={styles.serviceCard}>
            <Text style={styles.serviceIcon}>🌄</Text>
            <Text style={styles.serviceTitle}>Landscape & Architecture</Text>
            <Text style={styles.serviceDescription}>
              Stunning architectural and landscape photography
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => navigation.navigate('AboutMe')}
        >
          <Text style={styles.ctaButtonText}>Learn More About Us</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#1a1a1a',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#cccccc',
    fontStyle: 'italic',
  },
  // AI Prompt Section Styles
  aiSection: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  aiTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  aiSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    lineHeight: 20,
  },
  promptInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#1a1a1a',
    minHeight: 100,
    marginBottom: 15,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  uploadButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#1a1a1a',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#1a1a1a',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#666666',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  responseContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  responseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  responseTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  clearText: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  responseText: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 22,
  },
  heroSection: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 40,
    alignItems: 'center',
  },
  heroPlaceholder: {
    width: '90%',
    height: 200,
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroText: {
    fontSize: 64,
    marginBottom: 10,
  },
  heroSubtext: {
    fontSize: 18,
    color: '#666666',
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
    marginTop: 10,
  },
  description: {
    fontSize: 16,
    color: '#555555',
    lineHeight: 24,
    marginBottom: 20,
  },
  servicesSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  serviceCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  serviceIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  ctaButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  ctaButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
