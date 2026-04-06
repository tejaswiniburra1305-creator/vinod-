import React, { useState } from 'react';
import { User, Mail, Phone, Fingerprint, ShieldCheck, Camera as CameraIcon, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { CameraCapture } from './CameraCapture';
import { verifyFace } from '../services/gemini';

interface LoginProps {
  onLogin: (studentId: string) => void;
  students: any[];
}

export const Login: React.FC<LoginProps> = ({ onLogin, students }) => {
  const [step, setStep] = useState<'credentials' | 'face' | 'aadhar'>('credentials');
  const [identifier, setIdentifier] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [aadharInput, setAadharInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.email === identifier || s.phone === identifier);
    if (student) {
      setSelectedStudent(student);
      setStep('face');
      setError(null);
    } else {
      setError("Student not found with this email or phone.");
    }
  };

  const handleFaceCapture = async (base64: string) => {
    setIsVerifying(true);
    setError(null);
    try {
      const isVerified = await verifyFace(base64, selectedStudent.name);
      if (isVerified) {
        setStep('aadhar');
      } else {
        setError("Face verification failed. Please ensure your face is clearly visible and try again.");
      }
    } catch (err) {
      console.error("Face verification error:", err);
      setError("An error occurred during face verification. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAadhar = (e: React.FormEvent) => {
    e.preventDefault();
    if (aadharInput === selectedStudent.aadharNumber) {
      onLogin(selectedStudent.id);
    } else {
      setError("Aadhar number does not match our records.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Fingerprint size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Student Attendance Login</h2>
          <p className="text-slate-500 text-sm mt-2">Verify your identity to mark attendance</p>
        </div>

        {step === 'credentials' && (
          <form onSubmit={handleCredentials} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Email or Phone</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter email or phone"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  required
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              Continue
            </button>
          </form>
        )}

        {step === 'face' && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="font-bold text-slate-800">Face Recognition</h3>
              <p className="text-xs text-slate-500">Look directly at the camera</p>
            </div>
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-900 border-2 border-indigo-100 shadow-inner">
              <CameraCapture onCapture={handleFaceCapture} isAnalyzing={isVerifying} />
              {isVerifying && (
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-white z-10">
                  <Loader2 className="animate-spin mb-2" size={32} />
                  <p className="text-xs font-bold uppercase tracking-widest">Verifying Identity...</p>
                </div>
              )}
            </div>
            {error && (
              <div className="flex items-start space-x-2 p-3 bg-rose-50 rounded-xl border border-rose-100">
                <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={14} />
                <p className="text-[10px] text-rose-600 leading-tight">{error}</p>
              </div>
            )}
            <p className="text-[10px] text-center text-slate-400">Biometric verification powered by EduFocus AI</p>
          </div>
        )}

        {step === 'aadhar' && (
          <form onSubmit={handleAadhar} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Aadhar Verification</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  value={aadharInput}
                  onChange={(e) => setAadharInput(e.target.value)}
                  placeholder="Enter 12-digit Aadhar"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  required
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
            >
              Verify & Mark Attendance
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
