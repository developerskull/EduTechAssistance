import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Award, CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';
import { studentAPI } from '../services/api';

export default function StudentResultView() {
  const { attemptId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await studentAPI.getResultDetail(attemptId);
        setData(res.data.data);
      } catch (err) {
        alert(err.response?.data?.error?.message || 'Failed to load exam result');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [attemptId]);

  if (loading) {
    return <div className="p-12 text-center text-slate-500">Loading exam results...</div>;
  }

  const exam = data?.exam;
  const answers = data?.answers || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Link to="/student" className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Student Portal</span>
      </Link>

      {/* Scorecard Hero */}
      <div className="glass-panel p-8 rounded-2xl border border-slate-200 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">{exam?.title} - Scorecard</h1>
            <p className="text-xs text-slate-500 mt-1">
              Submission Date: {new Date(data?.submitted_at).toLocaleString()}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider self-start sm:self-auto ${
            data?.status === 'evaluated'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-amber-100 text-amber-800'
          }`}>
            {data?.status === 'evaluated' ? 'Fully Graded' : 'Awaiting Teacher Review'}
          </span>
        </div>

        {/* Big Numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Final Score</span>
            <p className="text-3xl font-black text-slate-900 mt-1">{data?.total_score} <span className="text-sm font-semibold text-slate-500">/ {data?.max_score}</span></p>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">Percentage</span>
            <p className="text-3xl font-black text-indigo-950 mt-1">{data?.percentage}%</p>
          </div>

          <div className="p-4 rounded-xl bg-violet-50 border border-violet-100 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-700">Performance</span>
            <p className="text-3xl font-black text-violet-950 mt-1">
              {data?.percentage >= 80 ? 'Mastery' : data?.percentage >= 60 ? 'Competent' : 'Developing'}
            </p>
          </div>
        </div>
      </div>

      {/* Questions Breakdown */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">Question-by-Question Breakdown</h2>
        {answers.map((ans, idx) => {
          const q = ans.question;
          const isObjective = q?.question_type === 'multiple_choice' || q?.question_type === 'true_false';
          const isCorrect = ans.score === q?.points;

          return (
            <div key={ans.id} className="glass-card p-6 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-500">Question {idx + 1} ({q?.question_type?.replace('_', ' ')})</span>
                <span className={`px-2.5 py-0.5 rounded-full ${
                  ans.is_verified
                    ? isCorrect
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  Score: {ans.score} / {q?.points} pts
                </span>
              </div>

              <p className="text-sm font-semibold text-slate-800">{q?.question_text}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-500 block mb-1">Your Submitted Answer:</span>
                  <span className="font-medium text-slate-900">{ans.student_answer || <span className="italic text-slate-400">Blank</span>}</span>
                </div>

                {ans.is_verified && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="font-bold text-emerald-800 block mb-1">Correct Answer / Model:</span>
                    <span className="font-medium text-emerald-950">{q?.correct_answer}</span>
                  </div>
                )}
              </div>

              {ans.feedback && (
                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-900">
                  <span className="font-bold">Teacher Feedback:</span> {ans.feedback}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

