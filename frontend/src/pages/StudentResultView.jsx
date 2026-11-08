import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Award, CheckCircle, XCircle, Clock, ArrowLeft, Printer, FileCheck } from 'lucide-react';
import { studentAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function StudentResultView() {
  const { attemptId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await studentAPI.getResultDetail(attemptId);
        setData(res.data.data);
      } catch (err) {
        toast.error(err.response?.data?.error?.message || 'Failed to load exam result');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-12 text-slate-500 text-sm">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin mb-3" />
        <span>Loading comprehensive scorecard...</span>
      </div>
    );
  }

  const exam = data?.exam;
  const answers = data?.answers || [];
  const pct = data?.percentage || 0;

  const getGradeTier = (percentage) => {
    if (percentage >= 90) return { grade: 'A+', label: 'Distinction / Exemplary', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (percentage >= 80) return { grade: 'A', label: 'Mastery / Very Good', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
    if (percentage >= 70) return { grade: 'B', label: 'Competent / Good', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    if (percentage >= 60) return { grade: 'C', label: 'Developing / Satisfactory', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { grade: 'F', label: 'Needs Remediation', color: 'text-rose-700 bg-rose-50 border-rose-200' };
  };

  const gradeInfo = getGradeTier(pct);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Top action bar - Hidden during print */}
      <div className="no-print flex items-center justify-between">
        <Link
          to="/student"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Student Portal</span>
        </Link>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition shadow-xs"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / Export Transcript</span>
        </button>
      </div>

      {/* Scorecard Hero */}
      <div className="glass-panel p-8 rounded-2xl border border-slate-200 shadow-md space-y-6 print:shadow-none print:border-slate-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <FileCheck className="w-6 h-6 text-indigo-600 print:text-black" />
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {exam?.title} - Scorecard
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Submission Date: {new Date(data?.submitted_at).toLocaleString()} | Attempt ID: #{attemptId}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider self-start sm:self-auto ${
              data?.status === 'evaluated'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {data?.status === 'evaluated' ? 'Fully Graded' : 'Awaiting Teacher Review'}
          </span>
        </div>

        {/* Big Numbers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Marks</span>
            <p className="text-3xl font-black text-slate-900 mt-1">
              {data?.total_score} <span className="text-sm font-semibold text-slate-500">/ {data?.max_score}</span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">Percentage</span>
            <p className="text-3xl font-black text-indigo-950 mt-1">{pct}%</p>
          </div>

          <div className={`p-4 rounded-xl border text-center ${gradeInfo.color}`}>
            <span className="text-xs font-bold uppercase tracking-wider">Letter Grade</span>
            <p className="text-3xl font-black mt-1">
              {gradeInfo.grade} <span className="text-xs font-semibold block">{gradeInfo.label}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Questions Breakdown */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">Performance by Question</h2>
        {answers.map((ans, idx) => {
          const q = ans.question;
          const isCorrect = ans.score === q?.points;

          return (
            <div key={ans.id} className="glass-card p-6 rounded-2xl border border-slate-200 space-y-3 print:border-slate-300">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-500">
                  Question {idx + 1} ({q?.question_type?.replace('_', ' ')})
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full ${
                    ans.is_verified
                      ? isCorrect
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  Score: {ans.score} / {q?.points} pts
                </span>
              </div>

              <p className="text-sm font-semibold text-slate-800">{q?.question_text}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-500 block mb-1">Your Submitted Answer:</span>
                  <span className="font-medium text-slate-900">
                    {ans.student_answer || <span className="italic text-slate-400">Blank</span>}
                  </span>
                </div>

                {ans.is_verified && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="font-bold text-emerald-800 block mb-1">Model Answer / Key:</span>
                    <span className="font-medium text-emerald-950">{q?.correct_answer}</span>
                  </div>
                )}
              </div>

              {ans.feedback && (
                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-900">
                  <span className="font-bold">Instructor Commentary:</span> {ans.feedback}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
