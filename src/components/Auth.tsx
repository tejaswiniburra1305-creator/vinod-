import React, { useState } from 'react';
import { User, ShieldCheck, Fingerprint, GraduationCap, ArrowRight, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Login as StudentLogin } from './Login';

interface AuthProps {
  onLogin: (user: any) => void;
  students: any[];
}

export const Auth: React.FC<AuthProps> = ({ onLogin, students }) => {
  const [mode, setMode] = useState<'selection' | 'student' | 'teacher'>('selection');
  const [teacherPass, setTeacherPass] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // For demo purposes, we'll use a simple "admin123" password
    if (teacherPass === 'admin123') {
      const prof = students.find(s => s.role === 'teacher');
      onLogin(prof || { name: 'Prof. Anderson', role: 'teacher' });
    } else {
      setError('Invalid teacher credentials');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 items-center">
        <div className="hidden md:block">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200">
              <GraduationCap size={32} />
            </div>
            <h1 className="text-5xl font-bold text-slate-900 leading-tight">
              Smart Classroom <br />
              <span className="text-indigo-600">Attention Management</span>
            </h1>
            <p className="text-lg text-slate-500 max-w-md">
              A production-grade system for real-time engagement tracking, biometric attendance, and session analytics.
            </p>
            <div className="flex items-center space-x-4 text-sm font-bold text-slate-400 uppercase tracking-widest">
              <span>Biometric</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span>Vision AI</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span>Analytics</span>
            </div>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'selection' && (
            <motion.div
              key="selection"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100"
            >
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
                <p className="text-slate-500 mt-2">Select your login type to continue</p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => setMode('teacher')}
                  className="w-full group p-6 bg-slate-50 hover:bg-indigo-600 border border-slate-100 hover:border-indigo-500 rounded-3xl transition-all duration-300 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white group-hover:bg-indigo-500 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:text-white shadow-sm transition-colors">
                      <ShieldCheck size={24} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-900 group-hover:text-white transition-colors">Teacher Dashboard</p>
                      <p className="text-xs text-slate-500 group-hover:text-indigo-100 transition-colors">Access analytics & class monitor</p>
                    </div>
                  </div>
                  <ArrowRight className="text-slate-300 group-hover:text-white transition-colors" size={20} />
                </button>

                <button
                  onClick={() => setMode('student')}
                  className="w-full group p-6 bg-slate-50 hover:bg-emerald-600 border border-slate-100 hover:border-emerald-500 rounded-3xl transition-all duration-300 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white group-hover:bg-emerald-500 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:text-white shadow-sm transition-colors">
                      <Fingerprint size={24} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-900 group-hover:text-white transition-colors">Student Attendance</p>
                      <p className="text-xs text-slate-500 group-hover:text-emerald-100 transition-colors">Mark attendance with Biometrics</p>
                    </div>
                  </div>
                  <ArrowRight className="text-slate-300 group-hover:text-white transition-colors" size={20} />
                </button>
              </div>

              <p className="text-center text-[10px] text-slate-400 mt-8 uppercase tracking-widest font-bold">
                Powered by EduFocus Vision Engine
              </p>
            </motion.div>
          )}

          {mode === 'teacher' && (
            <motion.div
              key="teacher"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100"
            >
              <button 
                onClick={() => setMode('selection')}
                className="mb-6 text-slate-400 hover:text-slate-600 text-xs font-bold flex items-center space-x-1 transition-colors"
              >
                <span>← Back to selection</span>
              </button>
              
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Lock size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Teacher Login</h2>
                <p className="text-slate-500 text-sm mt-2">Enter your secure access credentials</p>
              </div>

              <form onSubmit={handleTeacherLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Access Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="password"
                      value={teacherPass}
                      onChange={(e) => setTeacherPass(e.target.value)}
                      placeholder="Enter admin password"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      required
                    />
                  </div>
                </div>
                {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  Access Dashboard
                </button>
                <p className="text-[10px] text-center text-slate-400 mt-4">
                  Default password for demo: <span className="font-bold">admin123</span>
                </p>
              </form>
            </motion.div>
          )}

          {mode === 'student' && (
            <motion.div
              key="student"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full"
            >
              <button 
                onClick={() => setMode('selection')}
                className="mb-4 text-slate-400 hover:text-slate-600 text-xs font-bold flex items-center space-x-1 transition-colors"
              >
                <span>← Back to selection</span>
              </button>
              <StudentLogin onLogin={(id) => {
                const student = students.find(s => s.id === id);
                onLogin(student);
              }} students={students} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
