import { useState, useEffect } from 'react';
import { Moon, Sun, Bell, ChevronLeft, ChevronRight, Search, Music2, Radio, Menu } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '../ui/button';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { usePlayer } from '../../contexts/PlayerContext';
import { useSidebarState } from '../../contexts/SidebarContext';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { motion, AnimatePresence } from 'motion/react';
import { useIsMobile } from '../../hooks/useMobile';

const pageTitles: Record<string, string> = {
  '/home': 'الرئيسية',
  '/search': 'البحث',
  '/library': 'المكتبة',
  '/videos': 'الفيديوهات',
  '/albums': 'الألبومات',
  '/artists': 'الفنانون',
  '/bands': 'الفرق الموسيقية',
  '/poems': 'القصائد',
  '/poets': 'الشعراء',
  '/playlists': 'قوائم التشغيل',
  '/news': 'الأخبار',
  '/occasions': 'المناسبات',
  '/favorites': 'المفضلة',
  '/downloads': 'التنزيلات',
  '/profile': 'الملف الشخصي',
  '/settings': 'الإعدادات',
  '/now-playing': 'جاري التشغيل',
  '/songs': 'الزوامل والأناشيد',
};

export default function TopBar() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { currentTrack, isPlaying } = usePlayer();
  const { isOpen, toggle } = useSidebarState();
  const [showSearch, setShowSearch] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const isMobile = useIsMobile();

  // Global Cmd/Ctrl+K to open search (open-design style command discovery)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSearch(s => !s);
      }
      if (e.key === 'Escape' && showSearch) {
        setShowSearch(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showSearch]);

  const pageTitle = Object.entries(pageTitles).find(([path]) =>
    location.pathname === path || (path.length > 1 && location.pathname.startsWith(path + '/'))
  )?.[1] || '';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchVal.trim())}`);
      setShowSearch(false);
      setSearchVal('');
    }
  };

  const topBarRight = isMobile ? 0 : (isOpen ? 256 : 64);

  return (
    <motion.header
      animate={{ right: topBarRight }}
      transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
      className="fixed top-0 left-0 h-16 glass-panel z-40 transition-colors duration-300"
      style={{ right: topBarRight }}
    >
      <div className="flex items-center justify-between h-full px-5">
        {/* Left: Navigation + Sidebar Toggle + Page Title */}
        <div className="flex items-center gap-2">
          {/* Sidebar Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="rounded-xl hover:bg-accent w-9 h-9"
            title={isOpen ? 'إخفاء الشريط الجانبي' : 'إظهار الشريط الجانبي'}
          >
            <Menu className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-xl hover:bg-accent w-8 h-8"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(1)}
              className="rounded-xl hover:bg-accent w-8 h-8"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>

          {/* Page Title */}
          <AnimatePresence mode="wait">
            <motion.span
              key={location.pathname}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="text-sm font-medium text-foreground hidden sm:block"
            >
              {pageTitle}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Center: Search Bar / Now Playing */}
        <AnimatePresence>
          {showSearch ? (
            <motion.form
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleSearch}
              className="absolute left-1/2 -translate-x-1/2 w-80 max-w-full"
            >
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder="ابحث عن أغانٍ، زوامل، فنانين..."
                  className="w-full bg-input-background border border-border rounded-full pl-4 pr-10 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-[inset_0_1px_0_rgba(18,18,18,0.5)] transition-all"
                  autoFocus
                />
              </div>
            </motion.form>
          ) : (
            currentTrack && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => navigate('/now-playing')}
                className="hidden md:flex items-center gap-3 bg-muted/60 hover:bg-accent border border-border hover:border-primary/30 px-4 py-2 rounded-full transition-all group absolute left-1/2 -translate-x-1/2"
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={currentTrack.coverUrl}
                    alt={currentTrack.title}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  {isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                      <div className="flex items-end gap-px h-3">
                        {[2, 4, 3].map((h, i) => (
                          <motion.div
                            key={i}
                            animate={{ height: [`${h}px`, `${h + 2}px`, `${h}px`] }}
                            transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1 }}
                            className="w-0.5 bg-primary rounded-full"
                            style={{ height: `${h}px` }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-xs text-foreground max-w-32 truncate group-hover:text-primary transition-colors">
                  {currentTrack.title}
                </span>
                <Radio className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            )
          )}
        </AnimatePresence>

        {/* Right Section */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl hover:bg-accent w-9 h-9 hidden sm:flex items-center justify-center gap-px"
            onClick={() => setShowSearch(!showSearch)}
            title="بحث (Ctrl+K أو ⌘K)"
            aria-label="فتح البحث"
          >
            <Search className="w-4 h-4" />
            <span className="text-[9px] text-muted-foreground font-mono hidden xl:block ml-px">K</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-xl hover:bg-accent w-9 h-9"
            title={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
          >
            <AnimatePresence mode="wait">
              {theme === 'dark' ? (
                <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                  <Sun className="w-4 h-4 text-amber-500" />
                </motion.div>
              ) : (
                <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                  <Moon className="w-4 h-4 text-primary" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>

          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-accent w-9 h-9 relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full ring-2 ring-background" />
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full p-1 hover:bg-accent">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 max-w-full">
                <DropdownMenuLabel>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-primary text-primary-foreground">{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>الملف الشخصي</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/now-playing')}>
                  <Music2 className="w-4 h-4 ml-2" />
                  جاري التشغيل
                </DropdownMenuItem>
                {user.isArtist && (
                  <DropdownMenuItem onClick={() => navigate('/artist/dashboard')}>لوحة تحكم الفنان</DropdownMenuItem>
                )}
                {user.role === 'admin' && (
                  <DropdownMenuItem onClick={() => navigate('/admin/dashboard')}>لوحة الإدارة</DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => navigate('/settings')}>الإعدادات</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive">تسجيل الخروج</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => navigate('/login')} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5">
              دخول
            </Button>
          )}
        </div>
      </div>
    </motion.header>
  );
}
