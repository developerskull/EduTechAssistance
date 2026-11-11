import React, { useState, useEffect } from 'react';
import { X, CheckCircle, PieChart, AlertCircle } from 'lucide-react';
import { teacherAPI } from '../services/api';

export default function QuestionAnalyticsModal({ examId, questionId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await teacherAPI.getQuestionAnalytics(examId, questionId);
        setData(res.data.data);
      } catch (err) {
        alert(err.response?.data?.error?.message || 'Failed to load question analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [examId, questionId]);

  const stats = data?.statistics;
  const question = data?.question;
  const distribution = stats?.answer_distribution || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202124]/50 backdrop-blur-xs overflow-y-auto font-sans">
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-xl border border-[#dadce0] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#dadce0] flex items-center justify-between bg-white">
          <div>
            <h2 className="text-base font-semibold text-[#202124]">Question Breakdown & Analytics</h2>
            <p className="text-xs text-[#5f6368] mt-0.5">Item response diagnostics and cohort distribution</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-[#5f6368] hover:bg-[#f1f3f4] transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-[#5f6368]">Loading question metrics...</div>
        ) : (
          <div className="p-6 space-y-5 overflow-y-auto bg-[#f8f9fa]">
            {/* Question Details */}
            <div className="p-4 rounded-lg bg-white border border-[#dadce0] space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[#5f6368] uppercase">
                <span>{question?.question_type?.replace('_', ' ')}</span>
                <span>{question?.points} Points</span>
              </div>
              <p className="text-sm font-medium text-[#202124]">{question?.question_text}</p>
              <div className="text-xs text-[#137333] bg-[#e6f4ea] border border-[#ceead6] p-2.5 rounded">
                <span className="font-semibold">Correct Solution:</span> {question?.correct_answer}
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-white border border-[#dadce0] text-center">
                <span className="text-[11px] font-semibold text-[#5f6368] uppercase">Total Responses</span>
                <p className="text-xl font-bold text-[#202124]">{stats?.total_answers}</p>
              </div>
              <div className="p-3 rounded-lg bg-white border border-[#dadce0] text-center">
                <span className="text-[11px] font-semibold text-[#137333] uppercase">Correct</span>
                <p className="text-xl font-bold text-[#137333]">{stats?.correct_count}</p>
              </div>
              <div className="p-3 rounded-lg bg-white border border-[#dadce0] text-center">
                <span className="text-[11px] font-semibold text-[#1a73e8] uppercase">Accuracy Rate</span>
                <p className="text-xl font-bold text-[#1a73e8]">{stats?.accuracy_percentage}%</p>
              </div>
            </div>

            {/* Answer Distribution */}
            {Object.keys(distribution).length > 0 && (
              <div className="bg-white p-4 rounded-lg border border-[#dadce0] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#202124] flex items-center space-x-1.5">
                  <PieChart className="w-4 h-4 text-[#5f6368]" />
                  <span>Answer Distribution</span>
                </h4>
                <div className="space-y-2">
                  {Object.entries(distribution).map(([key, count]) => {
                    const pct = Math.round((count / Math.max(1, stats.total_answers)) * 100);
                    return (
                      <div key={key} className="flex items-center space-x-3 text-xs">
                        <span className="w-16 font-medium text-[#202124] truncate">{key}</span>
                        <div className="flex-1 bg-[#e8eaed] h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#1a73e8] h-full rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-16 text-right font-medium text-[#5f6368]">{count} ({pct}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
