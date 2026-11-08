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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Question Performance Analytics</h2>
            <p className="text-xs text-slate-500 mt-0.5">Deep-dive into student accuracy and answer distribution</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading question metrics...</div>
        ) : (
          <div className="p-6 space-y-6 overflow-y-auto">
            {/* Question Details */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
                <span>{question?.question_type?.replace('_', ' ')}</span>
                <span>{question?.points} Points</span>
              </div>
              <p className="text-sm font-semibold text-slate-800">{question?.question_text}</p>
              <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg">
                <span className="font-bold">Correct Solution:</span> {question?.correct_answer}
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 rounded-xl bg-slate-100 text-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Total Answers</span>
                <p className="text-xl font-black text-slate-900">{stats?.total_answers}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 text-center border border-emerald-100">
                <span className="text-[11px] font-bold text-emerald-700 uppercase">Correct</span>
                <p className="text-xl font-black text-emerald-950">{stats?.correct_count}</p>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50 text-center border border-indigo-100">
                <span className="text-[11px] font-bold text-indigo-700 uppercase">Accuracy Rate</span>
                <p className="text-xl font-black text-indigo-950">{stats?.accuracy_percentage}%</p>
              </div>
            </div>

            {/* Answer Distribution */}
            {Object.keys(distribution).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                  <PieChart className="w-4 h-4 text-slate-500" />
                  <span>Answer Distribution</span>
                </h4>
                <div className="space-y-1.5">
                  {Object.entries(distribution).map(([key, count]) => {
                    const pct = Math.round((count / Math.max(1, stats.total_answers)) * 100);
                    return (
                      <div key={key} className="flex items-center space-x-3 text-xs">
                        <span className="w-16 font-bold text-slate-700 truncate">{key}</span>
                        <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-12 text-right font-semibold text-slate-500">{count} ({pct}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Student Responses */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                All Student Responses ({data?.student_responses?.length || 0})
              </h4>
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-56 overflow-y-auto">
                {data?.student_responses?.map((r, i) => (
                  <div key={i} className="p-3 text-xs flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <span className="font-bold text-slate-800">{r.student_name}: </span>
                      <span className="text-slate-600">{r.student_answer || <span className="italic text-slate-400">Blank</span>}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        r.score === question?.points ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {r.score} / {question?.points}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

