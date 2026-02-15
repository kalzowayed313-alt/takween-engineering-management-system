
import React, { useState, useMemo } from 'react';
import { Project, Task, Employee, TaskStatus, Role, TaskPriority } from '../types';
import { 
  Briefcase, Calendar, DollarSign, ArrowRight, CheckCircle, X, 
  User, Building2, Plus, Save, Trash2, ListTodo, Lock, 
  AlertTriangle, Clock, Target, TrendingUp, UserCheck, ShieldCheck, 
  ChevronLeft, Layout, Cloud, Link as LinkIcon
} from 'lucide-react';
import { DEPARTMENTS } from '../constants';

const ProjectCard: React.FC<{ 
  project: Project, 
  projectTasks: Task[], 
  projectEmployees: Employee[],
  isLocked: boolean,
  onViewDetails: (proj: Project) => void,
  onAccessDeny: () => void
}> = ({ project, projectTasks, projectEmployees, isLocked, onViewDetails, onAccessDeny }) => {
  const progressPercent = useMemo(() => {
    const totalWeight = projectTasks.reduce((acc, t) => acc + (t.weight || 0), 0);
    if (totalWeight === 0) return 0;
    const completedWeight = projectTasks
      .filter(t => t.status === TaskStatus.COMPLETED)
      .reduce((acc, t) => acc + (t.weight || 0), 0);
    return Math.round((completedWeight / totalWeight) * 100);
  }, [projectTasks]);
  
  const dept = DEPARTMENTS.find(d => d.id === project.departmentId);

  return (
    <div 
      onClick={() => isLocked ? onAccessDeny() : onViewDetails(project)}
      className={`bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all group flex flex-col h-full relative overflow-hidden cursor-pointer ${isLocked ? 'grayscale opacity-60' : 'hover:shadow-2xl hover:border-blue-200'}`}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 dark:bg-blue-900/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-6">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
            <Briefcase size={24} />
          </div>
          <div className="flex gap-2">
            {project.driveFolderUrl && <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg" title="مرتبط بـ Google Drive"><Cloud size={14} /></div>}
            <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest ${
              project.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
            }`}>
              {project.status === 'ACTIVE' ? 'نشط' : 'معلق'}
            </span>
          </div>
        </div>

        <h3 className="text-xl font-black mb-1 text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">{project.name}</h3>
        <p className="text-xs text-slate-400 font-bold mb-4 flex items-center gap-1"><Building2 size={12} /> {project.client}</p>
        
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-tighter">
            <span className="text-slate-400">الإنجاز الفني</span>
            <span className="text-blue-600">{progressPercent}%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-50 dark:border-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-1000 ease-out" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="flex flex-col gap-1 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">تاريخ التسليم</span>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Calendar size={14} className="text-blue-500" />
              <span className="text-xs font-black tabular-nums">{project.deadline}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">الميزانية</span>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <DollarSign size={14} className="text-emerald-500" />
              <span className="text-xs font-black tabular-nums">{(project.budget/1000).toFixed(0)}K</span>
            </div>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800">
          <div className="flex -space-x-2 rtl:space-x-reverse">
            {projectEmployees.slice(0, 3).map(emp => (
              <img key={emp.id} src={emp.avatar} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 object-cover shadow-sm" alt=""/>
            ))}
          </div>
          <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[11px] font-black group-hover:bg-blue-600 transition-all shadow-lg">
             <ArrowRight size={16} /> إدارة المشروع
          </div>
        </div>
      </div>
    </div>
  );
};

const NewProjectModal: React.FC<{ 
  isOpen: boolean, 
  onClose: () => void, 
  onAdd: (p: Project, steps: any[]) => void,
  employees: Employee[] 
}> = ({ isOpen, onClose, onAdd, employees }) => {
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    budget: 1000000,
    deadline: new Date().toISOString().split('T')[0],
    managerId: employees[0]?.id || '',
    departmentId: employees[0]?.departmentId || 'arch',
    driveFolderUrl: '' // جديد: حقل رابط درايف
  });

  const [steps, setSteps] = useState([{ title: 'بدء المشروع وتجهيز المخططات', weight: 10 }]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: `proj-${Date.now()}`,
      ...formData,
      status: 'ACTIVE',
      progress: 0
    }, steps);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in zoom-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden p-10 border border-white/10 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between mb-8">
           <h3 className="text-2xl font-black text-slate-800 dark:text-white">إطلاق مشروع هندسي جديد</h3>
           <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all text-slate-400"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto custom-scrollbar px-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">اسم المشروع</label>
              <input required type="text" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">رابط Google Drive للمشروع</label>
              <div className="relative">
                <Cloud className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                <input type="url" placeholder="https://drive.google.com/..." className="w-full pr-12 pl-4 py-4 bg-indigo-50/50 dark:bg-indigo-900/10 border-2 border-indigo-100 dark:border-indigo-900/30 rounded-2xl text-xs font-bold outline-none" value={formData.driveFolderUrl} onChange={e => setFormData({...formData, driveFolderUrl: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">العميل</label>
              <input required type="text" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none" value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">مدير المشروع المسؤول</label>
              <select value={formData.managerId} onChange={e => setFormData({...formData, managerId: e.target.value})} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none">
                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">الميزانية التقديرية</label>
                <input required type="number" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 rounded-2xl text-sm font-bold" value={formData.budget} onChange={e => setFormData({...formData, budget: parseInt(e.target.value)})} />
             </div>
             <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">موعد التسليم</label>
                <input required type="date" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 rounded-2xl text-sm font-bold" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
             </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 mt-4">
             <CheckCircle size={20} /> إطلاق المشروع والأرشفة السحابية
          </button>
        </form>
      </div>
    </div>
  );
};

/* Defined ProjectsListProps interface to fix compilation error */
interface ProjectsListProps {
  projects: Project[];
  tasks: Task[];
  employees: Employee[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  currentUser: Employee;
  onAccessDeny: () => void;
}

const ProjectsList: React.FC<ProjectsListProps> = ({ projects, tasks, employees, setProjects, setTasks, currentUser, onAccessDeny }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  const handleAddProject = (newProj: Project, steps: any[]) => {
    setProjects(prev => [newProj, ...prev]);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white">محفظة المشاريع الهندسية</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">إدارة مركزية تربط التصاميم الإنشائية بمستودعات Google Drive</p>
        </div>
        {currentUser.role === Role.ADMIN && (
          <button 
            onClick={() => setIsNewProjectModalOpen(true)}
            className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2"
          >
            <span>إطلاق مشروع جديد</span>
            <Plus size={18} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map(p => {
          const projectTasks = tasks.filter(t => t.projectId === p.id);
          const projectEmployees = employees.filter(e => projectTasks.some(t => t.assignedTo === e.id) || e.id === p.managerId);
          const isLocked = currentUser.role !== Role.ADMIN && p.departmentId !== currentUser.departmentId;

          return (
            <ProjectCard 
              key={p.id} 
              project={p} 
              projectTasks={projectTasks} 
              projectEmployees={projectEmployees} 
              isLocked={isLocked}
              onViewDetails={setSelectedProject}
              onAccessDeny={onAccessDeny}
            />
          );
        })}
      </div>

      <NewProjectModal 
        isOpen={isNewProjectModalOpen} 
        onClose={() => setIsNewProjectModalOpen(false)} 
        onAdd={handleAddProject}
        employees={employees}
      />
    </div>
  );
};

export default ProjectsList;
