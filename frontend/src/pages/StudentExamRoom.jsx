import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  Save,
  Send,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  ListOrdered,
  X
} from 'lucide-react';
import { studentAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function StudentExamRoom() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [examData, setExamData] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [autosaveStatus, setAutosaveStatus] = useState('All changes saved');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

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
        toast.error(err.response?.data?.error?.message || 'Failed to start exam session');
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
        setAutosaveStatus('Autosave pending reconnection');
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [attemptId, answers]);

  const handleAnswerChange = (qId, value) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const toggleFlag = (qId) => {
    setFlagged((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleTimeExpired = () => {
    toast.error('Time limit has expired! Finalizing and submitting your exam now.');
    executeSubmit();
  };

  const executeSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const payload = Object.entries(answers).map(([qId, val]) => ({
        question_id: parseInt(qId, 10),
        answer_text: val
      }));
      await studentAPI.submitExam(attemptId, payload);
      toast.success('Exam submitted successfully!');
      navigate(`/results/${attemptId}`);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to submit exam');
    } finally {
      setSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mb-4" />
        <h2 className="text-base font-bold text-slate-800">Preparing Secure Examination Session...</h2>
        <p className="text-xs text-slate-500 mt-1">Synchronizing server countdown timer and question bank.</p>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const totalQuestions = questions.length;
  const answeredCount = questions.filter((q) => answers[q.id]?.toString().trim()).length;
  const flaggedCount = Object.values(flagged).filter(Boolean).length;
  const percentComplete = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Exam Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div>
          <h1 className="text-sm sm:text-base font-bold text-slate-900">{examData?.title}</h1>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
            <span>
              Question <strong className="text-slate-800">{currentIdx + 1}</strong> of {totalQuestions}
            </span>
            <span>•</span>
            <span className="font-semibold text-emerald-600">{answeredCount} Answered</span>
            {flaggedCount > 0 && (
              <>
                <span>•</span>
                <span className="font-semibold text-amber-600">{flaggedCount} Flagged</span>
              </>
            )}
          </div>
        </div>

        {/* Live Timer & Submit */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <span className="text-[11px] font-medium text-slate-400 hidden md:inline">
            {autosaveStatus}
          </span>

          <div
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-mono font-bold text-xs sm:text-sm shadow-xs ${
              remainingSeconds < 300
                ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatTime(remainingSeconds)}</span>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            disabled={submitting}
            className="flex items-center space-x-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Finish & Submit</span>
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-1.5">
        <div
          className="bg-indigo-600 h-1.5 transition-all duration-300"
          style={{ width: `${percentComplete}%` }}
        />
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto w-full p-4 sm:p-6 flex-1 flex flex-col justify-between gap-6">
        {currentQ && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md">
                  Question {currentIdx + 1}
                </span>
                <span className="text-slate-400 capitalize">{currentQ.question_type.replace('_', ' ')}</span>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => toggleFlag(currentQ.id)}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    flagged[currentQ.id]
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {flagged[currentQ.id] ? (
                    <BookmarkCheck className="w-3.5 h-3.5 text-amber-700" />
                  ) : (
                    <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>{flagged[currentQ.id] ? 'Flagged' : 'Flag for Review'}</span>
                </button>

                <span className="text-indigo-600 font-bold bg-indigo-50/70 px-2.5 py-1 rounded-md">
                  {currentQ.points} Point{currentQ.points > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {currentQ.question_text}
            </h2>

            {/* Answer Input based on type */}
            <div className="pt-2">
              {currentQ.question_type === 'multiple_choice' && (
                <div className="space-y-2.5">
                  {(currentQ.options || []).map((opt, oIdx) => {
                    const isSelected = answers[currentQ.id] === opt;
                    const letter = String.fromCharCode(65 + oIdx);
                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => handleAnswerChange(currentQ.id, opt)}
                        className={`w-full text-left p-3.5 rounded-xl border-2 text-xs sm:text-sm font-medium transition flex items-center space-x-3 ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 font-bold shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-600 border border-slate-300'
                          }`}
                        >
                          {letter}
                        </span>
                        <span className="flex-1">{opt}</span>
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
                        className={`p-4 rounded-xl border-2 font-bold text-center text-sm sm:text-base transition ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 shadow-xs'
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
                    placeholder="Provide your complete analytical response here..."
                    className="w-full p-4 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white leading-relaxed"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Your response will be evaluated by your instructor using side-by-side model criteria.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Question Navigation & Quick-Jump Palette */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(currentIdx - 1)}
              className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-40"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous Question</span>
            </button>

            {/* Quick jump question tokens */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-lg px-2">
              {questions.map((q, idx) => {
                const isAnswered = Boolean(answers[q.id]?.toString().trim());
                const isFlagged = Boolean(flagged[q.id]);
                const isCurrent = currentIdx === idx;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    title={`Question ${idx + 1}: ${isFlagged ? 'Flagged' : isAnswered ? 'Answered' : 'Unanswered'}`}
                    className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center relative transition ${
                      isCurrent
                        ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 ring-offset-1'
                        : isFlagged
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : isAnswered
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 absolute top-0.5 right-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={currentIdx === totalQuestions - 1}
              onClick={() => setCurrentIdx(currentIdx + 1)}
              className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition disabled:opacity-40"
            >
              <span>Next Question</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Submission Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-slide-down">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span>Confirm Final Submission</span>
              </h3>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2">
              <p>Are you sure you are ready to conclude your examination?</p>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between font-semibold">
                  <span>Questions Attempted:</span>
                  <span className="text-emerald-600 font-bold">
                    {answeredCount} / {totalQuestions}
                  </span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Unanswered Questions:</span>
                  <span className="text-rose-600 font-bold">
                    {totalQuestions - answeredCount}
                  </span>
                </div>
                {flaggedCount > 0 && (
                  <div className="flex justify-between font-semibold">
                    <span>Flagged for Review:</span>
                    <span className="text-amber-600 font-bold">{flaggedCount}</span>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Once submitted, objective questions will be evaluated immediately. You cannot re-enter this exam session.
              </p>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Return to Exam
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={executeSubmit}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Yes, Submit Exam'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
