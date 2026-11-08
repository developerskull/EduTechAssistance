import React, { useState, useEffect } from 'react';
import { X, BarChart3, Users, Award, Clock } from 'lucide-react';
import { teacherAPI } from '../services/api';

export default function ExamOverviewModal({ examId, onClose, onSelectQuestionAnalytics }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await teacherAPI.getExamOverview(examId);
        setData(res.data.data);
      } catch (err) {
        alert(err.response?.data?.error?.message || 'Failed to load exam overview');
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, [examId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Exam Class Analytics & Overview</h2>
            <p className="text-xs text-slate-500 mt-0.5">{data?.title || 'Loading exam data...'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading class performance analytics...</div>
        ) : (
          <div className="p-6 space-y-6 overflow-y-auto">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                <div className="flex items-center space-x-2 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-1">
                  <Users className="w-4 h-4" />
                  <span>Submissions</span>
                </div>
                <div className="text-2xl font-black text-indigo-950">
                  {data?.total_submissions} / {data?.total_assigned}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                <div className="flex items-center space-x-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
                  <Award className="w-4 h-4" />
                  <span>Class Average</span>
                </div>
                <div className="text-2xl font-black text-emerald-950">
                  {data?.average_score} <span className="text-sm font-semibold text-emerald-700">/ {data?.max_score}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                <div className="flex items-center space-x-2 text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">
                  <Clock className="w-4 h-4" />
                  <span>Pending Grading</span>
                </div>
                <div className="text-2xl font-black text-amber-950">
                  {data?.pending_evaluations}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-violet-50 border border-violet-100">
                <div className="flex items-center space-x-2 text-violet-700 text-xs font-bold uppercase tracking-wider mb-1">
                  <BarChart3 className="w-4 h-4" />
                  <span>Completion Rate</span>
                </div>
                <div className="text-2xl font-black text-violet-950">
                  {data?.total_assigned > 0 ? Math.round((data.total_submissions / data.total_assigned) * 100) : 0}%
                </div>
              </div>
            </div>

            {/* Question-by-Question Accuracy Bars */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Question Performance & Accuracy
              </h3>
              <div className="space-y-2.5">
                {data?.question_stats?.map((q, idx) => (
                  <div key={q.question_id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-slate-700">Q{idx + 1}:</span>
                        <span className="text-xs text-slate-600 truncate max-w-md">{q.question_text}</span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                          {q.question_type}
                        </span>
                      </div>
                      {/* Accuracy Bar */}
                      <div className="mt-2 w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            q.accuracy_percentage >= 75
                              ? 'bg-emerald-500'
                              : q.accuracy_percentage >= 50
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${q.accuracy_percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-bold text-slate-700">{q.accuracy_percentage}% Accuracy</span>
                      {onSelectQuestionAnalytics && (
                        <button
                          onClick={() => onSelectQuestionAnalytics(q.question_id)}
                          className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-slate-700 transition"
                        >
                          Deep Dive
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submissions List */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Student Submissions ({data?.submissions?.length || 0})
              </h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Student</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Score</th>
                      <th className="p-3">Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {data?.submissions?.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-800">{s.student_name}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            s.status === 'evaluated'
                              ? 'bg-emerald-100 text-emerald-800'
                              : s.status === 'completed'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-slate-700">{s.total_score} / {data?.max_score}</td>
                        <td className="p-3 font-bold text-slate-900">{s.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

