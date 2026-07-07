import { useNavigate } from 'react-router';
import { Play, Pause, MoreHorizontal } from 'lucide-react';
import { Button } from '../ui/button';
import { motion } from 'motion/react';
import { usePlayer } from '../../contexts/PlayerContext';
import { Album } from "../../types";
import { useDataStore } from "../../../app/store/dataStore";

type AlbumCardProps = {
  album: Album;
};

export default function AlbumCard({ album }: AlbumCardProps) {
    const { tracks } = useDataStore();
  const navigate = useNavigate();
  const { currentTrack, isPlaying, playTrack, pause } = usePlayer();
  const albumTracks = tracks.filter(t => t.albumId === album.id);
  const isCurrentAlbum = albumTracks.some(t => t.id === currentTrack?.id);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentAlbum && isPlaying) {
      pause();
    } else if (albumTracks.length > 0) {
      playTrack(albumTracks[0]);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="group glass-card p-4 rounded-2xl cursor-pointer focus-within:ring-2 focus-within:ring-primary/30 outline-none transition-all duration-200"
      onClick={() => navigate(`/albums/${album.id}`)}
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), navigate(`/albums/${album.id}`))}
    >
      <div className="relative mb-4">
        <div className="aspect-square rounded-xl overflow-hidden shadow-md">
          <img
            src={album.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400'}
            alt={album.title}
            className="w-full h-full object-cover group-hover:scale-[1.03] motion-safe transition-transform duration-300"
          />
        </div>

        {/* Play Button - Spotify Style (Bottom Right) */}
        <div className="absolute bottom-2 left-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <Button
            variant="default"
            size="icon"
            className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 shadow-[0_8px_16px_rgba(0,0,0,0.5)] hover:scale-110 transition-transform"
            onClick={handlePlay}
          >
            {isCurrentAlbum && isPlaying
              ? <Pause className="w-5 h-5 text-primary-foreground fill-current" />
              : <Play className="w-5 h-5 text-primary-foreground fill-current ml-1" />
            }
          </Button>
        </div>

        {/* Playing Indicator */}
        {isCurrentAlbum && (
          <div className="absolute top-2 right-2 bg-primary/90 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1">
            <div className="flex items-end gap-0.5 h-3">
              {[3, 5, 4].map((h, i) => (
                <motion.div
                  key={i}
                  animate={isPlaying ? { height: [`${h}px`, `${h + 3}px`, `${h}px`] } : {}}
                  transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.15 }}
                  className="w-0.5 bg-white rounded-full"
                  style={{ height: `${h}px` }}
                />
              ))}
            </div>
            <span className="text-white text-[9px]">يُشغَّل</span>
          </div>
        )}
      </div>

      <div className="space-y-0.5">
        <h3 className="text-foreground text-sm font-semibold truncate group-hover:text-primary transition-colors">{album.title}</h3>
        <p className="text-xs text-muted-foreground truncate">{album.artistName}</p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-muted-foreground">
            {new Date(album.releaseDate).getFullYear()} · {album.totalTracks} مقطع
          </p>
          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            {album.genre}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
