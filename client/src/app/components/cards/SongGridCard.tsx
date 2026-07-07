import { useState } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Heart, Eye, ListPlus } from 'lucide-react';
import { Track } from '../../contexts/PlayerContext';
import { cn } from '../ui/utils';

// ============ Type Badge Config ============
const TYPE_CONFIG: Record<string, { color: string; bg: string }> = {
  'نشيد':    { color: 'text-violet-700 dark:text-violet-300',  bg: 'bg-violet-100 dark:bg-violet-900/40 border-violet-200 dark:border-violet-700/50' },
  'زامل':    { color: 'text-amber-700 dark:text-amber-300',    bg: 'bg-amber-100 dark:bg-amber-900/40 border-amber-200 dark:border-amber-700/50' },
  'مدح':     { color: 'text-emerald-700 dark:text-emerald-300',bg: 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-700/50' },
  'ابتهال':  { color: 'text-sky-700 dark:text-sky-300',        bg: 'bg-sky-100 dark:bg-sky-900/40 border-sky-200 dark:border-sky-700/50' },
  'موشح':    { color: 'text-rose-700 dark:text-rose-300',      bg: 'bg-rose-100 dark:bg-rose-900/40 border-rose-200 dark:border-rose-700/50' },
  'قصيدة':   { color: 'text-orange-700 dark:text-orange-300',  bg: 'bg-orange-100 dark:bg-orange-900/40 border-orange-200 dark:border-orange-700/50' },
  'أنشودة':  { color: 'text-teal-700 dark:text-teal-300',      bg: 'bg-teal-100 dark:bg-teal-900/40 border-teal-200 dark:border-teal-700/50' },
  'تواشيح':  { color: 'text-indigo-700 dark:text-indigo-300',  bg: 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-200 dark:border-indigo-700/50' },
};

const formatNum = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}م`;
  if (n >= 1_000)     return `${Math.round(n / 1_000)}ك`;
  return n.toString();
};

const formatTime = (s: number): string =>
  `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

function EqualizerBars({ playing }: { playing: boolean }) {
  return (
    <div className="flex items-end gap-0.5 h-4 w-4">
      {[3, 5, 4, 6, 3].map((h, i) => (
        <motion.div
          key={i}
          animate={playing ? { height: [`${h}px`, `${h + 5}px`, `${h}px`] } : { height: '3px' }}
          transition={{ duration: 0.4 + i * 0.1, repeat: Infinity, delay: i * 0.08 }}
          className="flex-1 bg-primary rounded-full"
        />
      ))}
    </div>
  );
}

export default function SongGridCard({
  track, index, isCurrentTrack, isPlayingNow, onPlay, onAddQueue, onLike, isLiked,
}: {
  track: Track; index?: number; isCurrentTrack: boolean; isPlayingNow: boolean;
  onPlay: () => void; onAddQueue?: () => void; onLike?: () => void; isLiked?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const typeCfg = track.type ? TYPE_CONFIG[track.type] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index || 0) * 0.04, duration: 0.35 }}
      whileHover={{ y: -2 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'group bg-card rounded-2xl border overflow-hidden cursor-pointer transition-all duration-200 focus-within:ring-2 focus-within:ring-primary/40 outline-none h-full flex flex-col',
        isCurrentTrack
          ? 'border-primary/50 shadow-md shadow-primary/10'
          : 'border-border hover:border-primary/30 hover:shadow-md',
      )}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPlay(); } }}
    >
      {/* Cover */}
      <div className="relative aspect-square overflow-hidden" onClick={onPlay}>
        <motion.img
          src={track.coverUrl}
          alt={track.title}
          animate={{ scale: hovered ? 1.04 : 1 }}
          transition={{ duration: 0.2 }}
          className="w-full h-full object-cover"
        />

        {/* Overlay */}
        <AnimatePresence>
          {(hovered || isCurrentTrack) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 flex items-center justify-center"
            >
              <motion.button
                initial={{ scale: 0.7 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-2xl shadow-primary/40"
              >
                {isCurrentTrack && isPlayingNow
                  ? <Pause className="w-6 h-6 text-white fill-white" />
                  : <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                }
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Type badge top-right */}
        {track.type && (
          <div className="absolute top-2.5 right-2.5">
            <span className={cn(
              'text-[9px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-sm',
              typeCfg ? `${typeCfg.bg} ${typeCfg.color}` : 'bg-black/50 text-white',
            )}>
              {track.type}
            </span>
          </div>
        )}

        {/* Duration bottom-left */}
        <div className="absolute bottom-2.5 left-2.5">
          <span className="bg-black/75 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-lg font-mono">
            {formatTime(track.duration)}
          </span>
        </div>

        {/* Equalizer if playing */}
        {isCurrentTrack && isPlayingNow && !hovered && (
          <div className="absolute bottom-3 right-3 bg-black/60 rounded-lg p-1.5">
            <EqualizerBars playing={true} />
          </div>
        )}

        {/* Number overlay on hover */}
        {hovered && !isCurrentTrack && index !== undefined && (
          <div className="absolute top-2.5 left-2.5 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">{index + 1}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex-1 flex flex-col">
        <h3
          onClick={onPlay}
          className={cn(
            'text-sm font-medium line-clamp-1 cursor-pointer transition-colors mb-0.5',
            isCurrentTrack ? 'text-primary' : 'text-foreground group-hover:text-primary',
          )}
        >
          {track.title}
        </h3>

        <Link
          to={`/artists/${track.artistId}`}
          onClick={e => e.stopPropagation()}
          className="text-xs text-muted-foreground hover:text-primary transition-colors block truncate"
        >
          {track.artistName}
        </Link>

        {track.poetName && (
          <Link
            to={`/poet/${track.poetId}`}
            onClick={e => e.stopPropagation()}
            className="text-[10px] text-muted-foreground/70 hover:text-primary/70 transition-colors block truncate mt-0.5"
          >
            <span className="opacity-70">كلمات: </span>{track.poetName}
          </Link>
        )}

        <div className="flex items-center justify-between mt-auto pt-2.5">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Eye className="w-3 h-3" />
            <span>{formatNum(track.views || 0)}</span>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
            {onLike && (
              <button
                onClick={e => { e.stopPropagation(); onLike(); }}
                className={cn('p-1 rounded-full hover:bg-accent transition-colors', isLiked && 'text-red-500')}
              >
                <Heart className={cn('w-3.5 h-3.5', isLiked && 'fill-current')} />
              </button>
            )}
            {onAddQueue && (
              <button
                onClick={e => { e.stopPropagation(); onAddQueue(); }}
                className="p-1 rounded-full hover:bg-accent transition-colors"
              >
                <ListPlus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
