import React, { useState } from 'react';
import { Plus, Edit3, Trash2, FolderOpen, X } from 'lucide-react';
import { Category } from '../types';
import { Button, Input, Modal, EmptyState, ConfirmDialog } from '../components/UI';

interface CategoriesPageProps {
  categories: Category[];
  notesCount: Record<string, number>;
  tasksCount: Record<string, number>;
  onCreateCategory: (category: Omit<Category, 'id' | 'createdAt'>) => void;
  onUpdateCategory: (id: string, updates: Partial<Category>) => void;
  onDeleteCategory: (id: string) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b', '#ec4899', '#06b6d4', '#84cc16'];

export function CategoriesPage({ categories, notesCount, tasksCount, onCreateCategory, onUpdateCategory, onDeleteCategory, showToast }: CategoriesPageProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '', color: COLORS[0] });

  const handleCreate = () => {
    if (!newCategory.name.trim()) {
      showToast('Kategoriya nomini kiriting', 'error');
      return;
    }
    onCreateCategory({ name: newCategory.name, color: newCategory.color, userId: '' });
    setNewCategory({ name: '', color: COLORS[0] });
    setIsCreating(false);
    showToast('Kategoriya yaratildi', 'success');
  };

  const handleUpdate = () => {
    if (!editingCategory || !editingCategory.name.trim()) return;
    onUpdateCategory(editingCategory.id, { name: editingCategory.name, color: editingCategory.color });
    setEditingCategory(null);
    showToast('Kategoriya yangilandi', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-surface-500 dark:text-surface-400">Qayd va vazifalaringizni tartiblang</p>
        <Button onClick={() => setIsCreating(true)}><Plus size={16} className="mr-1" /> Yangi kategoriya</Button>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={<FolderOpen size={32} />}
          title="Kategoriyalar yo'q"
          description="Qayd va vazifalaringizni tartiblash uchun kategoriya yarating"
          action={<Button onClick={() => setIsCreating(true)}><Plus size={16} className="mr-1" /> Kategoriya yaratish</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map(category => (
            <div key={category.id} className="card p-4 flex items-center gap-4 group hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: category.color + '20' }}>
                <FolderOpen size={20} style={{ color: category.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-surface-900 dark:text-surface-100">{category.name}</h3>
                <p className="text-sm text-surface-500">
                  {(notesCount[category.id] || 0)} qayd · {(tasksCount[category.id] || 0)} vazifa
                </p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditingCategory(category)} className="p-1.5 rounded hover:bg-surface-100 dark:hover:bg-surface-700">
                  <Edit3 size={14} className="text-surface-400" />
                </button>
                <button onClick={() => setDeleteConfirm(category.id)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20">
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={isCreating} onClose={() => setIsCreating(false)} title="Yangi kategoriya" size="sm">
        <div className="space-y-4">
          <Input label="Nomi" placeholder="Kategoriya nomi..." value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Rang</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setNewCategory({ ...newCategory, color })}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${newCategory.color === color ? 'border-surface-900 dark:border-white scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
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
      <Modal isOpen={!!editingCategory} onClose={() => setEditingCategory(null)} title="Kategoriyani tahrirlash" size="sm">
        {editingCategory && (
          <div className="space-y-4">
            <Input label="Nomi" value={editingCategory.name} onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })} />
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Rang</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setEditingCategory({ ...editingCategory, color })}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${editingCategory.color === color ? 'border-surface-900 dark:border-white scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setEditingCategory(null)}>Bekor qilish</Button>
              <Button onClick={handleUpdate}>Saqlash</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => { if (deleteConfirm) { onDeleteCategory(deleteConfirm); showToast('Kategoriya o\'chirildi', 'success'); } }}
        title="Kategoriyani o'chirish"
        message="Bu kategoriyani o'chirishni xohlaysizmi? Qayd va vazifalar o'chirilmaydi, lekin kategoriyasiz qoladi."
        confirmText="O'chirish"
        cancelText="Bekor qilish"
      />
    </div>
  );
}
