import React, { useState } from 'react';
import { Archive, Undo, Trash2, FileText, CheckSquare } from 'lucide-react';
import { Note, Task } from '../types';
import { Button, EmptyState, ConfirmDialog } from '../components/UI';

interface ArchivePageProps {
  notes: Note[];
  tasks: Task[];
  onRestoreNote: (id: string) => void;
  onRestoreTask: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onDeleteTask: (id: string) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function ArchivePage({ notes, tasks, onRestoreNote, onRestoreTask, onDeleteNote, onDeleteTask, showToast }: ArchivePageProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'note' | 'task'; id: string } | null>(null);
  const [tab, setTab] = useState<'notes' | 'tasks'>('notes');

  const archivedNotes = notes.filter(n => n.isArchived && !n.isTrashed);
  const archivedTasks = tasks.filter(t => t.isArchived && !t.isTrashed);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <p className="text-surface-500 dark:text-surface-400">Arxivlangan qayd va vazifalar</p>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-surface-200 dark:border-surface-700">
        <button onClick={() => setTab('notes')} className={`px-4 py-2 text-sm font-medium transition-colors ${tab === 'notes' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400' : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'}`}>
          Qaydlar ({archivedNotes.length})
        </button>
        <button onClick={() => setTab('tasks')} className={`px-4 py-2 text-sm font-medium transition-colors ${tab === 'tasks' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400' : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'}`}>
          Vazifalar ({archivedTasks.length})
        </button>
      </div>

      {tab === 'notes' && (
        archivedNotes.length === 0 ? (
          <EmptyState icon={<Archive size={32} />} title="Arxiv bo'sh" description="Arxivlangan qaydlar shu yerda ko'rinadi" />
        ) : (
          <div className="space-y-2">
            {archivedNotes.map(note => (
              <div key={note.id} className="card p-4 flex items-center gap-3">
                <FileText size={18} className="text-surface-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-surface-900 dark:text-surface-100 truncate">{note.title}</h3>
                  <p className="text-sm text-surface-500 truncate">{note.content.substring(0, 80)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => { onRestoreNote(note.id); showToast('Qayd tiklandi', 'success'); }} className="p-1.5 rounded hover:bg-surface-100 dark:hover:bg-surface-700" title="Tiklash">
                    <Undo size={14} className="text-primary-500" />
                  </button>
                  <button onClick={() => setDeleteConfirm({ type: 'note', id: note.id })} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20" title="O'chirish">
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'tasks' && (
        archivedTasks.length === 0 ? (
          <EmptyState icon={<Archive size={32} />} title="Arxiv bo'sh" description="Arxivlangan vazifalar shu yerda ko'rinadi" />
        ) : (
          <div className="space-y-2">
            {archivedTasks.map(task => (
              <div key={task.id} className="card p-4 flex items-center gap-3">
                <CheckSquare size={18} className="text-surface-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium truncate ${task.completed ? 'line-through text-surface-400' : 'text-surface-900 dark:text-surface-100'}`}>{task.title}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => { onRestoreTask(task.id); showToast('Vazifa tiklandi', 'success'); }} className="p-1.5 rounded hover:bg-surface-100 dark:hover:bg-surface-700" title="Tiklash">
                    <Undo size={14} className="text-primary-500" />
                  </button>
                  <button onClick={() => setDeleteConfirm({ type: 'task', id: task.id })} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20" title="O'chirish">
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) {
            if (deleteConfirm.type === 'note') onDeleteNote(deleteConfirm.id);
            else onDeleteTask(deleteConfirm.id);
            showToast('Butunlay o\'chirildi', 'success');
          }
        }}
        title="Butunlay o'chirish"
        message="Bu elementni butunlay o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi."
        confirmText="O'chirish"
        cancelText="Bekor qilish"
      />
    </div>
  );
}

interface TrashPageProps {
  notes: Note[];
  tasks: Task[];
  onRestoreNote: (id: string) => void;
  onRestoreTask: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onEmptyTrash: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function TrashPage({ notes, tasks, onRestoreNote, onRestoreTask, onDeleteNote, onDeleteTask, onEmptyTrash, showToast }: TrashPageProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'note' | 'task'; id: string } | null>(null);
  const [emptyConfirm, setEmptyConfirm] = useState(false);
  const [tab, setTab] = useState<'notes' | 'tasks'>('notes');

  const trashedNotes = notes.filter(n => n.isTrashed);
  const trashedTasks = tasks.filter(t => t.isTrashed);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-surface-500 dark:text-surface-400">Savatdagi elementlar 30 kundan keyin avtomatik o'chiriladi</p>
        {(trashedNotes.length + trashedTasks.length) > 0 && (
          <Button variant="danger" size="sm" onClick={() => setEmptyConfirm(true)}>Savatni bo'shatish</Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-surface-200 dark:border-surface-700">
        <button onClick={() => setTab('notes')} className={`px-4 py-2 text-sm font-medium transition-colors ${tab === 'notes' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400' : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'}`}>
          Qaydlar ({trashedNotes.length})
        </button>
        <button onClick={() => setTab('tasks')} className={`px-4 py-2 text-sm font-medium transition-colors ${tab === 'tasks' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400' : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'}`}>
          Vazifalar ({trashedTasks.length})
        </button>
      </div>

      {tab === 'notes' && (
        trashedNotes.length === 0 ? (
          <EmptyState icon={<Trash2 size={32} />} title="Savat bo'sh" description="O'chirilgan qaydlar shu yerda ko'rinadi" />
        ) : (
          <div className="space-y-2">
            {trashedNotes.map(note => (
              <div key={note.id} className="card p-4 flex items-center gap-3 opacity-75">
                <FileText size={18} className="text-surface-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-surface-900 dark:text-surface-100 truncate">{note.title}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => { onRestoreNote(note.id); showToast('Qayd tiklandi', 'success'); }} className="p-1.5 rounded hover:bg-surface-100 dark:hover:bg-surface-700" title="Tiklash">
                    <Undo size={14} className="text-primary-500" />
                  </button>
                  <button onClick={() => setDeleteConfirm({ type: 'note', id: note.id })} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20" title="Butunlay o'chirish">
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'tasks' && (
        trashedTasks.length === 0 ? (
          <EmptyState icon={<Trash2 size={32} />} title="Savat bo'sh" description="O'chirilgan vazifalar shu yerda ko'rinadi" />
        ) : (
          <div className="space-y-2">
            {trashedTasks.map(task => (
              <div key={task.id} className="card p-4 flex items-center gap-3 opacity-75">
                <CheckSquare size={18} className="text-surface-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-surface-900 dark:text-surface-100 truncate">{task.title}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => { onRestoreTask(task.id); showToast('Vazifa tiklandi', 'success'); }} className="p-1.5 rounded hover:bg-surface-100 dark:hover:bg-surface-700" title="Tiklash">
                    <Undo size={14} className="text-primary-500" />
                  </button>
                  <button onClick={() => setDeleteConfirm({ type: 'task', id: task.id })} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20" title="Butunlay o'chirish">
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) {
            if (deleteConfirm.type === 'note') onDeleteNote(deleteConfirm.id);
            else onDeleteTask(deleteConfirm.id);
            showToast('Butunlay o\'chirildi', 'success');
          }
        }}
        title="Butunlay o'chirish"
        message="Bu elementni butunlay o'chirishni xohlaysizmi?"
        confirmText="O'chirish"
        cancelText="Bekor qilish"
      />

      <ConfirmDialog
        isOpen={emptyConfirm}
        onClose={() => setEmptyConfirm(false)}
        onConfirm={() => { onEmptyTrash(); showToast('Savat bo\'shatildi', 'success'); }}
        title="Savatni bo'shatish"
        message="Savatdagi barcha elementlar butunlay o'chiriladi. Bu amalni qaytarib bo'lmaydi."
        confirmText="Bo'shatish"
        cancelText="Bekor qilish"
      />
    </div>
  );
}
