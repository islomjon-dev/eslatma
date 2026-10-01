import React, { useState } from 'react';
import { Plus, Search, Bell, Trash2, Clock, Calendar as CalendarIcon, Repeat, Check } from 'lucide-react';
import { Reminder, Category } from '../types';
import { Button, Input, Textarea, Modal, EmptyState, Select, ConfirmDialog } from '../components/UI';

interface RemindersPageProps {
  reminders: Reminder[];
  categories: Category[];
  onCreateReminder: (reminder: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateReminder: (id: string, updates: Partial<Reminder>) => void;
  onDeleteReminder: (id: string) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function RemindersPage({ reminders, categories, onCreateReminder, onUpdateReminder, onDeleteReminder, showToast }: RemindersPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [newReminder, setNewReminder] = useState({ title: '', description: '', dateTime: '', recurring: null as Reminder['recurring'], categoryId: '' });

  const filteredReminders = reminders.filter(r => {
    const matchesSearch = !searchQuery || r.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  }).sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  const upcoming = filteredReminders.filter(r => new Date(r.dateTime) >= new Date());
  const past = filteredReminders.filter(r => new Date(r.dateTime) < new Date());

  const handleCreate = () => {
    if (!newReminder.title.trim() || !newReminder.dateTime) {
      showToast('Sarlavha va vaqtni kiriting', 'error');
      return;
    }
    onCreateReminder({
      userId: '',
      title: newReminder.title,
      description: newReminder.description || undefined,
      dateTime: newReminder.dateTime,
      recurring: newReminder.recurring,
      notified: false,
      categoryId: newReminder.categoryId || undefined,
      tags: [],
      isTrashed: false,
    });
    setNewReminder({ title: '', description: '', dateTime: '', recurring: null, categoryId: '' });
    setIsCreating(false);
    showToast('Eslatma yaratildi', 'success');
  };

  const recurringLabels: Record<string, string> = { daily: 'Har kuni', weekly: 'Har hafta', monthly: 'Har oy', yearly: 'Har yil' };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input type="text" placeholder="Eslatmalarni qidirish..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input-field pl-10 w-full" />
        </div>
        <Button onClick={() => setIsCreating(true)}><Plus size={16} className="mr-1" /> Yangi eslatma</Button>
      </div>

      {/* Info about browser notifications */}
      <div className="card p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>ℹ️ Eslatma haqida:</strong> Brauzer bildirishnomalari faqat ilova ochiq turganda ishlaydi. Ishonchli eslatmalar uchun email yoki push-notifikatsiya sozlanishi kerak.
        </p>
      </div>

      {/* Upcoming Reminders */}
      {upcoming.length === 0 && past.length === 0 ? (
        <EmptyState
          icon={<Bell size={32} />}
          title="Eslatmalar yo'q"
          description="Yangi eslatma qo'shing va vaqtini belgilang"
          action={<Button onClick={() => setIsCreating(true)}><Plus size={16} className="mr-1" /> Eslatma qo'shish</Button>}
        />
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-surface-500 mb-3">Kelgusi eslatmalar ({upcoming.length})</h3>
              <div className="space-y-2">
                {upcoming.map(reminder => (
                  <ReminderItem key={reminder.id} reminder={reminder} onDelete={() => setDeleteConfirm(reminder.id)} onDone={() => { onUpdateReminder(reminder.id, { notified: true }); showToast('Bajarildi!', 'success'); }} recurringLabels={recurringLabels} />
                ))}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-surface-500 mb-3">O'tgan eslatmalar ({past.length})</h3>
              <div className="space-y-2">
                {past.map(reminder => (
                  <ReminderItem key={reminder.id} reminder={reminder} onDelete={() => setDeleteConfirm(reminder.id)} onDone={() => { onUpdateReminder(reminder.id, { notified: true }); showToast('Bajarildi!', 'success'); }} recurringLabels={recurringLabels} isPast />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={isCreating} onClose={() => setIsCreating(false)} title="Yangi eslatma">
        <div className="space-y-4">
          <Input label="Sarlavha" placeholder="Eslatma nomi..." value={newReminder.title} onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })} />
          <Textarea label="Tavsif (ixtiyoriy)" placeholder="Qo'shimcha ma'lumot..." value={newReminder.description} onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })} rows={3} />
          <Input label="Sana va vaqt" type="datetime-local" value={newReminder.dateTime} onChange={(e) => setNewReminder({ ...newReminder, dateTime: e.target.value })} />
          <Select label="Takrorlash" value={newReminder.recurring || ''} onChange={(e) => setNewReminder({ ...newReminder, recurring: (e.target.value || null) as Reminder['recurring'] })} options={[{ value: '', label: 'Takrorlanmaydi' }, { value: 'daily', label: 'Har kuni' }, { value: 'weekly', label: 'Har hafta' }, { value: 'monthly', label: 'Har oy' }, { value: 'yearly', label: 'Har yil' }]} />
          <Select label="Kategoriya" value={newReminder.categoryId} onChange={(e) => setNewReminder({ ...newReminder, categoryId: e.target.value })} options={[{ value: '', label: 'Kategoriyasiz' }, ...categories.map(c => ({ value: c.id, label: c.name }))]} />
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setIsCreating(false)}>Bekor qilish</Button>
            <Button onClick={handleCreate}>Saqlash</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => { if (deleteConfirm) { onDeleteReminder(deleteConfirm); showToast('Eslatma o\'chirildi', 'success'); } }}
        title="Eslatmani o'chirish"
        message="Bu eslatmani o'chirishni xohlaysizmi?"
        confirmText="O'chirish"
        cancelText="Bekor qilish"
      />
    </div>
  );
}

function ReminderItem({ reminder, onDelete, onDone, recurringLabels, isPast }: { reminder: Reminder; onDelete: () => void; onDone: () => void; recurringLabels: Record<string, string>; isPast?: boolean }) {
  const date = new Date(reminder.dateTime);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow = date.toDateString() === new Date(now.getTime() + 86400000).toDateString();

  const formatReminderDate = () => {
    if (isToday) return `Bugun, ${date.toLocaleTimeString('uz-Latn-UZ', { hour: '2-digit', minute: '2-digit' })}`;
    if (isTomorrow) return `Ertaga, ${date.toLocaleTimeString('uz-Latn-UZ', { hour: '2-digit', minute: '2-digit' })}`;
    return date.toLocaleDateString('uz-Latn-UZ', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`card p-4 flex items-center gap-4 group ${isPast ? 'opacity-60' : ''}`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${reminder.notified ? 'bg-green-100 dark:bg-green-900/30' : 'bg-purple-100 dark:bg-purple-900/30'}`}>
        {reminder.notified ? <Check size={18} className="text-green-600 dark:text-green-400" /> : <Bell size={18} className="text-purple-600 dark:text-purple-400" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-surface-900 dark:text-surface-100 ${reminder.notified ? 'line-through' : ''}`}>{reminder.title}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-sm text-surface-500 flex items-center gap-1"><Clock size={14} /> {formatReminderDate()}</span>
          {reminder.recurring && <span className="text-xs px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-700 text-surface-500 flex items-center gap-1"><Repeat size={10} /> {recurringLabels[reminder.recurring]}</span>}
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!reminder.notified && <button onClick={onDone} className="p-1.5 rounded hover:bg-green-50 dark:hover:bg-green-900/20" title="Bajarildi"><Check size={14} className="text-green-500" /></button>}
        <button onClick={onDelete} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20" title="O'chirish"><Trash2 size={14} className="text-red-400" /></button>
      </div>
    </div>
  );
}
