import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SessionMetadata } from '../types/session';
import {
  getAllSessionsMetadata,
  deleteSession,
  setCurrentSessionId,
} from '../utils/sessionStorage';

type RootStackParamList = {
  Home: undefined;
  History: undefined;
  AboutMe: undefined;
};

type HistoryScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'History'>;
};

export default function HistoryScreen({ navigation }: HistoryScreenProps) {
  const [sessions, setSessions] = useState<SessionMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const sessionsList = await getAllSessionsMetadata();
      setSessions(sessionsList);
    } catch (error) {
      console.error('Error loading sessions:', error);
      Alert.alert('Error', 'Failed to load session history');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadSessions();
  };

  const handleSelectSession = async (sessionId: string) => {
    try {
      await setCurrentSessionId(sessionId);
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Error', 'Failed to load session');
    }
  };

  const handleDeleteSession = (sessionId: string, title: string) => {
    Alert.alert(
      'Delete Session',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSession(sessionId);
              loadSessions();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete session');
            }
          },
        },
      ]
    );
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Session History</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Session History</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Text style={styles.refreshText}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Sessions List */}
      <ScrollView style={styles.scrollView}>
        {sessions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No sessions yet</Text>
            <Text style={styles.emptySubtext}>Start a conversation to create your first session</Text>
            <TouchableOpacity
              style={styles.newSessionButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.newSessionButtonText}>Start New Session</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.sessionCount}>
              {sessions.length} {sessions.length === 1 ? 'Session' : 'Sessions'} (Max 5)
            </Text>

            {sessions.map((session) => (
              <View key={session.id} style={styles.sessionCard}>
                <TouchableOpacity
                  style={styles.sessionContent}
                  onPress={() => handleSelectSession(session.id)}
                >
                  <Text style={styles.sessionTitle}>{session.title}</Text>
                  <View style={styles.sessionMeta}>
                    <Text style={styles.metaText}>
                      {session.messageCount} {session.messageCount === 1 ? 'message' : 'messages'}
                    </Text>
                    <Text style={styles.metaDot}>•</Text>
                    <Text style={styles.metaText}>
                      {session.promptCount}/{15} prompts
                    </Text>
                    <Text style={styles.metaDot}>•</Text>
                    <Text style={styles.metaText}>{formatDate(session.lastActivityAt)}</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteSession(session.id, session.title)}
                >
                  <Text style={styles.deleteText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A0B2E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#2D1B4E',
    borderBottomWidth: 1,
    borderBottomColor: '#8B5CF6',
  },
  backButton: {
    padding: 8,
  },
  backText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  refreshButton: {
    padding: 8,
  },
  refreshText: {
    fontSize: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  sessionCount: {
    fontSize: 14,
    color: '#A78BFA',
    marginBottom: 15,
    textAlign: 'center',
  },
  sessionCard: {
    flexDirection: 'row',
    backgroundColor: '#2D1B4E',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#8B5CF6',
    overflow: 'hidden',
  },
  sessionContent: {
    flex: 1,
    padding: 16,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#A78BFA',
  },
  metaDot: {
    fontSize: 12,
    color: '#A78BFA',
    marginHorizontal: 6,
  },
  deleteButton: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8B2A5B',
  },
  deleteText: {
    fontSize: 24,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#A78BFA',
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  newSessionButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  newSessionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
