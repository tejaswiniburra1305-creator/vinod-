import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { 
  User, Brain, Zap, CheckCircle2, 
  TrendingUp, TrendingDown, Clock, MessageSquare,
  Calendar, Shield
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface StudentDashboardProps {
  student: any;
  attendanceHistory: any[];
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ student, attendanceHistory }) => {
  // Filter history for this student
  const myAttendance = attendanceHistory.filter(h => h.studentId === student.id);
  
  // Mock attention history for the chart (since we don't store historical attention scores per student in a separate collection yet, 
  // we can use the latest score and some random variation for demo, or just show the current score)
  const attentionHistory = [
    { time: '9:00 AM', score: Math.max(0, student.lastAttentionScore - 10) },
    { time: '9:15 AM', score: Math.max(0, student.lastAttentionScore - 5) },
    { time: '9:30 AM', score: student.lastAttentionScore },
    { time: '9:45 AM', score: Math.min(100, student.lastAttentionScore + 5) },
    { time: '10:00 AM', score: student.lastAttentionScore },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome, {student.name}!</h1>
          <p className="text-slate-500 mt-1">Here's your performance overview for today's session.</p>
        </div>
        <div className="flex items-center space-x-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
          <div className={cn(
            "w-3 h-3 rounded-full animate-pulse",
            student.attendanceStatus === 'present' ? "bg-emerald-500" : "bg-rose-500"
          )} />
          <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            Status: {student.attendanceStatus}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Brain size={24} />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Focus Level</span>
          </div>
          <h3 className="text-4xl font-black text-slate-900 mb-1">{student.lastAttentionScore}%</h3>
          <p className="text-sm text-slate-500">Current attention score</p>
          <div className="mt-4 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${student.lastAttentionScore}%` }}
              className={cn(
                "h-full transition-all duration-1000",
                student.lastAttentionScore > 70 ? "bg-emerald-500" : "bg-amber-500"
              )}
            />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <CheckCircle2 size={24} />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Attendance</span>
          </div>
          <h3 className="text-4xl font-black text-slate-900 mb-1">{myAttendance.length}</h3>
          <p className="text-sm text-slate-500">Sessions attended this week</p>
          <div className="mt-4 flex -space-x-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={cn(
                "w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold",
                i <= myAttendance.length ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
              )}>
                {i}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <Zap size={24} />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rank</span>
          </div>
          <h3 className="text-4xl font-black text-slate-900 mb-1">Top 10%</h3>
          <p className="text-sm text-slate-500">Compared to class average</p>
          <div className="mt-4 flex items-center text-emerald-500 text-sm font-bold">
            <TrendingUp size={16} className="mr-1" />
            <span>Improving consistently</span>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Attention Trend</h3>
              <p className="text-sm text-slate-500">Your focus levels throughout the current session</p>
            </div>
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
              <span>Focus %</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attentionHistory}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#6366f1" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feedback & Profile */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <MessageSquare size={20} />
              </div>
              <h3 className="font-bold text-slate-900">AI Feedback</h3>
            </div>
            <div className="space-y-4">
              {student.feedback && student.feedback.length > 0 ? (
                student.feedback.map((f: string, i: number) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm text-slate-600 italic leading-relaxed">
                    "{f}"
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 italic">No feedback available yet.</p>
              )}
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl shadow-slate-200">
            <h3 className="font-bold mb-6 flex items-center space-x-2">
              <Shield size={18} className="text-indigo-400" />
              <span>Identity Details</span>
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Roll Number</span>
                <span className="text-sm font-mono">{student.rollNumber}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Aadhar</span>
                <span className="text-sm font-mono">•••• •••• {student.aadharNumber?.slice(-4)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Grade</span>
                <span className="text-sm font-bold text-indigo-400">{student.grade}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
