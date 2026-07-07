import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { usePlayer } from '../contexts/PlayerContext';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronDown, Play, Pause, SkipBack, SkipForward,
  Repeat, Shuffle, Volume2, VolumeX, Heart, List,
  Share2, Download, MoreHorizontal, Music2, Mic2,
  AlignLeft, Radio, BadgeCheck, Disc3, ChevronRight,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { cn } from '../components/ui/utils';
import { useDataStore } from "../../app/store/dataStore";
import * as Slider from '@radix-ui/react-slider';

type TabType = 'queue' | 'lyrics' | 'info';

const mockLyrics = [
  { time: 0, text: '' },
  { time: 5, text: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ' },
  { time: 12, text: '...' },
  { time: 20, text: 'الله الله يا بهجة القلوب' },
  { time: 30, text: 'الله الله يا نور الدروب' },
  { time: 40, text: 'صلى الله على النبي الحبيب' },
  { time: 50, text: 'خير خلق الله العجيب' },
  { time: 60, text: 'الله الله يا فرحة الروح' },
  { time: 70, text: 'الله الله يا بهجة القلوب' },
  { time: 80, text: 'نور تجلى في الكون كله' },
  { time: 90, text: 'والهدى يجري من أصله' },
  { time: 100, text: 'الله الله يا بهجة القلوب' },
];

export default function NowPlaying() {
  const { tracks } = useDataStore();
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
    pause,
    resume,
    seek,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    playNext,
    playPrevious,
    playTrack,
  } = usePlayer();
  const { user, likeSong } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('lyrics');
  const [isRotating, setIsRotating] = useState(false);
  const lyricsRef = useRef<HTMLDivElement>(null);

  const isLiked = currentTrack ? user?.likedSongs.includes(currentTrack.id) : false;

  const formatTime = (s: number) => {
    if (!s || !isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const activeLyricIndex = mockLyrics.reduce((acc, line, i) => {
    if (line.time <= currentTime) return i;
    return acc;
  }, 0);

  useEffect(() => {
    setIsRotating(isPlaying);
  }, [isPlaying]);

  // Auto-scroll to active lyric (nice UX)
  useEffect(() => {
    if (activeTab === 'lyrics' && lyricsRef.current) {
      const activeEl = lyricsRef.current.querySelector(`[data-lyric-index="${activeLyricIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeLyricIndex, activeTab]);

  if (!currentTrack) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shadow-lg"
        >
          <Disc3 className="w-16 h-16 text-primary/30" />
        </motion.div>
        <div className="text-center">
          <h2 className="text-foreground text-xl font-bold mb-2">لا يوجد تشغيل حالياً</h2>
          <p className="text-muted-foreground text-sm">اختر نشيداً من المكتبة للبدء</p>
        </div>
        <Button
          onClick={() => navigate('/home')}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 gap-2 shadow-lg hover:-translate-y-0.5 transition-transform"
        >
          <Music2 className="w-4 h-4" />
          استعرض المكتبة
        </Button>
        <div className="grid grid-cols-2 md:grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {tracks.slice(0, 4).map(track => (
            <motion.button
              key={track.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => playTrack(track)}
              className="group flex flex-col items-center gap-2 p-4 bg-card border border-border rounded-2xl hover:border-primary/40 transition-all shadow-sm hover:shadow-md"
            >
              <div className="relative">
                <img src={track.coverUrl} alt={track.title} className="w-16 h-16 rounded-xl object-cover shadow-sm" />
                <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[1px]">
                  <Play className="w-6 h-6 text-white fill-white" />
                </div>
              </div>
              <p className="text-xs text-foreground font-medium truncate w-full text-center group-hover:text-primary transition-colors">{track.title}</p>
              <p className="text-[10px] text-muted-foreground">{track.artistName}</p>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex flex-col lg:flex-row gap-8 items-start relative pb-20">
      {/* Background ambient glow based on vinyl */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] z-0"
        style={{ background: 'radial-gradient(circle at 50% 50%, var(--primary) 0%, transparent 70%)' }}
      />

      {/* Left: Main Player */}
      <div className="flex-1 flex flex-col items-center max-w-xl mx-auto w-full space-y-8 z-10">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex items-center justify-between bg-card/50 backdrop-blur-md p-2 rounded-2xl border border-border/50 shadow-sm"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2 text-muted-foreground hover:text-foreground hover:bg-secondary/80 rounded-xl"
          >
            <ChevronDown className="w-4 h-4" />
            العودة
          </Button>
          <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
            جاري التشغيل
          </span>
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-secondary/80 text-muted-foreground hover:text-foreground">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </motion.div>

        {/* Album Art (Vinyl Effect) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 100 }}
          className="relative mt-4 mb-4"
        >
          {/* Glow Effect */}
          <div
            className={cn("absolute inset-0 rounded-full blur-3xl transition-opacity duration-1000 scale-110", isPlaying ? "opacity-40" : "opacity-20")}
            style={{ backgroundImage: `url(${currentTrack.coverUrl})`, backgroundSize: 'cover' }}
          />

          {/* Vinyl Record Effect — respects reduced motion via .motion-safe in theme */}
          <motion.div
            animate={{ rotate: isRotating ? 360 : 0 }}
            transition={{ duration: 14, repeat: isRotating ? Infinity : 0, ease: 'linear' }}
            className="relative w-64 h-64 md:w-80 md:h-80 motion-safe max-w-full"
          >
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-[6px] border-black/30 shadow-[0_20px_50px_rgba(0,0,0,0.4)]" />

            {/* Album Image */}
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-full h-full rounded-full object-cover shadow-inner"
            />

            {/* Vinyl grooves overlay */}
            <div className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, transparent 28%, rgba(0,0,0,0.1) 29%, transparent 30%, rgba(0,0,0,0.05) 45%, transparent 46%, rgba(0,0,0,0.05) 60%, transparent 61%)',
              }}
            />

            {/* Light reflection over vinyl */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/5 to-transparent mix-blend-overlay pointer-events-none" />

            {/* Center hole */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card border-4 border-border/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-primary/80 shadow-sm" />
            </div>
          </motion.div>
        </motion.div>

        {/* Track Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full text-center space-y-1"
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-black text-foreground truncate max-w-sm drop-shadow-sm">
              {currentTrack.title}
            </h1>
          </div>
          <button
            onClick={() => navigate(`/artists/${currentTrack.artistId}`)}
            className="inline-flex items-center justify-center gap-1.5 text-muted-foreground hover:text-primary transition-colors bg-secondary/30 hover:bg-secondary/60 px-3 py-1 rounded-full"
          >
            <Mic2 className="w-3.5 h-3.5" />
            <span className="text-sm font-medium">{currentTrack.artistName}</span>
            <BadgeCheck className="w-3.5 h-3.5 text-primary" />
          </button>
          {currentTrack.albumName && (
            <p className="text-xs font-medium text-muted-foreground/60 mt-2 tracking-wide uppercase">{currentTrack.albumName}</p>
          )}
        </motion.div>

        {/* Like & Share Actions */}
        <div className="flex items-center justify-between w-full max-w-md px-4">
          <Button
            variant="ghost"
            size="icon"
            className={cn('rounded-full w-10 h-10 hover:bg-secondary transition-colors', isLiked ? 'text-primary' : 'text-muted-foreground')}
            onClick={() => likeSong(currentTrack.id)}
          >
            <Heart className={cn('w-5 h-5 transition-transform hover:scale-110', isLiked && 'fill-current drop-shadow-[0_0_8px_rgba(30,215,96,0.5)]')} />
          </Button>

          {/* Equalizer Animation */}
          <div className="flex items-end gap-1 h-6">
            {[3, 7, 5, 8, 4, 6, 9, 3, 7, 5].map((h, i) => (
              <motion.div
                key={i}
                animate={isPlaying ? {
                  height: [`${h * 2}px`, `${(h + 4) * 2}px`, `${h * 2}px`],
                } : { height: '4px' }}
                transition={{
                  duration: 0.5 + i * 0.1,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  delay: i * 0.05,
                }}
                className="w-1.5 bg-primary/80 rounded-full"
                style={{ height: '4px' }}
              />
            ))}
          </div>

          <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 hover:bg-secondary text-muted-foreground hover:text-foreground">
            <Share2 className="w-5 h-5 transition-transform hover:scale-110" />
          </Button>
        </div>

        {/* Radix Progress Bar */}
        <div className="w-full max-w-md space-y-3 px-4">
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-4 group cursor-pointer"
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={(val) => seek(val[0])}
          >
            <Slider.Track className="bg-secondary relative grow h-1.5 rounded-full overflow-hidden transition-all group-hover:h-2">
              <Slider.Range className="absolute bg-foreground group-hover:bg-primary transition-colors h-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-4 h-4 bg-white border border-primary/20 shadow-[0_2px_8px_rgba(0,0,0,0.3)] rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none hover:scale-125" />
          </Slider.Root>
          <div className="flex items-center justify-between text-xs text-muted-foreground font-mono font-medium tracking-wider">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-center gap-4 md:gap-6 w-full max-w-md">
          <Button
            variant="ghost"
            size="icon"
            className={cn('rounded-full w-12 h-12 transition-colors hover:bg-secondary', shuffle ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground')}
            onClick={toggleShuffle}
          >
            <Shuffle className="w-[22px] h-[22px]" />
            {shuffle && <span className="absolute bottom-2 w-1 h-1 bg-primary rounded-full" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-12 h-12 hover:bg-secondary text-foreground transition-transform hover:scale-110 active:scale-95"
            onClick={playPrevious}
          >
            <SkipBack className="w-7 h-7 fill-current" />
          </Button>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={isPlaying ? pause : resume}
            className="w-16 h-16 md:w-20 md:h-20 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(30,215,96,0.4)] transition-colors"
          >
            {isPlaying
              ? <Pause className="w-8 h-8 md:w-10 md:h-10 fill-current" />
              : <Play className="w-8 h-8 md:w-10 md:h-10 fill-current ml-1" />
            }
          </motion.button>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-12 h-12 hover:bg-secondary text-foreground transition-transform hover:scale-110 active:scale-95"
            onClick={playNext}
          >
            <SkipForward className="w-7 h-7 fill-current" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={cn('rounded-full w-12 h-12 relative transition-colors hover:bg-secondary', repeat !== 'none' ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground')}
            onClick={toggleRepeat}
          >
            <Repeat className="w-[22px] h-[22px]" />
            {repeat !== 'none' && <span className="absolute bottom-2 w-1 h-1 bg-primary rounded-full" />}
            {repeat === 'one' && (
              <span className="absolute top-1 right-1 text-[9px] font-bold bg-primary text-white rounded-full w-4 h-4 flex items-center justify-center border-2 border-background">1</span>
            )}
          </Button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3 w-full max-w-sm px-6">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-9 h-9 flex-shrink-0 text-muted-foreground hover:text-foreground hover:bg-secondary"
            onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
          >
            {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
          <Slider.Root
            className="relative flex items-center select-none touch-none flex-1 h-4 group cursor-pointer"
            value={[volume * 100]}
            max={100}
            step={1}
            onValueChange={(val) => setVolume(val[0] / 100)}
          >
            <Slider.Track className="bg-secondary relative grow h-1.5 rounded-full overflow-hidden transition-all group-hover:h-2">
              <Slider.Range className="absolute bg-foreground group-hover:bg-primary transition-colors h-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-4 h-4 bg-white border border-primary/20 shadow-[0_2px_8px_rgba(0,0,0,0.3)] rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none hover:scale-125" />
          </Slider.Root>
          <span className="text-xs text-muted-foreground font-mono font-medium w-8 text-center">{Math.round(volume * 100)}%</span>
        </div>
      </div>

      {/* Right: Sidebar Panel */}
      <div className="w-full lg:w-[350px] xl:w-[400px] flex-shrink-0 flex flex-col h-full bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.1)] z-10">
        
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-secondary/30 p-2 border-b border-border/50">
          {[
            { key: 'lyrics', label: 'الكلمات', icon: AlignLeft },
            { key: 'queue', label: 'القائمة', icon: List },
            { key: 'info', label: 'التفاصيل', icon: Radio },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-150",
                activeTab === tab.key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden relative min-h-[400px] max-h-[65vh]">
          <AnimatePresence mode="wait">
            
            {/* === Lyrics Tab === */}
            {activeTab === 'lyrics' && (
              <motion.div
                key="lyrics"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 overflow-y-auto scrollbar-none p-8"
                ref={lyricsRef}
              >
                {currentTrack.lyrics || mockLyrics.length > 1 ? (
                  <div className="space-y-6 text-center pb-16 pt-4">
                    {mockLyrics.map((line, i) => {
                      const isActive = activeLyricIndex === i;
                      const isPast = activeLyricIndex > i;
                      return (
                        <motion.p
                          key={i}
                          data-lyric-index={i}
                          animate={{
                            scale: isActive ? 1.02 : 1,
                            opacity: isActive ? 1 : isPast ? 0.35 : 0.65,
                          }}
                          transition={{ duration: 0.18 }}
                          onClick={() => seek(line.time)}
                          className={cn(
                            "text-lg md:text-xl font-semibold leading-relaxed transition-colors cursor-pointer hover:text-primary/90 py-1",
                            isActive ? "text-primary scale-105" : "text-foreground"
                          )}
                        >
                          {line.text || '♪'}
                        </motion.p>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-4 pb-10">
                    <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center shadow-inner">
                      <AlignLeft className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-foreground font-bold text-sm">لا تتوفر كلمات لهذا النشيد</p>
                    <p className="text-muted-foreground text-xs max-w-[200px] text-center">أضف كلمات للنشيد من خلال لوحة التحكم.</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* === Queue Tab === */}
            {activeTab === 'queue' && (
              <motion.div
                key="queue"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="absolute inset-0 overflow-y-auto scrollbar-thin p-4"
              >
                {/* Currently Playing */}
                <div className="mb-6">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest px-2 mb-2 font-bold">يُشغَّل الآن</p>
                  <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-2xl p-3 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex-shrink-0">
                      <img src={currentTrack.coverUrl} alt={currentTrack.title} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                      <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center backdrop-blur-[1px]">
                        <EqualizerBars active={isPlaying} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 z-10">
                      <p className="text-sm text-primary font-bold truncate">{currentTrack.title}</p>
                      <p className="text-[11px] text-foreground/70 truncate">{currentTrack.artistName}</p>
                    </div>
                  </div>
                </div>

                {/* Queue Items */}
                <div className="mb-6">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest px-2 mb-2 font-bold">التالي في القائمة</p>
                  {queue.length > 0 ? (
                    <div className="space-y-1">
                      {queue.map((track, i) => (
                        <div key={track.id} className="flex items-center gap-3 group hover:bg-secondary/70 rounded-xl p-2 transition-colors cursor-pointer border border-transparent hover:border-border/50">
                          <span className="text-xs text-muted-foreground/60 w-5 text-center font-mono group-hover:text-primary transition-colors">{i + 1}</span>
                          <img src={track.coverUrl} alt={track.title} className="w-10 h-10 rounded-lg object-cover shadow-sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">{track.title}</p>
                            <p className="text-[11px] text-muted-foreground">{track.artistName}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <List className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground font-medium">القائمة فارغة</p>
                    </div>
                  )}
                </div>

                {/* Suggestions */}
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest px-2 mb-2 font-bold">مقترح لك من نفس الفنان</p>
                  <div className="space-y-1 pb-4">
                    {allTracks.slice(currentIndex + 1, currentIndex + 6).map(track => (
                      <motion.div
                        key={track.id}
                        whileHover={{ x: -4 }}
                        onClick={() => playTrack(track)}
                        className="flex items-center gap-3 group hover:bg-secondary/50 rounded-xl p-2 transition-colors cursor-pointer"
                      >
                        <img src={track.coverUrl} alt={track.title} className="w-10 h-10 rounded-lg object-cover shadow-sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">{track.title}</p>
                          <p className="text-[11px] text-muted-foreground">{track.artistName}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* === Info Tab === */}
            {activeTab === 'info' && (
              <motion.div
                key="info"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="absolute inset-0 overflow-y-auto scrollbar-thin p-5"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  {[
                    { label: 'الفنان', value: currentTrack.artistName },
                    { label: 'الألبوم', value: currentTrack.albumName || '—' },
                    { label: 'النوع', value: currentTrack.type || 'إنشاد' },
                    { label: 'المدة', value: `${Math.floor((duration || currentTrack.duration) / 60)} دقيقة` },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-secondary/40 border border-border/50 rounded-2xl p-3 hover:bg-secondary/60 transition-colors">
                      <p className="text-[10px] text-muted-foreground mb-1 font-bold uppercase tracking-wider">{label}</p>
                      <p className="text-sm text-foreground font-bold truncate">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="h-px bg-border/50 w-full mb-6" />

                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">أعمال الفنان</h3>
                <div className="space-y-2 mb-6">
                  {tracks.filter(t => t.artistId === currentTrack.artistId && t.id !== currentTrack.id).slice(0, 3).map(track => (
                    <motion.div
                      key={track.id}
                      whileHover={{ x: -4 }}
                      onClick={() => playTrack(track)}
                      className="flex items-center gap-3 cursor-pointer group hover:bg-secondary/40 p-2 rounded-xl transition-colors border border-transparent hover:border-border/50"
                    >
                      <img src={track.coverUrl} alt={track.title} className="w-10 h-10 rounded-lg object-cover shadow-sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">{track.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 font-mono">{formatTime(track.duration)}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 hover:bg-white/10">
                        <Play className="w-4 h-4 text-primary fill-current ml-0.5" />
                      </Button>
                    </motion.div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" className="flex-1 gap-2 rounded-xl border-border/50 hover:bg-secondary h-11 text-xs font-bold">
                    <Download className="w-4 h-4" />
                    تنزيل
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2 rounded-xl border-border/50 hover:bg-secondary h-11 text-xs font-bold">
                    <Share2 className="w-4 h-4" />
                    مشاركة
                  </Button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Internal component helper
function EqualizerBars({ active }: { active: boolean }) {
  return (
    <div className="flex items-end gap-[2px] h-3 w-4">
      {[2, 4, 3, 5, 2].map((h, i) => (
        <motion.div
          key={i}
          animate={active ? { height: [`${h}px`, `${h + 4}px`, `${h}px`] } : { height: '2px' }}
          transition={{ duration: 0.4 + i * 0.1, repeat: Infinity, delay: i * 0.05 }}
          className="flex-1 bg-primary rounded-full"
        />
      ))}
    </div>
  );
}
