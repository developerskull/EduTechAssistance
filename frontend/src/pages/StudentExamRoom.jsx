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
      toast.success('Exam submitted to GoogleExam Classroom successfully!');
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
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 rounded-full border-3 border-[#e8f0fe] border-t-[#1a73e8] animate-spin mb-3" />
        <h2 className="text-sm font-medium text-[#202124]">Loading GoogleExam Quiz Session...</h2>
        <p className="text-xs text-[#5f6368] mt-1">Connecting to Google Classroom server and starting timer.</p>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const totalQuestions = questions.length;
  const answeredCount = questions.filter((q) => answers[q.id]?.toString().trim()).length;
  const flaggedCount = Object.values(flagged).filter(Boolean).length;
  const percentComplete = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      {/* Exam Header Styled like Google Forms */}
      <header className="bg-white border-b border-[#dadce0] px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-[#1a73e8] bg-[#e8f0fe] px-2 py-0.5 rounded">
              GoogleExam Quiz
            </span>
            <h1 className="text-sm sm:text-base font-medium text-[#202124]">{examData?.title}</h1>
          </div>
          <div className="flex items-center space-x-2 text-xs text-[#5f6368] mt-0.5">
            <span>
              Question <strong className="text-[#202124]">{currentIdx + 1}</strong> of {totalQuestions}
            </span>
            <span>•</span>
            <span className="font-medium text-[#137333]">{answeredCount} Answered</span>
            {flaggedCount > 0 && (
              <>
                <span>•</span>
                <span className="font-medium text-[#e37400]">{flaggedCount} Flagged</span>
              </>
            )}
          </div>
        </div>

        {/* Live Timer & Submit Button */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <span className="text-[11px] font-medium text-[#5f6368] hidden md:inline">
            {autosaveStatus}
          </span>

          <div
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-mono font-bold text-xs sm:text-sm ${
              remainingSeconds < 300
                ? 'bg-[#fce8e6] text-[#d93025] border border-[#f5c2c7] animate-pulse'
                : 'bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatTime(remainingSeconds)}</span>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            disabled={submitting}
            className="flex items-center space-x-1.5 px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-md text-xs font-medium shadow-xs transition disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Exam</span>
          </button>
        </div>
      </header>

      {/* Progress Bar (Google Blue) */}
      <div className="w-full bg-[#dadce0] h-1">
        <div
          className="bg-[#1a73e8] h-1 transition-all duration-300"
          style={{ width: `${percentComplete}%` }}
        />
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto w-full p-4 sm:p-6 flex-1 flex flex-col justify-between gap-6">
        {currentQ && (
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xs border border-[#dadce0] border-t-4 border-t-[#1a73e8] space-y-6">
            <div className="flex justify-between items-center text-xs text-[#5f6368] border-b border-[#dadce0] pb-3">
              <div className="flex items-center space-x-2">
                <span className="bg-[#f1f3f4] text-[#202124] px-2.5 py-1 rounded font-medium">
                  Question {currentIdx + 1}
                </span>
                <span className="capitalize">{currentQ.question_type.replace('_', ' ')}</span>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => toggleFlag(currentQ.id)}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium transition ${
                    flagged[currentQ.id]
                      ? 'bg-[#fef7e0] text-[#e37400] border border-[#fde293]'
                      : 'bg-[#f8f9fa] text-[#5f6368] hover:bg-[#f1f3f4] border border-[#dadce0]'
                  }`}
                >
                  {flagged[currentQ.id] ? (
                    <BookmarkCheck className="w-3.5 h-3.5 text-[#e37400]" />
                  ) : (
                    <Bookmark className="w-3.5 h-3.5 text-[#5f6368]" />
                  )}
                  <span>{flagged[currentQ.id] ? 'Flagged' : 'Flag'}</span>
                </button>

                <span className="text-[#1a73e8] font-semibold bg-[#e8f0fe] px-2.5 py-1 rounded">
                  {currentQ.points} Point{currentQ.points > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <h2 className="text-base sm:text-lg font-medium text-[#202124] leading-relaxed">
              {currentQ.question_text}
            </h2>

            {/* Answer Input styled like Google Forms */}
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
                        className={`w-full text-left p-3.5 rounded-lg border text-xs sm:text-sm transition flex items-center space-x-3 ${
                          isSelected
                            ? 'border-[#1a73e8] bg-[#e8f0fe] text-[#1a73e8] font-medium'
                            : 'border-[#dadce0] hover:bg-[#f8f9fa] bg-white text-[#3c4043]'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 border ${
                            isSelected
                              ? 'bg-[#1a73e8] text-white border-[#1a73e8]'
                              : 'bg-white text-[#5f6368] border-[#dadce0]'
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
                <div className="grid grid-cols-2 gap-3">
                  {['True', 'False'].map((tf) => {
                    const isSelected = answers[currentQ.id] === tf;
                    return (
                      <button
                        key={tf}
                        type="button"
                        onClick={() => handleAnswerChange(currentQ.id, tf)}
                        className={`p-3.5 rounded-lg border font-medium text-center text-xs sm:text-sm transition ${
                          isSelected
                            ? 'border-[#1a73e8] bg-[#e8f0fe] text-[#1a73e8]'
                            : 'border-[#dadce0] hover:bg-[#f8f9fa] bg-white text-[#3c4043]'
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
                    placeholder="Type your response here..."
                    className="w-full p-3.5 border border-[#dadce0] rounded-lg text-xs sm:text-sm focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] bg-white leading-relaxed text-[#202124]"
                  />
                  <p className="text-[11px] text-[#5f6368] mt-1">
                    Your response will be evaluated by your instructor using side-by-side criteria.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Question Navigation Palette */}
        <div className="bg-white p-4 rounded-lg border border-[#dadce0] shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(currentIdx - 1)}
              className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-4 py-2 bg-white border border-[#dadce0] rounded-md text-xs font-medium text-[#3c4043] hover:bg-[#f8f9fa] transition disabled:opacity-40"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {/* Quick jump question numbers */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-lg px-2">
              {questions.map((q, idx) => {
                const isAnswered = Boolean(answers[q.id]?.toString().trim());
                const isFlagged = Boolean(flagged[q.id]);
                const isCurrent = currentIdx === idx;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    title={`Question ${idx + 1}`}
                    className={`w-7 h-7 rounded text-xs font-medium flex items-center justify-center relative transition ${
                      isCurrent
                        ? 'bg-[#1a73e8] text-white font-bold ring-2 ring-[#1a73e8] ring-offset-1'
                        : isFlagged
                        ? 'bg-[#fef7e0] text-[#e37400] border border-[#fde293]'
                        : isAnswered
                        ? 'bg-[#e6f4ea] text-[#137333] border border-[#ceead6]'
                        : 'bg-[#f8f9fa] text-[#5f6368] border border-[#dadce0] hover:bg-[#f1f3f4]'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={currentIdx === totalQuestions - 1}
              onClick={() => setCurrentIdx(currentIdx + 1)}
              className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-4 py-2 bg-[#1a73e8] text-white rounded-md text-xs font-medium hover:bg-[#1557b0] transition disabled:opacity-40"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Submission Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl space-y-4 animate-slide-down border border-[#dadce0]">
            <div className="flex items-center justify-between border-b border-[#dadce0] pb-3">
              <h3 className="text-sm font-semibold text-[#202124] flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-[#f29900]" />
                <span>Submit Exam to Classroom?</span>
              </h3>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-[#5f6368] hover:text-[#202124]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-[#5f6368] space-y-2">
              <p>Review your progress before turning in your quiz:</p>
              <div className="bg-[#f8f9fa] p-3 rounded border border-[#dadce0] space-y-1">
                <div className="flex justify-between font-medium">
                  <span>Questions Attempted:</span>
                  <span className="text-[#137333] font-bold">
                    {answeredCount} / {totalQuestions}
                  </span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Unanswered Questions:</span>
                  <span className="text-[#d93025] font-bold">
                    {totalQuestions - answeredCount}
                  </span>
                </div>
                {flaggedCount > 0 && (
                  <div className="flex justify-between font-medium">
                    <span>Flagged for Review:</span>
                    <span className="text-[#e37400] font-bold">{flaggedCount}</span>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-[#5f6368]">
                Once submitted, objective questions will be auto-graded and subjective answers sent for teacher evaluation.
              </p>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2 px-4 bg-white border border-[#dadce0] hover:bg-[#f1f3f4] text-[#3c4043] font-medium text-xs rounded-md transition"
              >
                Return to Exam
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={executeSubmit}
                className="flex-1 py-2 px-4 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium text-xs rounded-md shadow-xs transition disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Yes, Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
