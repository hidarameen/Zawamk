import { Link, useLocation } from 'react-router';
import {
  Home, Library, Search, Music, ListMusic, Disc, Video,
  FileText, Download, User, Heart, Settings, Feather,
  Users, Newspaper, CalendarDays, UsersRound, Mic2, Radio, Music2,
  ChevronRight, ChevronLeft,
} from 'lucide-react';
import { cn } from '../ui/utils';
import { useSidebarState } from '../../contexts/SidebarContext';
import { motion, AnimatePresence } from 'motion/react';
import { useIsMobile } from '../../hooks/useMobile';

const mainNav = [
  { name: 'الرئيسية', href: '/home', icon: Home },
  { name: 'البحث', href: '/search', icon: Search },
  { name: 'المكتبة', href: '/library', icon: Library },
];

const poetrySection = [
  { name: 'القصائد', href: '/poems', icon: FileText },
  { name: 'الشعراء', href: '/poets', icon: Feather },
];

const artistsSection = [
  { name: 'الفنانون / المنشدون', href: '/artists', icon: Mic2 },
  { name: 'الفرق الموسيقية', href: '/bands', icon: UsersRound },
];

const worksSection = [
  { name: 'الزوامل والأناشيد', href: '/songs', icon: Music2 },
  { name: 'الألبومات', href: '/albums', icon: Disc },
  { name: 'الفيديوهات', href: '/videos', icon: Video },
  { name: 'قوائم التشغيل', href: '/playlists', icon: ListMusic },
  { name: 'جاري التشغيل', href: '/now-playing', icon: Radio },
];

const unionSection = [
  { name: 'الأخبار والتصريحات', href: '/news', icon: Newspaper },
  { name: 'المناسبات السنوية', href: '/occasions', icon: CalendarDays },
];

const myLibrary = [
  { name: 'المفضلة', href: '/favorites', icon: Heart },
  { name: 'التنزيلات', href: '/downloads', icon: Download },
];

interface NavSectionProps {
  title: string;
  items: { name: string; href: string; icon: React.ElementType }[];
  currentPath: string;
  collapsed: boolean;
  isMobile?: boolean;
  close?: () => void;
}

function NavSection({ title, items, currentPath, collapsed, isMobile, close }: NavSectionProps) {
  return (
    <div className="mb-5">
      {!collapsed && (
        <h3 className="px-3 mb-2 text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-widest">
          {title}
        </h3>
      )}
      {collapsed && <div className="mb-2 h-px bg-sidebar-border mx-2" />}
      <nav className="space-y-0.5">
        {items.map((item) => {
          const isActive = currentPath === item.href || currentPath.startsWith(item.href + '/');
          return (
            <Link onClick={() => isMobile && close && close()}
              key={item.name}
              to={item.href}
              title={collapsed ? item.name : undefined}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 transition-all text-sm group relative font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                collapsed ? 'px-2 py-2.5 justify-center rounded-full' : 'px-4 py-2.5 rounded-full',
                isActive
                  ? 'bg-primary/15 text-primary shadow-sm'
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
              )}
            >
              <item.icon
                className={cn(
                  'w-4 h-4 flex-shrink-0 transition-colors',
                  isActive ? 'text-primary' : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground/90'
                )}
              />
              {!collapsed && <span className="truncate tracking-wide">{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}



export default function Sidebar() {
  const location = useLocation();
  const { isOpen, toggle, close } = useSidebarState();
  const isMobile = useIsMobile();

  const width = isMobile ? (isOpen ? 256 : 0) : (isOpen ? 256 : 64);
  const collapsed = isMobile ? false : !isOpen;

  return (
    <>
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={close}
        />
      )}
      <motion.aside
        animate={{ width }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="fixed right-0 top-0 h-screen glass-sidebar z-50 flex flex-col shadow-[rgba(0,0,0,0.5)_0px_8px_24px] overflow-hidden"
        style={{ width }}
      >
      {/* Logo */}
      <div className={cn('border-b border-sidebar-border flex items-center', isOpen ? 'p-4 gap-3' : 'p-3 justify-center')}>
        <Link onClick={() => isMobile && close()} to="/home" className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-gradient-to-br from-sidebar-primary to-sidebar-primary/70 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
            <Music className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="leading-tight overflow-hidden whitespace-nowrap"
              >
                <p className="text-sidebar-foreground font-bold text-sm leading-none">اتحاد الشعراء</p>
                <p className="text-sidebar-foreground/60 text-xs mt-0.5">والمنشدين</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-2.5 pb-4 space-y-0.5 scrollbar-thin">
        {/* Main */}
        <div className="mb-4">
          {isOpen && (
            <h3 className="px-3 mb-2 text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-widest">القائمة</h3>
          )}
          <nav className="space-y-0.5">
            {mainNav.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link onClick={() => isMobile && close()}
                  key={item.name}
                  to={item.href}
                  title={!isOpen ? item.name : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-xl transition-all text-sm group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                    !isOpen ? 'px-2 py-2.5 justify-center' : 'px-3 py-2.5',
                    isActive
                      ? 'bg-primary/15 text-primary shadow-sm'
                      : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon
                    className={cn(
                      'w-4 h-4 flex-shrink-0 transition-colors',
                      isActive ? 'text-primary' : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80'
                    )}
                  />
                  {isOpen && <span>{item.name}</span>}
                  {isOpen && isActive && <span className="mr-auto w-1.5 h-1.5 rounded-full bg-primary/60" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <NavSection title="الشعر العربي" items={poetrySection} currentPath={location.pathname} collapsed={collapsed} isMobile={isMobile} close={close} />
        <NavSection title="الفنانون والفرق" items={artistsSection} currentPath={location.pathname} collapsed={collapsed} isMobile={isMobile} close={close} />
        <NavSection title="الأعمال الفنية" items={worksSection} currentPath={location.pathname} collapsed={collapsed} isMobile={isMobile} close={close} />
        <NavSection title="الاتحاد" items={unionSection} currentPath={location.pathname} collapsed={collapsed} isMobile={isMobile} close={close} />
        <NavSection title="مكتبتي" items={myLibrary} currentPath={location.pathname} collapsed={collapsed} isMobile={isMobile} close={close} />
      </div>

      {/* User Section */}
      <div className="p-2.5 border-t border-sidebar-border space-y-0.5">
        {[
          { href: '/profile', icon: User, name: 'الملف الشخصي' },
          { href: '/settings', icon: Settings, name: 'الإعدادات' },
        ].map(item => (
          <Link onClick={() => isMobile && close()}
            key={item.href}
            to={item.href}
            title={!isOpen ? item.name : undefined}
            className={cn(
              'flex items-center gap-3 rounded-xl transition-all text-sm',
              !isOpen ? 'px-2 py-2.5 justify-center' : 'px-3 py-2.5',
              location.pathname === item.href
                ? 'bg-primary/15 text-primary shadow-sm'
                : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60'
            )}
          >
            <item.icon className="w-4 h-4 text-sidebar-foreground/50 flex-shrink-0" />
            {isOpen && <span>{item.name}</span>}
          </Link>
        ))}

        {/* Toggle Button */}
        <button
          onClick={toggle}
          title={isOpen ? 'طي الشريط الجانبي' : 'فتح الشريط الجانبي'}
          className={cn(
            'w-full flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all text-sm',
            !isOpen && 'justify-center px-2',
            'text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/60'
          )}
        >
          {isOpen ? (
            <>
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
              <span>طي الشريط</span>
            </>
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </motion.aside>
    </>
  );
}
