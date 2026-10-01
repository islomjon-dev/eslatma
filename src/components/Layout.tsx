import React, { useState } from 'react';
import {
  LayoutDashboard, FileText, CheckSquare, Bell, Calendar,
  FolderOpen, Archive, Trash2, Settings, LogOut, Menu, X,
  Moon, Sun, Monitor, ChevronDown, User
} from 'lucide-react';
import { ViewMode } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  userName: string;
  userEmail: string;
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  onLogout: () => void;
  notificationCount: number;
}

const navItems: { id: ViewMode; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Bosh sahifa', icon: LayoutDashboard },
  { id: 'notes', label: 'Qaydlar', icon: FileText },
  { id: 'tasks', label: 'Vazifalar', icon: CheckSquare },
  { id: 'reminders', label: 'Eslatmalar', icon: Bell },
  { id: 'calendar', label: 'Kalendar', icon: Calendar },
  { id: 'categories', label: 'Kategoriyalar', icon: FolderOpen },
  { id: 'archive', label: 'Arxiv', icon: Archive },
  { id: 'trash', label: 'Savat', icon: Trash2 },
  { id: 'settings', label: 'Sozlamalar', icon: Settings },
];

export function Layout({ children, currentView, onViewChange, userName, userEmail, theme, onThemeChange, onLogout, notificationCount }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const themeIcons = { light: Sun, dark: Moon, system: Monitor };
  const ThemeIcon = themeIcons[theme];

  const cycleTheme = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    onThemeChange(themes[(currentIndex + 1) % 3]);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50 dark:bg-surface-900">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-surface-800 border-r border-surface-200 dark:border-surface-700 flex flex-col transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-surface-200 dark:border-surface-700">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
            <FileText size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-surface-900 dark:text-surface-100">Eslatma</h1>
            <p className="text-xs text-surface-500 dark:text-surface-400 -mt-0.5">Daftari</p>
          </div>
          <button className="lg:hidden ml-auto p-1" onClick={() => setSidebarOpen(false)}>
            <X size={20} className="text-surface-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onViewChange(item.id); setSidebarOpen(false); }}
                className={`sidebar-item w-full ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.id === 'reminders' && notificationCount > 0 && (
                  <span className="px-1.5 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">{notificationCount}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-surface-200 dark:border-surface-700 p-3">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <User size={16} className="text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">{userName}</p>
                <p className="text-xs text-surface-500 truncate">{userEmail}</p>
              </div>
              <ChevronDown size={16} className="text-surface-400" />
            </button>

            {userMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg shadow-lg py-1 animate-fade-in">
                <button onClick={cycleTheme} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700">
                  <ThemeIcon size={16} />
                  <span>Mavzu: {theme === 'light' ? 'Yorug\'' : theme === 'dark' ? 'Qorong\'i' : 'Tizim'}</span>
                </button>
                <button onClick={() => { onViewChange('settings'); setUserMenuOpen(false); }} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700">
                  <Settings size={16} />
                  <span>Sozlamalar</span>
                </button>
                <hr className="my-1 border-surface-200 dark:border-surface-700" />
                <button onClick={onLogout} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <LogOut size={16} />
                  <span>Chiqish</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-4 lg:px-6 py-3 bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
          <button className="lg:hidden p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} className="text-surface-600 dark:text-surface-400" />
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
              {navItems.find(n => n.id === currentView)?.label || 'Eslatma Daftari'}
            </h2>
          </div>
          <button onClick={cycleTheme} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors" title="Mavzuni o'zgartirish">
            <ThemeIcon size={20} className="text-surface-500 dark:text-surface-400" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
