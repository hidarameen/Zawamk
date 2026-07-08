import { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Track } from '../contexts/PlayerContext';
import { usePlayer } from '../contexts/PlayerContext';
import { useAuth } from '../contexts/AuthContext';
import { useDataStore } from '../store/dataStore';
import { cn } from '../components/ui/utils';
import { EqualizerBars } from '../components/ui/EqualizerBars';
import {
  Play, Pause, Search, Grid3x3, List, Heart, Eye, Clock, Music,
  Filter, X, SortDesc, MoreHorizontal, ListPlus, TrendingUp,
  Disc, Mic2, Feather, CalendarDays, UsersRound, Flame,
  ChevronDown, ChevronUp, Music2, Shuffle, Check, Star,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import SongGridCard from '../components/cards/SongGridCard';


// ============ Type Badge Config ============
import { TYPE_CONFIG, ALL_TYPES } from '../../constants/trackTypes';

// ============ Helper Functions ============
const formatNum = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}م`;
  if (n >= 1_000)     return `${Math.round(n / 1_000)}ك`;
  return n.toString();
};

const formatTime = (s: number): string =>
  `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

// ============ Filter State ============
interface Filters {
  types: string[];
  artistIds: string[];
  poetIds: string[];
  bandIds: string[];
  albumIds: string[];
  occasionIds: string[];
  years: number[];
}

const EMPTY_FILTERS: Filters = {
  types: [], artistIds: [], poetIds: [], bandIds: [],
  albumIds: [], occasionIds: [], years: [],
};

type SortType = 'views' | 'newest' | 'oldest' | 'likes' | 'az' | 'duration';

const SORT_OPTIONS: { val: SortType; label: string }[] = [
  { val: 'views',    label: 'الأكثر مشاهدة' },
  { val: 'newest',   label: 'الأحدث' },
  { val: 'likes',    label: 'الأكثر إعجاباً' },
  { val: 'az',       label: 'أبجدي' },
  { val: 'oldest',   label: 'الأقدم' },
  { val: 'duration', label: 'المدة' },
];

// ============ Sub Components ============
function TypeBadge({ type }: { type?: string }) {
  if (!type) return null;
  const cfg = TYPE_CONFIG[type] || { color: 'text-muted-foreground', bg: 'bg-muted border-border' };
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border', cfg.bg, cfg.color)}>
      {type}
    </span>
  );
}



function FilterPill({
  label, active, onClick, color,
}: {
  label: string; active: boolean; onClick: () => void; color?: string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-full text-xs border transition-all flex items-center gap-1.5',
        active
          ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20'
          : color || 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground',
      )}
    >
      {active && <Check className="w-3 h-3" />}
      {label}
    </motion.button>
  );
}

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-full text-xs">
      {label}
      <button onClick={onRemove} className="hover:bg-primary/20 rounded-full p-0.5 transition-colors">
        <X className="w-2.5 h-2.5" />
      </button>
    </span>
  );
}

function FilterSection({
  title, icon, children, count,
}: {
  title: string; icon: React.ReactNode; children: React.ReactNode; count?: number;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-sm text-foreground mb-2.5 w-full group"
      >
        <span className="text-primary">{icon}</span>
        <span className="font-medium">{title}</span>
        {count ? <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{count}</span> : null}
        <span className="mr-auto text-muted-foreground group-hover:text-foreground transition-colors">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
      {displayCount < filteredTracks.length && (
        <div ref={observerRef} className="h-20 flex items-center justify-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin" /></div>
      )}
    </div>
  );
}

// ============ Song List Row ============
function SongListRow({
  track, index, isCurrentTrack, isPlayingNow, onPlay, onAddQueue, onLike, isLiked,
}: {
  track: Track; index: number; isCurrentTrack: boolean; isPlayingNow: boolean;
  onPlay: () => void; onAddQueue: () => void; onLike: () => void; isLiked: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.3), duration: 0.3 }}
      onClick={onPlay}
      className={cn(
        'group grid items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all',
        'grid-cols-[24px_40px_1fr_auto]',
        'md:grid-cols-[32px_44px_1fr_140px_120px_60px_70px_80px]',
        isCurrentTrack
          ? 'bg-primary/5 border-primary/30'
          : 'bg-card border-border hover:border-primary/20 hover:bg-accent/30',
      )}
    >
      {/* Index / Equalizer */}
      <div className="flex items-center justify-center w-6 md:w-8">
        {isCurrentTrack
          ? <EqualizerBars playing={isPlayingNow} />
          : (
            <>
              <span className="text-[10px] md:text-xs text-muted-foreground group-hover:hidden">{index + 1}</span>
              <Play className="w-3 md:w-3.5 h-3 md:h-3.5 text-primary fill-current hidden group-hover:block" />
            </>
          )
        }
      </div>

      {/* Cover */}
      <div className="relative w-10 h-10 md:w-11 md:h-11 rounded-lg overflow-hidden flex-shrink-0">
        <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
        {isCurrentTrack && isPlayingNow && (
          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
          </div>
        )}
      </div>

      {/* Title + Artist + Badges */}
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn(
            'text-sm font-medium truncate',
            isCurrentTrack ? 'text-primary' : 'text-foreground group-hover:text-primary transition-colors',
          )}>
            {track.title}
          </span>
          <TypeBadge type={track.type} />
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <Link
            to={`/artists/${track.artistId}`}
            onClick={e => e.stopPropagation()}
            className="text-xs text-muted-foreground hover:text-primary transition-colors truncate"
          >
            {track.artistName}
          </Link>
          {track.bandName && (
            <>
              <span className="text-muted-foreground/40 text-xs">·</span>
              <span className="text-xs text-muted-foreground/60 truncate">{track.bandName}</span>
            </>
          )}
        </div>
      </div>

      {/* Poet */}
      <div className="hidden md:block min-w-0">
        {track.poetId ? (
          <Link
            to={`/poet/${track.poetId}`}
            onClick={e => e.stopPropagation()}
            className="text-xs text-muted-foreground hover:text-primary transition-colors truncate block"
          >
            {track.poetName}
          </Link>
        ) : (
          <span className="text-xs text-muted-foreground/40">—</span>
        )}
      </div>

      {/* Occasion */}
      <div className="hidden md:block min-w-0">
        {track.occasionId ? (
          <Link
            to={`/occasions/${track.occasionId}`}
            onClick={e => e.stopPropagation()}
            className="text-xs text-muted-foreground hover:text-primary transition-colors truncate block"
          >
            {track.occasionName}
          </Link>
        ) : (
          <span className="text-xs text-muted-foreground/40">—</span>
        )}
      </div>

      {/* Year */}
      <div className="hidden md:flex justify-center">
        <span className="text-xs text-muted-foreground">{track.releaseYear || '—'}</span>
      </div>

      {/* Duration */}
      <div className="hidden md:flex justify-center">
        <span className="text-xs text-muted-foreground font-mono">{formatTime(track.duration)}</span>
      </div>

      {/* Views + Actions */}
      <div className="flex items-center gap-2 justify-end">
        <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
          <Eye className="w-3 h-3" />
          <span>{formatNum(track.views || 0)}</span>
        </div>
        <div className="flex items-center gap-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity pointer-events-auto md:pointer-events-none md:group-hover:pointer-events-auto">
          <button
            onClick={e => { e.stopPropagation(); onLike(); }}
            className={cn('p-1.5 rounded-full hover:bg-accent transition-colors', isLiked && 'text-red-500')}
          >
            <Heart className={cn('w-3.5 h-3.5', isLiked && 'fill-current')} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onAddQueue(); }}
            className="p-1.5 rounded-full hover:bg-accent transition-colors text-muted-foreground"
          >
            <ListPlus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ============ Main Songs Page ============
export default function Songs() {
  const { poets, bands, occasions, tracks, artists } = useDataStore();
  const { currentTrack, isPlaying, setPlaylist, addToQueue, pause, resume } = usePlayer();
  const { user, likeSong } = useAuth();

  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortType>('views');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  // Unique years from data
  const uniqueYears = useMemo(() => {
    const ys = tracks.map(t => t.releaseYear).filter(Boolean) as number[];
    return [...new Set(ys)].sort((a, b) => b - a);
  }, [tracks]);

  // Count active filters
  const activeFilterCount = useMemo(
    () => Object.values(filters).reduce((s, a) => s + a.length, 0),
    [filters],
  );

  // Filtered + sorted tracks
  const filteredTracks = useMemo(() => {
    let list = [...tracks];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.artistName.toLowerCase().includes(q) ||
        t.poetName?.toLowerCase().includes(q) ||
        t.occasionName?.toLowerCase().includes(q) ||
        t.albumName.toLowerCase().includes(q) ||
        t.type?.toLowerCase().includes(q) ||
        t.bandName?.toLowerCase().includes(q),
      );
    }

    if (filters.types.length)      list = list.filter(t => t.type && filters.types.includes(t.type));
    if (filters.artistIds.length)  list = list.filter(t => filters.artistIds.includes(t.artistId));
    if (filters.poetIds.length)    list = list.filter(t => t.poetId && filters.poetIds.includes(t.poetId));
    if (filters.bandIds.length)    list = list.filter(t => t.bandId && filters.bandIds.includes(t.bandId!));
    if (filters.albumIds.length)   list = list.filter(t => filters.albumIds.includes(t.albumId));
    if (filters.occasionIds.length)list = list.filter(t => t.occasionId && filters.occasionIds.includes(t.occasionId));
    if (filters.years.length)      list = list.filter(t => t.releaseYear && filters.years.includes(t.releaseYear));

    return list.sort((a, b) => {
      let diff = 0;
      switch (sortBy) {
        case 'views':    diff = (b.views || 0) - (a.views || 0); break;
        case 'newest': {
          const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          diff = bDate - aDate;
          break;
        }
        case 'oldest': {
          const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          diff = aDate - bDate;
          break;
        }
        case 'likes':    diff = (b.likes || 0) - (a.likes || 0); break;
        case 'az':       diff = a.title.localeCompare(b.title, 'ar'); break;
        case 'duration': diff = b.duration - a.duration; break;
      }
      if (diff !== 0) return diff;
      return a.id.localeCompare(b.id);
    });
  }, [searchQuery, filters, sortBy]);

  const toggleFilter = <K extends keyof Filters>(key: K, value: Filters[K][number]) => {
    setFilters(prev => {
      const arr = prev[key] as (string | number)[];
      const has = arr.includes(value as string | number);
      return {
        ...prev,
        [key]: has
          ? arr.filter(v => v !== value)
          : [...arr, value],
      };
    });
  };

  const clearAll = () => { setFilters(EMPTY_FILTERS); setSearchQuery(''); };

  const handlePlay = (track: Track, index: number) => {
    if (currentTrack?.id === track.id) {
      isPlaying ? pause() : resume();
    } else {
      setPlaylist(filteredTracks, index);
    }
  };

  const handleLike = (trackId: string) => {
    if (!user) return;
    likeSong(trackId);
  };

  const totalViews = tracks.reduce((s, t) => s + (t.views || 0), 0);
  const topTrack = [...tracks].sort((a, b) => (b.views || 0) - (a.views || 0))[0];

  // Count unique years per type
  const typeCounts: Record<string, number> = {};
  tracks.forEach(t => { if (t.type) typeCounts[t.type] = (typeCounts[t.type] || 0) + 1; });


  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayCount < filteredTracks.length) {
          setDisplayCount(prev => prev + 50);
        }
      },
      { threshold: 0.1 }
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [filteredTracks.length, displayCount]);

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(50);
  }, [searchQuery, filters]);
  return (
    <div className="space-y-6 pb-4">
      {/* ======== Hero ======== */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 40%, #7c3aed 70%, #8b5cf6 100%)' }}
      >
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '28px 28px' }}
        />
        {/* Glow circles */}
        <div className="absolute -top-20 -left-20 w-64 h-48 md:h-64 bg-white/10 rounded-full blur-3xl max-w-full" />
        <div className="absolute -bottom-10 right-10 w-40 h-40 bg-violet-300/20 rounded-full blur-2xl" />

        <div className="relative p-6 md:p-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl">
                  <Music2 className="w-7 h-7 text-foreground" />
                </div>
                <div>
                  <h1 className="text-foreground text-2xl">الزوامل والأناشيد</h1>
                  <p className="text-muted-foreground text-sm mt-0.5">جميع الأعمال الفنية · مرتبطة بالفنان والشاعر والمناسبة</p>
                </div>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2">
                  <Music2 className="w-4 h-4 text-secondary-foreground" />
                  <span className="text-foreground font-bold">{tracks.length}</span>
                  <span className="text-muted-foreground text-sm">زامل</span>
                </div>
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2">
                  <Eye className="w-4 h-4 text-secondary-foreground" />
                  <span className="text-foreground font-bold">{formatNum(totalViews)}</span>
                  <span className="text-muted-foreground text-sm">مشاهدة</span>
                </div>
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2">
                  <Star className="w-4 h-4 text-amber-300" />
                  <span className="text-foreground font-bold">{ALL_TYPES.length}</span>
                  <span className="text-muted-foreground text-sm">نوع فني</span>
                </div>
                <div className="hidden md:flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2">
                  <Flame className="w-4 h-4 text-orange-300" />
                  <span className="text-foreground text-sm truncate max-w-36">{topTrack?.title}</span>
                  <span className="text-muted-foreground text-xs">الأعلى</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                onClick={() => setPlaylist([...tracks].sort((a, b) => (b.views || 0) - (a.views || 0)), 0)}
                className="bg-white text-primary hover:bg-white/90 gap-2 rounded-full px-5 shadow-xl"
              >
                <Play className="w-4 h-4 fill-current" />
                تشغيل الكل
              </Button>
              <Button
                onClick={() => {
                  const shuffled = [...filteredTracks].sort(() => Math.random() - 0.5);
                  setPlaylist(shuffled, 0);
                }}
                variant="outline"
                className="border-white/30 text-foreground hover:bg-secondary gap-2 rounded-full px-4"
              >
                <Shuffle className="w-4 h-4" />
                عشوائي
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ======== Type Quick Filters (always visible) ======== */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none"
      >
        <button
          onClick={() => setFilters(f => ({ ...f, types: [] }))}
          className={cn(
            'flex-shrink-0 px-4 py-2 rounded-full text-sm border transition-all',
            filters.types.length === 0
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card text-muted-foreground border-border hover:border-primary/40',
          )}
        >
          الكل ({tracks.length})
        </button>
        {ALL_TYPES.map(type => {
          const cfg = TYPE_CONFIG[type];
          const active = filters.types.includes(type);
          return (
            <button
              key={type}
              onClick={() => toggleFilter('types', type)}
              className={cn(
                'flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm border transition-all',
                active
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : `${cfg.bg} ${cfg.color} hover:opacity-80`,
              )}
            >
              {active && <Check className="w-3.5 h-3.5" />}
              {type}
              <span className={cn('text-[10px] opacity-70', active ? '' : '')}>{typeCounts[type] || 0}</span>
            </button>
          );
        })}
      </motion.div>

      {/* ======== Controls Bar ======== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex flex-wrap items-center gap-3"
      >
        {/* Search */}
        <div className="flex-1 min-w-56 relative">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ابحث بالعنوان، الفنان، الشاعر، المناسبة، النوع..."
            className="w-full bg-card border border-border rounded-xl pr-10 pl-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-muted hover:bg-accent rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(f => !f)}
          className={cn(
            'relative flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-all',
            showFilters
              ? 'bg-primary/10 border-primary/50 text-primary'
              : 'bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
          )}
        >
          <Filter className="w-4 h-4" />
          <span>الفلاتر</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Sort dropdown */}
        <div className="relative" ref={sortMenuRef}>
          <button
            onClick={() => setShowSortMenu(s => !s)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all"
          >
            <SortDesc className="w-4 h-4" />
            <span className="hidden sm:inline">{SORT_OPTIONS.find(s => s.val === sortBy)?.label}</span>
            <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', showSortMenu && 'rotate-180')} />
          </button>
          <AnimatePresence>
            {showSortMenu && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                className="absolute top-full left-0 mt-1.5 w-44 bg-card border border-border rounded-xl shadow-xl z-30 overflow-hidden"
              >
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.val}
                    onClick={() => { setSortBy(opt.val); setShowSortMenu(false); }}
                    className={cn(
                      'flex items-center justify-between gap-2 w-full px-4 py-2.5 text-sm transition-colors',
                      sortBy === opt.val
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground hover:bg-accent/50',
                    )}
                  >
                    <span>{opt.label}</span>
                    {sortBy === opt.val && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
      {displayCount < filteredTracks.length && (
        <div ref={observerRef} className="h-20 flex items-center justify-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin" /></div>
      )}
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1">
          <button
            onClick={() => setViewType('grid')}
            className={cn(
              'p-2 rounded-lg transition-all',
              viewType === 'grid' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground',
            )}
            title="عرض شبكي"
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewType('list')}
            className={cn(
              'p-2 rounded-lg transition-all',
              viewType === 'list' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground',
            )}
            title="عرض قائمة"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* ======== Advanced Filter Panel ======== */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-card border border-border rounded-2xl p-5 space-y-5">

              <FilterSection title="الفنان / المنشد" icon={<Mic2 className="w-4 h-4" />} count={filters.artistIds.length || undefined}>
                <div className="flex flex-wrap gap-2">
                  {artists.map(a => (
                    <FilterPill
                      key={a.id} label={a.name}
                      active={filters.artistIds.includes(a.id)}
                      onClick={() => toggleFilter('artistIds', a.id)}
                    />
                  ))}
                </div>
              </FilterSection>

              <div className="border-t border-border" />

              <FilterSection title="الشاعر" icon={<Feather className="w-4 h-4" />} count={filters.poetIds.length || undefined}>
                <div className="flex flex-wrap gap-2">
                  {poets.map(p => (
                    <FilterPill
                      key={p.id} label={p.name}
                      active={filters.poetIds.includes(p.id)}
                      onClick={() => toggleFilter('poetIds', p.id)}
                    />
                  ))}
                </div>
              </FilterSection>

              <div className="border-t border-border" />

              <FilterSection title="المناسبة" icon={<CalendarDays className="w-4 h-4" />} count={filters.occasionIds.length || undefined}>
                <div className="flex flex-wrap gap-2">
                  {occasions.map(o => (
                    <FilterPill
                      key={o.id} label={o.title}
                      active={filters.occasionIds.includes(o.id)}
                      onClick={() => toggleFilter('occasionIds', o.id)}
                    />
                  ))}
                </div>
              </FilterSection>

              <div className="border-t border-border" />

              <FilterSection title="الألبوم" icon={<Disc className="w-4 h-4" />} count={filters.albumIds.length || undefined}>
                <div className="flex flex-wrap gap-2">
                  {mockAlbums.map(al => (
                    <FilterPill
                      key={al.id} label={`${al.title} · ${al.artistName}`}
                      active={filters.albumIds.includes(al.id)}
                      onClick={() => toggleFilter('albumIds', al.id)}
                    />
                  ))}
                </div>
              </FilterSection>

              <div className="border-t border-border" />

              <FilterSection title="الفرقة الموسيقية" icon={<UsersRound className="w-4 h-4" />} count={filters.bandIds.length || undefined}>
                <div className="flex flex-wrap gap-2">
                  {bands.map(b => (
                    <FilterPill
                      key={b.id} label={b.name}
                      active={filters.bandIds.includes(b.id)}
                      onClick={() => toggleFilter('bandIds', b.id)}
                    />
                  ))}
                </div>
              </FilterSection>

              <div className="border-t border-border" />

              <FilterSection title="سنة الإصدار" icon={<Clock className="w-4 h-4" />} count={filters.years.length || undefined}>
                <div className="flex flex-wrap gap-2">
                  {uniqueYears.map(y => (
                    <FilterPill
                      key={y} label={y.toString()}
                      active={filters.years.includes(y)}
                      onClick={() => toggleFilter('years', y)}
                    />
                  ))}
                </div>
              </FilterSection>

              {activeFilterCount > 0 && (
                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {activeFilterCount} فلتر نشط · {filteredTracks.length} نتيجة
                  </span>
                  <Button variant="ghost" onClick={clearAll} className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 text-sm">
                    <X className="w-4 h-4" />
                    مسح جميع الفلاتر
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {displayCount < filteredTracks.length && (
        <div ref={observerRef} className="h-20 flex items-center justify-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin" /></div>
      )}

      {/* ======== Active Filter Chips (when panel is closed) ======== */}
      {activeFilterCount > 0 && !showFilters && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 flex-wrap"
        >
          <span className="text-xs text-muted-foreground flex-shrink-0">الفلاتر:</span>
          {filters.types.map(t => (
            <ActiveChip key={t} label={t} onRemove={() => toggleFilter('types', t)} />
          ))}
          {filters.artistIds.map(id => {
            const a = mockArtists.find(x => x.id === id);
            return a ? <ActiveChip key={id} label={a.name} onRemove={() => toggleFilter('artistIds', id)} /> : null;
          })}
          {filters.poetIds.map(id => {
            const p = poets.find(x => x.id === id);
            return p ? <ActiveChip key={id} label={p.name} onRemove={() => toggleFilter('poetIds', id)} /> : null;
          })}
          {filters.occasionIds.map(id => {
            const o = occasions.find(x => x.id === id);
            return o ? <ActiveChip key={id} label={o.title} onRemove={() => toggleFilter('occasionIds', id)} /> : null;
          })}
          {filters.albumIds.map(id => {
            const al = mockAlbums.find(x => x.id === id);
            return al ? <ActiveChip key={id} label={al.title} onRemove={() => toggleFilter('albumIds', id)} /> : null;
          })}
          {filters.bandIds.map(id => {
            const b = bands.find(x => x.id === id);
            return b ? <ActiveChip key={id} label={b.name} onRemove={() => toggleFilter('bandIds', id)} /> : null;
          })}
          {filters.years.map(y => (
            <ActiveChip key={y} label={y.toString()} onRemove={() => toggleFilter('years', y)} />
          ))}
          <button onClick={clearAll} className="text-xs text-destructive hover:underline">
            مسح الكل
          </button>
        </motion.div>
      )}

      {/* ======== Results Bar ======== */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          عرض{' '}
          <span className="text-foreground font-medium">{filteredTracks.length}</span>
          {(activeFilterCount > 0 || searchQuery) ? ` من أصل ${mockTracks.length}` : ''} زامل
        </p>
        <div className="flex items-center gap-2">
          {filteredTracks.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPlaylist(filteredTracks, 0)}
              className="gap-1.5 text-primary hover:bg-primary/10 rounded-full"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              تشغيل النتائج
            </Button>
          )}
        </div>
      </div>

      {/* ======== Content ======== */}
      <AnimatePresence mode="wait">
        {viewType === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
          >
            {filteredTracks.slice(0, displayCount).map((track, i) => (
              <SongGridCard
                key={track.id}
                track={track}
                index={i}
                isCurrentTrack={currentTrack?.id === track.id}
                isPlayingNow={isPlaying}
                onPlay={() => handlePlay(track, i)}
                onAddQueue={() => addToQueue(track)}
                onLike={() => handleLike(track.id)}
                isLiked={user?.likedSongs.includes(track.id) ?? false}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-1.5"
          >
            {/* Header */}
            <div className="hidden md:grid grid-cols-[32px_44px_1fr_140px_120px_60px_70px_80px] gap-3 px-4 py-2 text-xs text-muted-foreground uppercase tracking-wide border-b border-border">
              <span>#</span>
              <span></span>
              <span>العنوان</span>
              <span>الشاعر</span>
              <span>المناسبة</span>
              <span className="text-center">السنة</span>
              <span className="text-center">المدة</span>
              <span className="text-left">المشاهدات</span>
            </div>
            {filteredTracks.slice(0, displayCount).map((track, i) => (
              <SongListRow
                key={track.id}
                track={track}
                index={i}
                isCurrentTrack={currentTrack?.id === track.id}
                isPlayingNow={isPlaying}
                onPlay={() => handlePlay(track, i)}
                onAddQueue={() => addToQueue(track)}
                onLike={() => handleLike(track.id)}
                isLiked={user?.likedSongs.includes(track.id) ?? false}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      {displayCount < filteredTracks.length && (
        <div ref={observerRef} className="h-20 flex items-center justify-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin" /></div>
      )}

      {/* ======== Empty State ======== */}
      {filteredTracks.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="w-24 h-24 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-inner">
            <Music2 className="w-12 h-12 text-muted-foreground/50" />
          </div>
          <h3 className="text-foreground mb-2">لا توجد نتائج</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
            جرّب تغيير مصطلح البحث أو الفلاتر للعثور على ما تبحث عنه
          </p>
          <div className="flex items-center justify-center gap-3">
            {searchQuery && (
              <Button variant="outline" className="rounded-full" onClick={() => setSearchQuery('')}>
                مسح البحث
              </Button>
            )}
            {activeFilterCount > 0 && (
              <Button className="rounded-full gap-2" onClick={clearAll}>
                <X className="w-4 h-4" />
                مسح الفلاتر
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
