import React, { useState } from 'react';
import { X, Printer, FileText, CheckCircle2 } from 'lucide-react';

export default function ExamPrintModal({ exam, onClose }) {
  const [showAnswerKey, setShowAnswerKey] = useState(false);

  if (!exam) return null;

  const handlePrint = () => {
    window.print();
  };

  const objectiveQuestions = (exam.questions || []).filter(
    (q) => q.question_type === 'multiple_choice' || q.question_type === 'true_false'
  );
  const subjectiveQuestions = (exam.questions || []).filter(
    (q) => q.question_type === 'short_answer' || q.question_type === 'essay'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-8 print:my-0 print:shadow-none print:w-full print:max-w-none">
        {/* Modal Controls - Hidden during print */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold">Official Examination Paper View</h3>
              <p className="text-[11px] text-slate-400">Ready for high-fidelity printing or PDF export</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer select-none bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 transition">
              <input
                type="checkbox"
                checked={showAnswerKey}
                onChange={(e) => setShowAnswerKey(e.target.checked)}
                className="rounded border-slate-700 text-indigo-600 focus:ring-0"
              />
              <span>Include Answer Key</span>
            </label>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition p-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Examination Paper Body */}
        <div className="p-8 sm:p-12 print:p-0 font-serif text-slate-900 bg-white">
          {/* Header */}
          <div className="text-center border-b-2 border-slate-900 pb-6 mb-6">
            <h1 className="text-xl sm:text-2xl font-bold tracking-wide uppercase">
              INSTITUTE OF ACADEMIC EXCELLENCE
            </h1>
            <h2 className="text-base sm:text-lg font-semibold mt-1 text-slate-800">
              {exam.title}
            </h2>
            {exam.description && (
              <p className="text-xs text-slate-600 italic mt-1 max-w-xl mx-auto">
                {exam.description}
              </p>
            )}

            <div className="flex flex-wrap justify-between items-center text-xs font-sans font-semibold mt-5 pt-3 border-t border-slate-300">
              <div>Time Allowed: <span className="font-bold">{exam.time_limit} Minutes</span></div>
              {showAnswerKey && (
                <div className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase tracking-widest text-[10px]">
                  *** TEACHER'S MASTER KEY ***
                </div>
              )}
              <div>Maximum Marks: <span className="font-bold">{exam.total_points} Marks</span></div>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-xs font-sans bg-slate-50 border border-slate-200 rounded p-3 mb-8 print:bg-transparent print:border-slate-300">
            <span className="font-bold uppercase tracking-wider">Instructions to Candidates:</span>
            <ol className="list-decimal list-inside mt-1 space-y-0.5 text-slate-700">
              <li>Read every question thoroughly before recording your answers.</li>
              <li>Write clearly and concisely; illegible handwriting or ambiguously marked responses may be penalized.</li>
              <li>Marks allocated for each question are indicated in brackets on the right.</li>
            </ol>
          </div>

          {/* Section A: Objective Questions */}
          {objectiveQuestions.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between border-b border-slate-400 pb-1 mb-4">
                <h3 className="font-sans font-bold text-sm uppercase tracking-wider text-slate-800">
                  Section A: Objective Questions
                </h3>
                <span className="text-xs font-sans text-slate-600">
                  [Total: {objectiveQuestions.reduce((acc, q) => acc + (q.points || 0), 0)} Marks]
                </span>
              </div>

              <div className="space-y-6">
                {objectiveQuestions.map((q, idx) => (
                  <div key={q.id || idx} className="text-sm">
                    <div className="flex items-start justify-between">
                      <div className="font-medium">
                        <span className="font-bold mr-2">Q{idx + 1}.</span>
                        <span>{q.question_text}</span>
                      </div>
                      <span className="font-sans text-xs font-bold ml-4 whitespace-nowrap text-slate-700">
                        [{q.points} {q.points === 1 ? 'Mark' : 'Marks'}]
                      </span>
                    </div>

                    {/* Multiple choice options */}
                    {q.question_type === 'multiple_choice' && Array.isArray(q.options) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 ml-6 text-xs font-sans">
                        {q.options.map((opt, oIdx) => {
                          const letter = String.fromCharCode(65 + oIdx);
                          const isCorrect = showAnswerKey && q.correct_answer === opt;
                          return (
                            <div
                              key={oIdx}
                              className={`p-1.5 rounded flex items-center space-x-2 ${
                                isCorrect
                                  ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-300'
                                  : 'text-slate-800'
                              }`}
                            >
                              <span className="w-5 h-5 rounded-full border border-slate-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                                {letter}
                              </span>
                              <span>{opt}</span>
                              {isCorrect && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto inline" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* True / False display */}
                    {q.question_type === 'true_false' && (
                      <div className="flex items-center space-x-6 mt-2 ml-6 text-xs font-sans">
                        {['True', 'False'].map((tf) => {
                          const isCorrect =
                            showAnswerKey &&
                            String(q.correct_answer).toLowerCase() === tf.toLowerCase();
                          return (
                            <div
                              key={tf}
                              className={`p-1.5 rounded flex items-center space-x-1.5 ${
                                isCorrect
                                  ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-300'
                                  : 'text-slate-700'
                              }`}
                            >
                              <span className="w-3.5 h-3.5 rounded-full border border-slate-400 inline-block" />
                              <span>{tf}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {showAnswerKey && q.correct_answer && q.question_type !== 'multiple_choice' && (
                      <div className="mt-2 ml-6 text-xs font-sans bg-emerald-50 text-emerald-800 p-2 rounded border border-emerald-200">
                        <span className="font-bold">Correct Key: </span>
                        {q.correct_answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section B: Subjective Questions */}
          {subjectiveQuestions.length > 0 && (
            <div>
              <div className="flex items-center justify-between border-b border-slate-400 pb-1 mb-4">
                <h3 className="font-sans font-bold text-sm uppercase tracking-wider text-slate-800">
                  Section B: Subjective & Analytical Questions
                </h3>
                <span className="text-xs font-sans text-slate-600">
                  [Total: {subjectiveQuestions.reduce((acc, q) => acc + (q.points || 0), 0)} Marks]
                </span>
              </div>

              <div className="space-y-6">
                {subjectiveQuestions.map((q, idx) => {
                  const qNum = objectiveQuestions.length + idx + 1;
                  return (
                    <div key={q.id || idx} className="text-sm">
                      <div className="flex items-start justify-between">
                        <div className="font-medium">
                          <span className="font-bold mr-2">Q{qNum}.</span>
                          <span>{q.question_text}</span>
                        </div>
                        <span className="font-sans text-xs font-bold ml-4 whitespace-nowrap text-slate-700">
                          [{q.points} {q.points === 1 ? 'Mark' : 'Marks'}]
                        </span>
                      </div>

                      {showAnswerKey ? (
                        <div className="mt-3 ml-6 text-xs font-sans bg-emerald-50 text-emerald-900 p-3 rounded-lg border border-emerald-200 space-y-1">
                          <div className="font-bold uppercase tracking-wider text-[11px] text-emerald-800">
                            Model Answer & Evaluation Rubric:
                          </div>
                          <div className="leading-relaxed">{q.correct_answer || 'Standard answer criteria.'}</div>
                        </div>
                      ) : (
                        <div className="mt-4 ml-6 h-16 border-b border-dotted border-slate-400 print:h-24"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer of the printed paper */}
          <div className="text-center text-xs font-sans text-slate-400 border-t border-slate-200 mt-12 pt-4 print:text-slate-600">
            --- END OF QUESTION PAPER ---
          </div>
        </div>
      </div>
    </div>
  );
}

