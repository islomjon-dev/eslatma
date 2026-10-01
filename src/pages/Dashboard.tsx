import React from 'react';
import { FileText, CheckSquare, Bell, Calendar, TrendingUp, Clock, Star, Plus } from 'lucide-react';
import { Note, Task, Reminder, ViewMode } from '../types';
import { Button, Badge } from '../components/UI';

interface DashboardProps {
  notes: Note[];
  tasks: Task[];
  reminders: Reminder[];
  userName: string;
  onNavigate: (view: ViewMode) => void;
  onQuickCreate: (type: 'note' | 'task' | 'reminder') => void;
}

export function Dashboard({ notes, tasks, reminders, userName, onNavigate, onQuickCreate }: DashboardProps) {
  const activeNotes = notes.filter(n => !n.isTrashed && !n.isArchived);
  const activeTasks = tasks.filter(t => !t.isTrashed && !t.isArchived);
  const completedTasks = activeTasks.filter(t => t.completed);
  const pendingTasks = activeTasks.filter(t => !t.completed);
  const upcomingReminders = reminders.filter(r => !r.isTrashed && new Date(r.dateTime) > new Date());
  const overdueTasks = pendingTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date());
  const highPriorityTasks = pendingTasks.filter(t => t.priority === 'high');
  const pinnedNotes = activeNotes.filter(n => n.pinned);

  const today = new Date();
  const greeting = today.getHours() < 12 ? 'Xayrli tong' : today.getHours() < 18 ? 'Xayrli kun' : 'Xayrli kech';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">{greeting}, {userName}!</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Bugun {today.toLocaleDateString('uz-Latn-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => onQuickCreate('note')}><Plus size={16} className="mr-1" /> Qayd</Button>
          <Button size="sm" variant="secondary" onClick={() => onQuickCreate('task')}><Plus size={16} className="mr-1" /> Vazifa</Button>
          <Button size="sm" variant="secondary" onClick={() => onQuickCreate('reminder')}><Plus size={16} className="mr-1" /> Eslatma</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Qaydlar" value={activeNotes.length} color="blue" onClick={() => onNavigate('notes')} />
        <StatCard icon={CheckSquare} label="Vazifalar" value={`${completedTasks.length}/${activeTasks.length}`} color="green" onClick={() => onNavigate('tasks')} />
        <StatCard icon={Bell} label="Eslatmalar" value={upcomingReminders.length} color="purple" onClick={() => onNavigate('reminders')} />
        <StatCard icon={Calendar} label="Muddati o'tgan" value={overdueTasks.length} color="red" onClick={() => onNavigate('tasks')} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-surface-900 dark:text-surface-100 flex items-center gap-2">
              <Clock size={18} className="text-primary-500" /> Yaqin vazifalar
            </h3>
            <button onClick={() => onNavigate('tasks')} className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">Barchasi →</button>
          </div>
          {pendingTasks.length === 0 ? (
            <p className="text-sm text-surface-500 dark:text-surface-400 py-4 text-center">Bajarilishi kerak bo'lgan vazifa yo'q ✨</p>
          ) : (
            <div className="space-y-2">
              {pendingTasks.slice(0, 5).map(task => (
                <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors">
                  <div className={`w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                  <span className="flex-1 text-sm text-surface-700 dark:text-surface-300 truncate">{task.title}</span>
                  {task.dueDate && (
                    <span className={`text-xs ${new Date(task.dueDate) < today ? 'text-red-500' : 'text-surface-400'}`}>
                      {formatDate(task.dueDate)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Reminders */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-surface-900 dark:text-surface-100 flex items-center gap-2">
              <Bell size={18} className="text-purple-500" /> Kelgusi eslatmalar
            </h3>
            <button onClick={() => onNavigate('reminders')} className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">Barchasi →</button>
          </div>
          {upcomingReminders.length === 0 ? (
            <p className="text-sm text-surface-500 dark:text-surface-400 py-4 text-center">Kutilayotgan eslatma yo'q 🔔</p>
          ) : (
            <div className="space-y-2">
              {upcomingReminders.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()).slice(0, 5).map(reminder => (
                <div key={reminder.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Bell size={14} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-700 dark:text-surface-300 truncate">{reminder.title}</p>
                    <p className="text-xs text-surface-400">{formatDateTime(reminder.dateTime)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pinned Notes */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-surface-900 dark:text-surface-100 flex items-center gap-2">
              <Star size={18} className="text-yellow-500" /> Mahkamlangan qaydlar
            </h3>
            <button onClick={() => onNavigate('notes')} className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">Barchasi →</button>
          </div>
          {pinnedNotes.length === 0 ? (
            <p className="text-sm text-surface-500 dark:text-surface-400 py-4 text-center">Mahkamlangan qayd yo'q 📌</p>
          ) : (
            <div className="space-y-2">
              {pinnedNotes.slice(0, 5).map(note => (
                <div key={note.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors cursor-pointer" onClick={() => onNavigate('notes')}>
                  <div className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                    <FileText size={14} className="text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-700 dark:text-surface-300 truncate">{note.title}</p>
                    <p className="text-xs text-surface-400 truncate">{note.content.substring(0, 60)}...</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-surface-900 dark:text-surface-100 flex items-center gap-2">
              <TrendingUp size={18} className="text-green-500" /> Bugungi natija
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-surface-600 dark:text-surface-400">Vazifalar bajarilishi</span>
                <span className="text-sm font-medium text-surface-900 dark:text-surface-100">
                  {activeTasks.length > 0 ? Math.round((completedTasks.length / activeTasks.length) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${activeTasks.length > 0 ? (completedTasks.length / activeTasks.length) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-surface-50 dark:bg-surface-700/50">
                <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">{highPriorityTasks.length}</p>
                <p className="text-xs text-surface-500">Muhim vazifalar</p>
              </div>
              <div className="p-3 rounded-lg bg-surface-50 dark:bg-surface-700/50">
                <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">{overdueTasks.length}</p>
                <p className="text-xs text-surface-500">Muddati o'tgan</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, onClick }: { icon: any; label: string; value: string | number; color: string; onClick: () => void }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  };

  return (
    <button onClick={onClick} className="card p-4 text-left hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center mb-3`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">{value}</p>
      <p className="text-sm text-surface-500 dark:text-surface-400">{label}</p>
    </button>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return 'Bugun';
  if (date.toDateString() === tomorrow.toDateString()) return 'Ertaga';
  return date.toLocaleDateString('uz-Latn-UZ', { day: 'numeric', month: 'short' });
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('uz-Latn-UZ', { day: 'numeric', month: 'short' }) + ', ' + date.toLocaleTimeString('uz-Latn-UZ', { hour: '2-digit', minute: '2-digit' });
}
