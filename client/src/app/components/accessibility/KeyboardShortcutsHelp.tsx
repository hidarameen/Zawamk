import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Keyboard, X } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { PLAYER_SHORTCUTS } from "../../hooks/useKeyboard";

export default function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    {
      category: "التشغيل",
      items: [
        { keys: ["Space"], description: "تشغيل/إيقاف مؤقت" },
        { keys: ["→"], description: "الزامل التالية" },
        { keys: ["←"], description: "الزامل السابقة" },
        { keys: ["↑"], description: "رفع الصوت" },
        { keys: ["↓"], description: "خفض الصوت" },
        { keys: ["M"], description: "كتم/إلغاء كتم الصوت" },
      ],
    },
    {
      category: "التنقل",
      items: [
        { keys: ["Ctrl", "H"], description: "الصفحة الرئيسية" },
        { keys: ["Ctrl", "L"], description: "المكتبة" },
        { keys: ["Ctrl", "S"], description: "البحث" },
        { keys: ["Ctrl", "P"], description: "الملف الشخصي" },
      ],
    },
    {
      category: "الإجراءات",
      items: [
        { keys: ["F"], description: "إضافة إلى المفضلة" },
        { keys: ["Shift", "S"], description: "تفعيل الترتيب العشوائي" },
        { keys: ["Shift", "R"], description: "تفعيل التكرار" },
        { keys: ["Ctrl", "Q"], description: "فتح قائمة الانتظار" },
      ],
    },
    {
      category: "عام",
      items: [
        { keys: ["?"], description: "إظهار اختصارات لوحة المفاتيح" },
        { keys: ["Esc"], description: "إغلاق النافذة الحالية" },
        { keys: ["Ctrl", "K"], description: "فتح البحث السريع" },
      ],
    },
  ];

  return (
    <>
      {/* زر فتح المساعدة */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-40 rounded-full shadow-lg"
        aria-label="اختصارات لوحة المفاتيح"
      >
        <Keyboard className="w-5 h-5" />
      </Button>

      {/* نافذة الاختصارات */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Keyboard className="w-6 h-6" />
              اختصارات لوحة المفاتيح
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {shortcuts.map((category, idx) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <h3 className="text-lg font-bold mb-3">{category.category}</h3>
                <div className="space-y-2">
                  {category.items.map((item, itemIdx) => (
                    <motion.div
                      key={itemIdx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 + itemIdx * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors"
                    >
                      <span className="text-sm">{item.description}</span>
                      <div className="flex gap-1">
                        {item.keys.map((key, keyIdx) => (
                          <Badge
                            key={keyIdx}
                            variant="secondary"
                            className="font-mono font-bold px-3 py-1"
                          >
                            {key}
                          </Badge>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm text-muted-foreground">
              💡 <strong>نصيحة:</strong> يمكنك استخدام هذه الاختصارات في أي صفحة من التطبيق
              لتحسين تجربة الاستخدام وسرعة الوصول للوظائف.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
