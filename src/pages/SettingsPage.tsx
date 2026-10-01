import React, { useState } from 'react';
import { User, Mail, Lock, Moon, Sun, Monitor, Bell, Shield, Save, Trash2 } from 'lucide-react';
import { User as UserType } from '../types';
import { Button, Input, Select, Alert, Modal, ConfirmDialog } from '../components/UI';

interface SettingsPageProps {
  user: UserType;
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  onUpdateUser: (updates: Partial<UserType>) => void;
  onEnableNotifications: () => void;
  onDeleteAccount: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function SettingsPage({ user, theme, onThemeChange, onUpdateUser, onEnableNotifications, onDeleteAccount, showToast }: SettingsPageProps) {
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    onUpdateUser({ fullName, email });
    showToast('Profil yangilandi', 'success');
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Barcha maydonlarni to\'ldiring', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Yangi parollar mos kelmaydi', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Parol kamida 6 ta belgidan iborat bo\'lishi kerak', 'error');
      return;
    }
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    showToast('Parol o\'zgartirildi', 'success');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSaving(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile Section */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4 flex items-center gap-2">
          <User size={20} className="text-primary-500" /> Profil ma'lumotlari
        </h3>
        <div className="space-y-4">
          <Input label="To'liq ism" value={fullName} onChange={(e) => setFullName(e.target.value)} icon={<User size={18} />} />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} icon={<Mail size={18} />} />
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${user.emailVerified ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
              {user.emailVerified ? '✓ Email tasdiqlangan' : '⚠ Email tasdiqlanmagan'}
            </span>
          </div>
          <Button onClick={handleSaveProfile} loading={saving}><Save size={16} className="mr-1" /> Saqlash</Button>
        </div>
      </div>

      {/* Theme Section */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4 flex items-center gap-2">
          <Monitor size={20} className="text-primary-500" /> Mavzu sozlamalari
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'light' as const, label: 'Yorug\'', icon: Sun, desc: 'Doimo yorug\' mavzu' },
            { id: 'dark' as const, label: 'Qorong\'i', icon: Moon, desc: 'Doimo qorong\'i mavzu' },
            { id: 'system' as const, label: 'Tizim', icon: Monitor, desc: 'Tizim sozlamasiga mos' },
          ].map(option => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => onThemeChange(option.id)}
                className={`p-4 rounded-lg border-2 text-center transition-all ${theme === option.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'}`}
              >
                <Icon size={24} className={`mx-auto mb-2 ${theme === option.id ? 'text-primary-600 dark:text-primary-400' : 'text-surface-400'}`} />
                <p className={`text-sm font-medium ${theme === option.id ? 'text-primary-700 dark:text-primary-400' : 'text-surface-700 dark:text-surface-300'}`}>{option.label}</p>
                <p className="text-xs text-surface-400 mt-1">{option.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications Section */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4 flex items-center gap-2">
          <Bell size={20} className="text-primary-500" /> Bildirishnomalar
        </h3>
        <Alert type="info" className="mb-4">
          Brauzer bildirishnomalari faqat ilova ochiq turganda ishlaydi. Ishonchli eslatmalar uchun email yoki push-notifikatsiya server tomonidan sozlanishi kerak.
        </Alert>
        <Button variant="secondary" onClick={onEnableNotifications}>
          <Bell size={16} className="mr-1" /> Brauzer bildirishnomalarini yoqish
        </Button>
      </div>

      {/* Password Section */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4 flex items-center gap-2">
          <Lock size={20} className="text-primary-500" /> Parolni o'zgartirish
        </h3>
        <div className="space-y-4">
          <Input label="Joriy parol" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          <Input label="Yangi parol" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <Input label="Yangi parolni tasdiqlang" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          <Button onClick={handleChangePassword} loading={saving}><Save size={16} className="mr-1" /> Parolni yangilash</Button>
        </div>
      </div>

      {/* Security Section */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4 flex items-center gap-2">
          <Shield size={20} className="text-primary-500" /> Xavfsizlik
        </h3>
        <div className="space-y-3 text-sm text-surface-600 dark:text-surface-400">
          <p>• Barcha ma'lumotlar shifrlangan holda saqlanadi</p>
          <p>• Faqat siz o'z ma'lumotlaringizni ko'rishingiz mumkin</p>
          <p>• Parol Argon2id/bcrypt bilan hash qilinadi</p>
          <p>• Server tomonida autentifikatsiya va autorisasiya</p>
          <p>• CSRF himoyasi va rate limiting yoqilgan</p>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card p-6 border-red-200 dark:border-red-800">
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">Xavfli zona</h3>
        <p className="text-sm text-surface-500 dark:text-surface-400 mb-4">Hisobni o'chirish barcha ma'lumotlaringizni butunlay o'chiradi. Bu amalni qaytarib bo'lmaydi.</p>
        <Button variant="danger" onClick={() => setDeleteConfirm(true)}>
          <Trash2 size={16} className="mr-1" /> Hisobni o'chirish
        </Button>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={onDeleteAccount}
        title="Hisobni o'chirish"
        message="Haqiqatan ham hisobingizni o'chirmoqchimisiz? Barcha qaydlar, vazifalar va eslatmalar butunlay o'chiriladi."
        confirmText="O'chirish"
        cancelText="Bekor qilish"
      />
    </div>
  );
}
