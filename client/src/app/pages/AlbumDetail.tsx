import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { Button } from '../components/ui/button';
import { usePlayer } from '../contexts/PlayerContext';
import { useAuth } from '../contexts/AuthContext';
import {
  Play, Pause, Heart, Share2, Download, MoreHorizontal,
  Clock, ChevronRight, ShuffleIcon, BadgeCheck, Music2,
  ListMusic, Disc3, Star,
} from 'lucide-react';
import TrackCard from '../components/cards/TrackCard';
import ReviewSection from '../components/reviews/ReviewSection';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../components/ui/utils';
import { useDataStore } from "../../app/store/dataStore";

export default function AlbumDetail() {
    const { getAlbumById, getArtistById, tracks } = useDataStore();
  const { id } = useParams();
  const navigate = useNavigate();
  const album = getAlbumById(id!);
  const albumTracks = tracks.filter(t => t.albumId === id);
  const artist = album ? getArtistById(album.artistId) : null;
  const { currentTrack, isPlaying, playTrack, pause, resume, toggleShuffle, addToQueue, setPlaylist } = usePlayer();
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'tracks' | 'about'>('tracks');

  const isCurrentAlbum = albumTracks.some(t => t.id === currentTrack?.id);
  const totalDuration = albumTracks.reduce((sum, t) => sum + t.duration, 0);
  const formatTime = (s: number) => `${Math.floor(s / 60)} د ${s % 60} ث`;
  const formatTotalDuration = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h} ساعة ${m} دقيقة` : `${m} دقيقة`;
  };

  const handlePlay = () => {
    if (isCurrentAlbum && isPlaying) {
      pause();
    } else if (isCurrentAlbum && !isPlaying) {
      resume();
    } else if (albumTracks.length > 0) {
      setPlaylist(albumTracks, 0);
    }
  };

  const handleShuffle = () => {
    if (albumTracks.length > 0) {
      const shuffled = [...albumTracks].sort(() => Math.random() - 0.5);
      setPlaylist(shuffled, 0);
      toggleShuffle();
    }
  };

  if (!album) {
    return (
      <div className="flex flex-col items-center justify-center h-72 md:h-96 gap-4">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
          <Disc3 className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">الألبوم غير موجود</p>
        <Button onClick={() => navigate('/albums')}>العودة للألبومات</Button>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative"
      >
        {/* Background Blur */}
        <div
          className="absolute inset-0 -top-6 -left-6 -right-6 h-64 md:h-80 opacity-30 blur-3xl"
          style={{
            backgroundImage: `url(${album.coverUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 h-64 md:h-80 bg-gradient-to-b from-background/50 via-background/80 to-background" />

        {/* Content */}
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-end pb-8">
          {/* Breadcrumb */}
          <div className="absolute top-0 left-0 right-0 flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/albums" className="hover:text-primary transition-colors">الألبومات</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">{album.title}</span>
          </div>

          {/* Cover */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
            className="mt-8 flex-shrink-0"
          >
            <div className="relative w-52 h-52 md:w-64 md:h-64 max-w-full">
              <img
                src={album.coverUrl}
                alt={album.title}
                className="w-full h-full rounded-2xl object-cover shadow-2xl"
              />
              {/* Play overlay on cover */}
              <motion.div
                whileHover={{ opacity: 1 }}
                initial={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center cursor-pointer"
                onClick={handlePlay}
              >
                {isCurrentAlbum && isPlaying
                  ? <Pause className="w-12 h-12 text-white fill-white" />
                  : <Play className="w-12 h-12 text-white fill-white ml-1" />
                }
              </motion.div>
              {/* Gradient reflection */}
              <div className="absolute -bottom-3 left-2 right-2 h-6 bg-black/20 blur-sm rounded-full" />
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1 pb-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full">ألبوم</span>
              <span className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full">{album.genre}</span>
            </div>
            <h1 className="text-foreground mb-3">{album.title}</h1>

            <div className="flex items-center gap-3 mb-4">
              {artist && (
                <button
                  onClick={() => navigate(`/artists/${artist.id}`)}
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <img src={artist.avatar} alt={artist.name} className="w-6 h-6 rounded-full object-cover" />
                  <span className="text-sm text-foreground font-medium">{artist.name}</span>
                  {artist.verified && <BadgeCheck className="w-4 h-4 text-primary" />}
                </button>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
              <span>{new Date(album.releaseDate).getFullYear()}</span>
              <span>·</span>
              <span>{album.totalTracks} مقطع</span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {formatTotalDuration(totalDuration)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 gap-2 shadow-lg shadow-primary/30"
                onClick={handlePlay}
              >
                {isCurrentAlbum && isPlaying
                  ? <><Pause className="w-5 h-5 fill-current" />إيقاف</>
                  : <><Play className="w-5 h-5 fill-current" />تشغيل</>
                }
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-border hover:border-primary/40 gap-2"
                onClick={handleShuffle}
              >
                <ShuffleIcon className="w-4 h-4" />
                عشوائي
              </Button>

              <Button
                size="icon"
                variant="ghost"
                className={cn("rounded-full w-11 h-11 border border-border hover:border-primary/40", isSaved && "text-primary border-primary bg-primary/10")}
                onClick={() => setIsSaved(!isSaved)}
              >
                <Heart className={cn("w-5 h-5", isSaved && "fill-current")} />
              </Button>

              <Button
                size="icon"
                variant="ghost"
                className="rounded-full w-11 h-11 border border-border hover:border-primary/40"
              >
                <Share2 className="w-5 h-5" />
              </Button>

              <Button
                size="icon"
                variant="ghost"
                className="rounded-full w-11 h-11"
              >
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6"
      >
        {[
          { icon: Music2, label: 'المقاطع', value: album.totalTracks.toString() },
          { icon: Clock, label: 'المدة الإجمالية', value: formatTotalDuration(totalDuration) },
          { icon: Star, label: 'التقييم', value: '4.9 ⭐' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-4 text-center">
            <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-foreground font-medium text-sm">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-muted rounded-xl p-1 mb-6">
        <button
          onClick={() => setActiveTab('tracks')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm transition-all",
            activeTab === 'tracks' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <ListMusic className="w-4 h-4" />
          المقاطع ({album.totalTracks})
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm transition-all",
            activeTab === 'about' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Disc3 className="w-4 h-4" />
          عن الألبوم
        </button>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'tracks' && (
          <motion.div
            key="tracks"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Track List Header */}
            <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 pb-3 text-xs text-muted-foreground uppercase tracking-wider border-b border-border mb-2">
              <span className="w-8">#</span>
              <span>العنوان</span>
              <span className="hidden md:block">الألبوم</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /></span>
            </div>

            <div className="space-y-1">
              {albumTracks.length > 0 ? (
                albumTracks.map((track, index) => (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <TrackCard track={track} index={index} showCover={false} />
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Music2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>لا توجد مقاطع في هذا الألبوم</p>
                </div>
              )}
            </div>

            {/* Add to queue batch action */}
            {albumTracks.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-6 flex items-center justify-between p-4 bg-card border border-border rounded-2xl"
              >
                <div>
                  <p className="text-sm text-foreground font-medium">إضافة الألبوم كاملاً</p>
                  <p className="text-xs text-muted-foreground">{albumTracks.length} مقطع · {formatTotalDuration(totalDuration)}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full gap-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                  onClick={() => albumTracks.forEach(t => addToQueue(t))}
                >
                  <ListMusic className="w-4 h-4" />
                  إضافة للقائمة
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === 'about' && (
          <motion.div
            key="about"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Artist Card */}
            {artist && (
              <div
                className="flex items-center gap-5 p-6 bg-card border border-border rounded-2xl cursor-pointer hover:border-primary/30 transition-colors"
                onClick={() => navigate(`/artists/${artist.id}`)}
              >
                <img
                  src={artist.coverImage || artist.avatar}
                  alt={artist.name}
                  className="w-20 h-20 rounded-xl object-cover shadow-lg"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-foreground">{artist.name}</h3>
                    {artist.verified && <BadgeCheck className="w-5 h-5 text-primary" />}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{artist.bio}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-foreground font-medium">
                      {(artist.followers / 1_000_000).toFixed(1)}M
                    </span>
                    <span className="text-xs text-muted-foreground">متابع</span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                    {artist.genres.map(g => (
                      <span key={g} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{g}</span>
                    ))}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            )}

            {/* Album Details */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h3 className="text-foreground text-base">تفاصيل الألبوم</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { label: 'تاريخ الإصدار', value: new Date(album.releaseDate).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }) },
                  { label: 'النوع', value: album.genre },
                  { label: 'عدد المقاطع', value: `${album.totalTracks} مقطع` },
                  { label: 'الشركة', value: 'اتحاد الشعراء والمنشدين' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-muted/50 rounded-xl p-3">
                    <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                    <p className="text-sm text-foreground font-medium">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}