import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  AboutMe: undefined;
};

type AboutMeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AboutMe'>;
};

export default function AboutMeScreen({ navigation }: AboutMeScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!name || !email || !subject || !message) {
      Alert.alert('Required Fields', 'Please fill in all fields before submitting.');
      return;
    }

    // TODO: Implement actual form submission to backend
    Alert.alert(
      'Thank You!',
      `Thank you ${name}! We've received your message and will get back to you soon.`,
      [
        {
          text: 'OK',
          onPress: () => {
            // Clear form
            setName('');
            setEmail('');
            setSubject('');
            setMessage('');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>About Me</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.photoPlaceholder}>
          <Text style={styles.photoIcon}>👨‍💼</Text>
        </View>

        <View style={styles.bioSection}>
          <Text style={styles.sectionTitle}>Professional Photographer</Text>
          <Text style={styles.bioText}>
            With over 10 years of experience in professional photography, I specialize in
            capturing life's most precious moments. From intimate wedding ceremonies to
            grand corporate events, my passion is telling stories through the lens.
          </Text>
          <Text style={styles.bioText}>
            My approach combines technical expertise with artistic vision, ensuring every
            shot reflects the unique essence of the moment. I believe great photography
            isn't just about beautiful images—it's about preserving emotions and memories
            that last a lifetime.
          </Text>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>500+</Text>
            <Text style={styles.statLabel}>Events Covered</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>10+</Text>
            <Text style={styles.statLabel}>Years Experience</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>100%</Text>
            <Text style={styles.statLabel}>Client Satisfaction</Text>
          </View>
        </View>

        <View style={styles.specialtiesSection}>
          <Text style={styles.sectionTitle}>Specialties</Text>
          <View style={styles.specialtyItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.specialtyText}>Wedding & Engagement Photography</Text>
          </View>
          <View style={styles.specialtyItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.specialtyText}>Portrait & Headshot Sessions</Text>
          </View>
          <View style={styles.specialtyItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.specialtyText}>Corporate Events & Conferences</Text>
          </View>
          <View style={styles.specialtyItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.specialtyText}>Landscape & Architectural Photography</Text>
          </View>
          <View style={styles.specialtyItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.specialtyText}>Product & Commercial Photography</Text>
          </View>
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Get In Touch</Text>
          <Text style={styles.contactDescription}>
            Have a project in mind? I'd love to hear from you. Fill out the form below
            and I'll get back to you as soon as possible.
          </Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Your Name"
              placeholderTextColor="#999999"
              value={name}
              onChangeText={setName}
            />

            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#999999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <TextInput
              style={styles.input}
              placeholder="Subject"
              placeholderTextColor="#999999"
              value={subject}
              onChangeText={setSubject}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Your Message"
              placeholderTextColor="#999999"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={message}
              onChangeText={setMessage}
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Send Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.contactInfo}>
          <Text style={styles.contactInfoTitle}>Contact Information</Text>
          <Text style={styles.contactInfoItem}>📧 Email: contact@aslayphotography.com</Text>
          <Text style={styles.contactInfoItem}>📱 Phone: (555) 123-4567</Text>
          <Text style={styles.contactInfoItem}>📍 Location: Los Angeles, CA</Text>
        </View>
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
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  content: {
    padding: 20,
  },
  photoPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#e0e0e0',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  photoIcon: {
    fontSize: 64,
  },
  bioSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
    marginTop: 10,
  },
  bioText: {
    fontSize: 16,
    color: '#555555',
    lineHeight: 24,
    marginBottom: 12,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  specialtiesSection: {
    marginBottom: 30,
  },
  specialtyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    fontSize: 16,
    color: '#1a1a1a',
    marginRight: 10,
    marginTop: 2,
  },
  specialtyText: {
    fontSize: 16,
    color: '#555555',
    flex: 1,
  },
  contactSection: {
    marginBottom: 30,
  },
  contactDescription: {
    fontSize: 16,
    color: '#555555',
    lineHeight: 24,
    marginBottom: 20,
  },
  form: {
    marginTop: 10,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    color: '#1a1a1a',
  },
  textArea: {
    height: 120,
    paddingTop: 15,
  },
  submitButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  contactInfo: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  contactInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  contactInfoItem: {
    fontSize: 16,
    color: '#555555',
    marginBottom: 8,
  },
});
