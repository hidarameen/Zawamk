import { Outlet, useLocation, useNavigate, Navigate } from 'react-router';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../components/ui/utils';
import { FileUpload } from '../../components/ui/FileUpload';
import {
  LayoutDashboard, Users, Music2, Disc, Video, Newspaper, CalendarDays,
  BarChart2, Settings, UsersRound, Feather, ListMusic, Mic2, Shield,
  TrendingUp, ChevronLeft, Menu, X, Bell, Sun, Moon, Home,
  LogOut, User, ChevronDown, ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from 'next-themes';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}
interface NavGroup {
  group: string;
  icon?: React.ElementType;
  items: NavItem[];
}

const adminNavGroups: NavGroup[] = [
  {
    group: 'عام',
    items: [
      { label: 'لوحة التحكم', href: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'التقارير والإحصاءات', href: '/admin/reports', icon: BarChart2 },
    ],
  },
  {
    group: 'المحتوى الصوتي',
    items: [
      { label: 'الزوامل والأناشيد', href: '/admin/songs', icon: Music2 },
      { label: 'الألبومات', href: '/admin/albums', icon: Disc },
      { label: 'قوائم التشغيل', href: '/admin/playlists', icon: ListMusic },
    ],
  },
  {
    group: 'الفيديوهات',
    items: [
      { label: 'إدارة الفيديوهات', href: '/admin/videos', icon: Video },
    ],
  },
  {
    group: 'الأشخاص',
    items: [
      { label: 'الفنانون والمنشدون', href: '/admin/artists', icon: Mic2 },
      { label: 'الفرق الموسيقية', href: '/admin/bands', icon: UsersRound },
      { label: 'الشعراء', href: '/admin/poets', icon: Feather },
      { label: 'المستخدمون', href: '/admin/users', icon: Users },
    ],
  },
  {
    group: 'الاتحاد',
    items: [
      { label: 'الأخبار', href: '/admin/news', icon: Newspaper },
      { label: 'المناسبات السنوية', href: '/admin/occasions', icon: CalendarDays },
    ],
  },
  {
    group: 'النظام',
    items: [
      { label: 'إعدادات النظام', href: '/admin/settings', icon: Settings },
    ],
  },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auth protection
  const { user, isAuthenticated, loading } = useAuth();
  
  // Wait until loading finishes
  if (loading) return <div className="min-h-screen bg-[var(--admin-bg)] flex items-center justify-center">جاري التحميل...</div>;

  // Redirect if not admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + '/');

  const NavContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Logo Header */}
      <div className={cn(
        'flex items-center border-b h-14 flex-shrink-0',
        'border-[var(--admin-sidebar-border)]',
        collapsed ? 'justify-center px-2' : 'gap-3 px-4'
      )}>
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-violet-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
          <Shield className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-foreground leading-none whitespace-nowrap">لوحة الإدارة</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 whitespace-nowrap">اتحاد الشعراء والمنشدين</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
        {adminNavGroups.map((group) => (
          <div key={group.group} className="mb-2">
            {!collapsed && (
              <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest px-2.5 mb-1.5">
                {group.group}
              </p>
            )}
            {collapsed && <div className="h-px bg-border mx-1 my-2" />}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <button
                    key={item.href}
                    onClick={() => { navigate(item.href); setMobileOpen(false); }}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      'w-full flex items-center gap-2.5 rounded-xl text-sm transition-all',
                      collapsed ? 'px-2 py-2.5 justify-center' : 'px-3 py-2.5 text-right',
                      active
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
                    )}
                  >
                    <item.icon className={cn('w-4 h-4 flex-shrink-0', active ? 'text-primary-foreground' : '')} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {!collapsed && item.badge && (
                      <span className="mr-auto bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className={cn('border-t border-[var(--admin-sidebar-border)] p-2.5 space-y-0.5')}>
        <button
          onClick={() => navigate('/home')}
          title={collapsed ? 'العودة للتطبيق' : undefined}
          className={cn(
            'w-full flex items-center gap-2.5 rounded-xl py-2.5 text-sm transition-all text-muted-foreground hover:text-foreground hover:bg-accent/60',
            collapsed ? 'justify-center px-2' : 'px-3'
          )}
        >
          <Home className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>العودة للتطبيق</span>}
        </button>
        <button
          onClick={() => setSidebarOpen(s => !s)}
          title={collapsed ? 'توسيع' : 'طي'}
          className={cn(
            'w-full hidden lg:flex items-center gap-2.5 rounded-xl py-2.5 text-sm transition-all text-muted-foreground hover:text-foreground hover:bg-accent/60',
            collapsed ? 'justify-center px-2' : 'px-3'
          )}
        >
          {collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          {!collapsed && <span>طي الشريط</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--admin-bg)] flex" dir="rtl">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex fixed right-0 top-0 bottom-0 z-50 flex-col bg-[var(--admin-sidebar)] border-l border-[var(--admin-sidebar-border)] overflow-hidden shadow-lg transition-all duration-300",
          sidebarOpen ? "w-[240px]" : "w-[64px]"
        )}
      >
        <NavContent collapsed={!sidebarOpen} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-64 z-50 flex flex-col bg-[var(--admin-sidebar)] border-l border-[var(--admin-sidebar-border)] shadow-2xl lg:hidden max-w-full"
            >
              <NavContent collapsed={false} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300",
          sidebarOpen ? "lg:mr-[240px]" : "lg:mr-[64px]"
        )}
      >
        {/* Admin Top Bar */}
        <header className="sticky top-0 z-30 h-14 bg-[var(--admin-header)] border-b border-[var(--admin-sidebar-border)] flex items-center justify-between px-5 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden rounded-xl w-9 h-9"
            >
              <Menu className="w-4 h-4" />
            </Button>
            {/* Desktop sidebar toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(s => !s)}
              className="hidden lg:flex rounded-xl w-9 h-9"
            >
              <Menu className="w-4 h-4" />
            </Button>

            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-1.5 text-sm">
              <span className="text-muted-foreground">الإدارة</span>
              <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground/50" />
              <span className="text-foreground font-medium">
                {adminNavGroups.flatMap(g => g.items).find(i => isActive(i.href))?.label || 'لوحة التحكم'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-xl w-9 h-9"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : (
                <Moon className="w-4 h-4 text-primary" />
              )}
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="rounded-xl w-9 h-9 relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-background" />
            </Button>

            {/* Admin Avatar */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-xl">
              <Avatar className="w-7 h-7">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">م</AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-xs font-medium text-foreground leading-none">المشرف</p>
                <p className="text-[10px] text-muted-foreground">مدير النظام</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-5 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
