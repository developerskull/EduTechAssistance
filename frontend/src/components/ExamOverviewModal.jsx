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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202124]/50 backdrop-blur-xs overflow-y-auto font-sans">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-xl border border-[#dadce0] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#dadce0] flex items-center justify-between bg-white">
          <div>
            <h2 className="text-base font-semibold text-[#202124]">Classroom Performance & Analytics</h2>
            <p className="text-xs text-[#5f6368] mt-0.5">{data?.title || 'Loading assessment statistics...'}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-[#5f6368] hover:bg-[#f1f3f4] transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-[#5f6368]">Loading class performance analytics...</div>
        ) : (
          <div className="p-6 space-y-5 overflow-y-auto bg-[#f8f9fa]">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-lg bg-white border border-[#dadce0]">
                <div className="flex items-center space-x-1.5 text-[#1a73e8] text-[11px] font-semibold uppercase tracking-wider mb-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>Turned In</span>
                </div>
                <div className="text-2xl font-bold text-[#202124]">
                  {data?.total_submissions} <span className="text-xs font-normal text-[#5f6368]">/ {data?.total_assigned}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-white border border-[#dadce0]">
                <div className="flex items-center space-x-1.5 text-[#137333] text-[11px] font-semibold uppercase tracking-wider mb-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>Class Average</span>
                </div>
                <div className="text-2xl font-bold text-[#202124]">
                  {data?.average_score} <span className="text-xs font-normal text-[#5f6368]">/ {data?.max_score}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-white border border-[#dadce0]">
                <div className="flex items-center space-x-1.5 text-[#ea8600] text-[11px] font-semibold uppercase tracking-wider mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pending Grading</span>
                </div>
                <div className="text-2xl font-bold text-[#202124]">
                  {data?.pending_evaluations}
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-white border border-[#dadce0]">
                <div className="flex items-center space-x-1.5 text-[#1a73e8] text-[11px] font-semibold uppercase tracking-wider mb-1">
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Completion Rate</span>
                </div>
                <div className="text-2xl font-bold text-[#202124]">
                  {data?.total_assigned > 0 ? Math.round((data.total_submissions / data.total_assigned) * 100) : 0}%
                </div>
              </div>
            </div>

            {/* Question-by-Question Accuracy Bars */}
            <div className="bg-white p-4 rounded-lg border border-[#dadce0] space-y-3">
              <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider">
                Item Analysis & Accuracy
              </h3>
              <div className="space-y-2">
                {data?.question_stats?.map((q, idx) => (
                  <div key={q.question_id} className="p-3 rounded border border-[#dadce0] bg-[#f8f9fa] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-xs text-[#202124]">Q{idx + 1}:</span>
                        <span className="text-xs text-[#5f6368] truncate max-w-md">{q.question_text}</span>
                        <span className="text-[10px] uppercase font-medium px-1.5 py-0.5 rounded bg-[#e8eaed] text-[#3c4043]">
                          {q.question_type}
                        </span>
                      </div>
                      {/* Accuracy Bar */}
                      <div className="mt-2 w-full bg-[#e8eaed] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#1a73e8] h-full rounded-full transition-all duration-500"
                          style={{ width: `${q.accuracy_rate}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 text-xs">
                      <div className="text-right">
                        <span className="font-bold text-[#202124]">{q.accuracy_rate}%</span>
                        <span className="text-[11px] text-[#5f6368] ml-1">correct</span>
                      </div>
                      {onSelectQuestionAnalytics && (
                        <button
                          onClick={() => onSelectQuestionAnalytics(q.question_id)}
                          className="px-2.5 py-1 text-xs font-medium text-[#1a73e8] hover:bg-[#e8f0fe] rounded transition border border-[#d2e3fc]"
                        >
                          Deep Dive
                        </button>
                      )}
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
