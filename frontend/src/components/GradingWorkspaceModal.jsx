import React, { useState } from 'react';
import { X, CheckCircle, Sparkles, Send, ArrowRight } from 'lucide-react';
import { teacherAPI } from '../services/api';

export default function GradingWorkspaceModal({ attempt, onClose, onEvaluated }) {
  const [answers, setAnswers] = useState(attempt?.answers || []);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [score, setScore] = useState(() => answers[0]?.score || answers[0]?.ai_suggested_score || 0);
  const [feedback, setFeedback] = useState(() => answers[0]?.feedback || '');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const currentAnswer = answers[selectedIdx];
  const question = currentAnswer?.question;

  const handleSelectAnswer = (idx) => {
    setSelectedIdx(idx);
    const ans = answers[idx];
    setScore(ans?.score || ans?.ai_suggested_score || 0);
    setFeedback(ans?.feedback || '');
    setSuccessMsg('');
  };

  const handleApplyAISuggestion = () => {
    if (currentAnswer?.ai_suggested_score !== null && currentAnswer?.ai_suggested_score !== undefined) {
      setScore(currentAnswer.ai_suggested_score);
      if (currentAnswer.ai_rationale && !feedback) {
        setFeedback(currentAnswer.ai_rationale);
      }
    }
  };

  const handleSaveEvaluation = async () => {
    if (!currentAnswer) return;
    setSaving(true);
    setSuccessMsg('');
    try {
      const res = await teacherAPI.evaluateAnswer({
        answer_id: currentAnswer.id,
        score: parseInt(score, 10),
        feedback: feedback
      });
      const updated = res.data.data;
      const newAnswers = [...answers];
      newAnswers[selectedIdx] = {
        ...newAnswers[selectedIdx],
        score: updated.score,
        is_verified: true,
        feedback: updated.feedback
      };
      setAnswers(newAnswers);
      setSuccessMsg('Evaluation recorded successfully in Classroom grades!');
      if (onEvaluated) onEvaluated();

      // Automatically advance to next unverified answer if available
      const nextUnverified = newAnswers.findIndex((a, i) => i > selectedIdx && !a.is_verified);
      if (nextUnverified !== -1) {
        setTimeout(() => handleSelectAnswer(nextUnverified), 600);
      }
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to save evaluation');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202124]/50 backdrop-blur-xs overflow-y-auto font-sans">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-xl border border-[#dadce0] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Google Classroom App Bar Header */}
        <div className="px-6 py-4 border-b border-[#dadce0] flex items-center justify-between bg-white">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-semibold text-[#202124]">Classroom Grading Workspace</h2>
              <span className="text-[11px] px-2 py-0.5 rounded font-medium bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc]">
                Submission #{attempt.id}
              </span>
            </div>
            <p className="text-xs text-[#5f6368] mt-0.5">
              Student: <span className="font-semibold text-[#202124]">{attempt.student_name}</span> | Exam: <span className="font-semibold text-[#202124]">{attempt.exam?.title}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-[#5f6368] hover:bg-[#f1f3f4] transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#f8f9fa]">
          {/* Question Selector Tabs */}
          <div className="flex items-center space-x-2 border-b border-[#dadce0] pb-3 overflow-x-auto bg-white p-3 rounded-lg border">
            {answers.map((ans, idx) => (
              <button
                key={ans.id}
                onClick={() => handleSelectAnswer(idx)}
                className={`px-3 py-1.5 rounded text-xs font-medium flex items-center space-x-1.5 whitespace-nowrap transition ${
                  selectedIdx === idx
                    ? 'bg-[#1a73e8] text-white shadow-xs'
                    : ans.is_verified
                    ? 'bg-[#e6f4ea] text-[#137333] border border-[#ceead6]'
                    : 'bg-[#f1f3f4] text-[#3c4043] hover:bg-[#e8eaed]'
                }`}
              >
                <span>Q{idx + 1} ({ans.question?.question_type?.replace('_', ' ')})</span>
                {ans.is_verified && <CheckCircle className="w-3.5 h-3.5 text-[#137333]" />}
              </button>
            ))}
          </div>

          {currentAnswer && (
            <div className="space-y-4">
              {/* Question Statement */}
              <div className="p-4 rounded-lg bg-white border border-[#dadce0]">
                <div className="flex items-center justify-between text-xs font-semibold text-[#5f6368] mb-1.5">
                  <span>Question {selectedIdx + 1} ({question?.points || 1} Points max)</span>
                  <span className="text-[#1a73e8] font-medium uppercase text-[11px]">{question?.question_type}</span>
                </div>
                <p className="text-sm font-medium text-[#202124] leading-relaxed">{question?.question_text}</p>
              </div>

              {/* Side-by-side Answer Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Model Answer */}
                <div className="rounded-lg border border-[#ceead6] bg-[#e6f4ea]/40 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#137333] uppercase tracking-wide mb-2">
                      <CheckCircle className="w-4 h-4 text-[#137333]" />
                      <span>Model Answer / Key</span>
                    </div>
                    <div className="text-xs font-medium text-[#137333] whitespace-pre-wrap leading-relaxed">
                      {question?.correct_answer}
                    </div>
                  </div>
                  {question?.ai_suggested_rubric && (
                    <div className="mt-3 pt-3 border-t border-[#ceead6] text-xs text-[#137333]">
                      <span className="font-semibold">Grading Rubric:</span> {question.ai_suggested_rubric}
                    </div>
                  )}
                </div>

                {/* Student Submitted Answer */}
                <div className="rounded-lg border border-[#d2e3fc] bg-[#e8f0fe]/40 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#1a73e8] uppercase tracking-wide mb-2">
                      <div className="w-2 h-2 rounded-full bg-[#1a73e8]"></div>
                      <span>Student Submission</span>
                    </div>
                    <div className="text-xs font-medium text-[#202124] whitespace-pre-wrap leading-relaxed">
                      {currentAnswer.student_answer || <span className="italic text-[#5f6368]">No answer submitted</span>}
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#d2e3fc] text-xs text-[#1a73e8] flex justify-between items-center font-medium">
                    <span>Status: {currentAnswer.is_verified ? 'Graded' : 'Turned In'}</span>
                    <span className="font-bold">Current: {currentAnswer.score} / {question?.points || 1} pts</span>
                  </div>
                </div>
              </div>

              {/* AI Auto-Grading Suggestion */}
              {currentAnswer.ai_suggested_score !== null && (
                <div className="p-3.5 rounded-lg bg-[#fef7e0] border border-[#feefc3] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start space-x-2.5">
                    <Sparkles className="w-4 h-4 text-[#ea8600] flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#b06000]">
                          Gemini AI Suggested Grade
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#fff] border border-[#feefc3] text-[#b06000]">
                          {currentAnswer.ai_suggested_score} / {question?.points || 1} pts
                        </span>
                      </div>
                      <p className="text-xs text-[#7c4a03] mt-0.5">{currentAnswer.ai_rationale}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyAISuggestion}
                    className="px-3 py-1.5 text-xs font-medium bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded transition whitespace-nowrap shadow-xs"
                  >
                    Apply Suggestion
                  </button>
                </div>
              )}

              {/* Teacher Evaluation Panel */}
              <div className="bg-white p-4 rounded-lg border border-[#dadce0] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#202124]">
                    Assign Points (0 to {question?.points || 1})
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={question?.points || 1}
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="w-24 px-3 py-1.5 border border-[#dadce0] rounded text-center font-bold text-sm bg-white focus:outline-none focus:border-[#1a73e8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#5f6368] mb-1">
                    Private Comment & Feedback for Student
                  </label>
                  <textarea
                    rows="2"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Add feedback to help the student understand..."
                    className="w-full p-2.5 border border-[#dadce0] rounded text-xs bg-white focus:outline-none focus:border-[#1a73e8] text-[#202124]"
                  />
                </div>

                {successMsg && (
                  <p className="text-xs text-[#137333] font-semibold">{successMsg}</p>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleSaveEvaluation}
                    disabled={saving}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-medium rounded shadow-xs transition disabled:opacity-50"
                  >
                    <span>{saving ? 'Saving...' : 'Save Grade & Next'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
