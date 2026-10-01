export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  emailVerified: boolean;
  createdAt: string;
  theme: 'light' | 'dark' | 'system';
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  categoryId?: string;
  tags: string[];
  isArchived: boolean;
  isTrashed: boolean;
  pinned: boolean;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  categoryId?: string;
  tags: string[];
  isArchived: boolean;
  isTrashed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  description?: string;
  dateTime: string;
  recurring?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
  notified: boolean;
  categoryId?: string;
  tags: string[];
  isTrashed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon?: string;
  createdAt: string;
}

export interface Tag {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: string;
}

export type ViewMode = 'dashboard' | 'notes' | 'tasks' | 'reminders' | 'calendar' | 'categories' | 'archive' | 'trash' | 'settings';

export interface AppState {
  user: User | null;
  notes: Note[];
  tasks: Task[];
  reminders: Reminder[];
  categories: Category[];
  tags: Tag[];
  notifications: Notification[];
  isAuthenticated: boolean;
}
