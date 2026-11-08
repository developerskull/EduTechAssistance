import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { UserActivity } from '../services/api-service';

interface RecentActivityProps {
  activities: UserActivity[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  if (!activities || activities.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No recent activity logged yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Recent Activity</Text>
      {activities.map((act) => (
        <View key={act.id} style={styles.item}>
          <View style={styles.bullet} />
          <View style={styles.itemContent}>
            <Text style={styles.description}>{act.description}</Text>
            <Text style={styles.timestamp}>
              {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.gray800,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: 5,
    marginRight: 10,
  },
  itemContent: {
    flex: 1,
  },
  description: {
    fontSize: 13,
    color: Colors.gray800,
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 11,
    color: Colors.gray500,
    marginTop: 2,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.gray500,
  },
});
