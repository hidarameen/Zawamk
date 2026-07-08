import { useState } from "react";
import { motion } from "motion/react";
import { 
  Settings as SettingsIcon, 
  Bell, 
  Volume2, 
  Download, 
  Shield, 
  Palette, 
  Zap,
  Database,
  Wifi,
  Moon,
  Sun,
  Monitor,
  Languages,
  HardDrive,
  Trash2
} from "lucide-react";
import { Card } from "../components/ui/card";
import { Switch } from "../components/ui/switch";
import { Slider } from "../components/ui/slider";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { useTheme } from "next-themes";
import { useCacheManager } from "../hooks/useCache";
import { toast } from "sonner";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { clearAllCache, getCacheSize } = useCacheManager();
  const [cacheSize, setCacheSize] = useState(getCacheSize());

  // إعدادات الإشعارات
  const [notifications, setNotifications] = useState({
    newReleases: true,
    followedArtists: true,
    playlistUpdates: false,
    recommendations: true,
  });

  // إعدادات التشغيل
  const [playback, setPlayback] = useState({
    autoPlay: true,
    crossfade: false,
    normalization: true,
    gaplessPlayback: true,
  });

  // إعدادات التنزيل
  const [download, setDownload] = useState({
    quality: "high",
    wifiOnly: true,
    autoDownload: false,
  });

  // إعدادات الأداء
  const [performance, setPerformance] = useState({
    lazyLoading: true,
    imageCaching: true,
    preloadPages: true,
    reducedAnimations: false,
  });

  const handleClearCache = () => {
    const cleared = clearAllCache();
    setCacheSize(0);
    toast.success(`تم مسح ${cleared} عنصر من الذاكرة المؤقتة`);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="p-6 pb-32 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">الإعدادات</h1>
          <p className="text-muted-foreground text-sm">
            إدارة تفضيلات حسابك وإعدادات التطبيق.
          </p>
        </div>
      </motion.div>

      <Tabs defaultValue="general" className="space-y-6" onValueChange={setActiveTab}>
        <div className="-mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto hide-scrollbar">
          <TabsList className="inline-flex min-w-max md:w-auto h-auto p-1 bg-muted/50 rounded-xl">
            <TabsTrigger value="general">عام</TabsTrigger>
            <TabsTrigger value="playback">التشغيل</TabsTrigger>
            <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
            <TabsTrigger value="download">التنزيل</TabsTrigger>
            <TabsTrigger value="performance">الأداء</TabsTrigger>
          </TabsList>
        </div>

        {/* عام */}
        <TabsContent value="general" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              المظهر
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">الثيم</p>
                  <p className="text-sm text-muted-foreground">اختر المظهر المفضل</p>
                </div>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-[180px] max-w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4" />
                        فاتح
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4" />
                        داكن
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        تلقائي
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">اللغة</p>
                  <p className="text-sm text-muted-foreground">لغة الواجهة</p>
                </div>
                <Select defaultValue="ar">
                  <SelectTrigger className="w-[180px] max-w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              الخصوصية والأمان
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">الملف الشخصي العام</p>
                  <p className="text-sm text-muted-foreground">السماح للآخرين بمشاهدة ملفك</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">إظهار النشاط</p>
                  <p className="text-sm text-muted-foreground">مشاركة ما تستمع إليه</p>
                </div>
                <Switch />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">قوائم التشغيل الخاصة</p>
                  <p className="text-sm text-muted-foreground">إخفاء قوائم التشغيل عن الآخرين</p>
                </div>
                <Switch />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* التشغيل */}
        <TabsContent value="playback" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              جودة الصوت
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">جودة البث</p>
                  <p className="text-sm text-muted-foreground">حدد جودة الصوت عند البث</p>
                </div>
                <Select defaultValue="high">
                  <SelectTrigger className="w-[180px] max-w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">منخفض (96 kbps)</SelectItem>
                    <SelectItem value="normal">عادي (160 kbps)</SelectItem>
                    <SelectItem value="high">عالي (320 kbps)</SelectItem>
                    <SelectItem value="lossless">Lossless</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">تشغيل تلقائي</p>
                  <p className="text-sm text-muted-foreground">متابعة التشغيل بعد انتهاء القائمة</p>
                </div>
                <Switch
                  checked={playback.autoPlay}
                  onCheckedChange={(checked) =>
                    setPlayback({ ...playback, autoPlay: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Crossfade</p>
                  <p className="text-sm text-muted-foreground">انتقال سلس بين الزوامل</p>
                </div>
                <Switch
                  checked={playback.crossfade}
                  onCheckedChange={(checked) =>
                    setPlayback({ ...playback, crossfade: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">تطبيع الصوت</p>
                  <p className="text-sm text-muted-foreground">مستوى صوت متساوي لجميع الزوامل</p>
                </div>
                <Switch
                  checked={playback.normalization}
                  onCheckedChange={(checked) =>
                    setPlayback({ ...playback, normalization: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">تشغيل بلا فواصل</p>
                  <p className="text-sm text-muted-foreground">إزالة الفجوات بين الزوامل</p>
                </div>
                <Switch
                  checked={playback.gaplessPlayback}
                  onCheckedChange={(checked) =>
                    setPlayback({ ...playback, gaplessPlayback: checked })
                  }
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* الإشعارات */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              إدارة الإشعارات
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">إصدارات جديدة</p>
                  <p className="text-sm text-muted-foreground">
                    إشعارات عند صدور موسيقى جديدة
                  </p>
                </div>
                <Switch
                  checked={notifications.newReleases}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, newReleases: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">الفنانون المتابَعون</p>
                  <p className="text-sm text-muted-foreground">
                    تحديثات من الفنانين الذين تتابعهم
                  </p>
                </div>
                <Switch
                  checked={notifications.followedArtists}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, followedArtists: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">تحديثات قوائم التشغيل</p>
                  <p className="text-sm text-muted-foreground">
                    إشعارات عند تحديث قوائم التشغيل
                  </p>
                </div>
                <Switch
                  checked={notifications.playlistUpdates}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, playlistUpdates: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">التوصيات</p>
                  <p className="text-sm text-muted-foreground">
                    اقتراحات موسيقية مخصصة
                  </p>
                </div>
                <Switch
                  checked={notifications.recommendations}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, recommendations: checked })
                  }
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* التنزيل */}
        <TabsContent value="download" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Download className="w-5 h-5" />
              إعدادات التنزيل
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">جودة التنزيل</p>
                  <p className="text-sm text-muted-foreground">
                    جودة الملفات المنزَّلة
                  </p>
                </div>
                <Select
                  value={download.quality}
                  onValueChange={(value) =>
                    setDownload({ ...download, quality: value })
                  }
                >
                  <SelectTrigger className="w-[180px] max-w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">عادي</SelectItem>
                    <SelectItem value="high">عالي</SelectItem>
                    <SelectItem value="very-high">عالي جداً</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">التنزيل عبر Wi-Fi فقط</p>
                  <p className="text-sm text-muted-foreground">
                    توفير بيانات الجوال
                  </p>
                </div>
                <Switch
                  checked={download.wifiOnly}
                  onCheckedChange={(checked) =>
                    setDownload({ ...download, wifiOnly: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">تنزيل تلقائي</p>
                  <p className="text-sm text-muted-foreground">
                    تنزيل الزوامل المفضلة تلقائياً
                  </p>
                </div>
                <Switch
                  checked={download.autoDownload}
                  onCheckedChange={(checked) =>
                    setDownload({ ...download, autoDownload: checked })
                  }
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* الأداء */}
        <TabsContent value="performance" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              تحسينات الأداء
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">التحميل الكسول</p>
                  <p className="text-sm text-muted-foreground">
                    تحميل المحتوى عند الحاجة فقط
                  </p>
                </div>
                <Switch
                  checked={performance.lazyLoading}
                  onCheckedChange={(checked) =>
                    setPerformance({ ...performance, lazyLoading: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">تخزين الصور مؤقتاً</p>
                  <p className="text-sm text-muted-foreground">
                    تحسين سرعة التحميل
                  </p>
                </div>
                <Switch
                  checked={performance.imageCaching}
                  onCheckedChange={(checked) =>
                    setPerformance({ ...performance, imageCaching: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">تحميل الصفحات مسبقاً</p>
                  <p className="text-sm text-muted-foreground">
                    انتقالات أسرع بين الصفحات
                  </p>
                </div>
                <Switch
                  checked={performance.preloadPages}
                  onCheckedChange={(checked) =>
                    setPerformance({ ...performance, preloadPages: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">تقليل الرسوم المتحركة</p>
                  <p className="text-sm text-muted-foreground">
                    للأجهزة الأقل قوة
                  </p>
                </div>
                <Switch
                  checked={performance.reducedAnimations}
                  onCheckedChange={(checked) =>
                    setPerformance({ ...performance, reducedAnimations: checked })
                  }
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Database className="w-5 h-5" />
              إدارة البيانات
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">الذاكرة المؤقتة</p>
                  <p className="text-sm text-muted-foreground">
                    الحجم المستخدم: {formatBytes(cacheSize)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCache}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  مسح الذاكرة المؤقتة
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">التخزين دون اتصال</p>
                  <p className="text-sm text-muted-foreground">
                    المساحة المستخدمة للتنزيلات
                  </p>
                </div>
                <Badge variant="secondary">2.4 GB</Badge>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
