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
  BarChart3,
  Users
} from 'lucide-react';

export default function LandingPage() {
  const [activeDemo, setActiveDemo] = useState('teacher'); // teacher | student | grading

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#3c4043] flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-24 border-b border-[#dadce0] bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-6">
          {/* Google Classroom Badge */}
          <div className="inline-flex items-center space-x-2 bg-[#e8f0fe] border border-[#d2e3fc] text-[#1a73e8] px-4 py-1.5 rounded-full text-xs font-semibold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#1a73e8] animate-ping" />
            <span>Google Classroom Integration • Dual-Engine Gemini AI 2.5 Flash</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal text-[#202124] tracking-tight max-w-4xl mx-auto leading-tight">
            Classroom examinations, simplified with{' '}
            <span className="text-[#1a73e8] font-medium">GoogleExam</span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-[#5f6368] max-w-2xl mx-auto leading-relaxed">
            The intelligent assessment suite for teachers and students. Ingest course PDFs into structured question papers in seconds, run timed quizzes with autosave, and grade with AI side-by-side rubrics.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium px-6 py-3 rounded-lg shadow-sm hover:shadow transition"
            >
              <span>Get started with GoogleExam</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-white hover:bg-[#f1f3f4] text-[#1a73e8] font-medium px-6 py-3 rounded-lg border border-[#dadce0] transition"
            >
              <span>Sign in to Classroom</span>
            </Link>

            <a
              href="http://127.0.0.1:5000/api/v1/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 text-xs text-[#5f6368] hover:text-[#1a73e8] py-3 px-3 transition"
            >
              <Code2 className="w-4 h-4" />
              <span>Swagger REST API</span>
            </a>
          </div>

          {/* Trust Metrics Bar - Google 4-Color Accents */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="bg-[#ffffff] p-4 rounded-lg border-l-4 border-l-[#1a73e8] border border-[#dadce0] shadow-xs">
              <div className="text-2xl font-bold text-[#1a73e8]">100%</div>
              <div className="text-xs font-semibold text-[#202124] mt-0.5">Server Time Integrity</div>
              <div className="text-[11px] text-[#5f6368]">Late submissions rejected</div>
            </div>

            <div className="bg-[#ffffff] p-4 rounded-lg border-l-4 border-l-[#137333] border border-[#dadce0] shadow-xs">
              <div className="text-2xl font-bold text-[#137333]">&lt; 2.5s</div>
              <div className="text-xs font-semibold text-[#202124] mt-0.5">Gemini RAG Synthesis</div>
              <div className="text-[11px] text-[#5f6368]">Instant PDF question banks</div>
            </div>

            <div className="bg-[#ffffff] p-4 rounded-lg border-l-4 border-l-[#f9ab00] border border-[#dadce0] shadow-xs">
              <div className="text-2xl font-bold text-[#e37400]">12 Tables</div>
              <div className="text-xs font-semibold text-[#202124] mt-0.5">SQLAlchemy Relational</div>
              <div className="text-[11px] text-[#5f6368]">JWT-enforced role isolation</div>
            </div>

            <div className="bg-[#ffffff] p-4 rounded-lg border-l-4 border-l-[#d93025] border border-[#dadce0] shadow-xs">
              <div className="text-2xl font-bold text-[#d93025]">27 / 27</div>
              <div className="text-xs font-semibold text-[#202124] mt-0.5">Automated Pytest Suite</div>
              <div className="text-[11px] text-[#5f6368]">100% verified test coverage</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Workflow Showcase - Google Classroom Style */}
      <section className="py-12 bg-[#f8f9fa]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-medium text-[#202124]">
              How GoogleExam Works with Your Classroom
            </h2>
            <p className="text-xs text-[#5f6368]">
              Switch tabs to preview the educator, student, and grading workflows.
            </p>
          </div>

          {/* Google Classroom Sub-Tabs */}
          <div className="flex justify-center border-b border-[#dadce0] bg-white rounded-t-lg">
            <button
              onClick={() => setActiveDemo('teacher')}
              className={`px-5 py-3 text-xs font-medium border-b-2 transition ${
                activeDemo === 'teacher'
                  ? 'border-[#1a73e8] text-[#1a73e8] font-bold'
                  : 'border-transparent text-[#5f6368] hover:text-[#202124]'
              }`}
            >
              1. Classwork Question Generator
            </button>

            <button
              onClick={() => setActiveDemo('student')}
              className={`px-5 py-3 text-xs font-medium border-b-2 transition ${
                activeDemo === 'student'
                  ? 'border-[#1a73e8] text-[#1a73e8] font-bold'
                  : 'border-transparent text-[#5f6368] hover:text-[#202124]'
              }`}
            >
              2. Student Timed Quiz
            </button>

            <button
              onClick={() => setActiveDemo('grading')}
              className={`px-5 py-3 text-xs font-medium border-b-2 transition ${
                activeDemo === 'grading'
                  ? 'border-[#1a73e8] text-[#1a73e8] font-bold'
                  : 'border-transparent text-[#5f6368] hover:text-[#202124]'
              }`}
            >
              3. Side-by-Side Grading
            </button>
          </div>

          {/* Showcase Display Card */}
          <div className="bg-white p-6 rounded-b-lg border border-t-0 border-[#dadce0] shadow-sm">
            {activeDemo === 'teacher' && (
              <div className="space-y-4 animate-slide-down">
                {/* Classroom-style Class Header */}
                <div className="bg-[#137333] text-white p-5 rounded-lg flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">Computer Science 2026 - Section A</h3>
                    <p className="text-xs text-[#e6f4ea] mt-0.5">Teacher: Alice • Subject: Operating Systems</p>
                  </div>
                  <span className="bg-[#f9ab00] text-[#202124] text-[11px] font-bold px-2.5 py-1 rounded">
                    Gemini 2.5 Inside
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="border border-[#dadce0] rounded-lg p-4 bg-[#f8f9fa] space-y-2">
                    <div className="font-semibold text-[#202124] flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-[#1a73e8]" />
                      <span>Ingested: OperatingSystems_Ch4.pdf (4.2 MB)</span>
                    </div>
                    <p className="text-[#5f6368] text-[11px] leading-relaxed">
                      12 Semantic Chunks extracted with sliding window partition. Vector embeddings indexed for top-k contextual retrieval.
                    </p>
                    <div className="flex items-center space-x-1.5 text-[11px] text-[#137333] bg-[#e6f4ea] px-2.5 py-1 rounded font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Validated MIME: application/pdf (Magic Bytes verified)</span>
                    </div>
                  </div>

                  <div className="border border-[#d2e3fc] rounded-lg p-4 bg-[#e8f0fe]/40 space-y-2">
                    <div className="font-semibold text-[#1a73e8] flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-[#1a73e8]" />
                      <span>Generated Exam Question</span>
                    </div>
                    <div className="text-[12px] text-[#202124] font-medium leading-relaxed">
                      "Explain the difference between preemptive and non-preemptive scheduling in modern OS kernels."
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#5f6368] pt-1">
                      <span>Format: Short Answer</span>
                      <span className="font-semibold text-[#1a73e8]">Difficulty: Hard [5 Points]</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeDemo === 'student' && (
              <div className="space-y-4 animate-slide-down">
                {/* Classroom quiz banner */}
                <div className="bg-[#1a73e8] text-white p-5 rounded-lg flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">Operating Systems Midterm 2026</h3>
                    <p className="text-xs text-[#e8f0fe] mt-0.5">Time Limit: 45 Minutes • Maximum Marks: 25</p>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-[#fce8e6] text-[#d93025] px-3 py-1.5 rounded-lg font-mono font-bold text-xs">
                    <Clock className="w-4 h-4" />
                    <span>00:44:18 Remaining</span>
                  </div>
                </div>

                <div className="p-5 rounded-lg border border-[#dadce0] bg-white space-y-3 text-xs">
                  <div className="flex justify-between items-center text-[#5f6368]">
                    <span className="font-semibold text-[#202124]">Question 3 of 10</span>
                    <span className="bg-[#e8f0fe] text-[#1a73e8] px-2 py-0.5 rounded font-bold">2 Points</span>
                  </div>
                  <p className="text-sm font-medium text-[#202124]">
                    Which of the following disk scheduling algorithms services requests closest to the current head position first?
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2.5 rounded-md border-2 border-[#1a73e8] bg-[#e8f0fe] font-medium text-[#1a73e8]">
                      A) SSTF (Shortest Seek Time First)
                    </div>
                    <div className="p-2.5 rounded-md border border-[#dadce0] text-[#3c4043]">
                      B) FCFS
                    </div>
                    <div className="p-2.5 rounded-md border border-[#dadce0] text-[#3c4043]">
                      C) SCAN (Elevator)
                    </div>
                    <div className="p-2.5 rounded-md border border-[#dadce0] text-[#3c4043]">
                      D) C-SCAN
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#5f6368] pt-2 border-t border-[#dadce0]">
                    <span className="text-[#137333] font-medium flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Autosaved 15 seconds ago</span>
                    </span>
                    <span>Palette: 3 of 10 Questions Answered</span>
                  </div>
                </div>
              </div>
            )}

            {activeDemo === 'grading' && (
              <div className="space-y-4 animate-slide-down">
                <div className="flex items-center justify-between border-b border-[#dadce0] pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#137333]" />
                    <span className="text-sm font-semibold text-[#202124]">
                      Teacher Evaluation Workspace: Charlie's Submission
                    </span>
                  </div>
                  <span className="text-xs bg-[#fef7e0] text-[#e37400] font-semibold px-2.5 py-0.5 rounded">
                    Awaiting Subjective Grade
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Model Answer (Google Green) */}
                  <div className="p-4 rounded-lg border border-[#a7f3d0] bg-[#ecfdf5] space-y-1">
                    <div className="font-bold text-[#065f46] uppercase text-[10px]">
                      Model Answer & Rubric
                    </div>
                    <p className="text-[#064e3b] leading-relaxed">
                      Preemptive scheduling permits high-priority tasks to interrupt active processes at any CPU clock tick, whereas non-preemptive requires the process to voluntarily yield.
                    </p>
                  </div>

                  {/* Student Answer */}
                  <div className="p-4 rounded-lg border border-[#d2e3fc] bg-[#e8f0fe] space-y-1">
                    <div className="font-bold text-[#174ea6] uppercase text-[10px]">
                      Student Submission (Charlie)
                    </div>
                    <p className="text-[#1a73e8] leading-relaxed">
                      Preemptive scheduling means a process can be interrupted by the operating system scheduler. Non-preemptive means it runs until finished.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-[#fef7e0] border border-[#fde293] rounded-lg flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-[#92400e]">
                    <Sparkles className="w-4 h-4 text-[#e37400] flex-shrink-0" />
                    <span>
                      <strong>AI Suggestion:</strong> 8 / 10 Marks. Clear summary of interruption vs voluntary run-to-completion.
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-[#1a73e8] bg-white px-3 py-1 rounded border border-[#dadce0] shadow-xs cursor-pointer">
                    Accept Suggestion
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3 Pillars Grid */}
      <section className="py-14 max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-normal text-[#202124]">
            Designed for Academic Scale & Classroom Security
          </h2>
          <p className="text-xs text-[#5f6368]">
            Google-grade reliability, server-enforced integrity, and state-of-the-art NLP.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-[#dadce0] space-y-2 hover:border-[#1a73e8] transition">
            <div className="w-9 h-9 rounded-lg bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center font-bold">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-[#202124]">RAG Question Generation</h3>
            <p className="text-xs text-[#5f6368] leading-relaxed">
              Upload PDF textbooks or syllabus notes up to 10MB. Text is parsed and synthesized into question banks using Gemini 2.5 Flash.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-[#dadce0] space-y-2 hover:border-[#137333] transition">
            <div className="w-9 h-9 rounded-lg bg-[#e6f4ea] text-[#137333] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-[#202124]">Anti-Cheat Exam Session</h3>
            <p className="text-xs text-[#5f6368] leading-relaxed">
              Server-enforced timer rejection, automatic periodic progress saving every 20 seconds, and answer key sanitization.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-[#dadce0] space-y-2 hover:border-[#f9ab00] transition">
            <div className="w-9 h-9 rounded-lg bg-[#fef7e0] text-[#e37400] flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-[#202124]">Classroom Grading Suite</h3>
            <p className="text-xs text-[#5f6368] leading-relaxed">
              Automatic objective grading, side-by-side rubric verification, printable university exam papers, and class analytics.
            </p>
          </div>
        </div>
      </section>

      {/* Google Classroom Footer */}
      <footer className="mt-auto bg-white border-t border-[#dadce0] py-6 text-xs text-[#5f6368]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-[#202124]">GoogleExam</span>
            <span>— The AI-Powered Examination Engine for Google Classroom</span>
          </div>

          <div className="flex items-center space-x-5">
            <a
              href="http://127.0.0.1:5000/api/v1/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#1a73e8] transition"
            >
              Swagger API Documentation
            </a>
            <a
              href="https://github.com/developerskull/EduTechAssistance"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#1a73e8] transition"
            >
              GitHub Repository
            </a>
            <span className="text-[#80868b]">Flask 2.3 • React 18 • Vite 5</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
