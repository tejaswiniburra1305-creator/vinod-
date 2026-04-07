import React, { useState } from 'react';
import { Plus, User, Hash, Calendar, GraduationCap, Phone, Shield, Save, X, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Student } from '@/src/services/gemini';

interface StudentFormProps {
  onSave: (student: any) => void;
  onClose: () => void;
  initialData?: any;
}

export const StudentForm: React.FC<StudentFormProps> = ({ onSave, onClose, initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    rollNumber: initialData?.rollNumber || '',
    age: initialData?.age || 0,
    grade: initialData?.grade || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    aadharNumber: initialData?.aadharNumber || '',
    parentContact: initialData?.parentContact || '',
    role: initialData?.role || 'student',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAadhar, setShowAadhar] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Phone validation (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Phone must be 10 digits';
    }

    // Aadhar validation (12 digits)
    const aadharRegex = /^\d{12}$/;
    if (!aadharRegex.test(formData.aadharNumber)) {
      newErrors.aadharNumber = 'Aadhar must be 12 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">{initialData ? 'Edit Student Profile' : 'Add New Student'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[80vh] overflow-y-auto">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Roll Number</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                required
                value={formData.rollNumber}
                onChange={e => setFormData({...formData, rollNumber: e.target.value})}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Age</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="number"
                required
                value={formData.age}
                onChange={e => setFormData({...formData, age: parseInt(e.target.value)})}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Grade/Class</label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                required
                value={formData.grade}
                onChange={e => setFormData({...formData, grade: e.target.value})}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className={`w-full px-4 py-2 bg-slate-50 border ${errors.email ? 'border-rose-500' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none`}
            />
            {errors.email && (
              <p className="text-[10px] text-rose-500 flex items-center gap-1">
                <AlertCircle size={10} /> {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                required
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className={`w-full pl-10 pr-4 py-2 bg-slate-50 border ${errors.phone ? 'border-rose-500' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none`}
              />
            </div>
            {errors.phone && (
              <p className="text-[10px] text-rose-500 flex items-center gap-1">
                <AlertCircle size={10} /> {errors.phone}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Aadhar Number</label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type={showAadhar ? "text" : "password"}
                required
                value={formData.aadharNumber}
                onChange={e => setFormData({...formData, aadharNumber: e.target.value})}
                className={`w-full pl-10 pr-10 py-2 bg-slate-50 border ${errors.aadharNumber ? 'border-rose-500' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none`}
              />
              <button
                type="button"
                onClick={() => setShowAadhar(!showAadhar)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showAadhar ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.aadharNumber && (
              <p className="text-[10px] text-rose-500 flex items-center gap-1">
                <AlertCircle size={10} /> {errors.aadharNumber}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Parent Contact</label>
            <input
              type="text"
              required
              value={formData.parentContact}
              onChange={e => setFormData({...formData, parentContact: e.target.value})}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="md:col-span-2 pt-4">
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-indigo-100"
            >
              <Save size={20} />
              <span>{initialData ? 'Update Student Profile' : 'Save Student Profile'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
