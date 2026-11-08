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
      setSuccessMsg('Answer evaluated and saved successfully!');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-900">Grading & Evaluation Workspace</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-100 text-indigo-700">
                Attempt #{attempt.id}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Student: <span className="font-semibold text-slate-700">{attempt.student_name}</span> | Exam: <span className="font-semibold text-slate-700">{attempt.exam?.title}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Question Selector Tabs */}
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 overflow-x-auto">
            {answers.map((ans, idx) => (
              <button
                key={ans.id}
                onClick={() => handleSelectAnswer(idx)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap transition ${
                  selectedIdx === idx
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : ans.is_verified
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>Q{idx + 1} ({ans.question?.question_type?.replace('_', ' ')})</span>
                {ans.is_verified && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
              </button>
            ))}
          </div>

          {currentAnswer && (
            <div className="space-y-5">
              {/* Question Statement */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  <span>Question {selectedIdx + 1} ({question?.points || 1} Points max)</span>
                  <span className="text-indigo-600 font-semibold">{question?.question_type}</span>
                </div>
                <p className="text-base font-medium text-slate-800">{question?.question_text}</p>
              </div>

              {/* SIDE BY SIDE ANSWER COMPARISON */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* MODEL ANSWER (EMERALD GREEN) */}
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Model / Expected Answer</span>
                    </div>
                    <div className="text-sm font-medium text-emerald-950 whitespace-pre-wrap leading-relaxed">
                      {question?.correct_answer}
                    </div>
                  </div>
                  {question?.ai_suggested_rubric && (
                    <div className="mt-4 pt-3 border-t border-emerald-200/60 text-xs text-emerald-800">
                      <span className="font-bold">Grading Rubric:</span> {question.ai_suggested_rubric}
                    </div>
                  )}
                </div>

                {/* STUDENT ANSWER (INDIGO BLUE) */}
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                      <span>Student's Submitted Answer</span>
                    </div>
                    <div className="text-sm font-medium text-indigo-950 whitespace-pre-wrap leading-relaxed">
                      {currentAnswer.student_answer || <span className="italic text-slate-400">No answer provided</span>}
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-indigo-200/60 text-xs text-indigo-700 flex justify-between items-center">
                    <span>Status: {currentAnswer.is_verified ? 'Graded' : 'Awaiting Teacher Grade'}</span>
                    <span className="font-bold">Current Score: {currentAnswer.score} / {question?.points || 1}</span>
                  </div>
                </div>
              </div>

              {/* AI SUGGESTION BADGE */}
              {currentAnswer.ai_suggested_score !== null && (
                <div className="p-4 rounded-xl bg-violet-50 border border-violet-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <Sparkles className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-violet-900">
                          AI Suggested Score
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-violet-200 text-violet-800">
                          {currentAnswer.ai_suggested_score} / {question?.points || 1} pts
                        </span>
                      </div>
                      <p className="text-xs text-violet-700 mt-0.5">{currentAnswer.ai_rationale}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyAISuggestion}
                    className="px-3 py-1.5 text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition whitespace-nowrap shadow-sm shadow-violet-200"
                  >
                    Apply Suggestion
                  </button>
                </div>
              )}

              {/* TEACHER EVALUATION INPUTS */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Assign Final Score (0 to {question?.points || 1})
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={question?.points || 1}
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="w-24 px-3 py-1.5 border border-slate-300 rounded-lg text-center font-bold text-sm bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Teacher Feedback & Commentary
                  </label>
                  <textarea
                    rows="2"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide supportive explanation or guidance on this answer..."
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {successMsg && (
                  <p className="text-xs text-emerald-600 font-semibold">{successMsg}</p>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveEvaluation}
                    disabled={saving}
                    className="flex items-center space-x-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
                  >
                    <span>{saving ? 'Saving...' : 'Save Grade & Continue'}</span>
                    <ArrowRight className="w-4 h-4" />
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

