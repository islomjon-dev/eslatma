import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Pin, PinOff, Archive, Trash2, Edit3, X, Tag, Filter, FileText, Grid, List } from 'lucide-react';
import { Note, Category } from '../types';
import { Button, Input, Textarea, Modal, EmptyState, Badge, Select, ConfirmDialog } from '../components/UI';

interface NotesPageProps {
  notes: Note[];
  categories: Category[];
  onCreateNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  onDeleteNote: (id: string) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const NOTE_COLORS = [
  { name: 'default', value: '' },
  { name: 'yellow', value: '#fef3c7' },
  { name: 'green', value: '#d1fae5' },
  { name: 'blue', value: '#dbeafe' },
  { name: 'purple', value: '#ede9fe' },
  { name: 'pink', value: '#fce7f3' },
  { name: 'orange', value: '#ffedd5' },
];

export function NotesPage({ notes, categories, onCreateNote, onUpdateNote, onDeleteNote, showToast }: NotesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({ title: '', content: '', categoryId: '', tags: [] as string[], color: '' });
  const [tagInput, setTagInput] = useState('');

  // Autosave for editing
  const [autosaveTimer, setAutosaveTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const filteredNotes = notes.filter(note => {
    const matchesSearch = !searchQuery || note.title.toLowerCase().includes(searchQuery.toLowerCase()) || note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || note.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreate = () => {
    if (!newNote.title.trim()) {
      showToast('Sarlavha kiriting', 'error');
      return;
    }
    onCreateNote({
      userId: '',
      title: newNote.title,
      content: newNote.content,
      categoryId: newNote.categoryId || undefined,
      tags: newNote.tags,
      isArchived: false,
      isTrashed: false,
      pinned: false,
      color: newNote.color || undefined,
    });
    setNewNote({ title: '', content: '', categoryId: '', tags: [], color: '' });
    setIsCreating(false);
    showToast('Qayd yaratildi', 'success');
  };

  const handleUpdate = useCallback((id: string, updates: Partial<Note>) => {
    onUpdateNote(id, updates);
  }, [onUpdateNote]);

  // Autosave effect
  useEffect(() => {
    if (editingNote && autosaveTimer) {
      clearTimeout(autosaveTimer);
    }
    if (editingNote) {
      const timer = setTimeout(() => {
        handleUpdate(editingNote.id, { title: editingNote.title, content: editingNote.content });
      }, 1000);
      setAutosaveTimer(timer);
    }
    return () => { if (autosaveTimer) clearTimeout(autosaveTimer); };
  }, [editingNote?.title, editingNote?.content]);

  const addTag = () => {
    if (tagInput.trim() && editingNote && !editingNote.tags.includes(tagInput.trim())) {
      const updatedTags = [...editingNote.tags, tagInput.trim()];
      setEditingNote({ ...editingNote, tags: updatedTags });
      handleUpdate(editingNote.id, { tags: updatedTags });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    if (editingNote) {
      const updatedTags = editingNote.tags.filter(t => t !== tag);
      setEditingNote({ ...editingNote, tags: updatedTags });
      handleUpdate(editingNote.id, { tags: updatedTags });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder="Qaydlarni qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="input-field w-auto">
            <option value="">Barcha kategoriyalar</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700">
            {viewMode === 'grid' ? <List size={20} className="text-surface-500" /> : <Grid size={20} className="text-surface-500" />}
          </button>
          <Button onClick={() => setIsCreating(true)}><Plus size={16} className="mr-1" /> Yangi qayd</Button>
        </div>
      </div>

      {/* Notes Grid/List */}
      {filteredNotes.length === 0 ? (
        <EmptyState
          icon={<FileText size={32} />}
          title={searchQuery ? 'Qayd topilmadi' : 'Qaydlar yo\'q'}
          description={searchQuery ? 'Boshqa kalit so\'z bilan qidirib ko\'ring' : 'Birinchi qaydingizni yarating'}
          action={!searchQuery ? <Button onClick={() => setIsCreating(true)}><Plus size={16} className="mr-1" /> Qayd yaratish</Button> : undefined}
        />
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-2'}>
          {filteredNotes.sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          }).map(note => (
            viewMode === 'grid' ? (
              <div
                key={note.id}
                className="card p-4 cursor-pointer hover:shadow-md transition-all group"
                style={note.color ? { backgroundColor: note.color + '40' } : {}}
                onClick={() => setEditingNote(note)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-surface-900 dark:text-surface-100 line-clamp-1 flex-1">{note.title}</h3>
                  {note.pinned && <Pin size={14} className="text-yellow-500 flex-shrink-0 ml-2" />}
                </div>
                <p className="text-sm text-surface-500 dark:text-surface-400 line-clamp-3 mb-3">{note.content || 'Bo\'sh qayd'}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 flex-wrap">
                    {note.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-700 text-surface-500">{tag}</span>
                    ))}
                  </div>
                  <span className="text-xs text-surface-400">{new Date(note.updatedAt).toLocaleDateString('uz-Latn-UZ', { day: 'numeric', month: 'short' })}</span>
                </div>
              </div>
            ) : (
              <div
                key={note.id}
                className="card p-3 cursor-pointer hover:shadow-md transition-all flex items-center gap-3"
                style={note.color ? { borderLeft: `3px solid ${note.color}` } : {}}
                onClick={() => setEditingNote(note)}
              >
                {note.pinned && <Pin size={14} className="text-yellow-500 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-surface-900 dark:text-surface-100 truncate">{note.title}</h3>
                  <p className="text-sm text-surface-500 dark:text-surface-400 truncate">{note.content || 'Bo\'sh qayd'}</p>
                </div>
                <span className="text-xs text-surface-400 flex-shrink-0">{new Date(note.updatedAt).toLocaleDateString('uz-Latn-UZ', { day: 'numeric', month: 'short' })}</span>
              </div>
            )
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={isCreating} onClose={() => setIsCreating(false)} title="Yangi qayd" size="lg">
        <div className="space-y-4">
          <Input label="Sarlavha" placeholder="Qayd sarlavhasi..." value={newNote.title} onChange={(e) => setNewNote({ ...newNote, title: e.target.value })} />
          <Textarea label="Mazmun" placeholder="Qayd mazmunini yozing..." value={newNote.content} onChange={(e) => setNewNote({ ...newNote, content: e.target.value })} rows={6} />
          <Select label="Kategoriya" value={newNote.categoryId} onChange={(e) => setNewNote({ ...newNote, categoryId: e.target.value })} options={[{ value: '', label: 'Kategoriyasiz' }, ...categories.map(c => ({ value: c.id, label: c.name }))]} />
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Rang</label>
            <div className="flex gap-2">
              {NOTE_COLORS.map(color => (
                <button
                  key={color.name}
                  onClick={() => setNewNote({ ...newNote, color: color.value })}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${newNote.color === color.value ? 'border-primary-500 scale-110' : 'border-surface-200 dark:border-surface-600'}`}
                  style={{ backgroundColor: color.value || '#f1f5f9' }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setIsCreating(false)}>Bekor qilish</Button>
            <Button onClick={handleCreate}>Saqlash</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editingNote} onClose={() => setEditingNote(null)} title="Qaydni tahrirlash" size="xl">
        {editingNote && (
          <div className="space-y-4">
            <Input
              label="Sarlavha"
              value={editingNote.title}
              onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
            />
            <Textarea
              label="Mazmun"
              value={editingNote.content}
              onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
              rows={8}
            />
            <div className="flex items-center gap-2 text-xs text-surface-400">
              <span>🔄 Avtomatik saqlash yoqilgan</span>
            </div>
            <Select
              label="Kategoriya"
              value={editingNote.categoryId || ''}
              onChange={(e) => { setEditingNote({ ...editingNote, categoryId: e.target.value || undefined }); handleUpdate(editingNote.id, { categoryId: e.target.value || undefined }); }}
              options={[{ value: '', label: 'Kategoriyasiz' }, ...categories.map(c => ({ value: c.id, label: c.name }))]}
            />
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Teglar</label>
              <div className="flex flex-wrap gap-1 mb-2">
                {editingNote.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300">
                    {tag}
                    <button onClick={() => removeTag(tag)}><X size={12} /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Teg qo'shish..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTag()}
                  className="input-field flex-1"
                />
                <Button variant="secondary" size="sm" onClick={addTag}>Qo'shish</Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Rang</label>
              <div className="flex gap-2">
                {NOTE_COLORS.map(color => (
                  <button
                    key={color.name}
                    onClick={() => { setEditingNote({ ...editingNote, color: color.value || undefined }); handleUpdate(editingNote.id, { color: color.value || undefined }); }}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${editingNote.color === color.value ? 'border-primary-500 scale-110' : 'border-surface-200 dark:border-surface-600'}`}
                    style={{ backgroundColor: color.value || '#f1f5f9' }}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-surface-200 dark:border-surface-700">
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => { handleUpdate(editingNote.id, { pinned: !editingNote.pinned }); setEditingNote({ ...editingNote, pinned: !editingNote.pinned }); }}>
                  {editingNote.pinned ? <PinOff size={16} className="mr-1" /> : <Pin size={16} className="mr-1" />}
                  {editingNote.pinned ? 'Mahkamlashni bekor qilish' : 'Mahkamlash'}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { handleUpdate(editingNote.id, { isArchived: true }); setEditingNote(null); showToast('Qayd arxivlandi', 'success'); }}>
                  <Archive size={16} className="mr-1" /> Arxivlash
                </Button>
              </div>
              <Button variant="danger" size="sm" onClick={() => setDeleteConfirm(editingNote.id)}>
                <Trash2 size={16} className="mr-1" /> O'chirish
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => { if (deleteConfirm) { onDeleteNote(deleteConfirm); showToast('Qayd o\'chirildi', 'success'); } }}
        title="Qaydni o'chirish"
        message="Bu qaydni o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi."
        confirmText="O'chirish"
        cancelText="Bekor qilish"
      />
    </div>
  );
}
