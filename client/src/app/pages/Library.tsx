import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import TrackCard from '../components/cards/TrackCard';
import AlbumCard from '../components/cards/AlbumCard';
import PoemCard from '../components/cards/PoemCard';
import { motion } from 'motion/react';
import { Music, Clock, FileText } from 'lucide-react';
import { useDataStore } from "../../app/store/dataStore";

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

export default function Library() {
    const { tracks, albums, playlists: publicPlaylists, userPlaylists, poems, getTrackById } = useDataStore();
    const navigate = useNavigate();
    const [historyIds, setHistoryIds] = useState<string[]>([]);

    useEffect(() => {
      const h = localStorage.getItem('history');
      if (h) setHistoryIds(JSON.parse(h));
    }, []);

    const historyTracks = historyIds.map(id => getTrackById(id)).filter(Boolean) as any[];
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold mb-2">مكتبتي</h1>
        <p className="text-muted-foreground">جميع موسيقاك وقصائدك المفضلة في مكان واحد</p>
      </motion.div>

      <Tabs defaultValue="tracks" className="w-full">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="tracks">الزوامل</TabsTrigger>
          <TabsTrigger value="albums">الألبومات</TabsTrigger>
          <TabsTrigger value="poems">القصائد</TabsTrigger>
          <TabsTrigger value="playlists">قوائم التشغيل</TabsTrigger>
          <TabsTrigger value="history">السجل</TabsTrigger>
        </TabsList>

        <TabsContent value="tracks" className="mt-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-secondary/50 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5 text-purple-400" />
                <h2 className="text-2xl font-bold">زواملك</h2>
              </div>
              <span className="text-sm text-muted-foreground">{tracks.length} زامل</span>
            </div>
            <div className="space-y-2">
              {tracks.map((track, index) => (
                <TrackCard key={track.id} track={track} index={index} showCover={true} />
              ))}
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="albums" className="mt-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {albums.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="poems" className="mt-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 md:grid-cols-4 gap-6">
              {poems.map((poem) => (
                <PoemCard key={poem.id} poem={poem} />
              ))}
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="playlists" className="mt-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 md:grid-cols-4 gap-6">
              {(userPlaylists.length > 0 ? userPlaylists : publicPlaylists).map((playlist: any) => {
                const trackCount = Array.isArray(playlist.tracks) ? playlist.tracks.length : (playlist.tracks?.length || 0);
                return (
                  <motion.div
                    key={playlist.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => navigate(`/playlists/${playlist.id}`)}
                    className="group bg-secondary/50 hover:bg-secondary p-4 rounded-xl transition-all cursor-pointer"
                  >
                    <div className="relative mb-4">
                      <img
                        src={playlist.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400'}
                        alt={playlist.name}
                        className="w-full aspect-square object-cover rounded-lg shadow-lg"
                      />
                    </div>
                    <h3 className="font-semibold text-white truncate mb-1">
                      {playlist.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {trackCount} زامل
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-secondary/50 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-purple-400" />
              <h2 className="text-2xl font-bold">سجل الاستماع</h2>
            </div>
            <div className="space-y-2">
              {historyTracks.length > 0 ? (
                historyTracks.map((track, index) => (
                  <TrackCard key={track.id} track={track} index={index} showCover={true} />
                ))
              ) : (
                <div className="text-center text-muted-foreground py-10">لا يوجد سجل استماع بعد</div>
              )}
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}