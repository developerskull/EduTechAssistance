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
import { apiService, QuestionPaperResponse } from '../../services/api-service';
import QuestionCard from '../../components/question-card';
import LoadingSpinner from '../../components/loading-spinner';

export default function QuestionsScreen() {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState('5');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QuestionPaperResponse | null>(null);

  const sampleTopics = [
    'Operating System Deadlocks',
    'Relational Database Normalization',
    'Binary Search Trees',
    'Computer Network Protocols',
  ];

  const handleGenerate = async (topicToUse?: string) => {
    const finalTopic = topicToUse || topic;
    if (!finalTopic.trim()) {
      Alert.alert('Required', 'Please enter a syllabus topic or chapter.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiService.generateQuestions({
        topic: finalTopic,
        difficulty,
        num_questions: parseInt(numQuestions, 10) || 5,
      });
      setResult(res);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Question generation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.formCard}>
          <Text style={styles.title}>AI Question Paper Generator</Text>
          <Text style={styles.subtitle}>Powered by Google Gemini 2.5 Flash</Text>

          {/* Topic Input */}
          <Text style={styles.label}>Topic or Syllabus Subject</Text>
          <TextInput
            style={styles.input}
            value={topic}
            onChangeText={setTopic}
            placeholder="e.g. Memory Virtualization & Page Replacement"
            placeholderTextColor={Colors.gray400}
          />

          {/* Quick topic chips */}
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

          {/* Difficulty Selection */}
          <Text style={styles.label}>Difficulty Level</Text>
          <View style={styles.segmentedRow}>
            {['easy', 'medium', 'hard'].map((d) => (
              <TouchableOpacity
                key={d}
                style={[
                  styles.segmentBtn,
                  difficulty === d && styles.segmentBtnActive,
                ]}
                onPress={() => setDifficulty(d)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    difficulty === d && styles.segmentTextActive,
                  ]}
                >
                  {d.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Generate Button */}
          <TouchableOpacity
            style={[styles.generateBtn, loading && styles.btnDisabled]}
            onPress={() => handleGenerate()}
            disabled={loading}
          >
            <Text style={styles.generateBtnText}>
              {loading ? 'Synthesizing with Gemini...' : 'Generate Question Paper'}
            </Text>
          </TouchableOpacity>
        </View>

        {loading && <LoadingSpinner message="Generating balanced questions with answer keys..." />}

        {result && (
          <View style={styles.resultContainer}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>{result.title}</Text>
              <Text style={styles.resultMeta}>
                {result.questions.length} Questions • Difficulty: {result.difficulty}
              </Text>
            </View>

            {result.questions.map((q, idx) => (
              <QuestionCard key={idx} question={q} index={idx} />
            ))}
          </View>
        )}
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
    color: Colors.primary,
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
    marginTop: 8,
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
    marginBottom: 10,
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
  segmentedRow: {
    flexDirection: 'row',
    backgroundColor: Colors.gray100,
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentBtnActive: {
    backgroundColor: Colors.primary,
  },
  segmentText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.gray600,
  },
  segmentTextActive: {
    color: Colors.white,
  },
  generateBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  generateBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  resultContainer: {
    marginTop: 10,
  },
  resultHeader: {
    marginBottom: 14,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.gray900,
  },
  resultMeta: {
    fontSize: 12,
    color: Colors.gray500,
    marginTop: 2,
  },
});

