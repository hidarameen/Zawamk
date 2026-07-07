import { create } from 'zustand';
import { Track, Album, Artist, Playlist, Band, Poet, Poem, NewsItem, Occasion, MusicVideo } from '../types';
import { apiPost, apiPut, apiDelete } from '../services/api';

interface DataState {
  tracks: Track[];
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
  bands: Band[];
  poets: Poet[];
  poems: Poem[];
  news: NewsItem[];
  occasions: Occasion[];
  videos: MusicVideo[];
  loading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
  addEntity: (type: string, data: any) => Promise<boolean>;
  updateEntity: (type: string, id: string, data: any) => Promise<boolean>;
  deleteEntity: (type: string, id: string) => Promise<boolean>;

  // Helpers
  getTrackById: (id: string) => Track | undefined;
  getVideoById: (id: string) => MusicVideo | undefined;
  getArtistById: (id: string) => Artist | undefined;
  getBandById: (id: string) => Band | undefined;
  getAlbumById: (id: string) => Album | undefined;
  getPlaylistById: (id: string) => Playlist | undefined;
  getNewsById: (id: string) => NewsItem | undefined;
  getOccasionById: (id: string) => Occasion | undefined;
  getTracksByArtistId: (artistId: string) => Track[];
  getAlbumsByArtistId: (artistId: string) => Album[];
  getVideosByArtistId: (artistId: string) => MusicVideo[];
  getPoetById: (id: string) => Poet | undefined;
  getPoemById: (id: string) => Poem | undefined;
  getPoemsByPoetId: (poetId: string) => Poem[];
  getPoemsByEra: (era: string) => Poem[];
  getPoemsByCategory: (category: string) => Poem[];
  getTracksByType: (type: string) => Track[];
  getTracksByPoetId: (poetId: string) => Track[];
  getTracksByOccasionId: (occasionId: string) => Track[];
  getTracksByAlbumId: (albumId: string) => Track[];
  getTracksByBandId: (bandId: string) => Track[];
  getVideosByOccasionId: (occasionId: string) => MusicVideo[];
  getPoemsByOccasionId: (occasionId: string) => Poem[];
  getTopTracks: (limit?: number) => Track[];
  getRecentTracks: (limit?: number) => Track[];
  getFeaturedNews: () => NewsItem[];
  getRecentNews: (limit?: number) => NewsItem[];

  // User data
  userPlaylists: any[];
  fetchUserPlaylists: () => Promise<void>;
  addTrackToPlaylist: (playlistId: string, trackId: string) => Promise<boolean>;
  createPlaylist: (data: { name: string; description?: string }) => Promise<any>;
}

const CACHE_KEY = 'musicAppDataCacheV4';
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

function loadFromCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (!data || Date.now() - ts > CACHE_TTL_MS) return null;
    // only restore if has some data
    if (data.tracks && data.tracks.length > 0) {
      return data;
    }
  } catch (e) {}
  return null;
}

function saveToCache(data: Partial<DataState>) {
  try {
    const toSave = {
      tracks: data.tracks || [],
      albums: data.albums || [],
      artists: data.artists || [],
      playlists: data.playlists || [],
      bands: data.bands || [],
      poets: data.poets || [],
      poems: data.poems || [],
      news: data.news || [],
      occasions: data.occasions || [],
      videos: data.videos || [],
      lastFetch: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data: toSave, ts: Date.now() }));
  } catch (e) {}
}

const cached = loadFromCache() || {};

export const useDataStore = create<DataState>((set, get) => ({
  tracks: cached.tracks || [],
  albums: cached.albums || [],
  artists: cached.artists || [],
  playlists: cached.playlists || [],
  bands: cached.bands || [],
  poets: cached.poets || [],
  poems: cached.poems || [],
  news: cached.news || [],
  occasions: cached.occasions || [],
  videos: cached.videos || [],
  loading: !(cached.tracks && cached.tracks.length > 0),
  error: null,
  
  fetchData: async (force = false) => {
    // Skip full load if we have cached data and not forcing
    if (!force && get().tracks && get().tracks.length > 0) {
      set({ loading: false });
      // still keep user data fresh if logged in
      const token = localStorage.getItem('token');
      if (token) {
        fetch('https://music.hidar.eu.cc/api/playlists/me', { headers: { Authorization: `Bearer ${token}` } })
          .then(r => r.ok ? r.json() : [])
          .then(data => set({ userPlaylists: data || [] }))
          .catch(() => {});
      }
      return;
    }

    set({ loading: true, error: null });
    try {
      // Also load user playlists if logged in
      const token = localStorage.getItem('token');
      if (token) {
        fetch('https://music.hidar.eu.cc/api/playlists/me', { headers: { Authorization: `Bearer ${token}` } })
          .then(r => r.ok ? r.json() : [])
          .then(data => set({ userPlaylists: data || [] }))
          .catch(() => {});
      }
      // Use Promise.allSettled for resilience - if one fails others still load
      const results = await Promise.allSettled([
        fetch('https://music.hidar.eu.cc/api/tracks/all').then(r => r.json()),
        fetch('https://music.hidar.eu.cc/api/albums').then(r => r.json()),
        fetch('https://music.hidar.eu.cc/api/artists').then(r => r.json()),
        fetch('https://music.hidar.eu.cc/api/playlists/public').then(r => r.json()),   // public discovery
        fetch('https://music.hidar.eu.cc/api/bands').then(r => r.json()),
        fetch('https://music.hidar.eu.cc/api/poets').then(r => r.json()),
        fetch('https://music.hidar.eu.cc/api/poems').then(r => r.json()),
        fetch('https://music.hidar.eu.cc/api/news').then(r => r.json()),
        fetch('https://music.hidar.eu.cc/api/occasions').then(r => r.json()),
        fetch('https://music.hidar.eu.cc/api/videos').then(r => r.json()),
      ]);

      const [
        tracksRaw = [], albumsRaw = [], artistsRaw = [], playlistsRaw = [],
        bandsRaw = [], poetsRaw = [], poemsRaw = [], newsRaw = [],
        occasionsRaw = [], videosRaw = []
      ] = results.map(r => r.status === 'fulfilled' ? r.value : []);

      const mappedArtists = (artistsRaw || []).map((a: any) => ({
        ...a,
        avatar: a.avatar || a.coverImage || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400',
        coverImage: a.coverImage || a.avatar || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400',
        followers: a.followers || 0,
        verified: !!a.verified,
        monthlyListeners: a.monthlyListeners || 0,
        genres: a.genres || []
      }));

      const artistMap = Object.fromEntries(mappedArtists.map((a: any) => [a.id, a]));

      const mappedAlbums = (albumsRaw || []).map((a: any) => ({
        ...a,
        artistName: a.artist?.name || artistMap[a.artistId]?.name || 'غير معروف'
      }));

      const albumMap = Object.fromEntries(mappedAlbums.map((a: any) => [a.id, a]));

      const mappedVideos = (videosRaw || []).map((v: any) => ({
        ...v,
        artistName: v.artist?.name || artistMap[v.artistId]?.name || 'غير معروف',
        views: v.views || 0
      }));

      const mappedTracks = (tracksRaw || []).map((t: any) => ({
        ...t,
        artistName: t.artist?.name || artistMap[t.artistId]?.name || 'غير معروف',
        albumName: t.album?.title || albumMap[t.albumId]?.title || 'بدون ألبوم',
        poetName: t.poet?.name || '',
        bandName: t.band?.name || '',
        occasionName: t.occasion?.title || '',
        coverUrl: t.coverUrl || t.album?.coverUrl || albumMap[t.albumId]?.coverUrl || artistMap[t.artistId]?.avatar || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400',
        plays: t.views || 0,
      }));

      const mappedPoems = (poemsRaw || []).map((p: any) => ({
        ...p,
        poetName: p.poet?.name || 'غير معروف'
      }));

      set({ 
        tracks: mappedTracks, 
        albums: mappedAlbums, 
        artists: mappedArtists, 
        playlists: playlistsRaw || [], 
        bands: bandsRaw || [], 
        poets: poetsRaw || [], 
        poems: mappedPoems, 
        news: newsRaw || [], 
        occasions: occasionsRaw || [], 
        videos: mappedVideos, 
        loading: false 
      });

      // persist to cache (avoid full reload next time)
      saveToCache(get());

      // load recommendations in background
      get().fetchRecommendations?.();
    } catch (err: any) {
      console.error('Data fetch error', err);
      set({ error: err.message || 'Error fetching data', loading: false });
    }
  },

  addEntity: async (type: string, data: any) => {
    try {
      await apiPost(`/api/${type}`, data);
      // Refresh in background
      setTimeout(() => get().fetchData(true), 300);
      return true;
    } catch (e) {
      console.error('addEntity failed', e);
      return false;
    }
  },

  updateEntity: async (type: string, id: string, data: any) => {
    try {
      await apiPut(`/api/${type}/${id}`, data);
      setTimeout(() => get().fetchData(true), 200);
      return true;
    } catch (e) {
      console.error('updateEntity failed', e);
      return false;
    }
  },

  deleteEntity: async (type: string, id: string) => {
    try {
      await apiDelete(`/api/${type}/${id}`);
      setTimeout(() => get().fetchData(true), 200);
      return true;
    } catch (e) {
      console.error('deleteEntity failed', e);
      return false;
    }
  },

  // Implement helpers
  getTrackById: (id) => get().tracks.find(t => t.id === id),
  getVideoById: (id) => get().videos.find(v => v.id === id),
  getArtistById: (id) => get().artists.find(a => a.id === id),
  getBandById: (id) => get().bands.find(b => b.id === id),
  getAlbumById: (id) => get().albums.find(a => a.id === id),
  getPlaylistById: (id) => get().playlists.find(p => p.id === id),
  getNewsById: (id) => get().news.find(n => n.id === id),
  getOccasionById: (id) => get().occasions.find(o => o.id === id),
  getTracksByArtistId: (artistId) => get().tracks.filter(t => t.artistId === artistId),
  getAlbumsByArtistId: (artistId) => get().albums.filter(a => a.artistId === artistId),
  getVideosByArtistId: (artistId) => get().videos.filter(v => v.artistId === artistId),
  getPoetById: (id) => get().poets.find(p => p.id === id),
  getPoemById: (id) => get().poems.find(p => p.id === id),
  getPoemsByPoetId: (poetId) => get().poems.filter(p => p.poetId === poetId),
  getPoemsByEra: (era) => get().poems.filter(p => p.era === era),
  getPoemsByCategory: (category) => get().poems.filter(p => p.category === category),
  getTracksByType: (type) => get().tracks.filter(t => t.type === type),
  getTracksByPoetId: (poetId) => get().tracks.filter(t => t.poetId === poetId),
  getTracksByOccasionId: (occasionId) => get().tracks.filter(t => t.occasionId === occasionId),
  getTracksByAlbumId: (albumId) => get().tracks.filter(t => t.albumId === albumId),
  getTracksByBandId: (bandId) => get().tracks.filter(t => t.bandId === bandId), // Assuming bandId is mapped if we added it
  getVideosByOccasionId: (occasionId) => get().videos.filter(v => (v as any).occasionId === occasionId),
  getPoemsByOccasionId: (occasionId) => get().poems.filter(p => p.occasionId === occasionId),
  getTopTracks: (limit = 10) => [...get().tracks].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, limit),
  getRecentTracks: (limit = 10) => [...get().tracks].sort((a, b) => {
    const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bDate - aDate;
  }).slice(0, limit),
  getFeaturedNews: () => get().news.filter(n => n.featured),
  getRecentNews: (limit = 6) => [...get().news].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()).slice(0, limit),

  userPlaylists: [],
  recommendations: [] as any[],
  fetchRecommendations: async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://music.hidar.eu.cc/api/recommendations', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (res.ok) set({ recommendations: await res.json() });
    } catch {}
  },
  fetchUserPlaylists: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('https://music.hidar.eu.cc/api/playlists/me', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        set({ userPlaylists: data });
      }
    } catch (e) { console.error(e); }
  },

  createPlaylist: async (data) => {
    try {
      const res = await fetch('https://music.hidar.eu.cc/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(data)
      });
      if (!res.ok) return null;
      const pl = await res.json();
      await get().fetchUserPlaylists();
      return pl;
    } catch (e) { return null; }
  },

  addTrackToPlaylist: async (playlistId, trackId) => {
    try {
      const res = await fetch(`https://music.hidar.eu.cc/api/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ trackId })
      });
      return res.ok;
    } catch { return false; }
  },
}));
