import { useState, useMemo } from 'react';
import { useParams } from 'react-router';
import { Button } from '../components/ui/button';
import { Play, UserPlus, Share2, CheckCircle2, SlidersHorizontal, ArrowDownAZ } from 'lucide-react';
import TrackCard from '../components/cards/TrackCard';
import AlbumCard from '../components/cards/AlbumCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useDataStore } from "../../app/store/dataStore";

export default function ArtistProfile() {
  const { getArtistById, getTracksByArtistId, getAlbumsByArtistId, poets } = useDataStore();
  const { id } = useParams();
  const artist = getArtistById(id!);
  const allTracks = getTracksByArtistId(id!);
  const albums = getAlbumsByArtistId(id!);
  const { user, followArtist } = useAuth();

  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'popular'
  const [filterPoet, setFilterPoet] = useState('all');

  const filteredAndSortedTracks = useMemo(() => {
    let result = [...allTracks];

    // Filter by Poet
    if (filterPoet !== 'all') {
      result = result.filter(t => t.poetId === filterPoet);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      if (sortBy === 'popular') return (b.views || 0) - (a.views || 0);
      return 0;
    });

    return result;
  }, [allTracks, sortBy, filterPoet]);

  if (!artist) {
    return <div>Artist not found</div>;
  }

  const isFollowing = user?.followedArtists?.includes(artist.id);

  // Extract unique poets from the artist's tracks for the filter dropdown
  const artistPoetIds = Array.from(new Set(allTracks.map(t => t.poetId).filter(Boolean)));
  const artistPoets = poets.filter(p => artistPoetIds.includes(p.id));

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-72 md:h-96 -mt-6 -mx-6 mb-8 rounded-b-3xl overflow-hidden"
      >
        <img
          src={artist.coverImage}
          alt={artist.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent mix-blend-overlay"></div>
        
        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
          <div className="flex items-center gap-6 mb-6">
            <img
              src={artist.avatar}
              alt={artist.name}
              className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-background shadow-2xl"
            />
            <div>
              {artist.verified && (
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-[#1ed760]" />
                  <span className="text-sm text-[#1ed760] font-bold">فنان موثق</span>
                </div>
              )}
              <h1 className="text-5xl md:text-7xl font-bold mb-4 text-foreground tracking-tighter drop-shadow-lg">{artist.name}</h1>
              <p className="text-lg text-secondary-foreground font-medium">
                {(artist.monthlyListeners / 1000000).toFixed(1)}M مستمع شهرياً
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button size="icon" className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 hover:scale-105 shadow-[0_8px_16px_rgba(0,0,0,0.5)] transition-transform">
              <Play className="w-6 h-6 text-primary-foreground fill-current ml-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => followArtist(artist.id)}
              className="rounded-full px-6 border-white/30 text-foreground hover:bg-secondary hover:border-white font-bold tracking-wide"
            >
              {isFollowing ? 'متابع' : 'متابعة'}
            </Button>
            <Button size="icon" variant="ghost" className="rounded-full w-12 h-12 text-muted-foreground hover:text-foreground hover:bg-secondary">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="tracks">الزوامل والمقاطع</TabsTrigger>
          <TabsTrigger value="albums">الألبومات</TabsTrigger>
          <TabsTrigger value="about">عن الفنان</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">الأكثر استماعاً</h2>
            <div className="bg-secondary/50 rounded-2xl p-6">
              <div className="space-y-2">
                {allTracks.sort((a,b) => (b.views||0) - (a.views||0)).slice(0, 5).map((track, index) => (
                  <TrackCard key={track.id} track={track} index={index} showCover={true} />
                ))}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">الألبومات</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {albums.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tracks" className="mt-6">
          <div className="bg-secondary/50 rounded-2xl p-6">
            
            {/* Filters & Sorting Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 border-b border-white/10 pb-6">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
                <span className="font-semibold text-muted-foreground">تصفية حسب:</span>
                
                <select 
                  className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={filterPoet}
                  onChange={(e) => setFilterPoet(e.target.value)}
                >
                  <option value="all" className="bg-card">جميع الشعراء</option>
                  {artistPoets.map(poet => (
                    <option key={poet.id} value={poet.id} className="bg-card">{poet.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <ArrowDownAZ className="w-5 h-5 text-muted-foreground" />
                <span className="font-semibold text-muted-foreground">الترتيب:</span>
                <select 
                  className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest" className="bg-card">الأحدث أولاً</option>
                  <option value="oldest" className="bg-card">الأقدم أولاً</option>
                  <option value="popular" className="bg-card">الأكثر استماعاً</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              {filteredAndSortedTracks.length > 0 ? (
                filteredAndSortedTracks.map((track, index) => (
                  <TrackCard key={track.id} track={track} index={index} showCover={true} />
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  لا توجد زوامل تطابق بحثك حالياً.
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="albums" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="about" className="mt-6">
          <div className="bg-secondary/50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-4">عن {artist.name}</h2>
            <p className="text-muted-foreground text-lg mb-6">{artist.bio}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <div className="text-3xl font-bold text-purple-400 mb-1">
                  {(artist.followers / 1000000).toFixed(1)}M
                </div>
                <div className="text-sm text-muted-foreground">متابع</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-400 mb-1">
                  {(artist.monthlyListeners / 1000000).toFixed(1)}M
                </div>
                <div className="text-sm text-muted-foreground">مستمع شهرياً</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-400 mb-1">
                  {artist.genres.length}
                </div>
                <div className="text-sm text-muted-foreground">نوع موسيقي</div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
