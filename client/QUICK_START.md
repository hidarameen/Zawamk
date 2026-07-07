# 🚀 دليل البدء السريع

دليل سريع للبدء في العمل مع منصة البث الموسيقي.

---

## ⚡ البدء في 3 خطوات

### 1. استنساخ المشروع
```bash
git clone [repository-url]
cd music-platform
```

### 2. تثبيت المكتبات
```bash
npm install
# أو
pnpm install
```

### 3. تشغيل التطبيق
```bash
npm run dev
```

افتح المتصفح على: `http://localhost:3000`

---

## 📁 الهيكل الأساسي

```
src/app/
├── pages/          # صفحات التطبيق (29+)
├── components/     # المكونات (60+)
├── hooks/          # Custom Hooks (8)
├── contexts/       # React Contexts (3)
└── routes.ts       # إعدادات التوجيه
```

---

## 🎯 المسارات الرئيسية

### صفحات عامة
- `/` - Landing page
- `/home` - الصفحة الرئيسية
- `/search` - البحث
- `/library` - المكتبة

### ميزات متقدمة
- `/recommendations` - التوصيات الذكية
- `/party-mode` - وضع الحفلات
- `/social-listening` - الاستماع الجماعي
- `/settings` - الإعدادات

### لوحات التحكم
- `/artist/dashboard` - لوحة الفنان
- `/admin/dashboard` - لوحة الإدارة

---

## ⌨️ اختصارات مهمة

| الاختصار | الوظيفة |
|----------|---------|
| `Space` | تشغيل/إيقاف |
| `→` / `←` | التالي/السابق |
| `↑` / `↓` | رفع/خفض الصوت |
| `Ctrl+K` | بحث سريع |
| `?` | المساعدة |

[المزيد في KEYBOARD_SHORTCUTS.md](./KEYBOARD_SHORTCUTS.md)

---

## 🎨 تخصيص الثيم

```typescript
// في أي مكون
import { useTheme } from "next-themes";

const { theme, setTheme } = useTheme();

// تبديل الثيم
setTheme(theme === "dark" ? "light" : "dark");
```

---

## 🎵 استخدام المشغل

```typescript
import { usePlayer } from "../contexts/PlayerContext";

function MyComponent() {
  const { 
    currentTrack, 
    isPlaying, 
    play, 
    pause, 
    playTrack 
  } = usePlayer();
  
  // تشغيل أغنية
  playTrack(track);
  
  // إيقاف/تشغيل
  isPlaying ? pause() : play();
}
```

---

## 🔐 المصادقة

```typescript
import { useAuth } from "../contexts/AuthContext";

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <LoginButton onClick={login} />;
  }
  
  return <div>مرحباً {user.name}</div>;
}
```

---

## 📦 إضافة صفحة جديدة

### 1. إنشاء الصفحة
```typescript
// src/app/pages/MyPage.tsx
export default function MyPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">صفحتي</h1>
    </div>
  );
}
```

### 2. إضافة المسار
```typescript
// src/app/routes.ts
import MyPage from "./pages/MyPage";

// في children:
{ path: "my-page", Component: MyPage }
```

### 3. إضافة رابط في Sidebar
```typescript
// src/app/components/layout/Sidebar.tsx
const navigation = [
  // ...
  { name: 'صفحتي', href: '/my-page', icon: MyIcon },
];
```

---

## 🎨 إنشاء مكون جديد

```typescript
// src/app/components/MyComponent.tsx
import { motion } from "motion/react";

interface MyComponentProps {
  title: string;
}

export default function MyComponent({ title }: MyComponentProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 bg-accent rounded-lg"
    >
      <h2>{title}</h2>
    </motion.div>
  );
}
```

---

## 🔧 Custom Hook

```typescript
// src/app/hooks/useMyHook.ts
import { useState, useEffect } from "react";

export function useMyHook() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // منطق Hook
  }, []);
  
  return { data };
}
```

---

## 📝 إضافة بيانات تجريبية

```typescript
// src/data/mockData.ts
export const myData = [
  {
    id: "1",
    name: "اسم",
    // ... بقية الحقول
  },
];
```

---

## 🎭 استخدام الرسوم المتحركة

```typescript
import { motion } from "motion/react";

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  محتوى متحرك
</motion.div>
```

---

## 💾 التخزين المؤقت

```typescript
import { useCache } from "../hooks/useCache";

function MyComponent() {
  const { data, isLoading } = useCache(
    "my-data-key",
    async () => {
      // جلب البيانات
      return await fetchData();
    },
    { ttl: 5 * 60 * 1000 } // 5 دقائق
  );
}
```

---

## 🖼️ التحميل الكسول للصور

```typescript
import LazyImage from "../components/optimization/LazyImage";

<LazyImage
  src="https://example.com/image.jpg"
  alt="وصف الصورة"
  className="w-full h-64 object-cover"
/>
```

---

## ⌨️ اختصارات لوحة المفاتيح

```typescript
import { useKeyboard } from "../hooks/useKeyboard";

function MyComponent() {
  useKeyboard([
    {
      key: "Enter",
      callback: () => console.log("Enter pressed"),
      description: "تنفيذ إجراء",
    },
  ]);
}
```

---

## 🌍 PWA

### تثبيت Service Worker
Service Worker يعمل تلقائياً. للتحقق:
```javascript
// في console المتصفح
navigator.serviceWorker.ready.then(registration => {
  console.log('Service Worker ready:', registration);
});
```

### تثبيت كـ PWA
1. افتح التطبيق في المتصفح
2. ابحث عن أيقونة "تثبيت التطبيق" في شريط العنوان
3. اضغط "تثبيت"

---

## 🧪 الاختبار

```bash
# تشغيل الاختبارات
npm test

# بناء المشروع
npm run build

# معاينة البناء
npm run preview
```

---

## 📚 الموارد المفيدة

- [README الكامل](./README.md)
- [دليل اختصارات لوحة المفاتيح](./KEYBOARD_SHORTCUTS.md)
- [دليل المساهمة](./CONTRIBUTING.md)
- [سجل التغييرات](./CHANGELOG.md)

---

## 🐛 حل المشاكل

### المشروع لا يعمل؟
```bash
# مسح node_modules وإعادة التثبيت
rm -rf node_modules
npm install

# مسح cache
npm cache clean --force
```

### الثيم لا يتغير؟
تأكد من وجود `ThemeProvider` في المكون الجذري.

### Service Worker لا يعمل؟
Service Workers يعمل فقط على HTTPS أو localhost.

---

## 💡 نصائح سريعة

1. **استخدم اختصارات لوحة المفاتيح** - اضغط `?` لرؤية جميع الاختصارات

2. **Dark Mode** - التطبيق يدعم Dark/Light mode تلقائياً

3. **PWA** - ثبّت التطبيق على جهازك للوصول السريع

4. **البيانات التجريبية** - كل شيء يستخدم بيانات تجريبية حالياً

5. **التوثيق** - اقرأ التوثيق في `/README.md` للتفاصيل الكاملة

---

## 🤝 المساعدة

لديك سؤال؟
- اقرأ [README.md](./README.md)
- راجع [CONTRIBUTING.md](./CONTRIBUTING.md)
- افتح Issue على GitHub

---

## 🎉 استمتع!

كل شيء جاهز! ابدأ بالاستكشاف والتطوير.

**Happy Coding! 🚀**
