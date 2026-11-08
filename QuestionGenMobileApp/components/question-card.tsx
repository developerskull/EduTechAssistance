import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';
import { Question } from '../services/api-service';

interface QuestionCardProps {
  question: Question;
  index: number;
}

export default function QuestionCard({ question, index }: QuestionCardProps) {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.questionNum}>Question {index + 1}</Text>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{question.question_type.replace('_', ' ')}</Text>
        </View>
        <Text style={styles.points}>{question.points} pts</Text>
      </View>

      <Text style={styles.questionText}>{question.question_text}</Text>

      {question.options && question.options.length > 0 && (
        <View style={styles.optionsList}>
          {question.options.map((opt, oIdx) => {
            const letter = String.fromCharCode(65 + oIdx);
            return (
              <View key={oIdx} style={styles.optionRow}>
                <View style={styles.optionBadge}>
                  <Text style={styles.optionLetter}>{letter}</Text>
                </View>
                <Text style={styles.optionText}>{opt}</Text>
              </View>
            );
          })}
        </View>
      )}

      <TouchableOpacity
        style={styles.toggleBtn}
        onPress={() => setShowAnswer(!showAnswer)}
        activeOpacity={0.7}
      >
        <Text style={styles.toggleBtnText}>
          {showAnswer ? 'Hide Model Answer' : 'Show Model Answer'}
        </Text>
      </TouchableOpacity>

      {showAnswer && (
        <View style={styles.answerBox}>
          <Text style={styles.answerTitle}>Model Answer / Evaluation Key:</Text>
          <Text style={styles.answerText}>{question.correct_answer}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  questionNum: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  tag: {
    backgroundColor: Colors.gray100,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.gray700,
    textTransform: 'uppercase',
  },
  points: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gray600,
  },
  questionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray900,
    lineHeight: 20,
    marginBottom: 12,
  },
  optionsList: {
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray50,
    padding: 8,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  optionBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  optionLetter: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
  },
  optionText: {
    fontSize: 13,
    color: Colors.gray800,
    flex: 1,
  },
  toggleBtn: {
    paddingVertical: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    marginTop: 4,
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  answerBox: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#ECFDF5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  answerTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 4,
  },
  answerText: {
    fontSize: 12,
    color: '#064E3B',
    lineHeight: 18,
  },
});
