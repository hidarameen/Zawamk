import { useEffect } from "react";

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  callback: () => void;
  description: string;
}

/**
 * Hook للتحكم بلوحة المفاتيح
 * يدعم اختصارات لوحة المفاتيح المخصصة
 */
export function useKeyboard(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      shortcuts.forEach((shortcut) => {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = !shortcut.ctrl || event.ctrlKey || event.metaKey;
        const shiftMatch = !shortcut.shift || event.shiftKey;
        const altMatch = !shortcut.alt || event.altKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          event.preventDefault();
          shortcut.callback();
        }
      });
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [shortcuts]);

  return { shortcuts };
}

/**
 * اختصارات لوحة المفاتيح الافتراضية للمشغل الموسيقي
 */
export const PLAYER_SHORTCUTS: Omit<KeyboardShortcut, "callback">[] = [
  { key: " ", description: "تشغيل/إيقاف مؤقت" },
  { key: "ArrowRight", description: "التالي" },
  { key: "ArrowLeft", description: "السابق" },
  { key: "ArrowUp", description: "رفع الصوت" },
  { key: "ArrowDown", description: "خفض الصوت" },
  { key: "m", description: "كتم الصوت" },
  { key: "f", description: "المفضلة" },
  { key: "l", ctrl: true, description: "فتح كلمات الزوامل" },
  { key: "q", ctrl: true, description: "فتح قائمة الانتظار" },
  { key: "s", shift: true, description: "تفعيل الترتيب العشوائي" },
  { key: "r", shift: true, description: "تفعيل التكرار" },
];
