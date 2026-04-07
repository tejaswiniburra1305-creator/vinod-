import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Camera as CameraIcon, 
  History, 
  Settings as SettingsIcon,
  Bell,
  Search,
  User,
  GraduationCap,
  Users as UsersIcon,
  LogIn,
  Plus,
  X,
  Info,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Clock,
  Calendar
} from 'lucide-react';
import { CameraCapture } from './components/CameraCapture';
import { Dashboard } from './components/Dashboard';
import { Auth } from './components/Auth';
import { StudentForm } from './components/StudentForm';
import { analyzeClassroom, generateSessionSummary, AttentionAnalysis, Student, SessionSummary } from './services/gemini';
import { cn } from './lib/utils';
import { SessionSummaryModal } from './components/SessionSummaryModal';

interface AppNotification {
  id: string;
  type: 'info' | 'warning' | 'success';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'camera' | 'history' | 'students' | 'settings'>('dashboard');
  const [analysis, setAnalysis] = useState<AttentionAnalysis | null>(null);
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [history, setHistory] = useState<{ time: string; engagement: number }[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastCapturedImage, setLastCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
    fetchAttendanceHistory();
    // Initial notification
    addNotification('info', 'System Ready', 'EduFocus is monitoring classroom 402.');
  }, []);

  const addNotification = (type: 'info' | 'warning' | 'success', title: string, message: string) => {
    const newNotif: AppNotification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      time: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 10));
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error("Failed to fetch students", err);
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      const res = await fetch('/api/attendance');
      const data = await res.json();
      setAttendanceHistory(data);
    } catch (err) {
      console.error("Failed to fetch attendance history", err);
    }
  };

  const handleCapture = async (base64: string) => {
    setIsAnalyzing(true);
    setLastCapturedImage(base64);
    try {
      const result = await analyzeClassroom(base64, students);
      setAnalysis(result);
      
      if (result.overallEngagement < 50) {
        addNotification('warning', 'Low Engagement Alert', `Classroom attention has dropped to ${result.overallEngagement}%.`);
      } else {
        addNotification('success', 'Analysis Complete', `Classroom engagement is at ${result.overallEngagement}%.`);
      }

      // Update student attention scores and feedback
      if (result.studentDetails) {
        const updatedStudents = students.map(s => {
          const detail = result.studentDetails?.find(d => d.rollNumber === s.rollNumber);
          if (detail) {
            const updated = {
              ...s,
              attendanceStatus: 'present' as const,
              lastAttentionScore: detail.attentionScore,
              feedback: [...(s.feedback || []), detail.feedback].slice(-5)
            };
            
            // Record attendance in history
            fetch('/api/attendance', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                studentId: s.id,
                studentName: s.name,
                rollNumber: s.rollNumber,
                status: 'present',
                timestamp: new Date().toISOString()
              })
            }).then(() => fetchAttendanceHistory());

            // Persist to server
            fetch(`/api/students/${s.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updated)
            });
            return updated;
          }
          return s;
        });
        setStudents(updatedStudents);
      }

      const newHistoryItem = {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        engagement: result.overallEngagement
      };
      
      setHistory(prev => [...prev.slice(-19), newHistoryItem]);
      setActiveTab('dashboard');
    } catch (error) {
      console.error("Analysis failed:", error);
      addNotification('warning', 'Analysis Failed', 'Could not process classroom image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!lastCapturedImage) {
      addNotification('warning', 'No Data', 'Please capture a classroom frame first.');
      return;
    }
    setIsGeneratingSummary(true);
    try {
      const summary = await generateSessionSummary(lastCapturedImage, students);
      setSessionSummary(summary);
      addNotification('success', 'Summary Generated', 'Live session summary is now available.');
    } catch (error) {
      console.error("Summary generation failed:", error);
      addNotification('warning', 'Generation Failed', 'Could not generate session summary.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleLogin = async (user: any) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    addNotification('success', 'Login Successful', `Welcome, ${user.name}!`);
    
    if (user.role === 'student') {
      // Mark attendance
      const updated = students.map(s => s.id === user.id ? { ...s, attendanceStatus: 'present' as const } : s);
      setStudents(updated);

      // Record in history
      try {
        const res = await fetch('/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: user.id,
            studentName: user.name,
            rollNumber: user.rollNumber,
            status: 'present'
          })
        });
        const record = await res.json();
        setAttendanceHistory(prev => [record, ...prev]);
      } catch (err) {
        console.error("Failed to record attendance", err);
      }
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setActiveTab('dashboard');
    addNotification('info', 'Logged Out', 'You have been successfully logged out.');
  };

  const saveStudent = async (studentData: any) => {
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...studentData, attendanceStatus: 'absent', lastAttentionScore: 0, feedback: [] })
      });
      const newStudent = await res.json();
      setStudents([...students, newStudent]);
      setShowStudentForm(false);
      addNotification('success', 'Student Added', `${newStudent.name} has been registered.`);
    } catch (err) {
      console.error("Failed to save student", err);
    }
  };

  const updateStudent = async (studentData: any) => {
    if (!editingStudent) return;
    try {
      const res = await fetch(`/api/students/${editingStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      });
      const updated = await res.json();
      setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
      if (currentUser?.id === updated.id) {
        setCurrentUser(updated);
      }
      setEditingStudent(null);
      addNotification('success', 'Profile Updated', `${updated.name}'s profile has been updated.`);
    } catch (err) {
      console.error("Failed to update student", err);
    }
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  if (!isLoggedIn) {
    return <Auth onLogin={handleLogin} students={students} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-20 md:w-64 bg-white border-r border-slate-200 z-50 transition-all">
        <div className="p-6 flex items-center space-x-3">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 overflow-hidden">
            <img 
              src="https://png.pngtree.com/png-vector/20220611/ourmid/pngtree-smart-class-logo-design-png-image_5033333.png" 
              alt="EduFocus Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="hidden md:block font-bold text-xl tracking-tight text-slate-800">EduFocus</span>
        </div>

        <nav className="mt-8 px-4 space-y-2">
          <NavItem 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')}
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
          />
          <NavItem 
            active={activeTab === 'camera'} 
            onClick={() => setActiveTab('camera')}
            icon={<CameraIcon size={20} />}
            label="Live Monitor"
          />
          <NavItem 
            active={activeTab === 'students'} 
            onClick={() => setActiveTab('students')}
            icon={<UsersIcon size={20} />}
            label="Students"
          />
          <NavItem 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')}
            icon={<History size={20} />}
            label="History"
          />
        </nav>

        <div className="absolute bottom-8 left-0 w-full px-4 space-y-2">
          <NavItem 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')}
            icon={<SettingsIcon size={20} />}
            label="Settings"
          />
          <div className="pt-4 border-t border-slate-100">
            <div 
              onClick={handleLogout}
              className="flex items-center space-x-3 p-3 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-slate-200 group-hover:bg-rose-100 flex items-center justify-center text-slate-500 group-hover:text-rose-600 transition-colors">
                <User size={16} />
              </div>
              <div className="hidden md:block overflow-hidden">
                <p className="text-sm font-semibold truncate">{currentUser?.name}</p>
                <p className="text-xs text-slate-500 group-hover:text-rose-400 truncate">Logout</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pl-20 md:pl-64 min-h-screen transition-all">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-8 flex items-center justify-between">
          <div className="flex items-center bg-slate-100 px-4 py-2 rounded-full w-full max-w-md">
            <Search size={18} className="text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search sessions, students..." 
              className="bg-transparent border-none focus:ring-0 text-sm w-full"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            {!isLoggedIn && (
              <button 
                onClick={() => setActiveTab('camera')}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold transition-all"
              >
                <LogIn size={16} />
                <span>Student Login</span>
              </button>
            )}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) markAllRead();
                }}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative"
              >
                <Bell size={20} />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                        <h3 className="font-bold text-slate-800">Notifications</h3>
                        <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                          <X size={16} />
                        </button>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? notifications.map(notif => (
                          <div key={notif.id} className={cn(
                            "p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors flex space-x-3",
                            !notif.read && "bg-indigo-50/30"
                          )}>
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                              notif.type === 'info' && "bg-blue-100 text-blue-600",
                              notif.type === 'warning' && "bg-amber-100 text-amber-600",
                              notif.type === 'success' && "bg-emerald-100 text-emerald-600"
                            )}>
                              {notif.type === 'info' && <Info size={16} />}
                              {notif.type === 'warning' && <AlertTriangle size={16} />}
                              {notif.type === 'success' && <CheckCircle2 size={16} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-800 truncate">{notif.title}</p>
                              <p className="text-xs text-slate-500 line-clamp-2">{notif.message}</p>
                              <p className="text-[10px] text-slate-400 mt-1">{notif.time}</p>
                            </div>
                          </div>
                        )) : (
                          <div className="p-8 text-center text-slate-400">
                            <p className="text-sm italic">No new notifications</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Session</p>
              <p className="text-sm font-semibold text-slate-700">Intro to Algorithms • Room 402</p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900">Classroom Insights</h1>
                    <p className="text-slate-500 mt-1">Real-time analysis of student engagement and focus.</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={handleGenerateSummary}
                      disabled={isGeneratingSummary || !lastCapturedImage}
                      className={cn(
                        "px-6 py-2.5 rounded-xl font-semibold transition-all flex items-center space-x-2",
                        isGeneratingSummary || !lastCapturedImage 
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                          : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
                      )}
                    >
                      {isGeneratingSummary ? (
                        <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FileText size={18} />
                      )}
                      <span>Generate Summary</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab('camera')}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all flex items-center space-x-2"
                    >
                      <CameraIcon size={18} />
                      <span>New Analysis</span>
                    </button>
                  </div>
                </div>
                <Dashboard analysis={analysis} history={history} />
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900">Attendance History</h1>
                    <p className="text-slate-500 mt-1">Chronological record of student check-ins.</p>
                  </div>
                  <div className="flex items-center space-x-2 bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
                    <button className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold">All Records</button>
                    <button className="px-4 py-1.5 text-slate-400 hover:text-slate-600 rounded-lg text-xs font-bold transition-colors">Today</button>
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Roll Number</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Timestamp</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {attendanceHistory.length > 0 ? attendanceHistory.map((record) => (
                          <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                  <User size={14} />
                                </div>
                                <span className="text-sm font-bold text-slate-800">{record.studentName}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-slate-500 font-mono">{record.rollNumber}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={cn(
                                "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                record.status === 'present' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                              )}>
                                {record.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <div className="flex items-center space-x-1 text-sm text-slate-700 font-medium">
                                  <Clock size={12} className="text-slate-400" />
                                  <span>{new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="flex items-center space-x-1 text-[10px] text-slate-400">
                                  <Calendar size={10} />
                                  <span>{new Date(record.timestamp).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button className="text-indigo-500 hover:text-indigo-700 text-xs font-bold opacity-0 group-hover:opacity-100 transition-all">
                                View Details
                              </button>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                              <div className="flex flex-col items-center space-y-2">
                                <History size={32} className="opacity-20" />
                                <p className="text-sm italic">No attendance records found</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'students' && (
              <motion.div
                key="students"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <h1 className="text-3xl font-bold text-slate-900">Student Directory</h1>
                  <button 
                    onClick={() => setShowStudentForm(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold flex items-center space-x-2"
                  >
                    <Plus size={18} />
                    <span>Add Student</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {students.map(student => (
                    <div 
                      key={student.id} 
                      onClick={() => {
                        setCurrentUser(student);
                        // We can use a modal or just show details
                      }}
                      className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                          <User size={24} />
                        </div>
                        <span className={cn(
                          "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                          student.attendanceStatus === 'present' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                        )}>
                          {student.attendanceStatus}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{student.name}</h3>
                      <p className="text-xs text-slate-400 mb-4">Roll: {student.rollNumber} • Age: {student.age} • Grade: {student.grade}</p>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-1">
                            <span>Attention Score</span>
                            <span>{student.lastAttentionScore}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full transition-all",
                                student.lastAttentionScore > 70 ? "bg-emerald-500" : "bg-amber-500"
                              )}
                              style={{ width: `${student.lastAttentionScore}%` }}
                            />
                          </div>
                        </div>
                        
                        {student.feedback && student.feedback.length > 0 && (
                          <div className="pt-2 border-t border-slate-50">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Latest Feedback</p>
                            <p className="text-xs text-slate-600 italic line-clamp-1 group-hover:line-clamp-none transition-all">"{student.feedback[student.feedback.length - 1]}"</p>
                          </div>
                        )}
                        
                        <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400">
                          <span>Parent: {student.parentContact}</span>
                          <span className="text-indigo-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">View Profile →</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'students' && currentUser && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
              >
                <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-800">Student Profile</h2>
                    <button onClick={() => setCurrentUser(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                  <div className="p-8">
                    <div className="flex items-center space-x-6 mb-8">
                      <div className="w-24 h-24 bg-indigo-100 rounded-3xl flex items-center justify-center text-indigo-600">
                        <User size={48} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900">{currentUser?.name}</h3>
                        <p className="text-slate-500">Roll Number: {currentUser?.rollNumber || 'N/A'}</p>
                        <div className="mt-2 flex space-x-2">
                          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider">Grade {currentUser?.grade || 'N/A'}</span>
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider">{currentUser?.age || 'N/A'} Years Old</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact Information</p>
                        <p className="text-sm font-medium text-slate-700">{currentUser?.email || 'N/A'}</p>
                        <p className="text-sm font-medium text-slate-700">{currentUser?.phone || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Parent/Guardian</p>
                        <p className="text-sm font-medium text-slate-700">{currentUser?.parentContact || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aadhar Number</p>
                        <p className="text-sm font-medium text-slate-700">•••• •••• {currentUser?.aadharNumber?.slice(-4) || 'XXXX'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attendance</p>
                        <p className={cn(
                          "text-sm font-bold",
                          currentUser?.attendanceStatus === 'present' ? "text-emerald-600" : "text-rose-600"
                        )}>{(currentUser?.attendanceStatus || 'N/A').toUpperCase()}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attention History & Feedback</p>
                      <div className="space-y-2">
                        {currentUser.feedback?.map((f: string, i: number) => (
                          <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 italic">
                            "{f}"
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex space-x-4">
                      <button 
                        onClick={() => {
                          // Logic to download profile as JSON/Text
                          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentUser));
                          const downloadAnchorNode = document.createElement('a');
                          downloadAnchorNode.setAttribute("href",     dataStr);
                          downloadAnchorNode.setAttribute("download", `${currentUser.name}_profile.json`);
                          document.body.appendChild(downloadAnchorNode);
                          downloadAnchorNode.click();
                          downloadAnchorNode.remove();
                        }}
                        className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
                      >
                        Download Profile
                      </button>
                      <button 
                        onClick={() => setEditingStudent(currentUser)}
                        className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all"
                      >
                        Edit Profile
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-2xl"
              >
                <h1 className="text-3xl font-bold text-slate-900 mb-8">Settings</h1>
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4">System Configuration</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold">Auto-Analysis Interval</p>
                          <p className="text-xs text-slate-500">How often the system captures frames</p>
                        </div>
                        <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-sm">
                          <option>Every 5 mins</option>
                          <option>Every 10 mins</option>
                          <option>Manual only</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold">Face Recognition Sensitivity</p>
                          <p className="text-xs text-slate-500">Confidence threshold for attendance</p>
                        </div>
                        <input type="range" className="w-32" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4">Database Management</h3>
                    <p className="text-sm text-slate-500 mb-4">You are currently using a local JSON database.</p>
                    <button className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-sm font-bold hover:bg-rose-100 transition-all">
                      Clear All Data
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'camera' && (
              <motion.div
                key="camera"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto"
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-slate-900">Classroom Monitoring</h1>
                  <p className="text-slate-500 mt-1">Capture a frame to analyze student engagement and attendance.</p>
                </div>
                <CameraCapture onCapture={handleCapture} isAnalyzing={isAnalyzing} />
                
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FeatureCard 
                    title="Real-time Analysis" 
                    desc="Gemini AI analyzes every student's posture and focus levels."
                  />
                  <FeatureCard 
                    title="Auto Attendance" 
                    desc="Students are automatically marked present via face recognition."
                  />
                  <FeatureCard 
                    title="Privacy First" 
                    desc="Images are processed and discarded after analysis."
                  />
                </div>
              </motion.div>
            )}

            {/* ... other tabs ... */}
          </AnimatePresence>
        </div>

        {showStudentForm && (
          <StudentForm onSave={saveStudent} onClose={() => setShowStudentForm(false)} />
        )}

        {editingStudent && (
          <StudentForm 
            initialData={editingStudent} 
            onSave={updateStudent} 
            onClose={() => setEditingStudent(null)} 
          />
        )}

        {sessionSummary && (
          <SessionSummaryModal 
            summary={sessionSummary} 
            onClose={() => setSessionSummary(null)} 
          />
        )}
      </main>
    </div>
  );
}

const NavItem = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center space-x-3 p-3 rounded-xl transition-all group",
      active 
        ? "bg-indigo-50 text-indigo-600 shadow-sm" 
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
    )}
  >
    <span className={cn("transition-transform group-hover:scale-110", active && "scale-110")}>
      {icon}
    </span>
    <span className="hidden md:block text-sm font-semibold">{label}</span>
  </button>
);

const FeatureCard = ({ title, desc }: any) => (
  <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
    <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
  </div>
);
