# TreadX WMS — Base Project

مشروع Next.js (App Router) مُهيأ كقاعدة لمشاريع ويب مع مصادقة، صلاحيات، ترجمة وثيمات.

## الميزات

- **المصادقة**: تسجيل دخول وتسجيل مستخدم جديد (محاكاة جاهزة لربط الـ Backend).
- **الصلاحيات (RBAC)**: أدوار (admin, supplier, user) وحماية مسارات وSidebar ديناميكي.
- **الترجمة**: عربي / إنجليزي (next-intl)، لغة من الكوكي مع دعم RTL.
- **الثيمات**: فاتح / غامق / نظام (next-themes).
- **Layout**: الصفحة الرئيسية تُوجّه إلى تسجيل الدخول؛ لوحة تحكم مع Sidebar (قائمة، مبدّل ثيم ولغة، تسجيل خروج).

## التشغيل

```bash
npm install
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000). سيتم توجيهك إلى صفحة تسجيل الدخول (`/auth`).

## متغيرات البيئة

انسخ `.env.example` إلى `.env.local` وعدّل القيم عند الحاجة:

| المتغير | الوصف |
|--------|--------|
| `NEXT_PUBLIC_API_URL` | عنوان الـ API (افتراضي: `http://localhost:5000/api`) |

## البنية والتوثيق

- **[BASE_PROJECT.md](BASE_PROJECT.md)** — ملخص وروابط.
- **[docs/architecture.md](docs/architecture.md)** — بنية المجلدات، إضافة features و use-cases، استخدام المشروع كقاعدة.

## التقنيات

- Next.js 16 (App Router)
- React 19
- next-intl, next-themes
- Tailwind CSS
- Zustand, Axios

## الأوامر

| الأمر | الوصف |
|-------|--------|
| `npm run dev` | تشغيل وضع التطوير |
| `npm run build` | بناء للإنتاج |
| `npm run start` | تشغيل إنتاج |
| `npm run lint` | فحص ESLint |
