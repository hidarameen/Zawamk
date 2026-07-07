import { useParams } from 'react-router';
import { Button } from '../components/ui/button';
import { Play, Heart } from 'lucide-react';
import TrackCard from '../components/cards/TrackCard';
import { motion } from 'motion/react';
import { useDataStore } from "../../app/store/dataStore";
import { usePlayer } from '../contexts/PlayerContext';
import { useState } from 'react';

export default function PlaylistDetail() {
    const { getPlaylistById, getTrackById } = useDataStore();
  const { id } = useParams();
  const playlist = getPlaylistById(id!);
  
  const { setPlaylist } = usePlayer();
  const [saved, setSaved] = useState(false);

  if (!playlist) return <div>Playlist not found</div>;

  const tracks = playlist.tracks ? playlist.tracks.map((trackId: any) => getTrackById(trackId)).filter(Boolean) : [];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex gap-8 items-end"
      >
        <img src={playlist.coverUrl} alt={playlist.name} className="w-64 h-48 md:h-64 rounded-2xl shadow-2xl max-w-full" />
        <div>
          <p className="text-sm font-semibold mb-2">قائمة تشغيل</p>
          <h1 className="text-5xl font-bold mb-4">{playlist.name}</h1>
          <p className="text-muted-foreground mb-4">{playlist.description}</p>
          <p className="text-sm text-muted-foreground">{playlist.tracks?.length || 0} زامل • {playlist.followers.toLocaleString()} متابع</p>
        </div>
      </motion.div>

      <div className="flex gap-4">
        <Button size="lg" className="bg-purple-600 hover:bg-purple-700 rounded-full px-8" onClick={() => tracks.length > 0 && setPlaylist(tracks as any[], 0)}>
          <Play className="w-5 h-5 mr-2 fill-current" />تشغيل
        </Button>
        <Button size="lg" variant={saved ? "default" : "outline"} className="rounded-full" onClick={() => setSaved(!saved)}>
          <Heart className={`w-5 h-5 mr-2 ${saved ? 'fill-current text-white' : ''}`} />حفظ
        </Button>
      </div>

      <div className="bg-secondary/50 rounded-2xl p-6">
        <div className="space-y-2">
          {tracks.map((track, index) => track && (
            <TrackCard key={track.id} track={track} index={index} showCover={true} />
          ))}
        </div>
      </div>
    </div>
  );
}
