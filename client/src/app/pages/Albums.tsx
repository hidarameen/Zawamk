import { useState } from 'react';
import { useDataStore } from '../store/dataStore';
import AlbumCard from '../components/cards/AlbumCard';
import { motion } from 'motion/react';
import { Disc3, Search, Grid3x3, LayoutList, TrendingUp, Music2 } from 'lucide-react';
import { cn } from '../components/ui/utils';

type SortType = 'date' | 'name' | 'tracks';

export default function Albums() {
  const { albums } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('date');
  const [viewSize, setViewSize] = useState<'sm' | 'lg'>('lg');

  const filtered = [...albums]
    .filter(a =>
      !searchQuery ||
      a.title.includes(searchQuery) ||
      a.artistName.includes(searchQuery) ||
      a.genre.includes(searchQuery)
    )
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
      if (sortBy === 'name') return a.title.localeCompare(b.title, 'ar');
      return b.totalTracks - a.totalTracks;
    });

  const totalDuration = albums.reduce((s, a) => s + (a.duration || 0), 0);
  const formatHours = (s: number) => `${Math.floor(s / 3600)} ساعة`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-400 rounded-xl flex items-center justify-center shadow-lg">
            <Disc3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-foreground">الألبومات</h1>
            <p className="text-sm text-muted-foreground">
              {albums.length} ألبوم · {formatHours(totalDuration)} من الموسيقى
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
          {[
            { icon: Disc3, label: 'الألبومات', value: albums.length.toString(), color: 'text-primary' },
            { icon: Music2, label: 'المقاطع', value: albums.reduce((s, a) => s + (a.totalTracks || 0), 0).toString(), color: 'text-green-500' },
            { icon: TrendingUp, label: 'الساعات', value: formatHours(totalDuration), color: 'text-amber-500' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
              <Icon className={cn("w-5 h-5 flex-shrink-0", color)} />
              <div>
                <p className="text-foreground font-semibold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap items-center gap-3"
      >
        {/* Search */}
        <div className="flex-1 min-w-52 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ابحث في الألبومات..."
            className="w-full bg-card border border-border rounded-xl pr-10 pl-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1">
          {[
            { val: 'date', label: 'الأحدث' },
            { val: 'name', label: 'الاسم' },
            { val: 'tracks', label: 'المقاطع' },
          ].map(s => (
            <button
              key={s.val}
              onClick={() => setSortBy(s.val as SortType)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm transition-all",
                sortBy === s.val
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* View Size */}
        <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1">
          <button
            onClick={() => setViewSize('lg')}
            className={cn("p-2 rounded-lg transition-all", viewSize === 'lg' ? 'bg-primary/10 text-primary' : 'text-muted-foreground')}
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewSize('sm')}
            className={cn("p-2 rounded-lg transition-all", viewSize === 'sm' ? 'bg-primary/10 text-primary' : 'text-muted-foreground')}
          >
            <LayoutList className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Albums Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={cn(
          "grid gap-4",
          viewSize === 'lg'
            ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            : "grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8"
        )}
      >
        {filtered.map((album, i) => (
          <motion.div
            key={album.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <AlbumCard album={album} />
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <Disc3 className="w-14 h-14 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">لا توجد ألبومات مطابقة للبحث</p>
          <button onClick={() => setSearchQuery('')} className="mt-3 text-primary text-sm hover:underline">
            مسح البحث
          </button>
        </motion.div>
      )}
    </div>
  );
}
