import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  UploadCloud,
  Sparkles,
  Plus,
  BookOpen,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  BarChart2,
  Printer,
  Search,
  Filter,
  Users
} from 'lucide-react';
import { aiAPI, teacherAPI } from '../services/api';
import CreateAssignmentWizard from '../components/CreateAssignmentWizard';
import GradingWorkspaceModal from '../components/GradingWorkspaceModal';
import ExamOverviewModal from '../components/ExamOverviewModal';
import QuestionAnalyticsModal from '../components/QuestionAnalyticsModal';
import ExamPrintModal from '../components/ExamPrintModal';
import { useToast } from '../context/ToastContext';

export default function TeacherDashboard() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('generator'); // generator | exams | evaluations
  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [selectedTypes, setSelectedTypes] = useState(['multiple_choice', 'true_false', 'short_answer']);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generatedPaper, setGeneratedPaper] = useState(null);

  // Exams & Evaluations State
  const [exams, setExams] = useState([]);
  const [examSearch, setExamSearch] = useState('');
  const [pendingEvals, setPendingEvals] = useState([]);
  const [showWizard, setShowWizard] = useState(false);
  const [activeAttempt, setActiveAttempt] = useState(null);
  const [overviewExamId, setOverviewExamId] = useState(null);
  const [analyticsQuestionId, setAnalyticsQuestionId] = useState(null);
  const [printExamData, setPrintExamData] = useState(null);

  // Load documents, exams, and pending evaluations
  const loadData = async () => {
    try {
      const [docsRes, examsRes, evalsRes] = await Promise.all([
        aiAPI.listDocuments(),
        teacherAPI.listExams(),
        teacherAPI.getPendingEvaluations()
      ]);
      setDocuments(docsRes.data.data.items || []);
      setExams(examsRes.data.data.items || []);
      setPendingEvals(evalsRes.data.data.items || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Dropzone setup
  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name.replace(/\.[^/.]+$/, ''));

    try {
      const res = await aiAPI.uploadPdf(formData);
      toast.success(`Uploaded and indexed "${file.name}" (${res.data.data.chunks_indexed} chunks)!`);
      loadData();
      setSelectedDocId(res.data.data.document.id);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to upload and parse PDF');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 10 * 1024 * 1024,
    multiple: false
  });

  // Handle Question Generation
  const handleGenerateQuestions = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await aiAPI.generateQuestions({
        document_id: selectedDocId ? parseInt(selectedDocId, 10) : null,
        topic: topic || 'Course Assessment',
        num_questions: parseInt(numQuestions, 10),
        difficulty,
        question_types: selectedTypes
      });
      setGeneratedPaper(res.data.data);
      toast.success(`Successfully generated ${res.data.data.questions?.length || 0} questions via Gemini RAG!`);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Question generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const toggleType = (t) => {
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((item) => item !== t) : [...prev, t]
    );
  };

  const filteredExams = exams.filter((ex) =>
    (ex.title || '').toLowerCase().includes(examSearch.toLowerCase()) ||
    (ex.description || '').toLowerCase().includes(examSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Teacher Workspace</h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate balanced question banks from course notes, schedule examinations, and evaluate submissions.
          </p>
        </div>

        <button
          onClick={() => setShowWizard(true)}
          className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Assignment</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('generator')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
            activeTab === 'generator'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Question Generator</span>
        </button>

        <button
          onClick={() => setActiveTab('exams')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
            activeTab === 'exams'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Created Exams ({exams.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('evaluations')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
            activeTab === 'evaluations'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pending Evaluations ({pendingEvals.length})</span>
        </button>
      </div>

      {/* TAB 1: AI QUESTION GENERATOR */}
      {activeTab === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Upload & Controls */}
          <div className="lg:col-span-5 space-y-6">
            {/* PDF Upload Card */}
            <div className="glass-card p-6 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>1. Ingest Course Document (RAG)</span>
              </h3>

              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                  isDragActive
                    ? 'border-indigo-500 bg-indigo-50/50'
                    : 'border-slate-300 hover:border-indigo-400 bg-slate-50'
                }`}
              >
                <input {...getInputProps()} />
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">
                  {uploading
                    ? 'Extracting and embedding PDF...'
                    : 'Drag & drop textbook/syllabus PDF, or browse'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Maximum file size: 10 MB (searchable PDF)</p>
              </div>
            </div>

            {/* Question Generation Form */}
            <form onSubmit={handleGenerateQuestions} className="glass-card p-6 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>2. Configure Question Parameters</span>
              </h3>

              {/* Source Document Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Source Document (For Grounded Context)
                </label>
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">No document (Direct concept generation)</option>
                  {documents.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title} ({d.chunks_count} semantic chunks)
                    </option>
                  ))}
                </select>
              </div>

              {/* Topic */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Topic / Syllabus Chapter
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Memory Virtualization & Paging Algorithms"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              {/* Difficulty & Count */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm bg-white"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Question Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm text-center bg-white"
                  />
                </div>
              </div>

              {/* Question Types */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Question Formats
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ['multiple_choice', 'Multiple Choice'],
                    ['true_false', 'True / False'],
                    ['short_answer', 'Short Answer'],
                    ['essay', 'Essay']
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleType(key)}
                      className={`px-3 py-2 text-xs font-semibold rounded-lg border text-left transition ${
                        selectedTypes.includes(key)
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={generating}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{generating ? 'Synthesizing with Gemini AI...' : 'Generate Questions'}</span>
              </button>
            </form>
          </div>

          {/* Right Column: Generated Output Preview */}
          <div className="lg:col-span-7">
            {generatedPaper ? (
              <div className="glass-card p-6 rounded-2xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">{generatedPaper.title}</h3>
                    <p className="text-xs text-slate-500">{generatedPaper.description}</p>
                  </div>
                  <button
                    onClick={() => setShowWizard(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition whitespace-nowrap"
                  >
                    Convert into Live Exam
                  </button>
                </div>

                <div className="space-y-4">
                  {generatedPaper.questions?.map((q, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                        <span>Question {idx + 1} ({q.points} pt)</span>
                        <span className="uppercase text-indigo-600 font-bold">{q.question_type?.replace('_', ' ')}</span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-slate-800">{q.question_text}</p>
                      {q.options && (
                        <div className="grid grid-cols-2 gap-1.5 pt-1">
                          {q.options.map((opt, oIdx) => (
                            <span key={oIdx} className="text-xs text-slate-600 bg-white p-2 rounded border border-slate-200">
                              {opt}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="pt-2 text-xs text-emerald-800 font-medium bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
                        <span className="font-bold">Model Answer:</span> {q.correct_answer}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="glass-card p-12 rounded-2xl text-center space-y-3 border-dashed">
                <Sparkles className="w-12 h-12 text-indigo-300 mx-auto" />
                <h4 className="text-base font-bold text-slate-700">Ready to Generate Questions</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Upload a PDF document or choose a topic to synthesize balanced question papers with multiple choice, true/false, and short answer formats.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CREATED EXAMS */}
      {activeTab === 'exams' && (
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Your Exam Repository</h3>
              <p className="text-xs text-slate-500">Manage, export, and inspect analytics for scheduled tests.</p>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={examSearch}
                  onChange={(e) => setExamSearch(e.target.value)}
                  placeholder="Search exams..."
                  className="pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                onClick={() => setShowWizard(true)}
                className="px-3 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-xs font-bold transition flex items-center space-x-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Exam</span>
              </button>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200">
            {filteredExams.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                {exams.length === 0 ? 'No exams created yet.' : 'No exams matching search criteria.'}
              </div>
            ) : (
              filteredExams.map((ex) => (
                <div key={ex.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{ex.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      <strong>{ex.questions_count}</strong> Questions | <strong>{ex.time_limit}</strong> Minutes | <strong>{ex.total_points}</strong> Total Points
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPrintExamData(ex)}
                      className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 rounded-lg transition flex items-center space-x-1"
                      title="Print or export authentic university question paper"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Paper</span>
                    </button>

                    <button
                      onClick={() => setOverviewExamId(ex.id)}
                      className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg transition flex items-center space-x-1"
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                      <span>Analytics</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PENDING EVALUATIONS */}
      {activeTab === 'evaluations' && (
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Student Submissions Requiring Evaluation</h3>
            <span className="text-xs text-slate-500 font-semibold">{pendingEvals.length} Pending</span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200">
            {pendingEvals.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400 space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="font-semibold text-slate-700">All submissions graded!</p>
                <p>There are no subjective answers currently awaiting manual review.</p>
              </div>
            ) : (
              pendingEvals.map((attempt) => (
                <div key={attempt.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-slate-900">{attempt.student_name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">
                        {attempt.unverified_count} Pending Grading
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Exam: <span className="font-semibold text-slate-700">{attempt.exam?.title}</span> | Submitted:{' '}
                      {new Date(attempt.submitted_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveAttempt(attempt)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                  >
                    Open Grading Workspace
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {showWizard && (
        <CreateAssignmentWizard
          onClose={() => {
            setShowWizard(false);
            loadData();
          }}
          preloadedQuestions={generatedPaper?.questions}
          preloadedTitle={generatedPaper?.title}
          preloadedDescription={generatedPaper?.description}
        />
      )}

      {activeAttempt && (
        <GradingWorkspaceModal
          attemptId={activeAttempt.id}
          onClose={() => {
            setActiveAttempt(null);
            loadData();
          }}
        />
      )}

      {overviewExamId && (
        <ExamOverviewModal
          examId={overviewExamId}
          onClose={() => setOverviewExamId(null)}
          onSelectQuestion={(qId) => setAnalyticsQuestionId(qId)}
        />
      )}

      {analyticsQuestionId && (
        <QuestionAnalyticsModal
          examId={overviewExamId}
          questionId={analyticsQuestionId}
          onClose={() => setAnalyticsQuestionId(null)}
        />
      )}

      {printExamData && (
        <ExamPrintModal
          exam={printExamData}
          onClose={() => setPrintExamData(null)}
        />
      )}
    </div>
  );
}
