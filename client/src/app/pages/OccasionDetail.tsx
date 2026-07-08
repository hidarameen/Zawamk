import { useParams, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowRight, CalendarDays, Music, FileText, Video, Play } from 'lucide-react';
import { Button } from '../components/ui/button';
import { usePlayer } from '../contexts/PlayerContext';
import { useDataStore } from "../../app/store/dataStore";

export default function OccasionDetail() {
    const { getOccasionById, getTrackById, getPoemById, videos: storeVideos } = useDataStore();
  const { id } = useParams();
  const navigate = useNavigate();
  const { playTrack, setPlaylist } = usePlayer();
  const occasion = getOccasionById(id || '');

  if (!occasion) {
    return (
      <div className="flex flex-col items-center justify-center h-72 md:h-96 text-center">
        <CalendarDays className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="font-semibold mb-2">المناسبة غير موجودة</h2>
        <Button onClick={() => navigate('/occasions')} variant="outline">العودة للمناسبات</Button>
      </div>
    );
  }

  const tracks = occasion.trackIds.map(id => getTrackById(id)).filter(Boolean);
  const poemsList = occasion.poemIds.map(id => getPoemById(id)).filter(Boolean);
  const videos = storeVideos.filter(v => occasion.videoIds.includes(v.id));

  const handlePlayAll = () => {
    const validTracks = tracks.filter(Boolean) as NonNullable<typeof tracks[0]>[];
    if (validTracks.length > 0) setPlaylist(validTracks, 0);
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Back */}
      <Button variant="ghost" onClick={() => navigate('/occasions')} className="gap-2">
        <ArrowRight className="w-4 h-4" />
        المناسبات السنوية
      </Button>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-56 md:h-72 rounded-3xl overflow-hidden"
      >
        <img
          src={occasion.coverUrl}
          alt={occasion.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${occasion.color} opacity-60`} />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-black/50 backdrop-blur-sm border border-white/20 text-white text-sm px-3 py-1.5 rounded-full">
              {occasion.type}
            </span>
            <span className="bg-black/50 backdrop-blur-sm border border-white/20 text-white text-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4" />
              {occasion.date}
            </span>
          </div>
          <h1 className="text-white">{occasion.title}</h1>
        </div>
      </motion.div>

      {/* Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <p className="text-muted-foreground leading-loose">{occasion.description}</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-2 md:grid-cols-3 gap-4"
      >
        {[
          { icon: Music, label: 'أناشيد', value: tracks.length },
          { icon: FileText, label: 'قصائد', value: poemsList.length },
          { icon: Video, label: 'فيديوهات', value: videos.length },
        ].map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-4 text-center">
            <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-primary">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Tracks */}
      {tracks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Music className="w-5 h-5 text-primary" />
            الأناشيد والزوامل
          </h2>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {tracks.map((track, idx) => (
              track && (
                <div
                  key={track.id}
                  className="flex items-center gap-4 p-4 hover:bg-accent/30 transition-colors cursor-pointer group border-b border-border last:border-0"
                  onClick={() => playTrack(track)}
                >
                  <span className="w-6 text-center text-sm text-muted-foreground group-hover:hidden">{idx + 1}</span>
                  <Play className="w-4 h-4 text-primary hidden group-hover:block flex-shrink-0" />
                  <img src={track.coverUrl} alt={track.title} className="w-10 h-10 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{track.title}</p>
                    <p className="text-sm text-muted-foreground">{track.artistName}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{formatDuration(track.duration)}</span>
                </div>
              )
            ))}
            <Button
              onClick={handlePlayAll}
              className="w-full p-4 bg-primary text-primary-foreground font-semibold rounded-xl mt-4"
            >
              تشغيل الكل
            </Button>
          </div>
        </motion.div>
      )}

      {/* Poems */}
      {poemsList.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            القصائد
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {poemsList.map(poem => (
              poem && (
                <div
                  key={poem.id}
                  onClick={() => navigate(`/poem/${poem.id}`)}
                  className="bg-card border border-border rounded-xl p-5 cursor-pointer hover:border-primary/40 hover:bg-accent/30 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <img src={poem.coverUrl} alt={poem.title} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1 leading-snug">{poem.title}</h3>
                      <p className="text-sm text-muted-foreground">{poem.poetName}</p>
                      <span className="inline-block mt-2 text-xs bg-accent text-accent-foreground px-2 py-1 rounded">{poem.category}</span>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        </motion.div>
      )}

      {/* Videos */}
      {videos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" />
            الفيديوهات
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map(video => (
              <div
                key={video.id}
                onClick={() => navigate('/videos')}
                className="group relative rounded-xl overflow-hidden cursor-pointer border border-border hover:border-primary/40 shadow-sm hover:shadow-md transition-all"
              >
                <div className="relative aspect-video">
                  <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 border border-white/30">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="bg-card p-3">
                  <p className="font-medium text-foreground text-sm truncate">{video.title}</p>
                  <p className="text-xs text-muted-foreground">{video.artistName}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}