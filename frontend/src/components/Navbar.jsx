import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, LogOut, User as UserIcon, BookOpen, Layers, Code2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const handleLogout = () => {
    logout();
    toast.info('Signed out successfully');
    navigate('/login');
  };

  return (
    <nav className="glass-panel sticky top-0 z-50 border-b border-slate-200 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 bg-clip-text text-transparent">
                EduTechAssistance
              </span>
            </Link>

            {isAuthenticated && (
              <div className="hidden md:flex items-center space-x-1">
                {user?.role === 'teacher' ? (
                  <Link
                    to="/teacher"
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      location.pathname === '/teacher'
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                    }`}
                  >
                    Teacher Workspace
                  </Link>
                ) : (
                  <Link
                    to="/student"
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      location.pathname === '/student'
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                    }`}
                  >
                    Student Portal
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <a
              href="http://127.0.0.1:5000/api/v1/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center space-x-1 text-slate-500 hover:text-indigo-600 text-xs font-semibold px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition"
              title="Open OpenAPI / Swagger Documentation"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>API Docs</span>
            </a>

            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                  <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-xs font-bold text-slate-700">{user?.username}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      user?.role === 'teacher'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {user?.role}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 transition"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
