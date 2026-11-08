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
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-12 text-[#5f6368] text-sm">
        <div className="w-8 h-8 rounded-full border-2 border-[#e8f0fe] border-t-[#1a73e8] animate-spin mb-3" />
        <span>Loading Classroom scorecard...</span>
      </div>
    );
  }

  const exam = data?.exam;
  const answers = data?.answers || [];
  const pct = data?.percentage || 0;

  const getGradeTier = (percentage) => {
    if (percentage >= 90) return { grade: 'A+', label: 'Exemplary', color: 'text-[#137333] bg-[#e6f4ea] border-[#ceead6]' };
    if (percentage >= 80) return { grade: 'A', label: 'Mastery', color: 'text-[#1a73e8] bg-[#e8f0fe] border-[#d2e3fc]' };
    if (percentage >= 70) return { grade: 'B', label: 'Competent', color: 'text-[#1a73e8] bg-[#e8f0fe] border-[#d2e3fc]' };
    if (percentage >= 60) return { grade: 'C', label: 'Developing', color: 'text-[#e37400] bg-[#fef7e0] border-[#fde293]' };
    return { grade: 'F', label: 'Needs Review', color: 'text-[#d93025] bg-[#fce8e6] border-[#f5c2c7]' };
  };

  const gradeInfo = getGradeTier(pct);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Top action bar - Hidden during print */}
      <div className="no-print flex items-center justify-between">
        <Link
          to="/student"
          className="inline-flex items-center space-x-1.5 text-xs font-medium text-[#1a73e8] hover:underline transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Student Portal</span>
        </Link>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#e8f0fe] border border-[#d2e3fc] hover:bg-[#d2e3fc] text-[#1a73e8] rounded-md text-xs font-medium transition shadow-xs"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / Export Transcript</span>
        </button>
      </div>

      {/* Scorecard Hero */}
      <div className="bg-white p-6 sm:p-8 rounded-lg border border-[#dadce0] shadow-xs space-y-6 print:shadow-none print:border-slate-400">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <FileCheck className="w-6 h-6 text-[#1a73e8] print:text-black" />
              <h1 className="text-xl sm:text-2xl font-medium text-[#202124]">
                {exam?.title} — Scorecard
              </h1>
            </div>
            <p className="text-xs text-[#5f6368] mt-1">
              Classroom Submission • Date: {new Date(data?.submitted_at).toLocaleString()} • Attempt #{attemptId}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider self-start sm:self-auto ${
              data?.status === 'evaluated'
                ? 'bg-[#e6f4ea] text-[#137333]'
                : 'bg-[#fef7e0] text-[#e37400]'
            }`}
          >
            {data?.status === 'evaluated' ? 'Fully Graded' : 'Turned In • Pending Review'}
          </span>
        </div>

        {/* Big Numbers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-lg bg-[#f8f9fa] border border-[#dadce0] text-center">
            <span className="text-xs font-medium text-[#5f6368] uppercase tracking-wider">Total Score</span>
            <p className="text-3xl font-bold text-[#202124] mt-1">
              {data?.total_score} <span className="text-sm font-normal text-[#5f6368]">/ {data?.max_score}</span>
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#e8f0fe] border border-[#d2e3fc] text-center">
            <span className="text-xs font-medium text-[#1a73e8] uppercase tracking-wider">Percentage</span>
            <p className="text-3xl font-bold text-[#1a73e8] mt-1">{pct}%</p>
          </div>

          <div className={`p-4 rounded-lg border text-center ${gradeInfo.color}`}>
            <span className="text-xs font-medium uppercase tracking-wider">Classroom Grade</span>
            <p className="text-3xl font-bold mt-1">
              {gradeInfo.grade} <span className="text-xs font-medium block">{gradeInfo.label}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Questions Breakdown */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#5f6368]">Performance Breakdown</h2>
        {answers.map((ans, idx) => {
          const q = ans.question;
          const isCorrect = ans.score === q?.points;

          return (
            <div key={ans.id} className="bg-white p-5 rounded-lg border border-[#dadce0] shadow-xs space-y-3 print:border-slate-300">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#5f6368] font-medium">
                  Question {idx + 1} ({q?.question_type?.replace('_', ' ')})
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded font-medium ${
                    ans.is_verified
                      ? isCorrect
                        ? 'bg-[#e6f4ea] text-[#137333]'
                        : 'bg-[#fce8e6] text-[#d93025]'
                      : 'bg-[#fef7e0] text-[#e37400]'
                  }`}
                >
                  Score: {ans.score} / {q?.points} pts
                </span>
              </div>

              <p className="text-sm font-medium text-[#202124]">{q?.question_text}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                <div className="p-3 rounded-md bg-[#f8f9fa] border border-[#dadce0]">
                  <span className="font-semibold text-[#5f6368] block mb-1">Your Submitted Response:</span>
                  <span className="text-[#202124]">
                    {ans.student_answer || <span className="italic text-[#5f6368]">No response entered</span>}
                  </span>
                </div>

                {ans.is_verified && (
                  <div className="p-3 rounded-md bg-[#e6f4ea] border border-[#ceead6]">
                    <span className="font-semibold text-[#137333] block mb-1">Model Answer / Key:</span>
                    <span className="text-[#0d5224]">{q?.correct_answer}</span>
                  </div>
                )}
              </div>

              {ans.feedback && (
                <div className="p-3 rounded-md bg-[#e8f0fe] border border-[#d2e3fc] text-xs text-[#1a73e8]">
                  <span className="font-bold">Teacher Commentary:</span> {ans.feedback}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
