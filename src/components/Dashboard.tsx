import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { 
  Users, Brain, Zap, AlertCircle, 
  TrendingUp, TrendingDown, Clock, Lightbulb
} from 'lucide-react';
import { motion } from 'motion/react';
import { AttentionAnalysis } from '@/src/services/gemini';
import { cn } from '@/src/lib/utils';

interface DashboardProps {
  analysis: AttentionAnalysis | null;
  history: { time: string; engagement: number }[];
}

export const Dashboard: React.FC<DashboardProps> = ({ analysis, history }) => {
  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4 py-20">
        <div className="p-6 rounded-full bg-slate-100">
          <Clock size={48} className="opacity-50" />
        </div>
        <p className="text-lg font-medium">Waiting for first analysis...</p>
        <p className="text-sm max-w-xs text-center">Capture a frame of the classroom to see real-time attention metrics.</p>
      </div>
    );
  }

  const moodColors = {
    energetic: "text-amber-500 bg-amber-50 border-amber-100",
    focused: "text-emerald-500 bg-emerald-50 border-emerald-100",
    bored: "text-slate-500 bg-slate-50 border-slate-100",
    confused: "text-indigo-500 bg-indigo-50 border-indigo-100",
    distracted: "text-rose-500 bg-rose-50 border-rose-100",
  };

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Overall Engagement" 
          value={`${analysis.overallEngagement}%`} 
          icon={<Zap size={20} />}
          trend={analysis.overallEngagement > 70 ? 'up' : 'down'}
          color="indigo"
        />
        <StatCard 
          label="Total Students" 
          value={analysis.studentCount.toString()} 
          icon={<Users size={20} />}
          color="blue"
        />
        <StatCard 
          label="Focused" 
          value={analysis.focusedCount.toString()} 
          icon={<Brain size={20} />}
          color="emerald"
        />
        <StatCard 
          label="Distracted" 
          value={analysis.distractedCount.toString()} 
          icon={<AlertCircle size={20} />}
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Engagement Trend</h3>
            <div className="flex items-center space-x-2 text-xs font-medium text-slate-500">
              <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
              <span>Attention Level</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorEngage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" hide />
                <YAxis domain={[0, 100]} hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="engagement" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorEngage)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mood & Summary */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Classroom Mood</h3>
            <div className={cn(
              "inline-flex items-center px-4 py-2 rounded-full border text-sm font-bold capitalize mb-4",
              moodColors[analysis.mood]
            )}>
              {analysis.mood}
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              {analysis.summary}
            </p>
          </div>

          <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
            <div className="flex items-center space-x-2 mb-4 text-indigo-700">
              <Lightbulb size={18} />
              <h3 className="font-semibold">AI Recommendations</h3>
            </div>
            <ul className="space-y-3">
              {analysis.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start space-x-3 text-sm text-indigo-900/80">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, trend, color }: any) => {
  const colors: any = {
    indigo: "bg-indigo-50 text-indigo-600",
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-600",
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between"
    >
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
        <div className="flex items-baseline space-x-2">
          <h4 className="text-2xl font-bold text-slate-900">{value}</h4>
          {trend && (
            <span className={cn(
              "text-xs font-bold flex items-center",
              trend === 'up' ? "text-emerald-500" : "text-rose-500"
            )}>
              {trend === 'up' ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
            </span>
          )}
        </div>
      </div>
      <div className={cn("p-3 rounded-xl", colors[color])}>
        {icon}
      </div>
    </motion.div>
  );
};
