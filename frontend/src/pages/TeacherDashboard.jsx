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
  Users,
  Layers,
  GraduationCap
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
      toast.success(`Classroom document "${file.name}" indexed successfully (${res.data.data.chunks_indexed} chunks)!`);
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
        topic: topic || 'Classroom Assessment',
        num_questions: parseInt(numQuestions, 10),
        difficulty,
        question_types: selectedTypes
      });
      setGeneratedPaper(res.data.data);
      toast.success(`GoogleExam synthesized ${res.data.data.questions?.length || 0} questions via Gemini RAG!`);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Google Classroom Class Banner */}
      <div className="bg-[#137333] text-white p-6 sm:p-8 rounded-lg shadow-sm relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="relative z-10 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#e6f4ea] bg-[#0d5224] px-2.5 py-0.5 rounded">
            Classroom Course: Section A
          </span>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight">
            Computer Science & Academic Assessment
          </h1>
          <p className="text-xs text-[#e6f4ea]">
            Instructor Workspace • Class Code: <span className="font-mono font-bold bg-[#0d5224] px-2 py-0.5 rounded">g-exam-2026</span>
          </p>
        </div>

        <button
          onClick={() => setShowWizard(true)}
          className="relative z-10 bg-white hover:bg-[#f1f3f4] text-[#137333] font-medium text-xs px-4 py-2.5 rounded-md shadow-sm transition flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4 text-[#137333]" />
          <span>+ Create Assignment</span>
        </button>
      </div>

      {/* Classroom Secondary Tabs Navigation */}
      <div className="flex border-b border-[#dadce0] bg-white rounded-t-lg px-2">
        <button
          onClick={() => setActiveTab('generator')}
          className={`px-5 py-3 text-xs font-medium border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'generator'
              ? 'border-[#1a73e8] text-[#1a73e8] font-bold'
              : 'border-transparent text-[#5f6368] hover:text-[#202124]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Classwork: AI Generator</span>
        </button>

        <button
          onClick={() => setActiveTab('exams')}
          className={`px-5 py-3 text-xs font-medium border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'exams'
              ? 'border-[#1a73e8] text-[#1a73e8] font-bold'
              : 'border-transparent text-[#5f6368] hover:text-[#202124]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Exams Repository ({exams.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('evaluations')}
          className={`px-5 py-3 text-xs font-medium border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'evaluations'
              ? 'border-[#1a73e8] text-[#1a73e8] font-bold'
              : 'border-transparent text-[#5f6368] hover:text-[#202124]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Grades & Submissions ({pendingEvals.length})</span>
        </button>
      </div>

      {/* TAB 1: AI QUESTION GENERATOR */}
      {activeTab === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Upload & Controls */}
          <div className="lg:col-span-5 space-y-6">
            {/* PDF Upload Card */}
            <div className="bg-white p-6 rounded-lg border border-[#dadce0] shadow-xs space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5f6368] flex items-center space-x-2">
                <FileText className="w-4 h-4 text-[#1a73e8]" />
                <span>1. Attach Course PDF (RAG)</span>
              </h3>

              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
                  isDragActive
                    ? 'border-[#1a73e8] bg-[#e8f0fe]'
                    : 'border-[#dadce0] hover:border-[#1a73e8] bg-[#f8f9fa]'
                }`}
              >
                <input {...getInputProps()} />
                <UploadCloud className="w-8 h-8 text-[#5f6368] mx-auto mb-2" />
                <p className="text-xs font-medium text-[#202124]">
                  {uploading
                    ? 'Parsing PDF and indexing embeddings...'
                    : 'Attach syllabus / lecture note PDF (up to 10 MB)'}
                </p>
                <p className="text-[11px] text-[#5f6368] mt-1">Google Gemini RAG extracts semantic chunks automatically</p>
              </div>
            </div>

            {/* Question Generation Form */}
            <form onSubmit={handleGenerateQuestions} className="bg-white p-6 rounded-lg border border-[#dadce0] shadow-xs space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5f6368] flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#1a73e8]" />
                <span>2. Question Synthesis Parameters</span>
              </h3>

              {/* Source Document Selection */}
              <div>
                <label className="block text-xs font-medium text-[#5f6368] mb-1">
                  Attached Classroom Document
                </label>
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dadce0] rounded-md text-xs sm:text-sm bg-white focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
                >
                  <option value="">No document (Direct topic generation)</option>
                  {documents.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title} ({d.chunks_count} semantic chunks)
                    </option>
                  ))}
                </select>
              </div>

              {/* Topic */}
              <div>
                <label className="block text-xs font-medium text-[#5f6368] mb-1">
                  Topic / Chapter Focus
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Memory Virtualization & Paging Algorithms"
                  className="w-full px-3 py-2 border border-[#dadce0] rounded-md text-xs sm:text-sm focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] bg-white"
                />
              </div>

              {/* Difficulty & Count */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#5f6368] mb-1">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-3 py-2 border border-[#dadce0] rounded-md text-xs sm:text-sm bg-white"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#5f6368] mb-1">
                    Questions Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(e.target.value)}
                    className="w-full px-3 py-2 border border-[#dadce0] rounded-md text-xs sm:text-sm text-center bg-white"
                  />
                </div>
              </div>

              {/* Question Formats */}
              <div>
                <label className="block text-xs font-medium text-[#5f6368] mb-1.5">
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
                      className={`px-3 py-2 text-xs font-medium rounded-md border text-left transition ${
                        selectedTypes.includes(key)
                          ? 'bg-[#e8f0fe] border-[#1a73e8] text-[#1a73e8] font-bold'
                          : 'bg-white border-[#dadce0] text-[#5f6368] hover:bg-[#f8f9fa]'
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
                className="w-full py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-md text-xs sm:text-sm font-medium shadow-xs transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{generating ? 'Generating with Gemini AI...' : 'Generate Questions'}</span>
              </button>
            </form>
          </div>

          {/* Right Column: Generated Output Preview */}
          <div className="lg:col-span-7">
            {generatedPaper ? (
              <div className="bg-white p-6 rounded-lg border border-[#dadce0] shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#dadce0] pb-4 gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-[#202124]">{generatedPaper.title}</h3>
                    <p className="text-xs text-[#5f6368]">{generatedPaper.description}</p>
                  </div>
                  <button
                    onClick={() => setShowWizard(true)}
                    className="px-4 py-2 bg-[#137333] hover:bg-[#0d5224] text-white text-xs font-medium rounded-md shadow-xs transition whitespace-nowrap"
                  >
                    Convert into Live Exam
                  </button>
                </div>

                <div className="space-y-4">
                  {generatedPaper.questions?.map((q, idx) => (
                    <div key={idx} className="p-4 rounded-lg border border-[#dadce0] bg-[#f8f9fa] space-y-2">
                      <div className="flex items-center justify-between text-xs font-medium text-[#5f6368]">
                        <span>Question {idx + 1} ({q.points} pt)</span>
                        <span className="uppercase text-[#1a73e8] font-bold">{q.question_type?.replace('_', ' ')}</span>
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-[#202124]">{q.question_text}</p>
                      {q.options && (
                        <div className="grid grid-cols-2 gap-1.5 pt-1">
                          {q.options.map((opt, oIdx) => (
                            <span key={oIdx} className="text-xs text-[#3c4043] bg-white p-2 rounded border border-[#dadce0]">
                              {opt}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="pt-2 text-xs text-[#137333] font-medium bg-[#e6f4ea] p-2 rounded-md border border-[#ceead6]">
                        <span className="font-bold">Model Answer:</span> {q.correct_answer}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white p-12 rounded-lg border border-dashed border-[#dadce0] text-center space-y-3">
                <Sparkles className="w-12 h-12 text-[#1a73e8] mx-auto opacity-40" />
                <h4 className="text-sm font-semibold text-[#202124]">Ready to Synthesize Classroom Exam</h4>
                <p className="text-xs text-[#5f6368] max-w-sm mx-auto">
                  Upload a PDF document or choose a syllabus topic to create a balanced question bank with answer keys and rubric metrics.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CREATED EXAMS */}
      {activeTab === 'exams' && (
        <div className="bg-white p-6 rounded-lg border border-[#dadce0] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-[#202124]">Classroom Exam Repository</h3>
              <p className="text-xs text-[#5f6368]">Manage scheduled exams, inspect question analytics, and print exam papers.</p>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-4 h-4 text-[#5f6368] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={examSearch}
                  onChange={(e) => setExamSearch(e.target.value)}
                  placeholder="Search exams..."
                  className="pl-9 pr-3 py-1.5 text-xs border border-[#dadce0] rounded-md bg-white focus:outline-none focus:border-[#1a73e8]"
                />
              </div>

              <button
                onClick={() => setShowWizard(true)}
                className="px-3.5 py-1.5 bg-[#1a73e8] text-white hover:bg-[#1557b0] rounded-md text-xs font-medium transition flex items-center space-x-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Exam</span>
              </button>
            </div>
          </div>

          <div className="border border-[#dadce0] rounded-lg overflow-hidden divide-y divide-[#dadce0]">
            {filteredExams.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#5f6368]">
                {exams.length === 0 ? 'No exams created yet.' : 'No exams matching search criteria.'}
              </div>
            ) : (
              filteredExams.map((ex) => (
                <div key={ex.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#f8f9fa] transition">
                  <div>
                    <h4 className="text-sm font-semibold text-[#202124]">{ex.title}</h4>
                    <p className="text-xs text-[#5f6368] mt-0.5">
                      <strong>{ex.questions_count}</strong> Questions | <strong>{ex.time_limit}</strong> Minutes | <strong>{ex.total_points}</strong> Total Points
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPrintExamData(ex)}
                      className="px-3 py-1.5 text-xs font-medium bg-[#e8f0fe] border border-[#d2e3fc] hover:bg-[#d2e3fc] text-[#1a73e8] rounded-md transition flex items-center space-x-1"
                      title="Print or export authentic university question paper"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Paper</span>
                    </button>

                    <button
                      onClick={() => setOverviewExamId(ex.id)}
                      className="px-3 py-1.5 text-xs font-medium bg-white border border-[#dadce0] hover:bg-[#f1f3f4] text-[#3c4043] rounded-md transition flex items-center space-x-1"
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
        <div className="bg-white p-6 rounded-lg border border-[#dadce0] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-[#202124]">Submissions Requiring Evaluation</h3>
            <span className="text-xs text-[#5f6368] font-medium">{pendingEvals.length} Pending</span>
          </div>

          <div className="border border-[#dadce0] rounded-lg overflow-hidden divide-y divide-[#dadce0]">
            {pendingEvals.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#5f6368] space-y-2">
                <CheckCircle className="w-8 h-8 text-[#137333] mx-auto" />
                <p className="font-semibold text-[#202124]">All submissions evaluated!</p>
                <p>There are no student answers currently awaiting manual grading.</p>
              </div>
            ) : (
              pendingEvals.map((attempt) => (
                <div key={attempt.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#f8f9fa] transition">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-[#202124]">{attempt.student_name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-[#fef7e0] text-[#e37400]">
                        {attempt.unverified_count} Pending Grading
                      </span>
                    </div>
                    <p className="text-xs text-[#5f6368] mt-0.5">
                      Exam: <span className="font-medium text-[#202124]">{attempt.exam?.title}</span> | Submitted:{' '}
                      {new Date(attempt.submitted_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveAttempt(attempt)}
                    className="px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-md text-xs font-medium transition shadow-xs"
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
