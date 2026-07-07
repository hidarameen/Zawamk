import { useState } from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import TrackCard from '../components/cards/TrackCard';
import AlbumCard from '../components/cards/AlbumCard';
import PoemCard from '../components/cards/PoemCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useDataStore } from "../../app/store/dataStore";

import { useAuth } from '../contexts/AuthContext';

export default function Favorites() {
  const { tracks, albums, poems } = useDataStore();
  const { user } = useAuth();
  
  const favoriteTracks = tracks.filter(t => user?.likedSongs?.includes(t.id));
  const favoriteAlbums = albums.slice(0, 0); // Not implemented yet
  const favoritePoems = poems.slice(0, 0); // Not implemented yet

  return (
    <div className="p-6 pb-32 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3">
          <Heart className="w-8 h-8 text-primary fill-primary" />
          <h1 className="text-3xl font-bold">المفضلة</h1>
        </div>
        <p className="text-muted-foreground">
          جميع الزوامل والألبومات والقصائد المفضلة لديك
        </p>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">الكل</TabsTrigger>
          <TabsTrigger value="tracks">الزوامل ({favoriteTracks.length})</TabsTrigger>
          <TabsTrigger value="albums">الألبومات ({favoriteAlbums.length})</TabsTrigger>
          <TabsTrigger value="poems">القصائد ({favoritePoems.length})</TabsTrigger>
        </TabsList>

        {/* All Favorites */}
        <TabsContent value="all" className="space-y-8 mt-6">
          {favoriteTracks.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">الزوامل المفضلة</h2>
              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="space-y-2">
                  {favoriteTracks.map((track, index) => (
                    <TrackCard key={track.id} track={track} index={index} showCover={true} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {favoriteAlbums.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">الألبومات المفضلة</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {favoriteAlbums.map((album, idx) => (
                  <motion.div
                    key={album.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <AlbumCard album={album} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {favoritePoems.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">القصائد المفضلة</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {favoritePoems.map((poem, idx) => (
                  <motion.div
                    key={poem.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <PoemCard poem={poem} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Tracks Only */}
        <TabsContent value="tracks" className="mt-6">
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="space-y-2">
              {favoriteTracks.map((track, index) => (
                <TrackCard key={track.id} track={track} index={index} showCover={true} />
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Albums Only */}
        <TabsContent value="albums" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {favoriteAlbums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </TabsContent>

        {/* Poems Only */}
        <TabsContent value="poems" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {favoritePoems.map((poem) => (
              <PoemCard key={poem.id} poem={poem} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Empty State */}
      {favoriteTracks.length === 0 && favoriteAlbums.length === 0 && favoritePoems.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">لا توجد مفضلات بعد</h2>
          <p className="text-muted-foreground">
            ابدأ بإضافة الزوامل والألبومات والقصائد المفضلة لديك
          </p>
        </motion.div>
      )}
    </div>
  );
}
