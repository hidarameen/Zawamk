import { useState, useEffect } from 'react';
import { Search as SearchIcon, TrendingUp } from 'lucide-react';
import { Input } from '../components/ui/input';
import { motion } from 'motion/react';
import { cn } from '../components/ui/utils';
import TrackCard from '../components/cards/TrackCard';
import AlbumCard from '../components/cards/AlbumCard';
import ArtistCard from '../components/cards/ArtistCard';
import PoemCard from '../components/cards/PoemCard';
import PoetCard from '../components/cards/PoetCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useDataStore } from "../../app/store/dataStore";

export default function Search() {
    const { tracks: localTracks, albums: localAlbums, artists: localArtists, poems: localPoems, poets: localPoets } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [serverResults, setServerResults] = useState<any>(null);
  const [activeType, setActiveType] = useState<string>('all'); // all | نشيد | زامل | etc.

  // Use server search when query is long enough
  const performSearch = async (q: string) => {
    if (!q || q.length < 2) {
      setServerResults(null);
      return;
    }
    try {
      const res = await fetch(`https://music.hidar.eu.cc/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        setServerResults(await res.json());
      }
    } catch {}
  };

  useEffect(() => {
    const t = setTimeout(() => performSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const useServer = !!serverResults && searchQuery.length >= 2;

  const typeFilter = (item: any, typeKey?: string) => {
    if (activeType === 'all') return true;
    return (item.type === activeType) || (item.category === activeType);
  };

  const filteredTracks = (useServer ? (serverResults.tracks || []) : localTracks.filter(t => 
    (t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.artistName?.toLowerCase().includes(searchQuery.toLowerCase()))
  )).filter(t => typeFilter(t));

  const filteredAlbums = useServer ? (serverResults.albums || []) : localAlbums.filter(a => 
    (a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.artistName?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredArtists = useServer ? (serverResults.artists || []) : localArtists.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredPoems = useServer ? [] : localPoems.filter(p => 
    (p.title.toLowerCase().includes(searchQuery.toLowerCase()) || (p.poetName || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const filteredPoets = useServer ? (serverResults.poets || []) : localPoets.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const trendingSearches = [
    'ماهر زين',
    'مشاري راشد',
    'سامي يوسف',
    'المتنبي',
    'قصائد إسلامية',
    'أناشيد رمضان',
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold mb-6">البحث</h1>
        
        <div className="relative max-w-2xl">
          <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="ابحث عن أناشيد، فنانين، قصائد، فرق..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-4 pr-12 h-14 text-lg bg-card border-border focus:border-primary"
          />
        </div>

        {/* Type filters - open-design faceted search */}
        <div className="flex flex-wrap gap-2 pt-2">
          {['all', 'زامل', 'نشيد', 'مرثية', 'أوبريت'].map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={cn(
                "px-4 py-1 text-xs rounded-full border transition-all",
                activeType === t 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-secondary/50 hover:bg-secondary border-border text-muted-foreground'
              )}
            >
              {t === 'all' ? 'الكل' : t}
            </button>
          ))}
        </div>
      </motion.div>

      {!searchQuery ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-purple-400" />
              عمليات البحث الرائجة
            </h2>
            <div className="flex flex-wrap gap-3">
              {trendingSearches.map((term) => (
                <motion.button
                  key={term}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSearchQuery(term)}
                  className="px-5 py-2.5 bg-card hover:bg-accent border border-border rounded-full text-sm font-medium transition-colors text-foreground"
                >
                  {term}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {['إنشاد إسلامي', 'موسيقى تراثية', 'موشحات', 'شعر جاهلي', 'شعر معاصر', 'مدائح نبوية', 'أناشيد وطنية', 'قرآن كريم'].map((genre) => (
              <motion.div
                key={genre}
                whileHover={{ scale: 1.02 }}
                className="relative h-28 rounded-xl overflow-hidden cursor-pointer group border border-border"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/60 to-violet-700/80 group-hover:from-primary/80 group-hover:to-violet-700 transition-all" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="font-bold text-white text-center px-2">{genre}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="bg-card border border-border">
              <TabsTrigger value="all">الكل</TabsTrigger>
              <TabsTrigger value="tracks">الزوامل ({filteredTracks.length})</TabsTrigger>
              <TabsTrigger value="artists">الفنانين ({filteredArtists.length})</TabsTrigger>
              <TabsTrigger value="albums">الألبومات ({filteredAlbums.length})</TabsTrigger>
              <TabsTrigger value="poems">القصائد ({filteredPoems.length})</TabsTrigger>
              <TabsTrigger value="poets">الشاعرين ({filteredPoets.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6 space-y-8">
              {filteredArtists.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">الفنانين</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {filteredArtists.slice(0, 5).map((artist) => (
                      <ArtistCard key={artist.id} artist={artist} />
                    ))}
                  </div>
                </div>
              )}

              {filteredTracks.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">الزوامل</h2>
                  <div className="bg-card border border-border rounded-2xl p-4">
                    <div className="space-y-1">
                      {filteredTracks.slice(0, 10).map((track, index) => (
                        <TrackCard key={track.id} track={track} index={index} showCover={true} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {filteredAlbums.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">الألبومات</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {filteredAlbums.slice(0, 5).map((album) => (
                      <AlbumCard key={album.id} album={album} />
                    ))}
                  </div>
                </div>
              )}

              {filteredPoems.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">القصائد</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {filteredPoems.slice(0, 5).map((poem) => (
                      <PoemCard key={poem.id} poem={poem} />
                    ))}
                  </div>
                </div>
              )}

              {filteredPoets.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">الشاعرين</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {filteredPoets.slice(0, 5).map((poet) => (
                      <PoetCard key={poet.id} poet={poet} />
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="tracks" className="mt-6">
              <div className="bg-card border border-border rounded-2xl p-4">
                <div className="space-y-1">
                  {filteredTracks.map((track, index) => (
                    <TrackCard key={track.id} track={track} index={index} showCover={true} />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="artists" className="mt-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {filteredArtists.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="albums" className="mt-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {filteredAlbums.map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="poems" className="mt-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {filteredPoems.map((poem) => (
                  <PoemCard key={poem.id} poem={poem} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="poets" className="mt-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {filteredPoets.map((poet) => (
                  <PoetCard key={poet.id} poet={poet} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      )}
    </div>
  );
}