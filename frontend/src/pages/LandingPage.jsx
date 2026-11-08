import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileText,
  BrainCircuit,
  GraduationCap,
  ArrowRight,
  Code2,
  Layers,
  ChevronRight,
  Cpu,
  BarChart3
} from 'lucide-react';

export default function LandingPage() {
  const [activeDemo, setActiveDemo] = useState('teacher'); // teacher | student | grading

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50 pointer-events-none -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-200/80 text-indigo-700 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-xs">
            <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
            <span>Dual-Engine Gemini AI & RAG Question Paper Generation</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            Transform Academic Courseware into{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-700">
              Rigorous Examinations
            </span>{' '}
            in Seconds.
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            EduTechAssistance empowers educators with PDF-driven RAG question synthesis, timed student exam simulations with autosave, and side-by-side rubric evaluation.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-7 py-3 rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
            >
              <GraduationCap className="w-5 h-5" />
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 text-slate-800 font-bold px-6 py-3 rounded-xl border border-slate-200 shadow-sm transition"
            >
              <span>Sign In to Portal</span>
            </Link>

            <a
              href="http://127.0.0.1:5000/api/v1/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 text-xs text-slate-500 hover:text-indigo-600 py-3 px-4 font-semibold transition"
            >
              <Code2 className="w-4 h-4" />
              <span>Swagger API Docs</span>
            </a>
          </div>

          {/* Trust Metrics Bar */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="glass-panel p-4 rounded-xl border border-slate-200/80">
              <div className="text-2xl font-black text-indigo-600">100%</div>
              <div className="text-xs font-bold text-slate-800 mt-0.5">Server Time Integrity</div>
              <div className="text-[11px] text-slate-500">Late attempts auto-rejected</div>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-slate-200/80">
              <div className="text-2xl font-black text-emerald-600">&lt; 2.5s</div>
              <div className="text-xs font-bold text-slate-800 mt-0.5">RAG Paper Synthesis</div>
              <div className="text-[11px] text-slate-500">Gemini 2.5 Flash + Fallbacks</div>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-slate-200/80">
              <div className="text-2xl font-black text-blue-600">12 Tables</div>
              <div className="text-xs font-bold text-slate-800 mt-0.5">SQLAlchemy Relational</div>
              <div className="text-[11px] text-slate-500">Zero data leaks & strict RBAC</div>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-slate-200/80">
              <div className="text-2xl font-black text-violet-600">27 / 27</div>
              <div className="text-xs font-bold text-slate-800 mt-0.5">Automated Pytest Suite</div>
              <div className="text-[11px] text-slate-500">100% endpoint pass rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Workflow Demo Showcase */}
      <section className="py-12 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Explore the Seamless Dual-Sided Workflow
            </h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              Switch between perspectives to see how educators and students collaborate with AI assistance.
            </p>
          </div>

          {/* Selector Tabs */}
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => setActiveDemo('teacher')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeDemo === 'teacher'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>1. Teacher RAG Synthesis</span>
            </button>

            <button
              onClick={() => setActiveDemo('student')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeDemo === 'student'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>2. Student Timed Exam</span>
            </button>

            <button
              onClick={() => setActiveDemo('grading')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeDemo === 'grading'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>3. AI Side-by-Side Grading</span>
            </button>
          </div>

          {/* Interactive Showcase Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xl max-w-4xl mx-auto">
            {activeDemo === 'teacher' && (
              <div className="space-y-4 animate-slide-down">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center space-x-3">
                    <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block"></span>
                    <span className="text-sm font-bold text-slate-800">Teacher Workspace: Ingest PDF Document</span>
                  </div>
                  <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-md">
                    PyPDF + Gemini 2.5 Flash
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
                    <div className="font-bold text-slate-700 flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <span>Ingested: OperatingSystems_Ch4.pdf (4.2 MB)</span>
                    </div>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      12 Semantic Chunks extracted with sliding window partition. Vector embeddings indexed for top-k contextual retrieval.
                    </p>
                    <div className="flex items-center space-x-2 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>MIME validated: application/pdf (Magic Bytes verified)</span>
                    </div>
                  </div>

                  <div className="border border-indigo-100 rounded-xl p-4 bg-indigo-50/50 space-y-2">
                    <div className="font-bold text-indigo-900 flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>Synthesized Question Paper Preview</span>
                    </div>
                    <div className="text-[11px] text-indigo-800 font-medium">
                      "Explain the difference between preemptive and non-preemptive scheduling in modern OS kernels."
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-indigo-600 font-semibold pt-1">
                      <span>Type: Short Answer</span>
                      <span>Difficulty: Hard (5 Pts)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeDemo === 'student' && (
              <div className="space-y-4 animate-slide-down">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center space-x-3">
                    <span className="w-3 h-3 rounded-full bg-blue-600 inline-block animate-ping"></span>
                    <span className="text-sm font-bold text-slate-800">Student Portal: Midterm Examination Active</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                    <Clock className="w-3.5 h-3.5" />
                    <span>00:44:18 Remaining</span>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">Question 3 of 10</span>
                      <span className="text-slate-500 font-semibold">[2 Marks]</span>
                    </div>
                    <p className="text-slate-700 font-medium">
                      Which of the following disk scheduling algorithms suffers from potential starvation?
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="p-2 rounded-lg border border-indigo-500 bg-indigo-50 font-bold text-indigo-900">
                        A) Shortest Seek Time First (SSTF)
                      </div>
                      <div className="p-2 rounded-lg border border-slate-200 text-slate-600">
                        B) FCFS
                      </div>
                      <div className="p-2 rounded-lg border border-slate-200 text-slate-600">
                        C) SCAN (Elevator)
                      </div>
                      <div className="p-2 rounded-lg border border-slate-200 text-slate-600">
                        D) C-SCAN
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                    <div className="flex items-center space-x-1.5 text-emerald-600 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Autosaved 12s ago (POST /api/v1/student/save-progress)</span>
                    </div>
                    <span className="font-semibold text-slate-700">Question Palette: 3 / 10 Answered</span>
                  </div>
                </div>
              </div>
            )}

            {activeDemo === 'grading' && (
              <div className="space-y-4 animate-slide-down">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center space-x-3">
                    <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block"></span>
                    <span className="text-sm font-bold text-slate-800">Teacher Evaluation: Side-by-Side Verification</span>
                  </div>
                  <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-md">
                    Rubric Scoring
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Model Answer (Emerald) */}
                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 space-y-1.5">
                    <div className="font-bold text-emerald-900 uppercase tracking-wider text-[10px]">
                      Model Answer (Verified Solution)
                    </div>
                    <p className="text-emerald-950 font-medium text-[11px] leading-relaxed">
                      Preemptive scheduling permits high-priority tasks to interrupt active processes at any CPU clock tick, whereas non-preemptive requires the process to voluntarily yield.
                    </p>
                  </div>

                  {/* Student Submission (Indigo) */}
                  <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/60 space-y-1.5">
                    <div className="font-bold text-indigo-900 uppercase tracking-wider text-[10px]">
                      Student Submission (John Doe)
                    </div>
                    <p className="text-indigo-950 font-medium text-[11px] leading-relaxed">
                      In preemptive scheduling, the OS can force a running process to pause for higher priority tasks. Non-preemptive waits until it finishes or yields.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-amber-900">
                    <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>
                      <strong>AI Recommendation:</strong> 5 / 5 Marks. Accurate distinction and complete explanation.
                    </span>
                  </div>
                  <span className="text-xs font-bold text-indigo-700 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-xs">
                    One-Click Accept
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feature Capabilities Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Engineered for Academic Integrity & Scale
          </h2>
          <p className="text-sm text-slate-500 max-w-2xl mx-auto">
            Combining modern full-stack web standards with robust artificial intelligence guards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl space-y-3 hover:border-indigo-300 transition group">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">RAG Document Parsing</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload PDF textbooks or syllabus notes up to 10MB. Text is extracted, chunked, and synthesized into custom question banks using Google Gemini 2.5 Flash.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-3 hover:border-indigo-300 transition group">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Server-Side Exam Enforcement</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Exams validate remaining duration on the server with started_at + time_limit. Student questions are sanitized of answer keys, and submissions autosave every 20 seconds.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-3 hover:border-indigo-300 transition group">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Side-by-Side Teacher Grading</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Instant auto-scoring for MCQs and True/False. Subjective answers are compared against model keys in an emerald & indigo workspace with AI suggested scores.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-xs">
              E
            </div>
            <span className="font-bold text-slate-200">EduTechAssistance v3.0</span>
            <span>— AI Question Paper & Exam Management Platform</span>
          </div>

          <div className="flex items-center space-x-6">
            <a
              href="http://127.0.0.1:5000/api/v1/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition"
            >
              Swagger API Documentation
            </a>
            <a
              href="https://github.com/developerskull/EduTechAssistance"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition"
            >
              GitHub Repository
            </a>
            <span className="text-slate-600">Flask 2.3 • React 18 • Vite 5</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

