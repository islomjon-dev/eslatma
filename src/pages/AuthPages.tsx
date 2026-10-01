import React, { useState } from 'react';
import { FileText, Mail, Lock, User, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button, Input, Alert } from '../components/UI';

interface AuthPagesProps {
  onLogin: (email: string, password: string) => void;
  onRegister: (email: string, password: string, fullName: string) => void;
}

export function LoginPage({ onLogin, onRegister, onSwitch }: AuthPagesProps & { onSwitch: (page: 'register' | 'forgot') => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Barcha maydonlarni to\'ldiring');
      return;
    }
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 500));
      onLogin(email, password);
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary-600 mb-4">
            <FileText size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Eslatma Daftari</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Hisobingizga kiring</p>
        </div>

        <div className="card p-6">
          {error && <Alert type="error" className="mb-4">{error}</Alert>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="sizning@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={18} />}
            />
            <div className="relative">
              <Input
                label="Parol"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={18} />}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-surface-400 hover:text-surface-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm text-surface-600 dark:text-surface-400">Eslab qolish</span>
              </label>
              <button type="button" onClick={() => onSwitch('forgot')} className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">
                Parolni unutdingizmi?
              </button>
            </div>

            <Button type="submit" className="w-full" loading={loading}>Kirish</Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-surface-500 dark:text-surface-400">
              Hisobingiz yo'qmi?{' '}
              <button onClick={() => onSwitch('register')} className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium">
                Ro'yxatdan o'tish
              </button>
            </p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Alert type="info">
            <p className="text-xs">Demo rejim: Ro'yxatdan o'ting va ilovani sinab ko'ring. Ma'lumotlar brauzerda saqlanadi.</p>
          </Alert>
        </div>
      </div>
    </div>
  );
}

export function RegisterPage({ onRegister, onSwitch }: { onRegister: (email: string, password: string, fullName: string) => void; onSwitch: (page: 'login') => void }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Barcha maydonlarni to\'ldiring');
      return;
    }
    if (password.length < 6) {
      setError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
      return;
    }
    if (password !== confirmPassword) {
      setError('Parollar mos kelmaydi');
      return;
    }
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 500));
      onRegister(email, password, fullName);
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary-600 mb-4">
            <FileText size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Eslatma Daftari</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Yangi hisob yarating</p>
        </div>

        <div className="card p-6">
          {error && <Alert type="error" className="mb-4">{error}</Alert>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="To'liq ism"
              placeholder="Ismingiz Familiyangiz"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              icon={<User size={18} />}
            />
            <Input
              label="Email"
              type="email"
              placeholder="sizning@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={18} />}
            />
            <div className="relative">
              <Input
                label="Parol"
                type={showPassword ? 'text' : 'password'}
                placeholder="Kamida 6 ta belgi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={18} />}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-surface-400 hover:text-surface-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <Input
              label="Parolni tasdiqlang"
              type="password"
              placeholder="Parolni qayta kiriting"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock size={18} />}
            />

            <Button type="submit" className="w-full" loading={loading}>Ro'yxatdan o'tish</Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-surface-500 dark:text-surface-400">
              Allaqachon hisobingiz bormi?{' '}
              <button onClick={() => onSwitch('login')} className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium">
                Kirish
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ForgotPasswordPage({ onSwitch }: { onSwitch: (page: 'login') => void }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary-600 mb-4">
            <FileText size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Parolni tiklash</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Email manzilingizni kiriting</p>
        </div>

        <div className="card p-6">
          {sent ? (
            <div className="text-center">
              <Alert type="success" title="Xabar yuborildi!">
                Agar bu email ro'yxatdan o'tgan bo'lsa, parolni tiklash havolasi yuborildi.
              </Alert>
              <button onClick={() => onSwitch('login')} className="mt-4 text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium flex items-center gap-2 justify-center">
                <ArrowLeft size={16} /> Kirish sahifasiga qaytish
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="sizning@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail size={18} />}
              />
              <Button type="submit" className="w-full" loading={loading}>Havola yuborish</Button>
              <button type="button" onClick={() => onSwitch('login')} className="w-full text-center text-sm text-surface-500 hover:text-surface-700 dark:text-surface-400 flex items-center gap-2 justify-center">
                <ArrowLeft size={16} /> Kirish sahifasiga qaytish
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
