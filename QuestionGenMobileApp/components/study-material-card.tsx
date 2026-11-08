import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';
import { StudyMaterialResponse } from '../services/api-service';

interface StudyMaterialCardProps {
  content: StudyMaterialResponse;
}

export default function StudyMaterialCard({ content }: StudyMaterialCardProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.headerRow}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        <View style={styles.headerText}>
          <Text style={styles.title}>{content.topic}</Text>
          <Text style={styles.subtitle}>AI Study Guide</Text>
        </View>
        <Text style={styles.expandIcon}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.body}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.summaryText}>{content.summary}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Concepts</Text>
            {content.key_concepts.map((concept, idx) => (
              <View key={idx} style={styles.conceptRow}>
                <Text style={styles.conceptBullet}>•</Text>
                <Text style={styles.conceptText}>{concept}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Revision Tips</Text>
            {content.cheat_sheet.map((tip, idx) => (
              <View key={idx} style={styles.tipBox}>
                <Text style={styles.tipText}>💡 {tip}</Text>
              </View>
            ))}
          </View>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.gray900,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  expandIcon: {
    fontSize: 12,
    color: Colors.gray500,
    marginLeft: 8,
  },
  body: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 12,
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gray600,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 13,
    color: Colors.gray800,
    lineHeight: 18,
  },
  conceptRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  conceptBullet: {
    fontSize: 14,
    color: Colors.primary,
    marginRight: 6,
    lineHeight: 18,
  },
  conceptText: {
    fontSize: 13,
    color: Colors.gray800,
    flex: 1,
    lineHeight: 18,
  },
  tipBox: {
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 8,
    marginBottom: 6,
  },
  tipText: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 16,
  },
});

