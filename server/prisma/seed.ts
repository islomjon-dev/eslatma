// Seed data for development
// Save as: server/prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seed boshlandi...');

  // Create demo user
  const passwordHash = await bcrypt.hash('demo123456', 12);
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@eslatma.uz' },
    update: {},
    create: {
      email: 'demo@eslatma.uz',
      passwordHash,
      fullName: 'Demo Foydalanuvchi',
      emailVerified: true,
      theme: 'system',
    },
  });

  console.log(`Foydalanuvchi yaratildi: ${user.email}`);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { id: 'cat-personal' },
      update: {},
      create: { id: 'cat-personal', userId: user.id, name: 'Shaxsiy', color: '#3b82f6' },
    }),
    prisma.category.upsert({
      where: { id: 'cat-work' },
      update: {},
      create: { id: 'cat-work', userId: user.id, name: 'Ish', color: '#10b981' },
    }),
    prisma.category.upsert({
      where: { id: 'cat-study' },
      update: {},
      create: { id: 'cat-study', userId: user.id, name: 'O\'qish', color: '#8b5cf6' },
    }),
    prisma.category.upsert({
      where: { id: 'cat-health' },
      update: {},
      create: { id: 'cat-health', userId: user.id, name: 'Sog\'liq', color: '#ef4444' },
    }),
  ]);

  console.log(`${categories.length} ta kategoriya yaratildi`);

  // Create sample notes
  const notes = await Promise.all([
    prisma.note.create({
      data: {
        userId: user.id,
        title: 'Dasturlash rejasi',
        content: 'Bu hafta React va TypeScript bilan ishlashni rejalashtirganman. Yangi loyiha boshlash kerak.\n\n1. Frontend arxitekturani loyihalash\n2. API endpointlarni aniqlash\n3. Database schema yaratish',
        categoryId: categories[1].id,
        tags: ['dasturlash', 'reja'],
        pinned: true,
        color: '#dbeafe',
      },
    }),
    prisma.note.create({
      data: {
        userId: user.id,
        title: 'Kitob ro\'yxati',
        content: 'O\'qish kerak bo\'lgan kitoblar:\n- Clean Code\n- Design Patterns\n- The Pragmatic Programmer',
        categoryId: categories[2].id,
        tags: ['kitob', 'o\'qish'],
      },
    }),
    prisma.note.create({
      data: {
        userId: user.id,
        title: 'Mahsulotlar ro\'yxati',
        content: 'Non, sut, tuxum, sabzi, pomidor, piyoz, guruch',
        categoryId: categories[0].id,
        tags: ['xarid'],
      },
    }),
  ]);

  console.log(`${notes.length} ta qayd yaratildi`);

  // Create sample tasks
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        userId: user.id,
        title: 'Loyiha hujjatlarini tayyorlash',
        description: 'README va API dokumentatsiyasini yozish',
        priority: 'high',
        dueDate: tomorrow,
        categoryId: categories[1].id,
      },
    }),
    prisma.task.create({
      data: {
        userId: user.id,
        title: 'Sport mashqlari',
        description: '30 daqiqa yugurish',
        priority: 'medium',
        categoryId: categories[3].id,
      },
    }),
    prisma.task.create({
      data: {
        userId: user.id,
        title: 'TypeScript kursini tugatish',
        priority: 'low',
        dueDate: nextWeek,
        categoryId: categories[2].id,
      },
    }),
    prisma.task.create({
      data: {
        userId: user.id,
        title: 'Uy tozalash',
        priority: 'medium',
        completed: true,
        categoryId: categories[0].id,
      },
    }),
  ]);

  console.log(`${tasks.length} ta vazifa yaratildi`);

  // Create sample reminders
  const reminderTime = new Date();
  reminderTime.setHours(reminderTime.getHours() + 2);

  const reminders = await Promise.all([
    prisma.reminder.create({
      data: {
        userId: user.id,
        title: 'Doktor bilan uchrashuv',
        description: 'Yillik tekshiruv',
        dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        categoryId: categories[3].id,
      },
    }),
    prisma.reminder.create({
      data: {
        userId: user.id,
        title: 'Loyiha deadline',
        description: 'Frontend yakunlash',
        dateTime: nextWeek,
        categoryId: categories[1].id,
      },
    }),
    prisma.reminder.create({
      data: {
        userId: user.id,
        title: 'Dori ichish',
        dateTime: reminderTime,
        recurring: 'daily',
        categoryId: categories[3].id,
      },
    }),
  ]);

  console.log(`${reminders.length} ta eslatma yaratildi`);

  console.log('Seed muvaffaqiyatli yakunlandi!');
  console.log('\nDemo hisob:');
  console.log('  Email: demo@eslatma.uz');
  console.log('  Parol: demo123456');
}

main()
  .catch((e) => {
    console.error('Seed xatosi:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
