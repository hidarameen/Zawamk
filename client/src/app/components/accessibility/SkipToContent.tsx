import { motion } from "motion/react";

/**
 * مكون "تخطي إلى المحتوى" لتحسين إمكانية الوصول
 * يساعد مستخدمي لوحة المفاتيح وقارئات الشاشة
 */
export default function SkipToContent() {
  return (
    <motion.a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
      initial={{ opacity: 0 }}
      whileFocus={{ opacity: 1 }}
    >
      تخطي إلى المحتوى الرئيسي
    </motion.a>
  );
}
