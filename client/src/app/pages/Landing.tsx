import { useNavigate } from 'react-router';
import { Music, Play, Users, Feather, FileText, Newspaper, CalendarDays, UsersRound } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion } from 'motion/react';

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Music,
      title: 'الأناشيد والزوامل',
      description: 'استمع إلى أروع الأناشيد الإسلامية والأعمال الفنية للاتحاد',
    },
    {
      icon: Feather,
      title: 'الشعر العربي',
      description: 'اكتشف القصائد الخالدة لأعظم شعراء العرب عبر العصور',
    },
    {
      icon: UsersRound,
      title: 'الفرق الموسيقية',
      description: 'تعرّف على فرق الإنشاد والموسيقى التراثية المنضوية تحت الاتحاد',
    },
    {
      icon: CalendarDays,
      title: 'المناسبات الخاصة',
      description: 'أعمال فنية حصرية لكل مناسبة دينية ووطنية وثقافية',
    },
  ];

  const stats = [
    { number: '60+', label: 'فنان ومنشد' },
    { number: '30+', label: 'فرقة موسيقية' },
    { number: '500+', label: 'قصيدة ونشيد' },
    { number: '20+', label: 'مناسبة سنوية' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-gray-950 to-gray-950 text-white overflow-hidden" dir="rtl">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
              <Music className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base leading-none block">اتحاد الشعراء</span>
              <span className="text-muted-foreground text-xs">والمنشدين</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/login')}
              className="text-secondary-foreground hover:text-white"
            >
              تسجيل الدخول
            </Button>
            <Button
              onClick={() => navigate('/home')}
              className="bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 shadow-lg"
            >
              استكشف المنصة
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <span className="inline-flex items-center gap-2 bg-violet-500/20 border border-violet-500/30 text-violet-300 text-sm px-4 py-1.5 rounded-full">
                  <span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
                  المستودع الرسمي للأعمال الفنية
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-l from-white via-violet-200 to-purple-300 bg-clip-text text-transparent leading-tight">
                اتحاد الشعراء والمنشدين
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                منصة رقمية متكاملة تضم الأعمال الفنية لاتحاد الشعراء والمنشدين — أناشيد، قصائد، فيديوهات، وأعمال المناسبات الخاصة في مكان واحد.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/home')}
                  className="bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-base px-8 h-13 rounded-full shadow-2xl hover:shadow-violet-500/40 transition-all gap-2"
                >
                  <Play className="w-5 h-5 fill-current" />
                  ادخل المنصة
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/poems')}
                  className="text-base px-8 h-13 rounded-full border-2 border-white/20 text-white hover:bg-secondary gap-2"
                >
                  <Feather className="w-4 h-4" />
                  القصائد
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-8 mt-10">
                {stats.map(stat => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl font-bold text-violet-300">{stat.number}</div>
                    <div className="text-xs text-white/40 mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="relative h-48 rounded-2xl overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400"
                      alt="الشعر"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-violet-900/80 to-transparent" />
                    <div className="absolute bottom-3 right-3 text-white">
                      <Feather className="w-4 h-4 mb-1 text-violet-300" />
                      <p className="text-xs font-medium">قصائد عربية</p>
                    </div>
                  </div>
                  <div className="relative h-36 rounded-2xl overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400"
                      alt="أناشيد"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 to-transparent" />
                    <div className="absolute bottom-3 right-3 text-white">
                      <Music className="w-4 h-4 mb-1 text-purple-300" />
                      <p className="text-xs font-medium">أناشيد إسلامية</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="relative h-36 rounded-2xl overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400"
                      alt="فرق"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 to-transparent" />
                    <div className="absolute bottom-3 right-3 text-white">
                      <UsersRound className="w-4 h-4 mb-1 text-indigo-300" />
                      <p className="text-xs font-medium">فرق موسيقية</p>
                    </div>
                  </div>
                  <div className="relative h-48 rounded-2xl overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1564769662533-4f00a87b4056?w=400"
                      alt="مناسبات"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 to-transparent" />
                    <div className="absolute bottom-3 right-3 text-white">
                      <CalendarDays className="w-4 h-4 mb-1 text-green-300" />
                      <p className="text-xs font-medium">مناسبات خاصة</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-10 -right-10 w-80 h-64 md:h-80 bg-violet-500/20 rounded-full blur-3xl pointer-events-none max-w-full" />
              <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl pointer-events-none max-w-full" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-black/30 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">محتوى الاتحاد الفني</h2>
            <p className="text-muted-foreground">كل ما يُنتجه اتحاد الشعراء والمنشدين في مكان واحد</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03 }}
                className="bg-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-white/10 hover:border-violet-500/40 transition-all"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500/30 to-purple-600/30 border border-violet-500/20 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-violet-300" />
                </div>
                <h3 className="font-bold mb-2">{feature.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Union Sections */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">أقسام المنصة</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: FileText,
                title: 'الأخبار والتصريحات',
                desc: 'تابع آخر أخبار الاتحاد وبياناته الرسمية',
                color: 'from-blue-600/20 to-indigo-600/20',
                border: 'border-blue-500/30',
                href: '/news',
              },
              {
                icon: Users,
                title: 'الشعراء والفنانون',
                desc: 'تعرّف على شعراء وفناني ومنشدي الاتحاد',
                color: 'from-violet-600/20 to-purple-600/20',
                border: 'border-violet-500/30',
                href: '/artists',
              },
              {
                icon: Newspaper,
                title: 'المناسبات السنوية',
                desc: 'أعمال خاصة لكل مناسبة دينية ووطنية',
                color: 'from-amber-600/20 to-orange-600/20',
                border: 'border-amber-500/30',
                href: '/occasions',
              },
            ].map((section, idx) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate(section.href)}
                className={`bg-gradient-to-br ${section.color} border ${section.border} rounded-2xl p-8 cursor-pointer transition-all hover:shadow-xl`}
              >
                <section.icon className="w-8 h-8 text-muted-foreground mb-4" />
                <h3 className="font-bold text-lg mb-2">{section.title}</h3>
                <p className="text-muted-foreground text-sm">{section.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 backdrop-blur-xl p-6 md:p-12 rounded-3xl border border-violet-500/20"
          >
            <h2 className="text-4xl font-bold mb-4">استكشف عالم الإبداع</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              انضم وتمتع بأروع الأعمال الفنية لاتحاد الشعراء والمنشدين — مجاناً
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/home')}
              className="bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-base px-12 h-13 rounded-full shadow-2xl gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              ادخل المنصة الآن
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-white/30">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-purple-700 rounded-lg flex items-center justify-center">
              <Music className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-muted-foreground">اتحاد الشعراء والمنشدين</span>
          </div>
          <p className="text-sm">© 2026 اتحاد الشعراء والمنشدين. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}
