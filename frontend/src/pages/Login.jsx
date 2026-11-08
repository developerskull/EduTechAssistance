import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(identifier, password);
      toast.success(`Welcome back, ${user.username}!`);
      if (user.role === 'teacher' || user.role === 'admin') {
        navigate('/teacher');
      } else {
        navigate('/student');
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickFill = (u, p) => {
    setIdentifier(u);
    setPassword(p);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#f8f9fa]">
      <div className="w-full max-w-md bg-white p-8 rounded-lg border border-[#dadce0] shadow-sm">
        {/* Google Classroom Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-1.5 mb-2">
            <span className="text-2xl font-medium text-[#5f6368]">Google</span>
            <span className="text-2xl font-bold text-[#1a73e8]">Exam</span>
          </div>
          <h1 className="text-xl font-normal text-[#202124]">Sign in</h1>
          <p className="text-xs text-[#5f6368] mt-1">Use your Google Classroom Account</p>
        </div>

        {/* Quick Fill Demo Shortcuts */}
        <div className="mb-6 p-3 bg-[#e8f0fe] border border-[#d2e3fc] rounded-lg space-y-1.5">
          <div className="text-[11px] font-semibold text-[#1a73e8] uppercase tracking-wider flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Classroom Demo Accounts</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickFill('teacher_alice', 'TeacherPass123!')}
              className="p-2 bg-white hover:bg-[#f1f3f4] border border-[#dadce0] text-[#1a73e8] rounded-md font-medium transition text-left"
            >
              👩‍🏫 Teacher Alice
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('student_bob', 'StudentPass123!')}
              className="p-2 bg-white hover:bg-[#f1f3f4] border border-[#dadce0] text-[#1a73e8] rounded-md font-medium transition text-left"
            >
              👨‍🎓 Student Bob
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-md bg-[#fce8e6] border border-[#f5c2c7] flex items-start space-x-2 text-[#d93025] text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#5f6368] mb-1">
              Email or Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#5f6368] absolute left-3 top-3" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. teacher_alice or alice@university.edu"
                className="w-full pl-9 pr-3 py-2 rounded-md border border-[#dadce0] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] text-sm text-[#202124] bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#5f6368] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#5f6368] absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-md border border-[#dadce0] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] text-sm text-[#202124] bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link to="/register" className="text-xs font-medium text-[#1a73e8] hover:underline">
              Create account
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="py-2 px-6 rounded-md bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium text-xs shadow-xs transition disabled:opacity-50 flex items-center space-x-1.5"
            >
              <span>{submitting ? 'Signing in...' : 'Next'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
