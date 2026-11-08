import React, { useState } from 'react';
import { X, Plus, Trash2, ArrowRight, ArrowLeft, CheckCircle, Users } from 'lucide-react';
import { teacherAPI } from '../services/api';

export default function CreateAssignmentWizard({ initialQuestions = [], documentId = null, onClose, onCreated }) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState(30);
  const [questions, setQuestions] = useState(initialQuestions);
  const [createdExam, setCreatedExam] = useState(null);

  // Step 2 State
  const [studentIdsInput, setStudentIdsInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [assignedCount, setAssignedCount] = useState(null);

  // Add a blank question
  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: '',
        question_type: 'multiple_choice',
        options: ['A) ', 'B) ', 'C) ', 'D) '],
        correct_answer: 'A) ',
        points: 1
      }
    ]);
  };

  const handleRemoveQuestion = (idx) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleUpdateQuestion = (idx, field, value) => {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], [field]: value };
    setQuestions(updated);
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    if (questions.length === 0) {
      alert('Please add at least one question to the exam.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await teacherAPI.createAssignment({
        title,
        description,
        time_limit: parseInt(timeLimit, 10),
        document_id: documentId,
        questions
      });
      setCreatedExam(res.data.data);
      setStep(2);
      if (onCreated) onCreated(res.data.data);
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to create assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStep2Assign = async () => {
    if (!createdExam) return;
    const ids = studentIdsInput
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));

    if (ids.length === 0) {
      alert('Please enter at least one valid student ID.');
      return;
    }

    setAssigning(true);
    try {
      const res = await teacherAPI.assignToStudents({
        exam_id: createdExam.id,
        student_ids: ids
      });
      setAssignedCount(res.data.assignments_created);
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to assign exam to students');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Wizard Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Create & Assign Exam</h2>
            <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
              <span className={`font-semibold ${step === 1 ? 'text-indigo-600' : 'text-emerald-600'}`}>
                Step 1: Curate Exam
              </span>
              <span>→</span>
              <span className={`font-semibold ${step === 2 ? 'text-indigo-600' : 'text-slate-400'}`}>
                Step 2: Assign to Students
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Step 1: Curate Questions */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Exam Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Midterm Physics Assessment"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Time Limit (Minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="360"
                  required
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Instructions / Description (Optional)
              </label>
              <textarea
                rows="2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Instructions for students taking this exam..."
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Questions Pool */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Questions Pool ({questions.length})
                </h3>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Question</span>
                </button>
              </div>

              {questions.map((q, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3 relative group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">Question {idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(idx)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        required
                        value={q.question_text}
                        onChange={(e) => handleUpdateQuestion(idx, 'question_text', e.target.value)}
                        placeholder="Enter question text..."
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <select
                        value={q.question_type}
                        onChange={(e) => handleUpdateQuestion(idx, 'question_type', e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="multiple_choice">Multiple Choice</option>
                        <option value="true_false">True / False</option>
                        <option value="short_answer">Short Answer</option>
                        <option value="essay">Essay</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        required
                        value={q.correct_answer}
                        onChange={(e) => handleUpdateQuestion(idx, 'correct_answer', e.target.value)}
                        placeholder="Correct answer key or reference solution..."
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={q.points || 1}
                        onChange={(e) => handleUpdateQuestion(idx, 'points', parseInt(e.target.value, 10))}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-center bg-white focus:ring-2 focus:ring-indigo-500"
                        placeholder="Points"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-200 transition disabled:opacity-50"
              >
                <span>{submitting ? 'Creating Exam...' : 'Next: Assign to Students'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Wizard Step 2: Assign to Students */}
        {step === 2 && (
          <div className="p-6 space-y-6">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-emerald-900">Exam Created Successfully!</h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  "{createdExam?.title}" ({createdExam?.questions_count} questions, {createdExam?.time_limit} mins, {createdExam?.total_points} pts).
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Assign to Student User IDs
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Enter comma-separated student IDs (e.g. 2, 3, 4) to assign this exam to their student portal.
              </p>
              <input
                type="text"
                value={studentIdsInput}
                onChange={(e) => setStudentIdsInput(e.target.value)}
                placeholder="e.g. 2, 3"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {assignedCount !== null && (
              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-semibold">
                🎉 Exam successfully assigned to {assignedCount} student(s)! They can now take it from their portal.
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition"
              >
                Close Wizard
              </button>
              <button
                type="button"
                onClick={handleStep2Assign}
                disabled={assigning}
                className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-200 transition disabled:opacity-50"
              >
                <Users className="w-4 h-4" />
                <span>{assigning ? 'Assigning...' : 'Assign to Students'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

