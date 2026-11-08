import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { apiService, DashboardData } from '../../services/api-service';
import StatsCard from '../../components/stats-card';
import QuickActionCard from '../../components/quick-action-card';
import RecentActivity from '../../components/recent-activity';
import LoadingSpinner from '../../components/loading-spinner';

export default function HomeScreen() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const res = await apiService.getDashboardData();
      setData(res);
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoadingSpinner message="Connecting to EduTech Assistance..." />
      </SafeAreaView>
    );
  }

  const stats = data?.stats;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Welcome Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{data?.user.username || 'Scholar'} 👋</Text>
          <Text style={styles.subGreeting}>
            Dual-Engine Gemini AI Question Synthesis & Exam Manager
          </Text>
        </View>

        {/* Dynamic Stats Grid */}
        <View style={styles.statsRow}>
          <StatsCard
            title="Questions"
            value={stats?.total_questions_generated || 0}
            subtitle="Generated via AI"
          />
          <View style={{ width: 12 }} />
          <StatsCard
            title="Study Guides"
            value={stats?.total_study_materials || 0}
            subtitle="Created"
          />
        </View>

        <View style={[styles.statsRow, { marginTop: 12 }]}>
          <StatsCard
            title="Chat Sessions"
            value={stats?.total_chat_sessions || 0}
            subtitle="Tutor interactions"
          />
          <View style={{ width: 12 }} />
          <StatsCard
            title="Completed"
            value={stats?.exams_completed || 0}
            subtitle="Exams submitted"
          />
        </View>

        {/* Quick Action Cards */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>

        <QuickActionCard
          title="Generate Question Paper"
          description="Create MCQs, True/False, and analytical questions via Gemini"
          icon={<Text style={{ fontSize: 20 }}>📝</Text>}
          onPress={() => router.push('/(tabs)/questions')}
          accentColor={Colors.primary}
        />

        <QuickActionCard
          title="Create Study Material"
          description="Synthesize summaries, key formulas, and cheat sheets"
          icon={<Text style={{ fontSize: 20 }}>📚</Text>}
          onPress={() => router.push('/(tabs)/study')}
          accentColor={Colors.success}
        />

        <QuickActionCard
          title="Consult AI Study Tutor"
          description="Ask questions, request derivations, or practice problem sets"
          icon={<Text style={{ fontSize: 20 }}>💬</Text>}
          onPress={() => router.push('/(tabs)/chat')}
          accentColor={Colors.secondary}
        />

        {/* Live Recent Activity */}
        <View style={{ marginTop: 8 }}>
          <RecentActivity activities={data?.activities || []} />
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
    paddingBottom: 32,
  },
  header: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: Colors.gray600,
    fontWeight: '600',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.gray900,
    letterSpacing: -0.5,
  },
  subGreeting: {
    fontSize: 12,
    color: Colors.gray500,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.gray800,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

