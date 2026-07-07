import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play, Eye, Clock, Search, Grid3x3, List, Star,
  Flame, ChevronLeft, Filter, SortDesc, TrendingUp,
  Video, Clapperboard,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { cn } from '../components/ui/utils';
import { useDataStore } from "../../app/store/dataStore";

type SortType = 'views' | 'date' | 'duration';
type FilterType = 'all' | 'clips' | 'live' | 'recitation';
type ViewType = 'grid' | 'list';

const filterLabels: Record<FilterType, string> = {
  all: 'الكل',
  clips: 'كليبات',
  live: 'حفلات مباشرة',
  recitation: 'تلاوات',
};

const getFilterForVideo = (title: string): FilterType => {
  if (title.includes('Live') || title.includes('مباشر') || title.includes('حفل')) return 'live';
  if (title.includes('تلاوة') || title.includes('قرآن')) return 'recitation';
  return 'clips';
};

export default function Videos() {
    const { videos } = useDataStore();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('views');
  const [viewType, setViewType] = useState<ViewType>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const formatViews = (v?: number) =>
    (v || 0) >= 1_000_000 ? `${((v || 0) / 1_000_000).toFixed(1)}M` : `${((v || 0) / 1_000).toFixed(0)}K`;
  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const featuredVideo = videos.length > 0 
    ? videos.reduce((max, v) => (v.views || 0) > (max.views || 0) ? v : max, videos[0])
    : null;

  const filteredVideos = useMemo(() => {
    let list = videos;
    if (activeFilter !== 'all') {
      list = list.filter(v => getFilterForVideo(v.title) === activeFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(v =>
        (v.title || '').toLowerCase().includes(q) || (v.artistName || '').toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      if (sortBy === 'views') return (b.views || 0) - (a.views || 0);
      if (sortBy === 'date') {
        const da = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
        const db = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
        return db - da;
      }
      return (b.duration || 0) - (a.duration || 0);
    });
  }, [activeFilter, searchQuery, sortBy]);

  const totalViews = videos.reduce((s, v) => s + (v.views || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-400 rounded-xl flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-foreground">الفيديوهات الموسيقية</h1>
              <p className="text-sm text-muted-foreground">
                {videos.length} فيديو · {formatViews(totalViews)} مشاهدة إجمالية
              </p>
            </div>
          </div>
        </div>

        {/* Stats Pills */}
        <div className="hidden md:flex items-center gap-3">
          {featuredVideo && (
            <div className="flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-xl">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-foreground">{formatViews(featuredVideo.views || 0)}</span>
              <span className="text-xs text-muted-foreground">أعلى مشاهدة</span>
            </div>
          )}
          <div className="flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-xl">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm text-foreground">{videos.length}</span>
            <span className="text-xs text-muted-foreground">فيديو</span>
          </div>
        </div>
      </motion.div>

      {/* Featured Video Hero */}
      {featuredVideo && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onClick={() => navigate(`/videos/${featuredVideo.id}`)}
        className="relative h-80 md:h-96 rounded-3xl overflow-hidden cursor-pointer group shadow-2xl"
      >
        <img
          src={featuredVideo.thumbnailUrl}
          alt={featuredVideo.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-transparent" />

        {/* Featured Badge */}
        <div className="absolute top-5 right-5">
          <span className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-full shadow-lg">
            <Star className="w-3.5 h-3.5 fill-current" />
            الأكثر مشاهدة
          </span>
        </div>

        {/* Duration Badge */}
        <div className="absolute top-5 left-5">
          <span className="bg-black/70 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-full font-mono">
            {formatTime(featuredVideo.duration)}
          </span>
        </div>

        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-20 h-20 bg-primary/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl group-hover:bg-primary transition-colors"
          >
            <Play className="w-9 h-9 text-white fill-white ml-1" />
          </motion.div>
        </div>

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <p className="text-secondary-foreground text-sm mb-2">{featuredVideo.artistName}</p>
          <h2 className="text-white mb-3 leading-tight">{featuredVideo.title}</h2>
          <div className="flex items-center gap-4 text-muted-foreground text-sm">
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              {formatViews(featuredVideo.views)} مشاهدة
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {featuredVideo.releaseDate ? new Date(featuredVideo.releaseDate).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' }) : ''}
            </span>
          </div>
        </div>
      </motion.div>
      )}

      {/* Controls Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap items-center gap-3"
      >
        {/* Search */}
        <div className="flex-1 min-w-52 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ابحث في الفيديوهات..."
            className="w-full bg-card border border-border rounded-xl pr-10 pl-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 bg-card border border-border rounded-xl p-1">
          {(Object.keys(filterLabels) as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm transition-all",
                activeFilter === f
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              )}
            >
              {filterLabels[f]}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1">
          <SortDesc className="w-4 h-4 text-muted-foreground mr-1" />
          {[
            { val: 'views', label: 'المشاهدات' },
            { val: 'date', label: 'الأحدث' },
            { val: 'duration', label: 'المدة' },
          ].map(s => (
            <button
              key={s.val}
              onClick={() => setSortBy(s.val as SortType)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm transition-all",
                sortBy === s.val
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1">
          <button
            onClick={() => setViewType('grid')}
            className={cn("p-2 rounded-lg transition-all", viewType === 'grid' ? 'bg-primary/10 text-primary' : 'text-muted-foreground')}
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewType('list')}
            className={cn("p-2 rounded-lg transition-all", viewType === 'list' ? 'bg-primary/10 text-primary' : 'text-muted-foreground')}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          عرض <span className="text-foreground font-medium">{filteredVideos.length}</span> فيديو
        </p>
      </div>

      {/* Videos Grid */}
      <AnimatePresence mode="wait">
        {viewType === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 md:grid-cols-4 gap-5"
          >
            {filteredVideos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                whileHover={{ y: -4 }}
                className="group cursor-pointer"
                onClick={() => navigate(`/videos/${video.id}`)}
                onMouseEnter={() => setHoveredId(video.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Thumbnail */}
                <div className="relative rounded-2xl overflow-hidden mb-3 shadow-lg group-hover:shadow-xl transition-shadow">
                  <div className="aspect-video">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Hover Overlay */}
                  <AnimatePresence>
                    {hoveredId === video.id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center"
                      >
                        <motion.div
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-2xl"
                        >
                          <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Duration Badge */}
                  <div className="absolute bottom-2.5 left-2.5">
                    <span className="bg-black/85 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg font-mono">
                      {formatTime(video.duration)}
                    </span>
                  </div>

                  {/* HD Badge */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="bg-primary/90 text-white text-[10px] px-1.5 py-0.5 rounded-md font-bold">HD</span>
                  </div>

                  {/* Progress bar simulation */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="h-full bg-primary" style={{ width: '0%' }} />
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-1.5">
                  <h3 className="text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug text-sm">
                    {video.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">{video.artistName}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {formatViews(video.views)}
                    </span>
                    <span>·</span>
                    <span>{video.releaseDate ? new Date(video.releaseDate).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short' }) : ''}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {filteredVideos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 4 }}
                onClick={() => navigate(`/videos/${video.id}`)}
                className="group flex items-center gap-4 bg-card border border-border hover:border-primary/30 rounded-2xl p-4 cursor-pointer transition-all hover:shadow-md"
              >
                <div className="relative w-36 flex-shrink-0 rounded-xl overflow-hidden aspect-video">
                  <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 flex items-center justify-center transition-colors">
                    <Play className="w-7 h-7 text-white fill-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="absolute bottom-1 left-1 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                    {formatTime(video.duration)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-foreground group-hover:text-primary transition-colors truncate">{video.title}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{video.artistName}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{formatViews(video.views)} مشاهدة</span>
                    <span>·</span>
                    <span>{video.releaseDate ? new Date(video.releaseDate).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' }) : ''}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="default" size="sm" className="rounded-full bg-primary text-primary-foreground gap-1.5">
                    <Play className="w-3.5 h-3.5 fill-current" />
                    مشاهدة
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {filteredVideos.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Clapperboard className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-foreground mb-2">لا توجد نتائج</h3>
          <p className="text-muted-foreground text-sm">جرّب تغيير مصطلح البحث أو الفلتر</p>
          <Button
            variant="outline"
            className="mt-4 rounded-full"
            onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}
          >
            إعادة ضبط الفلاتر
          </Button>
        </motion.div>
      )}
    </div>
  );
}
