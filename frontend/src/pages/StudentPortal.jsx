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
      toast.success('Study guide synthesized with Gemini AI!');
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
        { sender_role: 'assistant', content: 'Apologies, could not process response. Please check connection.' }
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Google Classroom Student Class Banner */}
      <div className="bg-[#1a73e8] text-white p-6 sm:p-8 rounded-lg shadow-sm relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="relative z-10 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#e8f0fe] bg-[#1557b0] px-2.5 py-0.5 rounded">
            Student Classwork
          </span>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight">
            Computer Science 2026 — Student Portal
          </h1>
          <p className="text-xs text-[#e8f0fe]">
            Teacher: Alice • GoogleExam Classroom Suite
          </p>
        </div>
      </div>

      {/* Classroom Navigation Tabs */}
      <div className="flex border-b border-[#dadce0] bg-white rounded-t-lg px-2">
        <button
          onClick={() => setActiveTab('exams')}
          className={`px-5 py-3 text-xs font-medium border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'exams'
              ? 'border-[#1a73e8] text-[#1a73e8] font-bold'
              : 'border-transparent text-[#5f6368] hover:text-[#202124]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Assigned Exams ({assignments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('study')}
          className={`px-5 py-3 text-xs font-medium border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'study'
              ? 'border-[#1a73e8] text-[#1a73e8] font-bold'
              : 'border-transparent text-[#5f6368] hover:text-[#202124]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Study Guides</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`px-5 py-3 text-xs font-medium border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'chat'
              ? 'border-[#1a73e8] text-[#1a73e8] font-bold'
              : 'border-transparent text-[#5f6368] hover:text-[#202124]'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Classroom AI Tutor</span>
        </button>
      </div>

      {/* TAB 1: ASSIGNED EXAMS */}
      {activeTab === 'exams' && (
        <div className="bg-white p-6 rounded-lg border border-[#dadce0] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-[#202124]">Assigned Classwork & Exams</h3>
            <span className="text-xs text-[#5f6368] font-medium">{assignments.length} Total</span>
          </div>

          <div className="border border-[#dadce0] rounded-lg overflow-hidden divide-y divide-[#dadce0]">
            {assignments.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#5f6368] space-y-2">
                <BookOpen className="w-8 h-8 mx-auto text-[#dadce0]" />
                <p className="font-semibold text-[#202124]">No exams currently assigned</p>
                <p>When your instructor publishes examinations, they will appear here automatically.</p>
              </div>
            ) : (
              assignments.map((item) => {
                const exam = item.exam;
                const isFinished = item.status === 'completed' || item.status === 'evaluated';

                return (
                  <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#f8f9fa] transition">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-semibold text-[#202124]">{exam?.title}</h4>
                        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                          item.status === 'evaluated'
                            ? 'bg-[#e6f4ea] text-[#137333]'
                            : item.status === 'completed'
                            ? 'bg-[#fef7e0] text-[#e37400]'
                            : item.status === 'in_progress'
                            ? 'bg-[#e8f0fe] text-[#1a73e8]'
                            : 'bg-[#f1f3f4] text-[#5f6368]'
                        }`}>
                          {item.status === 'evaluated' ? 'Graded' : item.status === 'completed' ? 'Turned in' : item.status?.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-[#5f6368] mt-1">
                        Time: <strong>{exam?.time_limit} Mins</strong> | Questions: <strong>{exam?.questions_count}</strong> | Maximum Marks: <strong>{exam?.total_points}</strong>
                      </p>
                    </div>

                    <div>
                      {isFinished ? (
                        <Link
                          to={`/results/${item.id}`}
                          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-white hover:bg-[#f1f3f4] border border-[#dadce0] text-[#202124] rounded-md text-xs font-medium transition"
                        >
                          <Award className="w-3.5 h-3.5 text-[#1a73e8]" />
                          <span>View Scorecard ({item.percentage}%)</span>
                        </Link>
                      ) : (
                        <Link
                          to={`/exam/${exam?.id}`}
                          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-md text-xs font-medium shadow-xs transition"
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
          <div className="bg-white p-6 rounded-lg border border-[#dadce0] shadow-xs space-y-4">
            <h3 className="text-base font-semibold text-[#202124]">Synthesize AI Study Guides</h3>
            <p className="text-xs text-[#5f6368]">
              Enter any syllabus topic to generate an instant executive summary, key concepts breakdown, and revision cheat sheet.
            </p>

            <form onSubmit={(e) => { e.preventDefault(); handleGenerateStudy(); }} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                required
                value={studyTopic}
                onChange={(e) => setStudyTopic(e.target.value)}
                placeholder="Enter subject or topic (e.g. Relational Databases & SQL Normalization)..."
                className="flex-1 px-4 py-2.5 border border-[#dadce0] rounded-md text-xs sm:text-sm focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] bg-white"
              />
              <button
                type="submit"
                disabled={studyLoading}
                className="px-6 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-md text-xs sm:text-sm font-medium shadow-xs transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{studyLoading ? 'Synthesizing...' : 'Generate Study Material'}</span>
              </button>
            </form>

            {/* Quick Topic Suggestions */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-medium text-[#5f6368]">Suggested Topics:</span>
              {sampleTopics.map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setStudyTopic(t);
                    handleGenerateStudy(t);
                  }}
                  className="text-[11px] font-medium bg-[#f8f9fa] hover:bg-[#e8f0fe] hover:text-[#1a73e8] text-[#5f6368] px-2.5 py-1 rounded-md border border-[#dadce0] transition"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {studyContent && (
            <div className="bg-white p-6 sm:p-8 rounded-lg space-y-6 border border-[#dadce0] shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#dadce0] gap-3">
                <div>
                  <h2 className="text-xl font-medium text-[#202124]">
                    {studyContent.topic}
                  </h2>
                  <span className="text-xs text-[#5f6368]">Synthesized with Google Gemini 2.5 Flash</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyStudyContent}
                    className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-[#3c4043] bg-white hover:bg-[#f1f3f4] rounded-md border border-[#dadce0] transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-[#1a73e8] bg-[#e8f0fe] hover:bg-[#d2e3fc] rounded-md border border-[#d2e3fc] transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Guide</span>
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#5f6368] mb-2">Executive Summary</h4>
                <p className="text-xs sm:text-sm text-[#3c4043] leading-relaxed bg-[#f8f9fa] p-4 rounded-lg border border-[#dadce0]">
                  {studyContent.summary}
                </p>
              </div>

              {/* Key Concepts */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#5f6368] mb-2">Core Concepts & Rules</h4>
                <ul className="space-y-2">
                  {studyContent.key_concepts?.map((c, i) => (
                    <li key={i} className="text-xs sm:text-sm text-[#3c4043] flex items-start space-x-3 p-3 rounded-lg bg-[#e8f0fe]/40 border border-[#d2e3fc]">
                      <span className="w-5 h-5 rounded-full bg-[#1a73e8] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cheat Sheet */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#5f6368] mb-2">High-Yield Revision Sheet</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {studyContent.cheat_sheet?.map((tip, i) => (
                    <div key={i} className="p-3.5 bg-[#fef7e0] border border-[#fde293] rounded-lg text-xs text-[#92400e] font-medium leading-relaxed">
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
        <div className="bg-white rounded-lg border border-[#dadce0] shadow-xs overflow-hidden flex flex-col h-[650px]">
          {/* Chat Header */}
          <div className="p-4 bg-[#f8f9fa] border-b border-[#dadce0] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#137333] animate-pulse" />
              <h3 className="text-xs font-medium text-[#202124]">Classroom 24/7 AI Tutor</h3>
              <span className="text-[10px] text-[#5f6368]">• Contextual Assistance</span>
            </div>

            {chatMessages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="flex items-center space-x-1 text-[#5f6368] hover:text-[#d93025] text-xs font-medium transition"
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
              <div className="text-center p-8 text-[#5f6368] space-y-4">
                <MessageSquare className="w-12 h-12 mx-auto text-[#1a73e8] opacity-40" />
                <div>
                  <p className="text-sm font-medium text-[#202124]">How can I help with your studies today?</p>
                  <p className="text-xs text-[#5f6368] max-w-sm mx-auto mt-1">
                    Ask for concept breakdowns, sample exam problems, or explanations on tricky course questions.
                  </p>
                </div>

                <div className="flex flex-col items-center space-y-2 max-w-md mx-auto pt-2">
                  <span className="text-[11px] font-semibold text-[#5f6368] uppercase tracking-wider">Suggested Prompts</span>
                  {suggestedPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendChat(p)}
                      className="w-full text-left text-xs bg-[#f8f9fa] hover:bg-[#e8f0fe] hover:text-[#1a73e8] text-[#3c4043] p-2.5 rounded-md border border-[#dadce0] transition"
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
                    <div className={`max-w-xl p-3.5 rounded-lg text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-[#1a73e8] text-white shadow-xs'
                        : 'bg-[#f8f9fa] text-[#202124] border border-[#dadce0]'
                    }`}>
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    </div>
                  </div>
                );
              })
            )}

            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-[#f8f9fa] border border-[#dadce0] text-[#5f6368] text-xs px-4 py-2.5 rounded-lg animate-pulse flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-[#1a73e8] animate-ping" />
                  <span>Google AI Tutor is typing...</span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={(e) => { e.preventDefault(); handleSendChat(); }} className="p-3.5 border-t border-[#dadce0] bg-white flex space-x-2">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Ask a question or request step-by-step guidance..."
              className="flex-1 px-4 py-2 border border-[#dadce0] rounded-md text-xs sm:text-sm focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] bg-white"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatMessage.trim()}
              className="px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-md transition shadow-xs disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
