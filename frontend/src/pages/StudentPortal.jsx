import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Sparkles,
  MessageSquare,
  Clock,
  CheckCircle,
  ArrowRight,
  Send,
  Award,
  Layers,
  Copy,
  Printer,
  Trash2,
  HelpCircle,
  FileText
} from 'lucide-react';
import { studentAPI, aiAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function StudentPortal() {
  const toast = useToast();
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
  const chatBottomRef = useRef(null);

  const sampleTopics = [
    'Relational Databases & 3NF Normalization',
    'Process Scheduling & Deadlocks in OS',
    'Binary Search Trees & Balancing',
    'TCP/IP 4-Layer Architecture'
  ];

  const suggestedPrompts = [
    'Explain the difference between TCP and UDP with examples.',
    'Give me 3 practice multiple choice questions on Big-O notation.',
    'How does virtual memory paging work in modern operating systems?'
  ];

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

  useEffect(() => {
    if (activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  const handleGenerateStudy = async (topicToUse) => {
    const topic = topicToUse || studyTopic;
    if (!topic.trim()) return;
    setStudyLoading(true);
    try {
      const res = await aiAPI.generateStudyContent({ topic });
      setStudyContent(res.data.data);
      toast.success('Study guide generated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to generate study materials');
    } finally {
      setStudyLoading(false);
    }
  };

  const handleCopyStudyContent = () => {
    if (!studyContent) return;
    const text = `STUDY GUIDE: ${studyContent.topic}

OVERVIEW:
${studyContent.summary}

KEY CONCEPTS:
${(studyContent.key_concepts || []).map((c, i) => `${i + 1}. ${c}`).join('\n')}

QUICK CHEAT SHEET:
${(studyContent.cheat_sheet || []).map((t) => `• ${t}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    toast.success('Study guide copied to clipboard!');
  };

  const handleSendChat = async (messageText) => {
    const textToSend = messageText || chatMessage;
    if (!textToSend.trim() || chatLoading) return;

    setChatMessage('');
    setChatMessages((prev) => [...prev, { sender_role: 'user', content: textToSend }]);
    setChatLoading(true);

    try {
      const res = await aiAPI.chat({
        message: textToSend,
        conversation_id: conversationId
      });
      const data = res.data.data;
      setConversationId(data.conversation_id);
      setChatMessages((prev) => [...prev, data.assistant_message]);
    } catch (err) {
      toast.error('Failed to retrieve response from AI tutor');
      setChatMessages((prev) => [
        ...prev,
        { sender_role: 'assistant', content: 'Apologies, could not process response. Please check backend connection.' }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleClearChat = () => {
    setChatMessages([]);
    setConversationId(null);
    toast.info('Chat history cleared');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Student Banner */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Learning Portal</h1>
          <p className="text-sm text-slate-500 mt-1">
            Access assigned exams, review grades, generate personalized study guides, and consult your 24/7 AI Tutor.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('exams')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
            activeTab === 'exams'
              ? 'bg-indigo-600 text-white shadow-xs'
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
              ? 'bg-indigo-600 text-white shadow-xs'
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
              ? 'bg-indigo-600 text-white shadow-xs'
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
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Your Assigned Examinations</h3>
            <span className="text-xs text-slate-500 font-semibold">{assignments.length} Total</span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200">
            {assignments.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400 space-y-2">
                <BookOpen className="w-8 h-8 mx-auto text-slate-300" />
                <p className="font-semibold text-slate-600">No exams assigned yet</p>
                <p>When your teachers publish assignments, they will appear here automatically.</p>
              </div>
            ) : (
              assignments.map((item) => {
                const exam = item.exam;
                const isFinished = item.status === 'completed' || item.status === 'evaluated';

                return (
                  <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-slate-900">{exam?.title}</h4>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
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
                        Time Limit: <strong>{exam?.time_limit} Mins</strong> | Questions: <strong>{exam?.questions_count}</strong> | Total Points: <strong>{exam?.total_points}</strong>
                      </p>
                    </div>

                    <div>
                      {isFinished ? (
                        <Link
                          to={`/results/${item.id}`}
                          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition"
                        >
                          <Award className="w-3.5 h-3.5 text-indigo-600" />
                          <span>View Scorecard ({item.percentage}%)</span>
                        </Link>
                      ) : (
                        <Link
                          to={`/exam/${exam?.id}`}
                          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
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
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Generate Interactive Study Guides</h3>
            <p className="text-xs text-slate-500">
              Enter any syllabus topic to receive an instant summary, key concepts breakdown, and quick-revision cheat sheet.
            </p>

            <form onSubmit={(e) => { e.preventDefault(); handleGenerateStudy(); }} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                required
                value={studyTopic}
                onChange={(e) => setStudyTopic(e.target.value)}
                placeholder="Enter subject or topic (e.g. Relational Databases & SQL Normalization)..."
                className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
              />
              <button
                type="submit"
                disabled={studyLoading}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{studyLoading ? 'Generating Guide...' : 'Generate Study Material'}</span>
              </button>
            </form>

            {/* Quick Topic Suggestions */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-bold text-slate-400">Popular Topics:</span>
              {sampleTopics.map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setStudyTopic(t);
                    handleGenerateStudy(t);
                  }}
                  className="text-[11px] font-medium bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200 transition"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {studyContent && (
            <div className="glass-card p-6 sm:p-8 rounded-2xl space-y-6 border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {studyContent.topic}
                  </h2>
                  <span className="text-xs text-slate-500">Synthesized with Gemini 2.5 Flash</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyStudyContent}
                    className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Guide</span>
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Executive Summary</h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {studyContent.summary}
                </p>
              </div>

              {/* Key Concepts */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Core Concepts & Rules</h4>
                <ul className="space-y-2">
                  {studyContent.key_concepts?.map((c, i) => (
                    <li key={i} className="text-xs sm:text-sm text-slate-700 flex items-start space-x-3 p-3 rounded-xl bg-indigo-50/40 border border-indigo-100">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cheat Sheet */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">High-Yield Revision Sheet</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {studyContent.cheat_sheet?.map((tip, i) => (
                    <div key={i} className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-950 font-medium leading-relaxed">
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
        <div className="glass-card rounded-2xl border border-slate-200 overflow-hidden flex flex-col h-[650px]">
          {/* Chat Header */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-xs font-bold text-slate-800">24/7 AI Academic Tutor</h3>
              <span className="text-[10px] text-slate-400">Context-Aware Assistance</span>
            </div>

            {chatMessages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="flex items-center space-x-1 text-slate-400 hover:text-rose-600 text-xs font-semibold transition"
                title="Clear current conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset Chat</span>
              </button>
            )}
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {chatMessages.length === 0 ? (
              <div className="text-center p-8 text-slate-400 space-y-4">
                <MessageSquare className="w-12 h-12 mx-auto text-indigo-300" />
                <div>
                  <p className="text-sm font-semibold text-slate-700">How can I assist your study today?</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    Ask for concept breakdowns, sample test problems, or clarifications on challenging exam questions.
                  </p>
                </div>

                <div className="flex flex-col items-center space-y-2 max-w-md mx-auto pt-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Suggested Prompts</span>
                  {suggestedPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendChat(p)}
                      className="w-full text-left text-xs bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 p-2.5 rounded-xl border border-slate-200 transition"
                    >
                      " {p} "
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              chatMessages.map((m, i) => {
                const isUser = m.sender_role === 'user';
                return (
                  <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-br-none shadow-xs'
                        : 'bg-white text-slate-800 rounded-bl-none border border-slate-200 shadow-xs'
                    }`}>
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    </div>
                  </div>
                );
              })
            )}

            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 text-slate-500 text-xs px-4 py-2.5 rounded-2xl animate-pulse shadow-xs flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                  <span>AI Tutor is preparing your explanation...</span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={(e) => { e.preventDefault(); handleSendChat(); }} className="p-4 border-t border-slate-200 bg-white flex space-x-2">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Ask a question or request step-by-step guidance..."
              className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatMessage.trim()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition shadow-xs disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
