import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { usePlayer } from '../../contexts/PlayerContext';
import type { Track } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useSidebarState } from '../../contexts/SidebarContext';
import {
  Play, Pause, SkipBack, SkipForward, Repeat, Shuffle,
  Volume2, VolumeX, Heart, ListMusic, ChevronUp, Music2,
  Repeat1, Loader2, ListPlus, Feather, CalendarDays, Disc,
  Volume1,
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { motion, AnimatePresence } from 'motion/react';
import * as Slider from '@radix-ui/react-slider';
import { useIsMobile } from '../../hooks/useMobile';

const TYPE_COLORS: Record<string, string> = {
  'نشيد':   'text-violet-500',
  'زامل':   'text-amber-500',
  'مدح':    'text-emerald-500',
  'ابتهال': 'text-sky-500',
  'موشح':   'text-rose-500',
  'قصيدة':  'text-orange-500',
  'أنشودة': 'text-teal-500',
  'تواشيح': 'text-indigo-500',
};

function formatTime(time: number) {
  if (!time || !isFinite(time)) return '0:00';
  const m = Math.floor(time / 60);
  const s = Math.floor(time % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function PlayerBar() {
  const navigate = useNavigate();
  const {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    duration,
    shuffle,
    repeat,
    queue,
    allTracks,
    currentIndex,
    isBuffering,
    playNext,
    playPrevious,
    pause,
    resume,
    seek,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    addToQueue,
    removeFromQueue,
    clearQueue,
    playTrack,
  } = usePlayer();

  const { user, likeSong } = useAuth();
  const { isOpen } = useSidebarState();
  const [showVolume, setShowVolume] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [hoverProgress, setHoverProgress] = useState<number | null>(null);
  const isMobile = useIsMobile();

  if (!currentTrack) return null;

  const isLiked = user?.likedSongs.includes(currentTrack.id) ?? false;
  const typeColor = currentTrack.type ? TYPE_COLORS[currentTrack.type] : 'text-muted-foreground';

  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX className="w-4 h-4" />;
    if (volume < 0.5) return <Volume1 className="w-4 h-4" />;
    return <Volume2 className="w-4 h-4" />;
  };

  const getRepeatIcon = () => {
    if (repeat === 'one') return <Repeat1 className="w-4 h-4" />;
    return <Repeat className="w-4 h-4" />;
  };

  // Progress hover preview (open-design style micro-interaction)
  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverProgress(percent * (duration || 100));
  };
  const clearProgressHover = () => setHoverProgress(null);

  // Play a specific track from the queue (reconstructs queue)
  const playFromQueue = (track: Track, indexInQueue: number) => {
    const remaining = queue.filter((_, i) => i !== indexInQueue);
    playTrack(track);
    clearQueue();
    remaining.forEach(t => addToQueue(t));
    setShowQueue(false);
  };

  const removeFromQueueAt = (index: number) => {
    const trackToRemove = queue[index];
    if (trackToRemove) removeFromQueue(trackToRemove.id);
  };

  return (
    <>
      {/* --- Overlay & Queue Floating Panel --- */}
      <AnimatePresence>
        {showQueue && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setShowQueue(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed bottom-28 left-4 w-80 md:w-96 bg-card border border-border shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl z-50 overflow-hidden max-w-full"
            >
              <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/30">
                <div>
                  <h3 className="text-sm font-bold text-foreground">قائمة التشغيل</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {allTracks.length > 0 ? `${currentIndex + 1} من ${allTracks.length}` : 'لا توجد عناصر إضافية'}
                  </p>
                </div>
                <button
                  onClick={() => setShowQueue(false)}
                  className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto scrollbar-thin p-2">
                <div className="flex items-center gap-3 p-2 bg-primary/10 border border-primary/20 rounded-xl mb-2">
                  <img src={currentTrack.coverUrl} className="w-10 h-10 rounded-md object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-primary font-bold truncate">{currentTrack.title}</p>
                    <p className="text-xs text-foreground/80 truncate">{currentTrack.collaborators?.length ? `${currentTrack.artistName}، ${currentTrack.collaborators.map(c => c.name).join('، ')}` : currentTrack.artistName}</p>
                  </div>
                  <div className="flex items-end gap-[2px] h-3 w-4 px-2">
                    {[1, 3, 2, 4].map((h, i) => (
                      <motion.div key={i} animate={isPlaying ? { height: [`${h}px`, `${h + 3}px`, `${h}px`] } : { height: '2px' }} transition={{ duration: 0.4 + i * 0.1, repeat: Infinity }} className="flex-1 bg-primary rounded-full" />
                    ))}
                  </div>
                </div>
                
                {queue.length > 0 ? queue.map((track, i) => (
                  <div 
                    key={track.id} 
                    className="flex items-center gap-3 group hover:bg-secondary/50 rounded-xl p-2 transition-colors cursor-pointer"
                    onClick={() => playFromQueue(track, i)}
                  >
                    <span className="text-xs text-muted-foreground w-4 text-center">{i + 1}</span>
                    <img src={track.coverUrl} className="w-10 h-10 rounded-md object-cover shadow-sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">{track.title}</p>
                      <p className="text-xs text-muted-foreground">{track.artistName}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFromQueueAt(i); }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                      aria-label="إزالة من القائمة"
                    >
                      ×
                    </button>
                  </div>
                )) : (
                  <div className="text-center py-6">
                    <ListMusic className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">القائمة فارغة</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- Main Floating Player Pill --- */}
      <motion.div
        initial={{ y: 150, scale: 0.9 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="fixed bottom-4 left-4 z-50 transition-all duration-300 shadow-[0_15px_40px_rgba(0,0,0,0.6)]"
        style={{ right: isMobile ? 16 : (isOpen ? 272 : 80) }}
      >
        <div className="bg-card border border-border/80 rounded-2xl overflow-hidden relative backdrop-blur-2xl bg-opacity-95 dark:bg-opacity-80">
          
          {/* Progress Bar (Radix Slider) Top Edge - with hover time preview */}
          <div 
            className="absolute top-0 left-0 right-0 h-1.5 bg-secondary group/bottomprogress"
            onMouseMove={handleProgressHover}
            onMouseLeave={clearProgressHover}
          >
             <Slider.Root
                className="relative flex items-center select-none touch-none w-full h-full cursor-pointer"
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={(val) => seek(val[0])}
                aria-label="تقدم التشغيل"
                aria-valuemin={0}
                aria-valuemax={duration || 100}
                aria-valuenow={currentTime}
                aria-valuetext={`${formatTime(currentTime)} من ${formatTime(duration)}`}
              >
                <Slider.Track className="bg-transparent relative grow h-full overflow-hidden">
                  <Slider.Range className="absolute bg-primary h-full transition-colors" />
                </Slider.Track>
                <Slider.Thumb className="block w-2.5 h-2.5 bg-white border border-primary/50 shadow-md rounded-full opacity-0 hover:opacity-100 focus:outline-none transition-all hover:scale-125" />
              </Slider.Root>

              {/* Hover time tooltip (micro interaction per open-design) */}
              {hoverProgress !== null && (
                <div 
                  className="absolute -top-8 bg-card text-foreground text-[10px] px-2 py-0.5 rounded border border-border shadow pointer-events-none"
                  style={{ 
                    left: `${((hoverProgress / (duration || 100)) * 100)}%`, 
                    transform: 'translateX(-50%)' 
                  }}
                >
                  {formatTime(hoverProgress)}
                </div>
              )}
          </div>

          <div className="h-16 md:h-20 px-3 md:px-5 flex items-center justify-between gap-3 md:gap-4 relative overflow-hidden">
            
            {/* 1. Track Info & Art */}
            <div className="flex items-center gap-2 md:gap-3 flex-1 md:flex-none md:w-64 min-w-0">
              <div 
                className="relative flex-shrink-0 cursor-pointer group"
                onClick={() => navigate('/now-playing')}
                role="button"
                aria-label="فتح صفحة التشغيل الآن"
              >
                <img 
                  src={currentTrack.coverUrl} 
                  alt={`${currentTrack.title} — ${currentTrack.collaborators?.length ? `${currentTrack.artistName}، ${currentTrack.collaborators.map(c => c.name).join('، ')}` : currentTrack.artistName}`}
                  className={cn(
                    "w-10 h-10 md:w-12 md:h-12 rounded-full object-cover shadow-sm border-2 border-border group-hover:border-primary/50 transition-colors",
                    isPlaying ? "motion-safe animate-[spin_8s_linear_infinite]" : ""
                  )} 
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-card border border-border" />
              </div>
              
              <div className="flex-1 min-w-0">
                <button 
                  onClick={() => navigate('/now-playing')}
                  className="block text-foreground font-bold truncate text-sm md:text-base hover:text-primary transition-colors text-right w-full"
                >
                  {currentTrack.title}
                </button>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Link 
                    to={`/artists/${currentTrack.artistId}`}
                    className="text-[10px] md:text-xs text-muted-foreground hover:text-foreground transition-colors truncate"
                  >
                    {currentTrack.collaborators?.length ? `${currentTrack.artistName}، ${currentTrack.collaborators.map(c => c.name).join('، ')}` : currentTrack.artistName}
                  </Link>
                  {currentTrack.type && (
                    <>
                      <span className="text-muted-foreground/40">•</span>
                      <span className={cn("text-[10px] md:text-xs font-medium", typeColor)}>{currentTrack.type}</span>
                    </>
                  )}
                </div>
              </div>
              
              {/* Like Button (Hidden on very small screens) */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => likeSong(currentTrack.id)}
                className="hidden md:flex rounded-full w-8 h-8 flex-shrink-0 ml-1 hover:bg-secondary"
              >
                <Heart className={cn('w-4 h-4 transition-transform hover:scale-110', isLiked ? 'fill-primary text-primary' : 'text-muted-foreground')} />
              </Button>
            </div>

            {/* 2. Main Controls */}
            <div className="flex-none md:flex-1 flex flex-col items-center justify-center max-w-xl">
              <div className="flex items-center justify-center gap-2 md:gap-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleShuffle}
                  aria-label={shuffle ? "إلغاء التشغيل العشوائي" : "تشغيل عشوائي"}
                  className={cn('hidden sm:flex rounded-full w-8 h-8 transition-colors', shuffle ? 'text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary')}
                >
                  <Shuffle className="w-4 h-4" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={playPrevious}
                  aria-label="السابق"
                  className="text-muted-foreground hover:text-foreground transition-colors hover:bg-secondary w-8 h-8 rounded-full"
                >
                  <SkipBack className="w-5 h-5 fill-current" />
                </Button>
                
                <Button
                  onClick={isPlaying ? pause : resume}
                  aria-label={isPlaying ? "إيقاف" : "تشغيل"}
                  className={cn(
                    'w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all shadow-md',
                    isBuffering 
                      ? 'bg-secondary cursor-wait' 
                      : 'bg-foreground text-background hover:scale-105 hover:bg-primary hover:text-primary-foreground'
                  )}
                >
                  {isBuffering ? (
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  ) : isPlaying ? (
                    <Pause className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 md:w-6 md:h-6 fill-current ml-1" />
                  )}
                </Button>

                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={playNext}
                  aria-label="التالي"
                  className="text-muted-foreground hover:text-foreground transition-colors hover:bg-secondary w-8 h-8 rounded-full"
                >
                  <SkipForward className="w-5 h-5 fill-current" />
                </Button>

                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleRepeat}
                  className={cn('hidden sm:flex rounded-full w-8 h-8 relative transition-colors', repeat !== 'none' ? 'text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary')}
                >
                  {getRepeatIcon()}
                  {repeat === 'one' && (
                    <span className="absolute -top-0.5 -right-0.5 text-[8px] font-bold bg-primary text-primary-foreground rounded-full w-3.5 h-3.5 flex items-center justify-center border border-background">1</span>
                  )}
                </Button>
              </div>
            </div>

            {/* 3. Extra Actions (Volume, Queue, Expand) */}
            <div className="hidden md:flex items-center justify-end gap-1 w-auto md:w-[180px] flex-shrink-0">
              {/* Volume (Desktop) */}
              <div 
                className="hidden md:flex items-center gap-1 group/volume relative ml-2 w-28"
                onMouseEnter={() => setShowVolume(true)} 
                onMouseLeave={() => setShowVolume(false)}
              >
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-secondary flex-shrink-0"
                  onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
                >
                  {getVolumeIcon()}
                </Button>
                
                <Slider.Root
                  className={cn(
                    "relative flex items-center select-none touch-none h-4 group cursor-pointer transition-all duration-300",
                    showVolume ? "w-20 opacity-100" : "w-0 opacity-0"
                  )}
                  value={[volume]}
                  max={1}
                  step={0.01}
                  onValueChange={(val) => setVolume(val[0])}
                >
                  <Slider.Track className="bg-secondary relative grow h-1.5 rounded-full overflow-hidden">
                    <Slider.Range className="absolute bg-foreground group-hover:bg-primary transition-colors h-full" />
                  </Slider.Track>
                  <Slider.Thumb className="block w-3 h-3 bg-white border border-primary/50 rounded-full opacity-0 group-hover:opacity-100 hover:scale-125 transition-all focus:outline-none shadow-sm" />
                </Slider.Root>
              </div>

              {/* Expand to Now Playing */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/now-playing')}
                className="rounded-full w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-secondary flex-shrink-0 hidden sm:flex"
              >
                <ChevronUp className="w-5 h-5" />
              </Button>
              
              {/* Queue Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowQueue(s => !s)}
                className={cn('rounded-full w-8 h-8 transition-colors flex-shrink-0', showQueue ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-secondary')}
              >
                <ListMusic className="w-4 h-4" />
              </Button>
            </div>

          </div>
        </div>
      </motion.div>
    </>
  );
}
