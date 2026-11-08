import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { apiService, StudyMaterialResponse } from '../../services/api-service';
import StudyMaterialCard from '../../components/study-material-card';
import LoadingSpinner from '../../components/loading-spinner';

export default function StudyScreen() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<StudyMaterialResponse | null>(null);

  const sampleTopics = [
    'TCP/IP Protocol Suite',
    'Object-Oriented Design Patterns',
    'Algorithm Asymptotic Analysis',
    'Database Indexing & B-Trees',
  ];

  const handleGenerate = async (topicToUse?: string) => {
    const finalTopic = topicToUse || topic;
    if (!finalTopic.trim()) {
      Alert.alert('Required', 'Please enter a topic to generate study materials.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiService.generateStudyContent({ topic: finalTopic });
      setContent(res);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to generate study guide.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.formCard}>
          <Text style={styles.title}>AI Study Material Generator</Text>
          <Text style={styles.subtitle}>Curated Study Guides & Revision Cheat Sheets</Text>

          <Text style={styles.label}>Subject or Concept</Text>
          <TextInput
            style={styles.input}
            value={topic}
            onChangeText={setTopic}
            placeholder="e.g. Asymmetric Cryptography & RSA"
            placeholderTextColor={Colors.gray400}
          />

          <View style={styles.chipsContainer}>
            {sampleTopics.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.chip}
                onPress={() => {
                  setTopic(item);
                  handleGenerate(item);
                }}
              >
                <Text style={styles.chipText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.generateBtn, loading && styles.btnDisabled]}
            onPress={() => handleGenerate()}
            disabled={loading}
          >
            <Text style={styles.generateBtnText}>
              {loading ? 'Synthesizing Guide...' : 'Create Study Material'}
            </Text>
          </TouchableOpacity>
        </View>

        {loading && <LoadingSpinner message="Generating summaries and high-yield cheat sheets..." />}

        {content && <StudyMaterialCard content={content} />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.gray900,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '600',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gray700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.gray900,
    backgroundColor: Colors.gray50,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginBottom: 16,
  },
  chip: {
    backgroundColor: Colors.gray100,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipText: {
    fontSize: 11,
    color: Colors.gray700,
    fontWeight: '600',
  },
  generateBtn: {
    backgroundColor: Colors.success,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  generateBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
