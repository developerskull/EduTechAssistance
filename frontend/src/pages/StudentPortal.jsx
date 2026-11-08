import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Sparkles, MessageSquare, Clock, CheckCircle, ArrowRight, Send, Award, Layers } from 'lucide-react';
import { studentAPI, aiAPI } from '../services/api';

export default function StudentPortal() {
  const [activeTab, setActiveTab] = useState('exams'); // exams | study | chat
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  // AI Study Material State
  const [studyTopic, setStudyTopic] = useState('');
  const [studyLoading, setStudyLoading] = useState(false);
  const [studyContent, setStudyContent] = useState(null);

  // AI Chat State
  const [chatMessage, setChatMessage] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  const loadAssignments = async () => {
    try {
      const res = await studentAPI.getMyAssignments();
      setAssignments(res.data.data.items || []);
    } catch (err) {
      console.error('Failed to load student assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const handleGenerateStudy = async (e) => {
    e.preventDefault();
    if (!studyTopic.trim()) return;
    setStudyLoading(true);
    try {
      const res = await aiAPI.generateStudyContent({ topic: studyTopic });
      setStudyContent(res.data.data);
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to generate study materials');
    } finally {
      setStudyLoading(false);
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || chatLoading) return;

    const userText = chatMessage;
    setChatMessage('');
    setChatMessages((prev) => [...prev, { sender_role: 'user', content: userText }]);
    setChatLoading(true);

    try {
      const res = await aiAPI.chat({
        message: userText,
        conversation_id: conversationId
      });
      const data = res.data.data;
      setConversationId(data.conversation_id);
      setChatMessages((prev) => [...prev, data.assistant_message]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { sender_role: 'assistant', content: 'Apologies, could not process response. Please try again.' }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Student Banner */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Learning Portal</h1>
          <p className="text-sm text-slate-500 mt-1">
            Access your assigned exams, review grades, generate personalized study guides, and chat with AI.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('exams')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
            activeTab === 'exams'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>My Exams ({assignments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('study')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
            activeTab === 'study'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Study Materials</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
            activeTab === 'chat'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>AI Tutor Chat</span>
        </button>
      </div>

      {/* TAB 1: ASSIGNED EXAMS */}
      {activeTab === 'exams' && (
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-slate-900">Your Assigned Examinations</h3>
          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200">
            {assignments.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                You have no assigned exams at this time.
              </div>
            ) : (
              assignments.map((item) => {
                const exam = item.exam;
                const isFinished = item.status === 'completed' || item.status === 'evaluated';

                return (
                  <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-slate-900">{exam?.title}</h4>
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          item.status === 'evaluated'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'completed'
                            ? 'bg-amber-100 text-amber-800'
                            : item.status === 'in_progress'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {item.status?.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Time Limit: {exam?.time_limit} Mins | Questions: {exam?.questions_count} | Total Points: {exam?.total_points}
                      </p>
                    </div>

                    <div>
                      {isFinished ? (
                        <Link
                          to={`/results/${item.id}`}
                          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>View Scorecard ({item.percentage}%)</span>
                        </Link>
                      ) : (
                        <Link
                          to={`/exam/${exam?.id}`}
                          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                        >
                          <span>{item.status === 'in_progress' ? 'Resume Exam' : 'Start Exam'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: AI STUDY CONTENT */}
      {activeTab === 'study' && (
        <div className="space-y-6">
          <form onSubmit={handleGenerateStudy} className="glass-card p-6 rounded-2xl flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              required
              value={studyTopic}
              onChange={(e) => setStudyTopic(e.target.value)}
              placeholder="Enter subject or topic (e.g. Relational Databases & SQL Normalization)..."
              className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={studyLoading}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-200 transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{studyLoading ? 'Generating Guide...' : 'Generate Study Material'}</span>
            </button>
          </form>

          {studyContent && (
            <div className="glass-card p-8 rounded-2xl space-y-6">
              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-3">
                Study Guide: {studyContent.topic}
              </h2>

              {/* Summary */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Overview Summary</h4>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {studyContent.summary}
                </p>
              </div>

              {/* Key Concepts */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Key Concepts & Principles</h4>
                <ul className="space-y-2">
                  {studyContent.key_concepts?.map((c, i) => (
                    <li key={i} className="text-xs text-slate-700 flex items-start space-x-2 p-2.5 rounded-lg bg-indigo-50/50 border border-indigo-100">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cheat Sheet */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Quick Reference Cheat Sheet</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {studyContent.cheat_sheet?.map((tip, i) => (
                    <div key={i} className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium">
                      💡 {tip}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AI TUTOR CHAT */}
      {activeTab === 'chat' && (
        <div className="glass-card rounded-2xl border border-slate-200 overflow-hidden flex flex-col h-[600px]">
          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {chatMessages.length === 0 ? (
              <div className="text-center p-12 text-slate-400 space-y-2">
                <MessageSquare className="w-10 h-10 mx-auto text-indigo-300" />
                <p className="text-sm font-semibold text-slate-600">Ask your AI Study Assistant anything</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Type questions regarding complex topics, request step-by-step mathematical derivations, or ask for quiz practice.
                </p>
              </div>
            ) : (
              chatMessages.map((m, i) => {
                const isUser = m.sender_role === 'user';
                return (
                  <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-lg p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                        : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
                    }`}>
                      {m.content}
                    </div>
                  </div>
                );
              })
            )}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 text-slate-500 text-xs px-4 py-2.5 rounded-2xl animate-pulse">
                  AI is thinking...
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendChat} className="p-4 border-t border-slate-200 bg-white flex space-x-2">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Ask a question or request guidance..."
              className="flex-1 px-4 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={chatLoading}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition shadow-sm disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

