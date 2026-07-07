import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { Settings, Music, Heart, ListMusic } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import TrackCard from '../components/cards/TrackCard';
import { useDataStore } from "../../app/store/dataStore";

export default function Profile() {
  const { getTrackById, getArtistById, userPlaylists: storeUserPlaylists } = useDataStore();
  const { user } = useAuth();

  if (!user) return <div>Please login</div>;

  const userLikedTracks = user.likedSongs.map(id => getTrackById(id)).filter(Boolean) as any[];
  const userPlaylists = storeUserPlaylists.length > 0 ? storeUserPlaylists : (user.playlists || []).map((id: string) => ({ id, name: 'قائمة', coverUrl: '', tracks: [] }));
  const userFollowedArtists = user.followedArtists.map(id => getArtistById(id)).filter(Boolean) as any[];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-48 md:h-64 rounded-3xl overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600"></div>
        <div className="absolute inset-0 flex items-end p-8">
          <div className="flex items-end gap-6">
            <img src={user.avatar} alt={user.name} className="w-32 h-32 rounded-full border-4 border-white/20" />
            <div>
              <p className="text-sm font-semibold mb-1">الملف الشخصي</p>
              <h1 className="text-5xl font-bold mb-2">{user.name}</h1>
              <p className="text-gray-200">{user.email}</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex justify-between items-center">
        <div className="flex gap-8">
          <div>
            <div className="text-3xl font-bold text-purple-400">{user.followedArtists.length}</div>
            <div className="text-sm text-muted-foreground">متابع</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-400">{user.likedSongs.length}</div>
            <div className="text-sm text-muted-foreground">زامل مفضلة</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-400">{user.playlists.length}</div>
            <div className="text-sm text-muted-foreground">قائمة تشغيل</div>
          </div>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => alert('سيتم توفير هذه الميزة قريباً')}>
          <Settings className="w-4 h-4" />
          تعديل الملف الشخصي
        </Button>
      </div>

      <Tabs defaultValue="liked" className="w-full">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="liked">الزوامل المفضلة</TabsTrigger>
          <TabsTrigger value="playlists">قوائم التشغيل</TabsTrigger>
          <TabsTrigger value="following">المتابَعون</TabsTrigger>
        </TabsList>

        <TabsContent value="liked" className="mt-6">
          <div className="bg-secondary/50 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-purple-400" />
              <h2 className="text-2xl font-bold">زواملك المفضلة</h2>
            </div>
            <div className="space-y-2">
              {userLikedTracks.length > 0 ? userLikedTracks.map((track, index) => (
                <TrackCard key={track.id} track={track} index={index} showCover={true} />
              )) : (
                <div className="text-muted-foreground">لا توجد أغانٍ مفضلة</div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="playlists" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-2 md:grid-cols-4 gap-6">
            {userPlaylists.length > 0 ? userPlaylists.map((playlist) => (
              <div key={playlist.id} className="bg-secondary/50 p-4 rounded-xl cursor-pointer hover:bg-secondary transition-colors">
                <img src={playlist.coverUrl} alt={playlist.name} className="w-full aspect-square rounded-lg mb-3 object-cover" />
                <h3 className="font-semibold truncate">{playlist.name}</h3>
                <p className="text-sm text-muted-foreground">{playlist.tracks.length} زامل</p>
              </div>
            )) : (
              <div className="text-muted-foreground col-span-full">لا توجد قوائم تشغيل</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="following" className="mt-6">
          <div className="bg-secondary/50 rounded-2xl p-6">
            {userFollowedArtists.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-2 md:grid-cols-4 gap-6">
                {userFollowedArtists.map(artist => (
                  <div key={artist.id} className="text-center p-4 bg-secondary/50 rounded-xl hover:bg-secondary cursor-pointer">
                    <img src={artist.avatar} alt={artist.name} className="w-20 h-20 rounded-full mx-auto mb-3 object-cover" />
                    <h3 className="font-medium">{artist.name}</h3>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">لم تتابع أي فنان بعد</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
