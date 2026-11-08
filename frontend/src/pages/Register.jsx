import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, Mail, AlertCircle, ArrowRight, BookOpen, School } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('teacher');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await register({ username, email, password, role });
      toast.success(`GoogleExam account created! Welcome, ${user.username}.`);
      if (user.role === 'teacher' || user.role === 'admin') {
        navigate('/teacher');
      } else {
        navigate('/student');
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Registration failed. Please check your details.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#f8f9fa]">
      <div className="w-full max-w-md bg-white p-8 rounded-lg border border-[#dadce0] shadow-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-1.5 mb-2">
            <span className="text-2xl font-medium text-[#5f6368]">Google</span>
            <span className="text-2xl font-bold text-[#1a73e8]">Exam</span>
          </div>
          <h1 className="text-xl font-normal text-[#202124]">Create Account</h1>
          <p className="text-xs text-[#5f6368] mt-1">Join as an Educator or Student</p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-md bg-[#fce8e6] border border-[#f5c2c7] flex items-start space-x-2 text-[#d93025] text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selection tabs */}
          <div>
            <label className="block text-xs font-medium text-[#5f6368] mb-1.5">
              Account Type:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('teacher')}
                className={`p-2.5 rounded-md border text-center transition ${
                  role === 'teacher'
                    ? 'border-[#1a73e8] bg-[#e8f0fe] text-[#1a73e8] font-bold'
                    : 'border-[#dadce0] hover:bg-[#f8f9fa] text-[#5f6368]'
                }`}
              >
                <div className="text-xs font-medium">👨‍🏫 Educator / Teacher</div>
              </button>

              <button
                type="button"
                onClick={() => setRole('student')}
                className={`p-2.5 rounded-md border text-center transition ${
                  role === 'student'
                    ? 'border-[#1a73e8] bg-[#e8f0fe] text-[#1a73e8] font-bold'
                    : 'border-[#dadce0] hover:bg-[#f8f9fa] text-[#5f6368]'
                }`}
              >
                <div className="text-xs font-medium">👨‍🎓 Student / Learner</div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#5f6368] mb-1">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#5f6368] absolute left-3 top-3" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. prof_sharma"
                className="w-full pl-9 pr-3 py-2 rounded-md border border-[#dadce0] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] text-sm text-[#202124] bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#5f6368] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#5f6368] absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@school.edu"
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
                placeholder="At least 6 characters"
                className="w-full pl-9 pr-3 py-2 rounded-md border border-[#dadce0] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] text-sm text-[#202124] bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link to="/login" className="text-xs font-medium text-[#1a73e8] hover:underline">
              Sign in instead
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="py-2 px-6 rounded-md bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium text-xs shadow-xs transition disabled:opacity-50 flex items-center space-x-1.5"
            >
              <span>{submitting ? 'Creating...' : 'Register'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
