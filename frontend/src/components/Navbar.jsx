import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, Grid, LogOut, Code2, Sparkles, BookOpen } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const handleLogout = () => {
    logout();
    toast.info('Signed out of GoogleExam');
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-[#dadce0] sticky top-0 z-50 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between h-16 items-center">
          {/* Left: Google Classroom Logo & App Name */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              className="p-2 rounded-full hover:bg-[#f1f3f4] text-[#5f6368] transition"
              title="Main menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center space-x-2.5">
              {/* Google Classroom Official Chalkboard Icon */}
              <div className="w-9 h-9 rounded-lg bg-[#137333] border-2 border-[#f9ab00] flex items-center justify-center text-white shadow-xs">
                <span className="text-base select-none">👨‍🏫</span>
              </div>

              <div className="flex items-baseline space-x-1">
                <span className="text-xl font-medium tracking-tight text-[#5f6368]">
                  Google
                </span>
                <span className="text-xl font-bold tracking-tight text-[#1a73e8]">
                  Exam
                </span>
                <span className="text-[10px] font-medium bg-[#e8f0fe] text-[#1a73e8] px-1.5 py-0.5 rounded ml-1 uppercase tracking-wider hidden sm:inline">
                  Classroom Edition
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Classroom Tabs (when logged in) */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-1 h-full">
              {user?.role === 'teacher' ? (
                <>
                  <Link
                    to="/teacher"
                    className={`h-full flex items-center px-4 border-b-2 text-sm font-medium transition ${
                      location.pathname === '/teacher'
                        ? 'border-[#1a73e8] text-[#1a73e8] font-bold'
                        : 'border-transparent text-[#5f6368] hover:text-[#202124] hover:bg-[#f8f9fa]'
                    }`}
                  >
                    Teacher Workspace
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/student"
                    className={`h-full flex items-center px-4 border-b-2 text-sm font-medium transition ${
                      location.pathname === '/student'
                        ? 'border-[#1a73e8] text-[#1a73e8] font-bold'
                        : 'border-transparent text-[#5f6368] hover:text-[#202124] hover:bg-[#f8f9fa]'
                    }`}
                  >
                    Student Portal
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Right: Google Waffle & Account Avatar */}
          <div className="flex items-center space-x-2">
            <a
              href="http://127.0.0.1:5000/api/v1/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center space-x-1 text-[#5f6368] hover:text-[#1a73e8] hover:bg-[#f1f3f4] text-xs font-medium px-2.5 py-1.5 rounded-md transition"
              title="Open OpenAPI / Swagger Docs"
            >
              <Code2 className="w-4 h-4" />
              <span>API</span>
            </a>

            {/* Google Waffle Grid Icon */}
            <button
              type="button"
              className="p-2 rounded-full hover:bg-[#f1f3f4] text-[#5f6368] transition"
              title="Google apps"
            >
              <Grid className="w-5 h-5" />
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                {/* Google Account Avatar Circle */}
                <div className="flex items-center space-x-2 bg-[#f8f9fa] border border-[#dadce0] pl-1 pr-3 py-1 rounded-full">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    user?.role === 'teacher' ? 'bg-[#137333]' : 'bg-[#1a73e8]'
                  }`}>
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-medium text-[#202124] leading-tight">
                      {user?.username}
                    </span>
                    <span className="text-[10px] text-[#5f6368] capitalize leading-none">
                      {user?.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-[#5f6368] hover:text-[#d93025] hover:bg-[#fce8e6] rounded-full transition"
                  title="Sign out of GoogleExam"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-xs font-medium text-[#1a73e8] hover:bg-[#e8f0fe] px-3 py-2 rounded-md transition"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-medium bg-[#1a73e8] hover:bg-[#1557b0] text-white px-4 py-2 rounded-md shadow-xs transition"
                >
                  Join Class
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
