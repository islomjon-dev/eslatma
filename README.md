# Eslatma Daftari — Shaxsiy Eslatmalar va Qaydlar Ilovasi

![Eslatma Daftari](https://img.shields.io/badge/Eslatma-Daftari-blue)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)

## 📋 Umumiy Ma'lumot

**Eslatma Daftari** — bu shaxsiy qaydlar, vazifalar, eslatmalar va kalendar boshqaruvi uchun mo'ljallangan to'liq funksional veb-ilova.

### Xususiyatlar:
- ✅ **Qaydlar** — yaratish, tahrirlash, arxivlash, mahkamlash, ranglar va teglar
- ✅ **Vazifalar** — muhimlik darajasi, muddat, bajarilish kuzatuvi
- ✅ **Eslatmalar** — vaqt belgilash, takrorlash, bildirishnomalar
- ✅ **Kalendar** — oylik ko'rinish, hodisalar bilan
- ✅ **Kategoriyalar** — tartiblash va ranglar
- ✅ **Arxiv va Savat** — elementlarni boshqarish
- ✅ **Qidiruv va filtrlar** — tezkor topish
- ✅ **Light/Dark/System** — mavzu sozlamalari
- ✅ **Autosave** — qaydlar avtomatik saqlanadi
- ✅ **Responsive** — mobil va desktop uchun
- ✅ **Xavfsizlik** — autentifikatsiya, autorizatsiya, rate limiting

---

## 🚀 Ishga Tushirish

### Talablar:
- Node.js 18+
- PostgreSQL 16+ (yoki Docker)
- npm yoki yarn

### 1. Database Sozlash (Docker bilan)

```bash
# Docker Compose bilan PostgreSQL ishga tushirish
docker-compose up -d

# Database tayyorligini tekshirish
docker-compose ps
```

### 2. Backend Sozlash

```bash
# Server papkasiga o'tish
cd server

# Bog'liqliklarni o'rnatish
npm install

# .env faylini yaratish
cp ../.env.example .env

# Prisma migration ishga tushirish
npx prisma migrate dev --name init

# Seed data (ixtiyoriy)
npx prisma db seed

# Serverni ishga tushirish
npm run dev
```

### 3. Frontend Sozlash

```bash
# Asosiy papkaga qaytish
cd ..

# Bog'liqliklarni o'rnatish
npm install

# Development serverini ishga tushirish
npm run dev
```

Frontend: http://localhost:5173
Backend API: http://localhost:3001

---

## 📁 Loyiha Tuzilishi

```
eslatma-daftari/
├── src/                    # Frontend (React + Vite + TypeScript)
│   ├── App.tsx            # Asosiy ilova komponenti
│   ├── types.ts           # TypeScript tiplar
│   ├── store.ts           # Ma'lumotlar boshqaruvi
│   ├── index.css          # Tailwind CSS sozlamalari
│   ├── components/
│   │   ├── UI.tsx         # Qayta ishlatiladigan UI komponentlar
│   │   └── Layout.tsx     # Sidebar va navigatsiya
│   └── pages/
│       ├── AuthPages.tsx  # Login, Register, Forgot Password
│       ├── Dashboard.tsx  # Bosh sahifa
│       ├── NotesPage.tsx  # Qaydlar
│       ├── TasksPage.tsx  # Vazifalar
│       ├── RemindersPage.tsx # Eslatmalar
│       ├── CalendarPage.tsx # Kalendar
│       ├── CategoriesPage.tsx # Kategoriyalar
│       ├── SettingsPage.tsx # Sozlamalar
│       └── ArchiveTrashPages.tsx # Arxiv va Savat
├── server/                # Backend (Express + TypeScript)
│   ├── src/
│   │   └── index.ts      # Express server va API routes
│   └── prisma/
│       └── schema.prisma  # Database schema
├── docker-compose.yml     # PostgreSQL konteyner
├── .env.example          # Muhit o'zgaruvchilari
└── README.md             # Hujjat
```

---

## 🔒 Xavfsizlik

### Amalga oshirilgan:
- **Parol hashing**: bcrypt (12 rounds) yoki Argon2id
- **Secure cookies**: httpOnly, secure, sameSite=strict
- **CSRF himoyasi**: sameSite cookie va token asosida
- **Rate limiting**: autentifikatsiya va API endpointlar uchun
- **Ownership enforcement**: har bir so'rov foydalanuvchi egaligini tekshiradi
- **Security headers**: Helmet.js orqali
- **Input validation**: barcha kirish ma'lumotlari tekshiriladi
- **Safe error handling**: foydalanuvchiga generic xato xabarlari

### Ishlab chiqarish uchun qo'shimcha:
- HTTPS majburiy
- Environment variables serverda
- Regular security audits
- Dependency updates
- Database backups

---

## 🗄️ Database Schema

### Asosiy jadvallar:
- `users` — foydalanuvchilar
- `sessions` — server-side sessiyalar
- `notes` — qaydlar
- `tasks` — vazifalar
- `reminders` — eslatmalar
- `categories` — kategoriyalar
- `tags` — teglar
- `notifications` — bildirishnomalar

Barcha jadvallar `userId` indeksi bilan, ownership enforcement uchun.

---

## 🌐 Production Deployment

### Variant 1: VPS (Ubuntu)

```bash
# Server sozlash
sudo apt update && sudo apt install -y nodejs npm postgresql nginx

# PostgreSQL sozlash
sudo -u postgres createuser eslatma
sudo -u postgres createdb eslatma_daftari
sudo -u postgres psql -c "ALTER USER eslatma WITH PASSWORD 'strong_password';"

# Loyihani klonlash
git clone <repo-url> /var/www/eslatma-daftari
cd /var/www/eslatma-daftari

# Frontend build
npm install && npm run build

# Backend sozlash
cd server
npm install
cp .env.example .env
# .env faylini tahrirlang
npx prisma migrate deploy

# PM2 bilan ishga tushirish
npm install -g pm2
pm2 start dist/index.js --name eslatma-api
pm2 save && pm2 startup
```

### Variant 2: Docker

```bash
# Production docker-compose.yml yarating
docker-compose -f docker-compose.prod.yml up -d
```

### Variant 3: Railway/Render/Fly.io

1. Repositoryni ulang
2. Environment variables sozlang
3. Database addon qo'shing
4. Deploy bosing

---

## 📧 Email Sozlash

Ishonchli bildirishnomalar uchun email sozlash kerak:

### Gmail:
1. Google Account → Security → 2-Step Verification → App Passwords
2. App password yarating
3. `.env` faylida SMTP sozlamalarini kiriting

### Boshqa provayderlar:
- SendGrid, Mailgun, AWS SES, Postmark

---

## 🪟 Windows-da Sozlash

### 1. Kerakli dasturlarni o'rnatish:
- **Node.js 18+**: https://nodejs.org (LTS versiyasi)
- **Git**: https://git-scm.com
- **Docker Desktop**: https://docker.com (yoki PostgreSQL o'rnating)
- **PostgreSQL 16**: https://postgresql.org (agar Docker ishlatmasangiz)

### 2. PowerShell yoki CMD da:

```powershell
# Loyihani klonlash
git clone <repo-url>
cd eslatma-daftari

# Docker bilan database ishga tushirish
docker-compose up -d

# Frontend o'rnatish va ishga tushirish
npm install
npm run dev

# Yangi terminal oynasida - Backend
cd server
npm install

# .env faylini nusxalash
copy ..\.env.example .env

# Database migration
npx prisma migrate dev --name init

# Seed data (ixtiyoriy)
npx prisma db seed

# Server ishga tushirish
npm run dev
```

### 3. Brauzerda ochish:
- Frontend: http://localhost:5173
- Demo hisob: `demo@eslatma.uz` / `demo123456` (seed dan keyin)

### Muammolar:
- **Port band**: `netstat -ano | findstr :3001` va `taskkill /PID <pid> /F`
- **Docker ishlamasa**: Docker Desktop ni qayta ishga tushiring
- **npm install xatosi**: `npm cache clean --force` va qayta urinib ko'ring

---

## 🧪 Testing

```bash
# Backend testlar
cd server
npm test

# Frontend type checking
npm run typecheck

# Build tekshirish
npm run build
```

---

## 📝 Litsenziya

MIT

---

## 🤝 Hissa Qo'shish

Pull request yuborishingiz mumkin. Katta o'zgarishlar uchun avval issue oching.

---

**Eslatma Daftari** — O'zbek tilida yaratilgan, zamonaviy va xavfsiz shaxsiy boshqaruv ilovasi.
