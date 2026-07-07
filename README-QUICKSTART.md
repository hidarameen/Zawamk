# 🚀 تشغيل MusicApp بأمر واحد

## التنصيب التلقائي (مرة واحدة فقط)

```bash
cd MusicApp
npm run setup
```

هذا الأمر سيقوم تلقائياً بـ:
- تثبيت جميع التبعيات (Frontend + Backend)
- تشغيل PostgreSQL عبر Docker (إن وجد)
- إعداد Prisma + إنشاء الجداول
- إدخال بيانات تجريبية (Seed)

## تشغيل الواجهة + الباكند معاً (أمر واحد)

```bash
cd MusicApp
npm run dev
```

أو مباشرة:

```bash
cd MusicApp
bash start.sh
```

## أوامر مفيدة أخرى

```bash
npm run setup          # التنصيب الكامل
npm run dev            # تشغيل الاثنين معاً
npm run backend        # تشغيل الباكند فقط
npm run frontend       # تشغيل الواجهة فقط
npm run seed           # إعادة تعبئة البيانات
```

## الروابط بعد التشغيل

- **الواجهة**: http://localhost:5173
- **الباكند**: http://localhost:3002
- **Health Check**: http://localhost:3002/api/health

## حسابات التجربة

| البريد                | الدور     | كلمة السر |
|-----------------------|-----------|-----------|
| admin@music.app       | مدير     | 123456    |
| issa@music.app        | فنان     | 123456    |
| sara@music.app        | مستخدم   | 123456    |

**ملاحظة**: فقط حساب المدير يستطيع رفع الملفات.
