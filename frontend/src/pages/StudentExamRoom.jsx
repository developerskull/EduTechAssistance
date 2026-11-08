import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Save, Send, AlertTriangle, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { studentAPI } from '../services/api';

export default function StudentExamRoom() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [examData, setExamData] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [autosaveStatus, setAutosaveStatus] = useState('All changes saved');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const timerRef = useRef(null);

  // Initialize and start exam
  useEffect(() => {
    const initExam = async () => {
      try {
        const res = await studentAPI.startExam(examId);
        const data = res.data.data;
        setExamData(data.exam);
        setAttemptId(data.attempt_id);
        setQuestions(data.questions || []);
        setRemainingSeconds(data.remaining_seconds);
        if (data.saved_answers) {
          setAnswers(data.saved_answers);
        }
      } catch (err) {
        alert(err.response?.data?.error?.message || 'Failed to start exam');
        navigate('/student');
      } finally {
        setLoading(false);
      }
    };
    initExam();
  }, [examId, navigate]);

  // Client-side countdown timer (Server strictly enforces on submit)
  useEffect(() => {
    if (remainingSeconds <= 0) return;
    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [remainingSeconds]);

  // Periodic autosave every 20 seconds
  useEffect(() => {
    if (!attemptId || Object.keys(answers).length === 0) return;

    const interval = setInterval(async () => {
      try {
        setAutosaveStatus('Saving progress...');
        const payload = Object.entries(answers).map(([qId, val]) => ({
          question_id: parseInt(qId, 10),
          answer_text: val
        }));
        await studentAPI.saveProgress(attemptId, payload);
        setAutosaveStatus(`Autosaved at ${new Date().toLocaleTimeString()}`);
      } catch (e) {
        setAutosaveStatus('Autosave failed (offline?)');
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [attemptId, answers]);

  const handleAnswerChange = (qId, value) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleTimeExpired = () => {
    alert('Time limit has expired! Submitting your exam now.');
    handleSubmitExam();
  };

  const handleSubmitExam = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const payload = Object.entries(answers).map(([qId, val]) => ({
        question_id: parseInt(qId, 10),
        answer_text: val
      }));
      await studentAPI.submitExam(attemptId, payload);
      alert('Exam submitted successfully!');
      navigate(`/results/${attemptId}`);
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to submit exam');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500">Preparing examination session...</div>;
  }

  const currentQ = questions[currentIdx];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Exam Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div>
          <h1 className="text-base font-bold text-slate-900">{examData?.title}</h1>
          <span className="text-xs text-slate-500">
            Question {currentIdx + 1} of {questions.length}
          </span>
        </div>

        {/* Live Timer & Autosave Status */}
        <div className="flex items-center space-x-4">
          <span className="text-xs font-medium text-slate-500 hidden sm:inline">{autosaveStatus}</span>
          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-mono font-bold text-sm shadow-sm ${
            remainingSeconds < 300
              ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse'
              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
          }`}>
            <Clock className="w-4 h-4" />
            <span>{formatTime(remainingSeconds)}</span>
          </div>

          <button
            onClick={handleSubmitExam}
            disabled={submitting}
            className="flex items-center space-x-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? 'Submitting...' : 'Finish & Submit'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto w-full p-6 flex-1 flex flex-col justify-between">
        {currentQ && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-500">
              <span>Question {currentIdx + 1}</span>
              <span className="text-indigo-600">{currentQ.points} Point{currentQ.points > 1 ? 's' : ''}</span>
            </div>

            <h2 className="text-lg font-bold text-slate-900 leading-snug">
              {currentQ.question_text}
            </h2>

            {/* Answer Input based on type */}
            <div className="pt-2">
              {currentQ.question_type === 'multiple_choice' && (
                <div className="space-y-2.5">
                  {(currentQ.options || []).map((opt, oIdx) => {
                    const isSelected = answers[currentQ.id] === opt;
                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => handleAnswerChange(currentQ.id, opt)}
                        className={`w-full text-left p-3.5 rounded-xl border-2 text-sm font-medium transition ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {currentQ.question_type === 'true_false' && (
                <div className="grid grid-cols-2 gap-4">
                  {['True', 'False'].map((tf) => {
                    const isSelected = answers[currentQ.id] === tf;
                    return (
                      <button
                        key={tf}
                        type="button"
                        onClick={() => handleAnswerChange(currentQ.id, tf)}
                        className={`p-4 rounded-xl border-2 font-bold text-center text-base transition ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        {tf}
                      </button>
                    );
                  })}
                </div>
              )}

              {(currentQ.question_type === 'short_answer' || currentQ.question_type === 'essay') && (
                <div>
                  <textarea
                    rows={currentQ.question_type === 'essay' ? 6 : 4}
                    value={answers[currentQ.id] || ''}
                    onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full p-4 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white leading-relaxed"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Your answer will be reviewed and graded by your instructor.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Question Navigation Bar */}
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx(currentIdx - 1)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-40"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {/* Quick jump circles */}
          <div className="flex space-x-1.5 overflow-x-auto max-w-sm px-2">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentIdx(idx)}
                className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition ${
                  currentIdx === idx
                    ? 'bg-indigo-600 text-white'
                    : answers[q.id]
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-white border border-slate-200 text-slate-600'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={currentIdx === questions.length - 1}
            onClick={() => setCurrentIdx(currentIdx + 1)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition disabled:opacity-40"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

