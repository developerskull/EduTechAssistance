import React, { useState } from 'react';
import { X, Plus, Trash2, ArrowRight, ArrowLeft, CheckCircle, Users } from 'lucide-react';
import { teacherAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function CreateAssignmentWizard({
  initialQuestions = [],
  preloadedQuestions = [],
  preloadedTitle = '',
  preloadedDescription = '',
  documentId = null,
  onClose,
  onCreated
}) {
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState(preloadedTitle || '');
  const [description, setDescription] = useState(preloadedDescription || '');
  const [timeLimit, setTimeLimit] = useState(45);
  const [questions, setQuestions] = useState(preloadedQuestions.length > 0 ? preloadedQuestions : initialQuestions);
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
      toast.error('Please add at least one question to the exam.');
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
      toast.success('Classroom assignment created! Now assign to students.');
      if (onCreated) onCreated(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to create assignment');
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
      toast.error('Please enter at least one valid student ID.');
      return;
    }

    setAssigning(true);
    try {
      const res = await teacherAPI.assignToStudents({
        exam_id: createdExam.id,
        student_ids: ids
      });
      setAssignedCount(res.data.assignments_created);
      toast.success(`Exam successfully assigned to ${res.data.assignments_created} students!`);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to assign exam to students');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-xl border border-[#dadce0] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Google Classroom Wizard Header */}
        <div className="px-6 py-4 border-b border-[#dadce0] flex items-center justify-between bg-white">
          <div>
            <h2 className="text-base font-semibold text-[#202124]">Create Classroom Assignment</h2>
            <div className="flex items-center space-x-2 text-xs text-[#5f6368] mt-0.5">
              <span className={`font-medium ${step === 1 ? 'text-[#1a73e8]' : 'text-[#137333]'}`}>
                1. Curate Questions
              </span>
              <span>→</span>
              <span className={`font-medium ${step === 2 ? 'text-[#1a73e8]' : 'text-[#5f6368]'}`}>
                2. Assign to Students
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#5f6368] hover:bg-[#f1f3f4] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Step 1: Curate Questions */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#5f6368] mb-1">
                  Assignment Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Operating Systems Assessment Chapter 4"
                  className="w-full px-3 py-2 border border-[#dadce0] rounded-md text-xs sm:text-sm focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] bg-white text-[#202124]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5f6368] mb-1">
                  Time Allowed (Mins)
                </label>
                <input
                  type="number"
                  min="1"
                  max="360"
                  required
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dadce0] rounded-md text-xs sm:text-sm focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] bg-white text-[#202124] text-center"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#5f6368] mb-1">
                Instructions / Description (Optional)
              </label>
              <textarea
                rows="2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Instructions for students taking this examination..."
                className="w-full px-3 py-2 border border-[#dadce0] rounded-md text-xs sm:text-sm focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] bg-white text-[#202124]"
              />
            </div>

            {/* Questions Pool */}
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between border-b border-[#dadce0] pb-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5f6368]">
                  Questions Pool ({questions.length})
                </h3>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="flex items-center space-x-1 px-3 py-1 bg-[#e8f0fe] hover:bg-[#d2e3fc] text-[#1a73e8] text-xs font-medium rounded-md transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Question</span>
                </button>
              </div>

              {questions.map((q, idx) => (
                <div key={idx} className="p-4 rounded-md border border-[#dadce0] bg-[#f8f9fa] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#202124]">Question {idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(idx)}
                      className="text-[#5f6368] hover:text-[#d93025] p-1 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        required
                        value={q.question_text}
                        onChange={(e) => handleUpdateQuestion(idx, 'question_text', e.target.value)}
                        placeholder="Enter question text..."
                        className="w-full px-3 py-1.5 border border-[#dadce0] rounded-md text-xs sm:text-sm bg-white focus:outline-none focus:border-[#1a73e8]"
                      />
                    </div>
                    <div>
                      <select
                        value={q.question_type}
                        onChange={(e) => handleUpdateQuestion(idx, 'question_type', e.target.value)}
                        className="w-full px-3 py-1.5 border border-[#dadce0] rounded-md text-xs sm:text-sm bg-white focus:outline-none focus:border-[#1a73e8]"
                      >
                        <option value="multiple_choice">Multiple Choice</option>
                        <option value="true_false">True / False</option>
                        <option value="short_answer">Short Answer</option>
                        <option value="essay">Essay</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        required
                        value={q.correct_answer}
                        onChange={(e) => handleUpdateQuestion(idx, 'correct_answer', e.target.value)}
                        placeholder="Model answer key or reference solution..."
                        className="w-full px-3 py-1.5 border border-[#dadce0] rounded-md text-xs sm:text-sm bg-white focus:outline-none focus:border-[#1a73e8]"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={q.points || 1}
                        onChange={(e) => handleUpdateQuestion(idx, 'points', parseInt(e.target.value, 10))}
                        className="w-full px-3 py-1.5 border border-[#dadce0] rounded-md text-xs sm:text-sm text-center bg-white focus:outline-none focus:border-[#1a73e8]"
                        placeholder="Points"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-[#dadce0]">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center space-x-2 px-5 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium text-xs rounded-md shadow-xs transition disabled:opacity-50"
              >
                <span>{submitting ? 'Creating Exam...' : 'Next: Assign to Students'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Wizard Step 2: Assign to Students */}
        {step === 2 && (
          <div className="p-6 space-y-5">
            <div className="p-4 rounded-md bg-[#e6f4ea] border border-[#ceead6] flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-[#137333] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-[#0d5224]">Classroom Assignment Created!</h4>
                <p className="text-xs text-[#137333] mt-0.5">
                  "{createdExam?.title}" ({createdExam?.questions_count} questions, {createdExam?.time_limit} mins, {createdExam?.total_points} pts).
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-1">
                Assign to Student User IDs
              </label>
              <p className="text-xs text-[#5f6368] mb-2">
                Enter comma-separated student IDs (e.g. 2, 3, 4) to distribute this exam to their Classroom portal.
              </p>
              <input
                type="text"
                value={studentIdsInput}
                onChange={(e) => setStudentIdsInput(e.target.value)}
                placeholder="e.g. 2, 3, 4"
                className="w-full px-3 py-2 border border-[#dadce0] rounded-md text-xs sm:text-sm focus:outline-none focus:border-[#1a73e8] bg-white text-[#202124]"
              />
            </div>

            {assignedCount !== null && (
              <div className="p-3.5 rounded-md bg-[#e8f0fe] border border-[#d2e3fc] text-[#1a73e8] text-xs font-medium">
                🎉 Exam successfully assigned to {assignedCount} student(s)! They can now take it from their portal.
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-[#dadce0]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-[#5f6368] hover:text-[#202124] transition"
              >
                Done
              </button>
              <button
                type="button"
                onClick={handleStep2Assign}
                disabled={assigning}
                className="flex items-center space-x-2 px-5 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium text-xs rounded-md shadow-xs transition disabled:opacity-50"
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
