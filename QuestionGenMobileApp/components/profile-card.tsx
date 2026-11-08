import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface ProfileCardProps {
  username: string;
  role: string;
  email?: string;
}

export default function ProfileCard({ username, role, email = 'scholar@edutech.internal' }: ProfileCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{username.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.username}>{username}</Text>
        <Text style={styles.email}>{email}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{role.toUpperCase()}</Text>
        </View>
      </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
  },
  info: {
    flex: 1,
  },
  username: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.gray900,
  },
  email: {
    fontSize: 12,
    color: Colors.gray500,
    marginTop: 1,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
});

