import React, { useState } from 'react';
import { Plus, Search, Check, Circle, AlertCircle, Trash2, Archive, Calendar, Filter, CheckSquare } from 'lucide-react';
import { Task, Category } from '../types';
import { Button, Input, Textarea, Modal, EmptyState, Badge, Select, ConfirmDialog } from '../components/UI';

interface TasksPageProps {
  tasks: Task[];
  categories: Category[];
  onCreateTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function TasksPage({ tasks, categories, onCreateTask, onUpdateTask, onDeleteTask, showToast }: TasksPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('active');
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' as Task['priority'], dueDate: '', categoryId: '' });

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = !searchQuery || task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = !filterPriority || task.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'active' && !task.completed) || (filterStatus === 'completed' && task.completed);
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const handleCreate = () => {
    if (!newTask.title.trim()) {
      showToast('Vazifa nomini kiriting', 'error');
      return;
    }
    onCreateTask({
      userId: '',
      title: newTask.title,
      description: newTask.description || undefined,
      completed: false,
      priority: newTask.priority,
      dueDate: newTask.dueDate || undefined,
      categoryId: newTask.categoryId || undefined,
      tags: [],
      isArchived: false,
      isTrashed: false,
    });
    setNewTask({ title: '', description: '', priority: 'medium', dueDate: '', categoryId: '' });
    setIsCreating(false);
    showToast('Vazifa yaratildi', 'success');
  };

  const toggleComplete = (task: Task) => {
    onUpdateTask(task.id, { completed: !task.completed });
    if (!task.completed) showToast('Vazifa bajarildi! ✓', 'success');
  };

  const priorityColors = { high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
  const priorityLabels = { high: 'Muhim', medium: 'O\'rtacha', low: 'Past' };

  const activeTasks = filteredTasks.filter(t => !t.completed);
  const completedTasks = filteredTasks.filter(t => t.completed);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input type="text" placeholder="Vazifalarni qidirish..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input-field pl-10 w-full" />
          </div>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="input-field w-auto">
            <option value="">Barcha muhimlik</option>
            <option value="high">Muhim</option>
            <option value="medium">O'rtacha</option>
            <option value="low">Past</option>
          </select>
        </div>
        <Button onClick={() => setIsCreating(true)}><Plus size={16} className="mr-1" /> Yangi vazifa</Button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-1 border-b border-surface-200 dark:border-surface-700">
        {[{ id: 'active', label: 'Faol', count: tasks.filter(t => !t.completed && !t.isTrashed).length }, { id: 'completed', label: 'Bajarilgan', count: tasks.filter(t => t.completed && !t.isTrashed).length }, { id: 'all', label: 'Barchasi', count: tasks.filter(t => !t.isTrashed).length }].map(tab => (
          <button key={tab.id} onClick={() => setFilterStatus(tab.id)} className={`px-4 py-2 text-sm font-medium transition-colors relative ${filterStatus === tab.id ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400' : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'}`}>
            {tab.label}
            <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-surface-100 dark:bg-surface-800">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare size={32} />}
          title={searchQuery ? 'Vazifa topilmadi' : filterStatus === 'completed' ? 'Bajarilgan vazifa yo\'q' : 'Vazifa yo\'q'}
          description={searchQuery ? 'Boshqa kalit so\'z bilan qidirib ko\'ring' : 'Yangi vazifa qo\'shing'}
          action={!searchQuery && filterStatus === 'active' ? <Button onClick={() => setIsCreating(true)}><Plus size={16} className="mr-1" /> Vazifa qo'shish</Button> : undefined}
        />
      ) : (
        <div className="space-y-2">
          {activeTasks.map(task => (
            <TaskItem key={task.id} task={task} onToggle={toggleComplete} onDelete={() => setDeleteConfirm(task.id)} onArchive={() => { onUpdateTask(task.id, { isArchived: true }); showToast('Arxivlandi', 'success'); }} priorityColors={priorityColors} priorityLabels={priorityLabels} />
          ))}
          {filterStatus !== 'active' && completedTasks.length > 0 && (
            <>
              <div className="pt-4 pb-2"><h3 className="text-sm font-medium text-surface-500">Bajarilgan ({completedTasks.length})</h3></div>
              {completedTasks.map(task => (
                <TaskItem key={task.id} task={task} onToggle={toggleComplete} onDelete={() => setDeleteConfirm(task.id)} onArchive={() => { onUpdateTask(task.id, { isArchived: true }); showToast('Arxivlandi', 'success'); }} priorityColors={priorityColors} priorityLabels={priorityLabels} />
              ))}
            </>
          )}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={isCreating} onClose={() => setIsCreating(false)} title="Yangi vazifa">
        <div className="space-y-4">
          <Input label="Vazifa nomi" placeholder="Nima qilish kerak?" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />
          <Textarea label="Tavsif (ixtiyoriy)" placeholder="Qo'shimcha ma'lumot..." value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} rows={3} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Muhimlik" value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })} options={[{ value: 'low', label: 'Past' }, { value: 'medium', label: 'O\'rtacha' }, { value: 'high', label: 'Muhim' }]} />
            <Input label="Muddati" type="date" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} />
          </div>
          <Select label="Kategoriya" value={newTask.categoryId} onChange={(e) => setNewTask({ ...newTask, categoryId: e.target.value })} options={[{ value: '', label: 'Kategoriyasiz' }, ...categories.map(c => ({ value: c.id, label: c.name }))]} />
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setIsCreating(false)}>Bekor qilish</Button>
            <Button onClick={handleCreate}>Saqlash</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => { if (deleteConfirm) { onDeleteTask(deleteConfirm); showToast('Vazifa o\'chirildi', 'success'); } }}
        title="Vazifani o'chirish"
        message="Bu vazifani o'chirishni xohlaysizmi?"
        confirmText="O'chirish"
        cancelText="Bekor qilish"
      />
    </div>
  );
}

function TaskItem({ task, onToggle, onDelete, onArchive, priorityColors, priorityLabels }: { task: Task; onToggle: (t: Task) => void; onDelete: () => void; onArchive: () => void; priorityColors: any; priorityLabels: any }) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  return (
    <div className={`card p-3 flex items-center gap-3 group hover:shadow-sm transition-all ${task.completed ? 'opacity-60' : ''}`}>
      <button onClick={() => onToggle(task)} className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-green-500 border-green-500' : 'border-surface-300 dark:border-surface-600 hover:border-primary-500'}`}>
        {task.completed && <Check size={12} className="text-white" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${task.completed ? 'line-through text-surface-400' : 'text-surface-900 dark:text-surface-100'}`}>{task.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-xs px-1.5 py-0.5 rounded ${priorityColors[task.priority]}`}>{priorityLabels[task.priority]}</span>
          {task.dueDate && (
            <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-500' : 'text-surface-400'}`}>
              <Calendar size={12} /> {new Date(task.dueDate).toLocaleDateString('uz-Latn-UZ', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onArchive} className="p-1.5 rounded hover:bg-surface-100 dark:hover:bg-surface-700" title="Arxivlash">
          <Archive size={14} className="text-surface-400" />
        </button>
        <button onClick={onDelete} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20" title="O'chirish">
          <Trash2 size={14} className="text-red-400" />
        </button>
      </div>
    </div>
  );
}
