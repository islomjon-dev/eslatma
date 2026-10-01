import { User, Note, Task, Reminder, Category, Tag, Notification } from './types';

const STORAGE_KEYS = {
  user: 'eslatma_user',
  notes: 'eslatma_notes',
  tasks: 'eslatma_tasks',
  reminders: 'eslatma_reminders',
  categories: 'eslatma_categories',
  tags: 'eslatma_tags',
  notifications: 'eslatma_notifications',
  theme: 'eslatma_theme',
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// User operations
export const userStore = {
  get: (): User | null => getItem<User | null>(STORAGE_KEYS.user, null),
  set: (user: User) => setItem(STORAGE_KEYS.user, user),
  update: (updates: Partial<User>) => {
    const user = getItem<User | null>(STORAGE_KEYS.user, null);
    if (user) {
      const updated = { ...user, ...updates };
      setItem(STORAGE_KEYS.user, updated);
      return updated;
    }
    return null;
  },
  remove: () => localStorage.removeItem(STORAGE_KEYS.user),
};

// Notes operations
export const notesStore = {
  getAll: (userId: string): Note[] => {
    const notes = getItem<Note[]>(STORAGE_KEYS.notes, []);
    return notes.filter(n => n.userId === userId);
  },
  create: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Note => {
    const notes = getItem<Note[]>(STORAGE_KEYS.notes, []);
    const newNote: Note = {
      ...note,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    notes.push(newNote);
    setItem(STORAGE_KEYS.notes, notes);
    return newNote;
  },
  update: (id: string, updates: Partial<Note>): Note | null => {
    const notes = getItem<Note[]>(STORAGE_KEYS.notes, []);
    const index = notes.findIndex(n => n.id === id);
    if (index >= 0) {
      notes[index] = { ...notes[index], ...updates, updatedAt: new Date().toISOString() };
      setItem(STORAGE_KEYS.notes, notes);
      return notes[index];
    }
    return null;
  },
  delete: (id: string) => {
    const notes = getItem<Note[]>(STORAGE_KEYS.notes, []);
    setItem(STORAGE_KEYS.notes, notes.filter(n => n.id !== id));
  },
};

// Tasks operations
export const tasksStore = {
  getAll: (userId: string): Task[] => {
    const tasks = getItem<Task[]>(STORAGE_KEYS.tasks, []);
    return tasks.filter(t => t.userId === userId);
  },
  create: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task => {
    const tasks = getItem<Task[]>(STORAGE_KEYS.tasks, []);
    const newTask: Task = {
      ...task,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tasks.push(newTask);
    setItem(STORAGE_KEYS.tasks, tasks);
    return newTask;
  },
  update: (id: string, updates: Partial<Task>): Task | null => {
    const tasks = getItem<Task[]>(STORAGE_KEYS.tasks, []);
    const index = tasks.findIndex(t => t.id === id);
    if (index >= 0) {
      tasks[index] = { ...tasks[index], ...updates, updatedAt: new Date().toISOString() };
      setItem(STORAGE_KEYS.tasks, tasks);
      return tasks[index];
    }
    return null;
  },
  delete: (id: string) => {
    const tasks = getItem<Task[]>(STORAGE_KEYS.tasks, []);
    setItem(STORAGE_KEYS.tasks, tasks.filter(t => t.id !== id));
  },
};

// Reminders operations
export const remindersStore = {
  getAll: (userId: string): Reminder[] => {
    const reminders = getItem<Reminder[]>(STORAGE_KEYS.reminders, []);
    return reminders.filter(r => r.userId === userId);
  },
  create: (reminder: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>): Reminder => {
    const reminders = getItem<Reminder[]>(STORAGE_KEYS.reminders, []);
    const newReminder: Reminder = {
      ...reminder,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    reminders.push(newReminder);
    setItem(STORAGE_KEYS.reminders, reminders);
    return newReminder;
  },
  update: (id: string, updates: Partial<Reminder>): Reminder | null => {
    const reminders = getItem<Reminder[]>(STORAGE_KEYS.reminders, []);
    const index = reminders.findIndex(r => r.id === id);
    if (index >= 0) {
      reminders[index] = { ...reminders[index], ...updates, updatedAt: new Date().toISOString() };
      setItem(STORAGE_KEYS.reminders, reminders);
      return reminders[index];
    }
    return null;
  },
  delete: (id: string) => {
    const reminders = getItem<Reminder[]>(STORAGE_KEYS.reminders, []);
    setItem(STORAGE_KEYS.reminders, reminders.filter(r => r.id !== id));
  },
};

// Categories operations
export const categoriesStore = {
  getAll: (userId: string): Category[] => {
    const categories = getItem<Category[]>(STORAGE_KEYS.categories, []);
    return categories.filter(c => c.userId === userId);
  },
  create: (category: Omit<Category, 'id' | 'createdAt'>): Category => {
    const categories = getItem<Category[]>(STORAGE_KEYS.categories, []);
    const newCategory: Category = {
      ...category,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    categories.push(newCategory);
    setItem(STORAGE_KEYS.categories, categories);
    return newCategory;
  },
  update: (id: string, updates: Partial<Category>): Category | null => {
    const categories = getItem<Category[]>(STORAGE_KEYS.categories, []);
    const index = categories.findIndex(c => c.id === id);
    if (index >= 0) {
      categories[index] = { ...categories[index], ...updates };
      setItem(STORAGE_KEYS.categories, categories);
      return categories[index];
    }
    return null;
  },
  delete: (id: string) => {
    const categories = getItem<Category[]>(STORAGE_KEYS.categories, []);
    setItem(STORAGE_KEYS.categories, categories.filter(c => c.id !== id));
  },
};

// Tags operations
export const tagsStore = {
  getAll: (userId: string): Tag[] => {
    const tags = getItem<Tag[]>(STORAGE_KEYS.tags, []);
    return tags.filter(t => t.userId === userId);
  },
  create: (tag: Omit<Tag, 'id' | 'createdAt'>): Tag => {
    const tags = getItem<Tag[]>(STORAGE_KEYS.tags, []);
    const newTag: Tag = {
      ...tag,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    tags.push(newTag);
    setItem(STORAGE_KEYS.tags, tags);
    return newTag;
  },
  delete: (id: string) => {
    const tags = getItem<Tag[]>(STORAGE_KEYS.tags, []);
    setItem(STORAGE_KEYS.tags, tags.filter(t => t.id !== id));
  },
};

// Notifications operations
export const notificationsStore = {
  getAll: (userId: string): Notification[] => {
    const notifications = getItem<Notification[]>(STORAGE_KEYS.notifications, []);
    return notifications.filter(n => n.userId === userId);
  },
  create: (notification: Omit<Notification, 'id' | 'createdAt'>): Notification => {
    const notifications = getItem<Notification[]>(STORAGE_KEYS.notifications, []);
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    notifications.push(newNotification);
    setItem(STORAGE_KEYS.notifications, notifications);
    return newNotification;
  },
  markRead: (id: string) => {
    const notifications = getItem<Notification[]>(STORAGE_KEYS.notifications, []);
    const index = notifications.findIndex(n => n.id === id);
    if (index >= 0) {
      notifications[index].read = true;
      setItem(STORAGE_KEYS.notifications, notifications);
    }
  },
  markAllRead: (userId: string) => {
    const notifications = getItem<Notification[]>(STORAGE_KEYS.notifications, []);
    notifications.forEach(n => {
      if (n.userId === userId) n.read = true;
    });
    setItem(STORAGE_KEYS.notifications, notifications);
  },
};

// Theme operations
export const themeStore = {
  get: (): 'light' | 'dark' | 'system' => getItem<'light' | 'dark' | 'system'>(STORAGE_KEYS.theme, 'system'),
  set: (theme: 'light' | 'dark' | 'system') => setItem(STORAGE_KEYS.theme, theme),
};

// Auth simulation (demo mode)
export const authStore = {
  register: (email: string, password: string, fullName: string): User => {
    const users = getItem<Array<{ email: string; password: string; user: User }>>('eslatma_users_db', []);
    if (users.find(u => u.email === email)) {
      throw new Error('Bu email allaqachon ro\'yxatdan o\'tgan');
    }
    const user: User = {
      id: generateId(),
      email,
      fullName,
      emailVerified: true,
      createdAt: new Date().toISOString(),
      theme: 'system',
    };
    users.push({ email, password, user });
    setItem('eslatma_users_db', users);
    userStore.set(user);
    // Create default categories
    const defaultCategories = [
      { name: 'Shaxsiy', color: '#3b82f6', icon: 'user' },
      { name: 'Ish', color: '#10b981', icon: 'briefcase' },
      { name: 'O\'qish', color: '#8b5cf6', icon: 'book' },
      { name: 'Sog\'liq', color: '#ef4444', icon: 'heart' },
    ];
    defaultCategories.forEach(cat => {
      categoriesStore.create({ ...cat, userId: user.id });
    });
    return user;
  },
  login: (email: string, password: string): User => {
    const users = getItem<Array<{ email: string; password: string; user: User }>>('eslatma_users_db', []);
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) {
      throw new Error('Email yoki parol noto\'g\'ri');
    }
    userStore.set(found.user);
    return found.user;
  },
  logout: () => {
    userStore.remove();
  },
};
