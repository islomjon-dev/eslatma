// Express Server for Eslatma Daftari
// Save as: server/src/index.ts

import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Juda ko\'p urinish. 15 daqiqadan keyin qayta urinib ko\'ring.' },
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
});

app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// Session middleware - verify authentication
async function authenticate(req: any, res: any, next: any) {
  const token = req.cookies?.session_token;
  if (!token) {
    return res.status(401).json({ error: 'Autentifikatsiya talab qilinadi' });
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    return res.status(401).json({ error: 'Sessiya muddati tugagan' });
  }

  req.user = session.user;
  req.sessionId = session.id;
  next();
}

// Ownership middleware - ensures user can only access their own data
function requireOwnership(resourceUserId: string, reqUser: any) {
  return resourceUserId === reqUser.id;
}

// ============ AUTH ROUTES ============

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    // Validation
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Barcha maydonlarni to\'ldiring' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak' });
    }

    // Check existing user
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Bu email allaqachon ro\'yxatdan o\'tgan' });
    }

    // Hash password with bcrypt (or Argon2id in production)
    const passwordHash = await bcrypt.hash(password, 12);
    const emailToken = crypto.randomBytes(32).toString('hex');

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        emailToken,
      },
    });

    // Create default categories
    await prisma.category.createMany({
      data: [
        { userId: user.id, name: 'Shaxsiy', color: '#3b82f6' },
        { userId: user.id, name: 'Ish', color: '#10b981' },
        { userId: user.id, name: 'O\'qish', color: '#8b5cf6' },
        { userId: user.id, name: 'Sog\'liq', color: '#ef4444' },
      ],
    });

    // Create session
    const token = crypto.randomBytes(48).toString('hex');
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // Set secure cookie
    res.cookie('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    // TODO: Send verification email with emailToken

    res.status(201).json({
      user: { id: user.id, email: user.email, fullName: user.fullName, emailVerified: user.emailVerified, theme: user.theme },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server xatosi yuz berdi' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email va parolni kiriting' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Email yoki parol noto\'g\'ri' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email yoki parol noto\'g\'ri' });
    }

    // Create session
    const token = crypto.randomBytes(48).toString('hex');
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    res.cookie('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      user: { id: user.id, email: user.email, fullName: user.fullName, emailVerified: user.emailVerified, theme: user.theme },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server xatosi yuz berdi' });
  }
});

// Logout
app.post('/api/auth/logout', authenticate, async (req: any, res) => {
  try {
    await prisma.session.delete({ where: { id: req.sessionId } });
    res.clearCookie('session_token');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// Forgot password
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ success: true, message: 'Agar email ro\'yxatdan o\'tgan bo\'lsa, havola yuborildi' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetExpiry: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    // TODO: Send reset email with token

    res.json({ success: true, message: 'Parolni tiklash havolasi yuborildi' });
  } catch (error) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// Get current user
app.get('/api/auth/me', authenticate, async (req: any, res) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      fullName: req.user.fullName,
      emailVerified: req.user.emailVerified,
      theme: req.user.theme,
      createdAt: req.user.createdAt,
    },
  });
});

// ============ NOTES ROUTES ============

app.get('/api/notes', authenticate, async (req: any, res) => {
  try {
    const notes = await prisma.note.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: 'desc' },
    });
    res.json({ notes });
  } catch (error) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

app.post('/api/notes', authenticate, async (req: any, res) => {
  try {
    const { title, content, categoryId, tags, color } = req.body;
    if (!title) return res.status(400).json({ error: 'Sarlavha talab qilinadi' });

    const note = await prisma.note.create({
      data: {
        userId: req.user.id,
        title,
        content: content || '',
        categoryId: categoryId || null,
        tags: tags || [],
        color: color || null,
      },
    });
    res.status(201).json({ note });
  } catch (error) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

app.patch('/api/notes/:id', authenticate, async (req: any, res) => {
  try {
    const note = await prisma.note.findUnique({ where: { id: req.params.id } });
    if (!note || !requireOwnership(note.userId, req.user)) {
      return res.status(404).json({ error: 'Qayd topilmadi' });
    }

    const updated = await prisma.note.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ note: updated });
  } catch (error) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

app.delete('/api/notes/:id', authenticate, async (req: any, res) => {
  try {
    const note = await prisma.note.findUnique({ where: { id: req.params.id } });
    if (!note || !requireOwnership(note.userId, req.user)) {
      return res.status(404).json({ error: 'Qayd topilmadi' });
    }

    await prisma.note.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// ============ TASKS ROUTES ============

app.get('/api/tasks', authenticate, async (req: any, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

app.post('/api/tasks', authenticate, async (req: any, res) => {
  try {
    const { title, description, priority, dueDate, categoryId } = req.body;
    if (!title) return res.status(400).json({ error: 'Vazifa nomi talab qilinadi' });

    const task = await prisma.task.create({
      data: {
        userId: req.user.id,
        title,
        description: description || null,
        priority: priority || 'medium',
        dueDate: dueDate ? new Date(dueDate) : null,
        categoryId: categoryId || null,
      },
    });
    res.status(201).json({ task });
  } catch (error) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

app.patch('/api/tasks/:id', authenticate, async (req: any, res) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task || !requireOwnership(task.userId, req.user)) {
      return res.status(404).json({ error: 'Vazifa topilmadi' });
    }

    const data = { ...req.body };
    if (data.dueDate) data.dueDate = new Date(data.dueDate);

    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data,
    });
    res.json({ task: updated });
  } catch (error) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

app.delete('/api/tasks/:id', authenticate, async (req: any, res) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task || !requireOwnership(task.userId, req.user)) {
      return res.status(404).json({ error: 'Vazifa topilmadi' });
    }

    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// ============ REMINDERS ROUTES ============

app.get('/api/reminders', authenticate, async (req: any, res) => {
  try {
    const reminders = await prisma.reminder.findMany({
      where: { userId: req.user.id },
      orderBy: { dateTime: 'asc' },
    });
    res.json({ reminders });
  } catch (error) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

app.post('/api/reminders', authenticate, async (req: any, res) => {
  try {
    const { title, description, dateTime, recurring, categoryId } = req.body;
    if (!title || !dateTime) return res.status(400).json({ error: 'Sarlavha va vaqt talab qilinadi' });

    const reminder = await prisma.reminder.create({
      data: {
        userId: req.user.id,
        title,
        description: description || null,
        dateTime: new Date(dateTime),
        recurring: recurring || null,
        categoryId: categoryId || null,
      },
    });
    res.status(201).json({ reminder });
  } catch (error) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

app.patch('/api/reminders/:id', authenticate, async (req: any, res) => {
  try {
    const reminder = await prisma.reminder.findUnique({ where: { id: req.params.id } });
    if (!reminder || !requireOwnership(reminder.userId, req.user)) {
      return res.status(404).json({ error: 'Eslatma topilmadi' });
    }

    const data = { ...req.body };
    if (data.dateTime) data.dateTime = new Date(data.dateTime);

    const updated = await prisma.reminder.update({
      where: { id: req.params.id },
      data,
    });
    res.json({ reminder: updated });
  } catch (error) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

app.delete('/api/reminders/:id', authenticate, async (req: any, res) => {
  try {
    const reminder = await prisma.reminder.findUnique({ where: { id: req.params.id } });
    if (!reminder || !requireOwnership(reminder.userId, req.user)) {
      return res.status(404).json({ error: 'Eslatma topilmadi' });
    }

    await prisma.reminder.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// ============ CATEGORIES ROUTES ============

app.get('/api/categories', authenticate, async (req: any, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { userId: req.user.id },
      orderBy: { name: 'asc' },
    });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

app.post('/api/categories', authenticate, async (req: any, res) => {
  try {
    const { name, color } = req.body;
    if (!name) return res.status(400).json({ error: 'Kategoriya nomi talab qilinadi' });

    const category = await prisma.category.create({
      data: { userId: req.user.id, name, color: color || '#3b82f6' },
    });
    res.status(201).json({ category });
  } catch (error) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

app.patch('/api/categories/:id', authenticate, async (req: any, res) => {
  try {
    const category = await prisma.category.findUnique({ where: { id: req.params.id } });
    if (!category || !requireOwnership(category.userId, req.user)) {
      return res.status(404).json({ error: 'Kategoriya topilmadi' });
    }

    const updated = await prisma.category.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ category: updated });
  } catch (error) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

app.delete('/api/categories/:id', authenticate, async (req: any, res) => {
  try {
    const category = await prisma.category.findUnique({ where: { id: req.params.id } });
    if (!category || !requireOwnership(category.userId, req.user)) {
      return res.status(404).json({ error: 'Kategoriya topilmadi' });
    }

    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// ============ SETTINGS ROUTES ============

app.patch('/api/settings/profile', authenticate, async (req: any, res) => {
  try {
    const { fullName, email } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { fullName, email },
    });
    res.json({ user: { id: updated.id, email: updated.email, fullName: updated.fullName, theme: updated.theme } });
  } catch (error) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

app.patch('/api/settings/theme', authenticate, async (req: any, res) => {
  try {
    const { theme } = req.body;
    await prisma.user.update({
      where: { id: req.user.id },
      data: { theme },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

app.patch('/api/settings/password', authenticate, async (req: any, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const validPassword = await bcrypt.compare(currentPassword, req.user.passwordHash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Joriy parol noto\'g\'ri' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// Delete account
app.delete('/api/settings/account', authenticate, async (req: any, res) => {
  try {
    await prisma.user.delete({ where: { id: req.user.id } });
    res.clearCookie('session_token');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Eslatma Daftari API serveri ${PORT}-portda ishlayapti`);
});

export default app;
