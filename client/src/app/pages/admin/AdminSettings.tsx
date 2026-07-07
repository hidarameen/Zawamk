import { motion } from 'motion/react';
import { Settings } from 'lucide-react';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
import { Button } from '../../components/ui/button';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { FileUpload } from '../../components/ui/FileUpload';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    name: 'موسيقى',
    allowRegistration: true,
    requireReview: true
  });

  useEffect(() => {
    const s = localStorage.getItem('adminSettings');
    if (s) setSettings(JSON.parse(s));
  }, []);

  const handleSave = () => {
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    toast.success('تم حفظ الإعدادات بنجاح');
  };
  return (
    <div className="max-w-3xl space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Settings className="w-10 h-10 text-purple-400" />
          إعدادات النظام
        </h1>
        <p className="text-muted-foreground">تخصيص إعدادات المنصة</p>
      </motion.div>

      <div className="space-y-6">
        <div className="bg-secondary/50 border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-6">الإعدادات العامة</h3>
          <div className="space-y-6">
            <div>
              <Label>اسم المنصة</Label>
              <Input 
                value={settings.name}
                onChange={e => setSettings({...settings, name: e.target.value})}
                className="mt-2 bg-white/10 border-white/20" 
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>السماح بالتسجيل</Label>
                <p className="text-sm text-muted-foreground">السماح للمستخدمين الجدد بالتسجيل</p>
              </div>
              <Switch 
                checked={settings.allowRegistration}
                onCheckedChange={v => setSettings({...settings, allowRegistration: v})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>المراجعة قبل النشر</Label>
                <p className="text-sm text-muted-foreground">مراجعة المحتوى قبل نشره</p>
              </div>
              <Switch 
                checked={settings.requireReview}
                onCheckedChange={v => setSettings({...settings, requireReview: v})}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleSave}>حفظ التغييرات</Button>
          <Button variant="outline" onClick={() => {
            const s = localStorage.getItem('adminSettings');
            if (s) setSettings(JSON.parse(s));
          }}>إلغاء</Button>
        </div>
      </div>
    </div>
  );
}
