import { Track } from '../../contexts/PlayerContext';
import { usePlayer } from '../../contexts/PlayerContext';
import { useAuth } from '../../contexts/AuthContext';
import { useDataStore } from '../../store/dataStore';
import { Link } from 'react-router';
import { Play, Pause, Heart, MoreHorizontal, ListPlus } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { toast } from 'sonner';

const TYPE_COLORS: Record<string, string> = {
  'نشيد':   'text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400',
  'زامل':   'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400',
  'مدح':    'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400',
  'ابتهال': 'text-sky-600 bg-sky-50 dark:bg-sky-900/20 dark:text-sky-400',
  'موشح':   'text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400',
  'قصيدة':  'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400',
  'أنشودة': 'text-teal-600 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400',
  'تواشيح': 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400',
};

type TrackCardProps = {
  track: Track;
  index?: number;
  showCover?: boolean;
  playlist?: Track[];      // The full playlist to set when playing
  playlistIndex?: number;  // Index in the playlist to start from
};

function EqualizerBars({ playing }: { playing: boolean }) {
  return (
    <div className="flex items-end gap-0.5 h-4 w-4">
      {[3, 5, 4, 6, 3].map((h, i) => (
        <motion.div
          key={i}
          animate={playing ? { height: [`${h}px`, `${h + 4}px`, `${h}px`] } : { height: '3px' }}
          transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.08 }}
          className="flex-1 bg-primary rounded-full"
        />
      ))}
    </div>
  );
}

export default function TrackCard({
  track, index, showCover = true, playlist, playlistIndex,
}: TrackCardProps) {
  const { currentTrack, isPlaying, playTrack, pause, resume, addToQueue, setPlaylist } = usePlayer();
  const { user, likeSong } = useAuth();
  const { userPlaylists, addTrackToPlaylist, fetchUserPlaylists } = useDataStore();

  const isCurrentTrack = currentTrack?.id === track.id;
  const isLiked = user?.likedSongs.includes(track.id);

  const handleAddToPlaylist = async () => {
    if (!user) {
      toast.error('سجل الدخول أولاً');
      return;
    }
    if (userPlaylists.length === 0) {
      toast.error('لا توجد قوائم. أنشئ واحدة من صفحة القوائم');
      return;
    }
    // Add to first playlist for simplicity (user can manage in Playlists page)
    const first = userPlaylists[0];
    const ok = await addTrackToPlaylist(first.id, track.id);
    if (ok) {
      toast.success(`تمت الإضافة إلى "${first.name}"`);
      fetchUserPlaylists();
    } else {
      toast.error('فشلت الإضافة');
    }
  };

  const handlePlayPause = () => {
    if (isCurrentTrack && isPlaying) {
      pause();
    } else if (isCurrentTrack && !isPlaying) {
      resume();
    } else if (playlist && playlistIndex !== undefined) {
      setPlaylist(playlist, playlistIndex);
    } else {
      playTrack(track);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const typeCls = track.type ? TYPE_COLORS[track.type] : null;

  return (
    <motion.div
      whileHover={{ x: 1 }}
      className={cn(
        'group flex items-center gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer focus-within:ring-1 focus-within:ring-primary/30',
        isCurrentTrack ? 'bg-primary/10 border border-primary/20' : 'hover:bg-secondary/50 border border-transparent',
      )}
      onClick={handlePlayPause}
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), handlePlayPause())}
    >
      {/* Index / Equalizer */}
      <div className="w-8 text-center flex-shrink-0">
        <div className="relative h-5 flex items-center justify-center">
          {isCurrentTrack ? (
            <EqualizerBars playing={isPlaying} />
          ) : (
            <>
              <span className="text-muted-foreground text-sm group-hover:hidden">
                {index !== undefined ? index + 1 : '-'}
              </span>
              <Play className="w-4 h-4 text-primary hidden group-hover:block fill-current" />
            </>
          )}
        </div>
      </div>

      {/* Cover Image */}
      {showCover && (
        <div className="relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0">
          <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 flex items-center justify-center"
          >
            <div className="rounded-full hover:bg-white/20 w-7 h-7 flex items-center justify-center">
              {isCurrentTrack && isPlaying
                ? <Pause className="w-4 h-4 text-white fill-white" />
                : <Play className="w-4 h-4 text-white fill-white" />
              }
            </div>
          </motion.div>
        </div>
      )}

      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className={cn(
            'font-medium truncate text-sm',
            isCurrentTrack ? 'text-primary' : 'text-foreground',
          )}>
            {track.title}
          </h4>
          {track.type && typeCls && (
            <span className={cn('text-[9px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0', typeCls)}>
              {track.type}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Link
            to={`/artists/${track.artistId}`}
            onClick={e => e.stopPropagation()}
            className="text-xs text-muted-foreground hover:text-primary transition-colors truncate"
          >
            {track.artistName}
          </Link>
          {track.poetName && (
            <>
              <span className="text-muted-foreground/40 text-xs">·</span>
              <Link
                to={`/poet/${track.poetId}`}
                onClick={e => e.stopPropagation()}
                className="text-[10px] text-muted-foreground/60 hover:text-primary/60 transition-colors truncate"
              >
                {track.poetName}
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Album */}
      <div className="hidden md:block flex-shrink-0 max-w-32">
        <Link
          to={`/albums/${track.albumId}`}
          onClick={e => e.stopPropagation()}
          className="text-xs text-muted-foreground hover:text-primary transition-colors truncate block"
        >
          {track.albumName}
        </Link>
        {track.releaseYear && (
          <span className="text-[10px] text-muted-foreground/50">{track.releaseYear}</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'rounded-full opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 pointer-events-none group-hover:pointer-events-auto',
            isLiked && 'opacity-100 text-red-500',
          )}
          onClick={e => {
            e.stopPropagation();
            likeSong(track.id);
          }}
        >
          <Heart className={cn('w-4 h-4', isLiked && 'fill-current')} />
        </Button>

        <span className="text-sm text-muted-foreground w-10 text-center font-mono">
          {formatDuration(track.duration)}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 pointer-events-none group-hover:pointer-events-auto"
              onClick={e => e.stopPropagation()}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 max-w-full">
            <DropdownMenuItem onClick={() => addToQueue(track)}>
              <ListPlus className="w-4 h-4 ml-2" />
              إضافة إلى قائمة الانتظار
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleAddToPlaylist}>
              <ListPlus className="w-4 h-4 ml-2" />
              إضافة إلى قائمة تشغيل
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { likeSong(track.id); toast.success('تمت الإضافة للمفضلة'); }}>إضافة إلى المفضلة</DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`/albums/${track.albumId}`} onClick={e => e.stopPropagation()}>
                الانتقال إلى الألبوم
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`/artists/${track.artistId}`} onClick={e => e.stopPropagation()}>
                الانتقال إلى الفنان
              </Link>
            </DropdownMenuItem>
            {track.poetId && (
              <DropdownMenuItem asChild>
                <Link to={`/poet/${track.poetId}`} onClick={e => e.stopPropagation()}>
                  الانتقال إلى الشاعر
                </Link>
              </DropdownMenuItem>
            )}
            {track.occasionId && (
              <DropdownMenuItem asChild>
                <Link to={`/occasions/${track.occasionId}`} onClick={e => e.stopPropagation()}>
                  المناسبة: {track.occasionName}
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/albums/${track.albumId}`);
              alert('تم نسخ الرابط!');
            }}>مشاركة</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}
