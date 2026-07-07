import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play, Pause, Volume2, VolumeX, Maximize2, Minimize2,
  Heart, Share2, Download, MoreVertical, Eye, ThumbsUp,
  ThumbsDown, MessageCircle, ChevronRight, BadgeCheck,
  Clock, Calendar, List, X, Repeat, SkipBack, SkipForward,
  Settings, Cast, Subtitles, ChevronDown,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Slider } from '../components/ui/slider';
import { cn } from '../components/ui/utils';
import { useDataStore } from "../../app/store/dataStore";

const mockComments = [
  { id: 1, user: 'أحمد الراشدي', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', text: 'ما شاء الله، صوت رائع يملأ القلب نوراً وسروراً', likes: 1240, time: 'منذ 3 أيام' },
  { id: 2, user: 'فاطمة السالم', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', text: 'كل ما استمعت إلى هذا النشيد أحسست بالطمأنينة، جزاكم الله خيراً', likes: 890, time: 'منذ أسبوع' },
  { id: 3, user: 'خالد المنصور', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', text: 'روعة! من أجمل ما أنتجه الاتحاد في هذا العام، نسأل الله أن يديم علينا هذه النعمة', likes: 654, time: 'منذ أسبوعين' },
  { id: 4, user: 'نورا العتيبي', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', text: 'اللهم صلِّ وسلِّم على سيدنا محمد ﷺ، هذا النشيد من أروع ما سمعت', likes: 445, time: 'منذ شهر' },
  { id: 5, user: 'عمر الحسيني', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', text: 'تحفة فنية رائعة، بارك الله في جميع القائمين على هذا المشروع', likes: 312, time: 'منذ شهرين' },
];

export default function VideoDetail() {
    const { getVideoById, getArtistById, videos } = useDataStore();
  const { id } = useParams();
  const navigate = useNavigate();
  const video = getVideoById(id!);
  const artist = video ? getArtistById(video.artistId) : null;
  const relatedVideos = videos.filter(v => v.id !== id).slice(0, 8);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [activeTab, setActiveTab] = useState<'comments' | 'related'>('related');
  const [showQuality, setShowQuality] = useState(false);
  const [quality, setQuality] = useState('1080p');
  const controlsTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const formatViews = (v?: number) => (v || 0) >= 1_000_000 ? `${((v || 0) / 1_000_000).toFixed(1)}M` : `${((v || 0) / 1_000).toFixed(0)}K`;

  const recordVideoPlay = async () => {
    if (!video?.id) return;
    try {
      await fetch(`https://music.hidar.eu.cc/api/videos/${video.id}/play`, { method: 'POST' });
    } catch {}
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    if (isPlaying) {
      const timer = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= (video?.duration || 0)) { setIsPlaying(false); return 0; }
          return prev + 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isPlaying, video?.duration]);

  if (!video) {
    return (
      <div className="flex flex-col items-center justify-center h-72 md:h-96 gap-4">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
          <Play className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">الفيديو غير موجود</p>
        <Button onClick={() => navigate('/videos')}>العودة للفيديوهات</Button>
      </div>
    );
  }

  const progress = video.duration ? (currentTime / video.duration) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 text-sm text-muted-foreground"
      >
        <Link to="/videos" className="hover:text-primary transition-colors">الفيديوهات</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground truncate max-w-xs">{video.title}</span>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-2 space-y-4">
          {/* Video Player */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            ref={playerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
            className={cn(
              "relative bg-black rounded-2xl overflow-hidden group shadow-2xl",
              isFullscreen && "fixed inset-0 z-[100] rounded-none"
            )}
            style={{ aspectRatio: '16/9' }}
          >
            {/* Thumbnail / Video */}
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover"
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-black/20" />

            {/* Center Play Button (when paused) */}
            <AnimatePresence>
              {!isPlaying && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => { setIsPlaying(true); recordVideoPlay(); }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-20 h-20 bg-primary/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl hover:bg-primary hover:scale-110 transition-all">
                    <Play className="w-9 h-9 text-white fill-current ml-1" />
                  </div>
                </motion.button>
              )}
            </AnimatePresence>

            {/* Top Bar */}
            <AnimatePresence>
              {showControls && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">HD</span>
                    <span className="text-white text-sm font-medium drop-shadow">{video.title}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20 w-8 h-8 rounded-full"
                      onClick={() => setShowQuality(!showQuality)}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    {showQuality && (
                      <div className="absolute top-12 left-4 bg-black/90 backdrop-blur-sm rounded-xl p-2 text-white text-sm border border-white/10">
                        {['4K', '1080p', '720p', '480p', '360p'].map(q => (
                          <button
                            key={q}
                            onClick={() => { setQuality(q); setShowQuality(false); }}
                            className={cn('block w-full text-right px-3 py-1.5 rounded-lg hover:bg-secondary', quality === q && 'text-primary')}
                          >
                            {q} {quality === q && '✓'}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Controls */}
            <AnimatePresence>
              {showControls && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-0 left-0 right-0 p-4"
                >
                  {/* Progress Bar */}
                  <div className="mb-3 group/progress">
                    <div
                      className="w-full h-1.5 bg-white/30 rounded-full cursor-pointer hover:h-2.5 transition-all"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const pct = x / rect.width;
                        setCurrentTime(Math.floor(pct * (video.duration || 0)));
                      }}
                    >
                      <div
                        className="h-full bg-primary rounded-full relative"
                        style={{ width: `${progress}%` }}
                      >
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-lg" />
                      </div>
                    </div>
                  </div>

                  {/* Controls Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20 w-9 h-9 rounded-full"
                        onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
                      >
                        <SkipBack className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20 w-10 h-10 rounded-full bg-white/10"
                        onClick={() => { setIsPlaying(!isPlaying); if (!isPlaying) recordVideoPlay(); }}
                      >
                        {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20 w-9 h-9 rounded-full"
                        onClick={() => setCurrentTime(Math.min(video.duration || 0, currentTime + 10))}
                      >
                        <SkipForward className="w-5 h-5" />
                      </Button>

                      {/* Volume */}
                      <div className="flex items-center gap-2 group/vol">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white hover:bg-white/20 w-8 h-8 rounded-full"
                          onClick={() => setIsMuted(!isMuted)}
                        >
                          {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </Button>
                        <div className="w-0 group-hover/vol:w-20 overflow-hidden transition-all duration-300">
                          <Slider
                            value={[isMuted ? 0 : volume]}
                            max={100}
                            step={1}
                            onValueChange={([v]) => { setVolume(v); setIsMuted(v === 0); }}
                            className="w-20"
                          />
                        </div>
                      </div>

                      <span className="text-white text-xs font-mono">
                        {formatTime(currentTime)} / {formatTime(video.duration)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20 w-8 h-8 rounded-full"
                      >
                        <Cast className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20 w-8 h-8 rounded-full"
                      >
                        <Subtitles className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20 w-8 h-8 rounded-full"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                      >
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Click to play/pause */}
            {isPlaying && (
              <div
                className="absolute inset-0 cursor-pointer"
                onClick={() => setIsPlaying(false)}
              />
            )}
          </motion.div>

          {/* Video Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h1 className="text-foreground leading-tight">{video.title}</h1>

            {/* Stats Row */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  {formatViews(video.views)} مشاهدة
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {new Date(video.releaseDate).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {formatTime(video.duration)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "gap-2 rounded-full border-border hover:border-primary/50",
                    isLiked && "bg-primary/10 border-primary text-primary"
                  )}
                  onClick={() => setIsLiked(!isLiked)}
                >
                  <ThumbsUp className={cn("w-4 h-4", isLiked && "fill-current")} />
                  إعجاب
                </Button>
                <Button variant="outline" size="sm" className="gap-2 rounded-full border-border hover:border-primary/50">
                  <ThumbsDown className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" className="gap-2 rounded-full border-border hover:border-primary/50">
                  <Share2 className="w-4 h-4" />
                  مشاركة
                </Button>
                <Button variant="outline" size="sm" className="gap-2 rounded-full border-border hover:border-primary/50">
                  <Download className="w-4 h-4" />
                  تنزيل
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full w-9 h-9">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Artist Card */}
            {artist && (
              <div className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-4">
                  <img
                    src={artist.avatar}
                    alt={artist.name}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/20"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-foreground">{artist.name}</h3>
                      {artist.verified && <BadgeCheck className="w-4 h-4 text-primary fill-primary/20" />}
                    </div>
                    <p className="text-sm text-muted-foreground">{(artist.followers / 1_000_000).toFixed(1)}M متابع</p>
                    <div className="flex items-center gap-1 mt-1">
                      {artist.genres.slice(0, 2).map(g => (
                        <span key={g} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{g}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6"
                  onClick={() => navigate(`/artists/${artist.id}`)}
                >
                  متابعة
                </Button>
              </div>
            )}

            {/* Description */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className={cn("text-sm text-muted-foreground leading-relaxed", !showDescription && "line-clamp-3")}>
                <p>
                  {video.title} — من أروع إنتاجات اتحاد الشعراء والمنشدين لهذا العام.
                  يُقدّم {video.artistName} في هذا الفيديو تجربة فنية استثنائية تجمع بين أصالة الكلمة العربية وعذوبة الصوت وروعة الإنتاج البصري.
                </p>
                <p className="mt-2">
                  تم تسجيل هذا العمل في استوديوهات الاتحاد بأعلى مستويات الجودة الصوتية والمرئية، ليكون إضافة نوعية لمكتبة الأناشيد الإسلامية والعربية الراقية.
                </p>
                {showDescription && (
                  <div className="mt-2 space-y-2">
                    <p>المقطع الصوتي: {video.duration} ثانية | الجودة: 4K Ultra HD</p>
                    <p>الحقوق محفوظة © 2026 اتحاد الشعراء والمنشدين</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {['#إنشاد', '#أناشيد_إسلامية', '#اتحاد_الشعراء', '#موسيقى_روحانية'].map(tag => (
                        <span key={tag} className="text-primary text-xs">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowDescription(!showDescription)}
                className="flex items-center gap-1 mt-2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                {showDescription ? 'عرض أقل' : 'عرض المزيد'}
                <ChevronDown className={cn("w-4 h-4 transition-transform", showDescription && "rotate-180")} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
              <button
                onClick={() => setActiveTab('related')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-all",
                  activeTab === 'related' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <List className="w-4 h-4" />
                فيديوهات مشابهة
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-all",
                  activeTab === 'comments' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <MessageCircle className="w-4 h-4" />
                التعليقات ({mockComments.length})
              </button>
            </div>

            {/* Comments Tab */}
            <AnimatePresence mode="wait">
              {activeTab === 'comments' && (
                <motion.div
                  key="comments"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {/* Comment Input */}
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                      أ
                    </div>
                    <div className="flex-1">
                      <input
                        placeholder="أضف تعليقاً..."
                        className="w-full bg-transparent border-b border-border pb-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  {mockComments.map((comment, i) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex gap-3"
                    >
                      <img src={comment.avatar} alt={comment.user} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-foreground">{comment.user}</span>
                          <span className="text-xs text-muted-foreground">{comment.time}</span>
                        </div>
                        <p className="text-sm text-foreground/80 leading-relaxed">{comment.text}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                            <ThumbsUp className="w-3.5 h-3.5" />
                            {comment.likes.toLocaleString('ar')}
                          </button>
                          <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">رد</button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Related Videos Mobile */}
              {activeTab === 'related' && (
                <motion.div
                  key="related"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="xl:hidden space-y-3"
                >
                  {relatedVideos.map((rv, i) => (
                    <VideoCard key={rv.id} video={rv} index={i} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Sidebar - Related Videos (Desktop) */}
        <div className="hidden xl:block space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-foreground text-base">فيديوهات مشابهة</h2>
            <Button variant="ghost" size="sm" className="text-muted-foreground text-xs gap-1">
              <Repeat className="w-3.5 h-3.5" />
              تشغيل تلقائي
            </Button>
          </div>

          <div className="space-y-3">
            {relatedVideos.map((rv, i) => (
              <VideoCard key={rv.id} video={rv} index={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoCard({ video, index }: { video: { id: string; title: string; artistName: string; thumbnailUrl: string; duration: number; views: number; releaseDate: string }; index: number }) {
  const navigate = useNavigate();
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const formatViews = (v?: number) => (v || 0) >= 1_000_000 ? `${((v || 0) / 1_000_000).toFixed(1)}M` : `${((v || 0) / 1_000).toFixed(0)}K`;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ x: -4 }}
      onClick={() => navigate(`/videos/${video.id}`)}
      className="flex gap-3 cursor-pointer group"
    >
      <div className="relative w-40 flex-shrink-0 rounded-xl overflow-hidden aspect-video">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Play className="w-8 h-8 text-white fill-white" />
        </div>
        <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded-md font-mono">
          {formatTime(video.duration)}
        </span>
      </div>
      <div className="flex-1 min-w-0 py-0.5">
        <h4 className="text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">{video.title}</h4>
        <p className="text-xs text-muted-foreground mt-1.5">{video.artistName}</p>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <span>{formatViews(video.views)} مشاهدة</span>
          <span>·</span>
          <span>{new Date(video.releaseDate).getFullYear()}</span>
        </div>
      </div>
    </motion.div>
  );
}
