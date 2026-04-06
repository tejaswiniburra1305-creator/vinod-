import React from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  CheckCircle2, 
  Star, 
  MessageSquare, 
  TrendingUp,
  BookOpen,
  X
} from 'lucide-react';
import { SessionSummary } from '@/src/services/gemini';
import { cn } from '@/src/lib/utils';

interface SessionSummaryModalProps {
  summary: SessionSummary;
  onClose: () => void;
}

export const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({ summary, onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-indigo-600 text-white">
          <div className="flex items-center space-x-3">
            <FileText size={24} />
            <h2 className="text-xl font-bold">Live Session Summary</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto flex-1 space-y-8">
          {/* Header Info */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2 text-indigo-600 mb-1">
                <BookOpen size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">Inferred Topic</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">{summary.topic}</h3>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end space-x-1 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    className={cn(i < summary.overallRating ? "text-amber-400 fill-amber-400" : "text-slate-200")} 
                  />
                ))}
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase">Overall Session Rating</p>
            </div>
          </div>

          {/* Engagement Overview */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <div className="flex items-center space-x-2 mb-3 text-slate-800">
              <TrendingUp size={18} className="text-indigo-500" />
              <h4 className="font-bold">Engagement Overview</h4>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed italic">
              "{summary.engagementOverview}"
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Key Discussion Points */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-slate-800">
                <MessageSquare size={18} className="text-indigo-500" />
                <h4 className="font-bold">Key Discussion Points</h4>
              </div>
              <ul className="space-y-3">
                {summary.keyPoints.map((point, i) => (
                  <li key={i} className="flex items-start space-x-3 text-sm text-slate-600">
                    <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Student Highlights */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-slate-800">
                <Star size={18} className="text-indigo-500" />
                <h4 className="font-bold">Student Highlights</h4>
              </div>
              <div className="space-y-3">
                {summary.studentHighlights.map((highlight, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                    <span className="text-sm font-semibold text-slate-800">{highlight.name}</span>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider",
                      highlight.status.toLowerCase().includes('focused') ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    )}>
                      {highlight.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end space-x-4">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
          >
            Close
          </button>
          <button 
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            Save to History
          </button>
        </div>
      </motion.div>
    </div>
  );
};
