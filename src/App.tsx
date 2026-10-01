import React, { useState, useEffect, useCallback } from 'react';
import { ViewMode, User, Note, Task, Reminder, Category } from './types';
import { authStore, userStore, notesStore, tasksStore, remindersStore, categoriesStore, themeStore } from './store';
import { Layout } from './components/Layout';
import { Toast } from './components/UI';
import { LoginPage, RegisterPage, ForgotPasswordPage } from './pages/AuthPages';
import { Dashboard } from './pages/Dashboard';
import { NotesPage } from './pages/NotesPage';
import { TasksPage } from './pages/TasksPage';
import { RemindersPage } from './pages/RemindersPage';
import { CalendarPage } from './pages/CalendarPage';
import { SettingsPage } from './pages/SettingsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { ArchivePage, TrashPage } from './pages/ArchiveTrashPages';

type AuthPage = 'login' | 'register' | 'forgot';

function App() {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [authPage, setAuthPage] = useState<AuthPage>('login');

  // App state
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(themeStore.get());
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Initialize
  useEffect(() => {
    const savedUser = userStore.get();
    if (savedUser) {
      setUser(savedUser);
      loadData(savedUser.id);
    }
  }, []);

  // Theme effect
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', isDark);
      root.classList.toggle('light', !isDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
      root.classList.toggle('light', theme === 'light');
    }
    themeStore.set(theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const root = document.documentElement;
      root.classList.toggle('dark', mq.matches);
      root.classList.toggle('light', !mq.matches);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const loadData = (userId: string) => {
    setNotes(notesStore.getAll(userId));
    setTasks(tasksStore.getAll(userId));
    setReminders(remindersStore.getAll(userId));
    setCategories(categoriesStore.getAll(userId));
  };

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  }, []);

  // Auth handlers
  const handleLogin = (email: string, password: string) => {
    const loggedInUser = authStore.login(email, password);
    setUser(loggedInUser);
    setTheme(loggedInUser.theme || 'system');
    loadData(loggedInUser.id);
    setCurrentView('dashboard');
  };

  const handleRegister = (email: string, password: string, fullName: string) => {
    const newUser = authStore.register(email, password, fullName);
    setUser(newUser);
    loadData(newUser.id);
    setCurrentView('dashboard');
    showToast('Muvaffaqiyatli ro\'yxatdan o\'tdingiz!', 'success');
  };

  const handleLogout = () => {
    authStore.logout();
    setUser(null);
    setNotes([]);
    setTasks([]);
    setReminders([]);
    setCategories([]);
    setCurrentView('dashboard');
  };

  // Notes handlers
  const handleCreateNote = (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    const newNote = notesStore.create({ ...note, userId: user.id });
    setNotes(prev => [...prev, newNote]);
  };

  const handleUpdateNote = (id: string, updates: Partial<Note>) => {
    const updated = notesStore.update(id, updates);
    if (updated) setNotes(prev => prev.map(n => n.id === id ? updated : n));
  };

  const handleDeleteNote = (id: string) => {
    const note = notes.find(n => n.id === id);
    if (note?.isTrashed) {
      notesStore.delete(id);
      setNotes(prev => prev.filter(n => n.id !== id));
    } else {
      handleUpdateNote(id, { isTrashed: true });
    }
  };

  const handleRestoreNote = (id: string) => {
    handleUpdateNote(id, { isTrashed: false, isArchived: false });
  };

  // Tasks handlers
  const handleCreateTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    const newTask = tasksStore.create({ ...task, userId: user.id });
    setTasks(prev => [...prev, newTask]);
  };

  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    const updated = tasksStore.update(id, updates);
    if (updated) setTasks(prev => prev.map(t => t.id === id ? updated : t));
  };

  const handleDeleteTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task?.isTrashed) {
      tasksStore.delete(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } else {
      handleUpdateTask(id, { isTrashed: true });
    }
  };

  const handleRestoreTask = (id: string) => {
    handleUpdateTask(id, { isTrashed: false, isArchived: false });
  };

  // Reminders handlers
  const handleCreateReminder = (reminder: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    const newReminder = remindersStore.create({ ...reminder, userId: user.id });
    setReminders(prev => [...prev, newReminder]);
  };

  const handleUpdateReminder = (id: string, updates: Partial<Reminder>) => {
    const updated = remindersStore.update(id, updates);
    if (updated) setReminders(prev => prev.map(r => r.id === id ? updated : r));
  };

  const handleDeleteReminder = (id: string) => {
    remindersStore.delete(id);
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  // Categories handlers
  const handleCreateCategory = (category: Omit<Category, 'id' | 'createdAt'>) => {
    if (!user) return;
    const newCategory = categoriesStore.create({ ...category, userId: user.id });
    setCategories(prev => [...prev, newCategory]);
  };

  const handleUpdateCategory = (id: string, updates: Partial<Category>) => {
    const updated = categoriesStore.update(id, updates);
    if (updated) setCategories(prev => prev.map(c => c.id === id ? updated : c));
  };

  const handleDeleteCategory = (id: string) => {
    categoriesStore.delete(id);
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // Other handlers
  const handleUpdateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updated = userStore.update(updates);
    if (updated) setUser(updated);
  };

  const handleEnableNotifications = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          showToast('Bildirishnomalar yoqildi!', 'success');
        } else {
          showToast('Bildirishnomalar ruxsat berilmadi', 'error');
        }
      });
    } else {
      showToast('Brauzer bildirishnomalarni qo\'llab-quvvatlamaydi', 'error');
    }
  };

  const handleDeleteAccount = () => {
    if (!user) return;
    // Clear all user data
    localStorage.removeItem(`eslatma_notes`);
    localStorage.removeItem(`eslatma_tasks`);
    localStorage.removeItem(`eslatma_reminders`);
    localStorage.removeItem(`eslatma_categories`);
    localStorage.removeItem(`eslatma_tags`);
    localStorage.removeItem(`eslatma_notifications`);
    authStore.logout();
    setUser(null);
    showToast('Hisob o\'chirildi', 'success');
  };

  const handleEmptyTrash = () => {
    const trashedNotes = notes.filter(n => n.isTrashed);
    const trashedTasks = tasks.filter(t => t.isTrashed);
    trashedNotes.forEach(n => notesStore.delete(n.id));
    trashedTasks.forEach(t => tasksStore.delete(t.id));
    setNotes(prev => prev.filter(n => !n.isTrashed));
    setTasks(prev => prev.filter(t => !t.isTrashed));
  };

  const handleQuickCreate = (type: 'note' | 'task' | 'reminder') => {
    if (type === 'note') setCurrentView('notes');
    else if (type === 'task') setCurrentView('tasks');
    else setCurrentView('reminders');
  };

  // Notification count
  const upcomingReminders = reminders.filter(r => !r.isTrashed && !r.notified && new Date(r.dateTime) > new Date());

  // Category counts
  const notesCount: Record<string, number> = {};
  const tasksCount: Record<string, number> = {};
  notes.filter(n => !n.isTrashed).forEach(n => { if (n.categoryId) notesCount[n.categoryId] = (notesCount[n.categoryId] || 0) + 1; });
  tasks.filter(t => !t.isTrashed).forEach(t => { if (t.categoryId) tasksCount[t.categoryId] = (tasksCount[t.categoryId] || 0) + 1; });

  // Render auth pages
  if (!user) {
    if (authPage === 'login') {
      return <LoginPage onLogin={handleLogin} onRegister={handleRegister} onSwitch={(page) => setAuthPage(page)} />;
    }
    if (authPage === 'register') {
      return <RegisterPage onRegister={handleRegister} onSwitch={() => setAuthPage('login')} />;
    }
    if (authPage === 'forgot') {
      return <ForgotPasswordPage onSwitch={() => setAuthPage('login')} />;
    }
  }

  // Render main app
  if (!user) return null;

  return (
    <>
      <Layout
        currentView={currentView}
        onViewChange={setCurrentView}
        userName={user.fullName}
        userEmail={user.email}
        theme={theme}
        onThemeChange={setTheme}
        onLogout={handleLogout}
        notificationCount={upcomingReminders.length}
      >
        {currentView === 'dashboard' && (
          <Dashboard
            notes={notes}
            tasks={tasks}
            reminders={reminders}
            userName={user.fullName}
            onNavigate={setCurrentView}
            onQuickCreate={handleQuickCreate}
          />
        )}
        {currentView === 'notes' && (
          <NotesPage
            notes={notes.filter(n => !n.isTrashed && !n.isArchived)}
            categories={categories}
            onCreateNote={handleCreateNote}
            onUpdateNote={handleUpdateNote}
            onDeleteNote={handleDeleteNote}
            showToast={showToast}
          />
        )}
        {currentView === 'tasks' && (
          <TasksPage
            tasks={tasks.filter(t => !t.isTrashed && !t.isArchived)}
            categories={categories}
            onCreateTask={handleCreateTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            showToast={showToast}
          />
        )}
        {currentView === 'reminders' && (
          <RemindersPage
            reminders={reminders.filter(r => !r.isTrashed)}
            categories={categories}
            onCreateReminder={handleCreateReminder}
            onUpdateReminder={handleUpdateReminder}
            onDeleteReminder={handleDeleteReminder}
            showToast={showToast}
          />
        )}
        {currentView === 'calendar' && (
          <CalendarPage
            tasks={tasks.filter(t => !t.isTrashed)}
            reminders={reminders.filter(r => !r.isTrashed)}
            notes={notes.filter(n => !n.isTrashed)}
          />
        )}
        {currentView === 'categories' && (
          <CategoriesPage
            categories={categories}
            notesCount={notesCount}
            tasksCount={tasksCount}
            onCreateCategory={handleCreateCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
            showToast={showToast}
          />
        )}
        {currentView === 'archive' && (
          <ArchivePage
            notes={notes}
            tasks={tasks}
            onRestoreNote={handleRestoreNote}
            onRestoreTask={handleRestoreTask}
            onDeleteNote={handleDeleteNote}
            onDeleteTask={handleDeleteTask}
            showToast={showToast}
          />
        )}
        {currentView === 'trash' && (
          <TrashPage
            notes={notes}
            tasks={tasks}
            onRestoreNote={handleRestoreNote}
            onRestoreTask={handleRestoreTask}
            onDeleteNote={handleDeleteNote}
            onDeleteTask={handleDeleteTask}
            onEmptyTrash={handleEmptyTrash}
            showToast={showToast}
          />
        )}
        {currentView === 'settings' && (
          <SettingsPage
            user={user}
            theme={theme}
            onThemeChange={setTheme}
            onUpdateUser={handleUpdateUser}
            onEnableNotifications={handleEnableNotifications}
            onDeleteAccount={handleDeleteAccount}
            showToast={showToast}
          />
        )}
      </Layout>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}

export default App;
