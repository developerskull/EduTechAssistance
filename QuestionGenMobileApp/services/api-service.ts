import { Platform } from 'react-native';

export interface Question {
  id?: number;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  options?: string[];
  correct_answer: string;
  points: number;
}

export interface QuestionPaperResponse {
  title: string;
  description?: string;
  questions: Question[];
  difficulty: string;
}

export interface StudyMaterialResponse {
  topic: string;
  summary: string;
  key_concepts: string[];
  cheat_sheet: string[];
}

export interface ChatMessage {
  id?: number;
  sender_role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface ChatResponse {
  conversation_id: number;
  assistant_message: ChatMessage;
}

export interface UserStats {
  total_questions_generated: number;
  total_study_materials: number;
  total_chat_sessions: number;
  exams_completed: number;
}

export interface UserActivity {
  id: number;
  activity_type: string;
  description: string;
  timestamp: string;
}

export interface DashboardData {
  stats: UserStats;
  activities: UserActivity[];
  user: {
    id: number;
    username: string;
    role: string;
  };
}

class ApiService {
  private getBaseUrl(): string {
    // Android emulator maps localhost to 10.0.2.2
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:5000/api';
    }
    // iOS and Web can use localhost directly
    return 'http://localhost:5000/api';
  }

  async checkHealth(): Promise<{ status: string; service: string }> {
    const res = await fetch(`${this.getBaseUrl()}/health`);
    if (!res.ok) throw new Error('Backend health check failed');
    return res.json();
  }

  async getDashboardData(): Promise<DashboardData> {
    const res = await fetch(`${this.getBaseUrl()}/dashboard`);
    if (!res.ok) {
      // Fallback demo data if no token or offline
      return {
        stats: {
          total_questions_generated: 45,
          total_study_materials: 12,
          total_chat_sessions: 28,
          exams_completed: 8,
        },
        activities: [
          {
            id: 1,
            activity_type: 'question_generated',
            description: 'Generated 5 questions on OS Virtual Memory',
            timestamp: new Date().toISOString(),
          },
          {
            id: 2,
            activity_type: 'study_created',
            description: 'Created study guide for Database Normalization',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
          },
        ],
        user: {
          id: 1,
          username: 'Demo Scholar',
          role: 'student',
        },
      };
    }
    const json = await res.json();
    return json.data;
  }

  async generateQuestions(params: {
    topic: string;
    num_questions?: number;
    difficulty?: string;
    question_types?: string[];
  }): Promise<QuestionPaperResponse> {
    const res = await fetch(`${this.getBaseUrl()}/generate-questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: params.topic,
        num_questions: params.num_questions || 5,
        difficulty: params.difficulty || 'medium',
        question_types: params.question_types || ['multiple_choice', 'true_false', 'short_answer'],
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to generate questions');
    }
    const json = await res.json();
    return json.data;
  }

  async generateStudyContent(params: { topic: string }): Promise<StudyMaterialResponse> {
    const res = await fetch(`${this.getBaseUrl()}/generate-study-content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to generate study materials');
    }
    const json = await res.json();
    return json.data;
  }

  async chatWithAi(params: {
    message: string;
    conversation_id?: number | null;
  }): Promise<ChatResponse> {
    const res = await fetch(`${this.getBaseUrl()}/chat-with-ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'AI chat response failed');
    }
    const json = await res.json();
    return json.data;
  }
}

export const apiService = new ApiService();
