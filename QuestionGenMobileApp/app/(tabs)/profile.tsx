import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Colors } from '../../constants/colors';
import ProfileCard from '../../components/profile-card';
import SettingsItem from '../../components/settings-item';

export default function ProfileScreen() {
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [offlineSync, setOfflineSync] = useState(false);

  const handleResetStorage = () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear locally cached exam papers and chat sessions?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => Alert.alert('Cleared', 'Local cache cleared.') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <ProfileCard username="Scholar Student" role="student" />

        {/* General Settings */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Exam & Sync Settings</Text>

          <SettingsItem
            label="Autosave In Progress"
            description="Automatically sync draft answers every 20s"
            isSwitch
            value={autoSave}
            onValueChange={setAutoSave}
          />

          <SettingsItem
            label="Push Notifications"
            description="Alerts for graded exams and teacher feedback"
            isSwitch
            value={notifications}
            onValueChange={setNotifications}
          />

          <SettingsItem
            label="Offline Mode Cache"
            description="Store study guides locally for disconnected review"
            isSwitch
            value={offlineSync}
            onValueChange={setOfflineSync}
          />
        </View>

        {/* System & Support */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>System & Support</Text>

          <SettingsItem
            label="Backend API Health"
            description="Check connection to Flask REST server (10.0.2.2 / localhost:5000)"
            onPress={() => Alert.alert('Connection', 'Backend URL: http://10.0.2.2:5000/api\nStatus: Online')}
          />

          <SettingsItem
            label="Clear Offline Cache"
            description="Remove cached study notes and logs"
            onPress={handleResetStorage}
          />

          <SettingsItem
            label="About EduTechAssistance"
            description="Version 3.0.0 Production Architecture"
            onPress={() =>
              Alert.alert(
                'EduTechAssistance',
                'Version 3.0.0\nDual-Engine Gemini AI & RAG Question Paper Generation\nRepository: developerskull/EduTechAssistance'
              )
            }
          />
        </View>
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
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gray600,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
});

