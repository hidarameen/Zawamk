import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import adminRoutes from './routes/adminRoutes';
import authRoutes from './routes/authRoutes';
import uploadRoutes from './routes/uploadRoutes';
import playlistRoutes from './routes/playlistRoutes';
import { authenticateToken, AuthRequest, requireAdmin } from './middleware/authMiddleware';

const app = express();
const prisma = new PrismaClient();
const PORT = parseInt(process.env.PORT || '3002', 10);
const DOMAIN = process.env.DOMAIN || 'music.hidar.eu.cc';

console.log('Server module loaded, starting setup...');

// CORS - support dev and production
const allowedOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
  : [
      'http://localhost:5173', 
      'http://localhost:3000', 
      'http://127.0.0.1:5173',
      `https://${DOMAIN}`,
      `http://${DOMAIN}`
    ];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files and static assets
const publicDir = path.join(__dirname, '../public');
app.use('/uploads', express.static(path.join(publicDir, 'uploads'), { maxAge: '30d' }));
app.use(express.static(publicDir));



// Health check (used by load balancers / monitoring)
app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    domain: DOMAIN,
    time: new Date().toISOString(),
    port: PORT
  });
});

app.use('/api', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/playlists', playlistRoutes);

// Auto-seed disabled
// ...

// Like & Follow
app.post('/api/tracks/:id/like', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const trackId = req.params.id as string;
    const userId = req.user!.id as string;
    
    const existingLike = await prisma.trackLike.findUnique({
      where: { userId_trackId: { userId, trackId } }
    });

    if (existingLike) {
      await prisma.trackLike.delete({ where: { id: existingLike.id } });
      await prisma.track.update({ where: { id: trackId }, data: { likes: { decrement: 1 } } });
      res.json({ liked: false });
    } else {
      await prisma.trackLike.create({ data: { userId, trackId } });
      await prisma.track.update({ where: { id: trackId }, data: { likes: { increment: 1 } } });
      res.json({ liked: true });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to process like' });
  }
});

app.post('/api/artists/:id/follow', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const artistId = req.params.id as string;
    const userId = req.user!.id as string;
    
    const existingFollow = await prisma.artistFollow.findUnique({
      where: { userId_artistId: { userId, artistId } }
    });

    if (existingFollow) {
      await prisma.artistFollow.delete({ where: { id: existingFollow.id } });
      await prisma.artist.update({ where: { id: artistId }, data: { followers: { decrement: 1 } } });
      res.json({ followed: false });
    } else {
      await prisma.artistFollow.create({ data: { userId, artistId } });
      await prisma.artist.update({ where: { id: artistId }, data: { followers: { increment: 1 } } });
      res.json({ followed: true });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to process follow' });
  }
});

// Artists endpoints
app.get('/api/artists', async (req, res) => {
  const artists = await prisma.artist.findMany({ include: { albums: true } });
  res.json(artists);
});

app.get('/api/artists/:id', async (req, res) => {
  const artist = await prisma.artist.findUnique({
    where: { id: req.params.id },
    include: { albums: true, tracks: true },
  });
  if (artist) res.json(artist);
  else res.status(404).json({ error: 'Artist not found' });
});

// Albums endpoints
app.get('/api/albums', async (req, res) => {
  const albums = await prisma.album.findMany({ include: { artist: true, tracks: true } });
  res.json(albums);
});

app.get('/api/albums/:id', async (req, res) => {
  const album = await prisma.album.findUnique({
    where: { id: req.params.id },
    include: { artist: true, tracks: true },
  });
  if (album) res.json(album);
  else res.status(404).json({ error: 'Album not found' });
});

// Tracks endpoints
app.get('/api/tracks', async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const skip = (page - 1) * limit;

  const [tracks, total] = await Promise.all([
    prisma.track.findMany({
      skip,
      take: limit,
      include: { artist: true, album: true, poet: true, band: true, occasion: true },
      orderBy: { createdAt: 'desc' } // Default sort
    }),
    prisma.track.count()
  ]);

  res.json({
    data: tracks,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  });
});

app.get('/api/tracks/all', async (req, res) => {
  // Legacy endpoint for when the frontend needs all tracks
  const tracks = await prisma.track.findMany({ include: { artist: true, album: true, poet: true, band: true, occasion: true } });
  res.json(tracks);
});

app.get('/api/tracks/:id', async (req, res) => {
  const track = await prisma.track.findUnique({
    where: { id: req.params.id },
    include: { artist: true, album: true, poet: true, band: true, occasion: true },
  });
  if (track) res.json(track);
  else res.status(404).json({ error: 'Track not found' });
});

// Playlists endpoints
app.get('/api/playlists', async (req, res) => {
  const playlists = await prisma.playlist.findMany();
  res.json(playlists);
});

app.get('/api/playlists/:id', async (req, res) => {
  const playlist = await prisma.playlist.findUnique({ where: { id: req.params.id } });
  if (playlist) res.json(playlist);
  else res.status(404).json({ error: 'Playlist not found' });
});

// New models API
app.get('/api/bands', async (req, res) => {
  const bands = await prisma.band.findMany({ include: { tracks: true, albums: true } });
  res.json(bands);
});

app.get('/api/bands/:id', async (req, res) => {
  const band = await prisma.band.findUnique({ 
    where: { id: req.params.id },
    include: { tracks: true, albums: true } 
  });
  if (band) res.json(band);
  else res.status(404).json({ error: 'Band not found' });
});

app.get('/api/poets', async (req, res) => {
  const poets = await prisma.poet.findMany({ include: { poems: true, tracks: true } });
  res.json(poets);
});

app.get('/api/poets/:id', async (req, res) => {
  const poet = await prisma.poet.findUnique({ 
    where: { id: req.params.id },
    include: { poems: true, tracks: true } 
  });
  if (poet) res.json(poet);
  else res.status(404).json({ error: 'Poet not found' });
});

app.get('/api/poems', async (req, res) => {
  const poems = await prisma.poem.findMany({ include: { poet: true, occasion: true } });
  res.json(poems);
});

app.get('/api/poems/:id', async (req, res) => {
  const poem = await prisma.poem.findUnique({ 
    where: { id: req.params.id },
    include: { poet: true, occasion: true } 
  });
  if (poem) res.json(poem);
  else res.status(404).json({ error: 'Poem not found' });
});

app.get('/api/news', async (req, res) => {
  const news = await prisma.newsItem.findMany({
    orderBy: { publishedAt: 'desc' },
  });
  res.json(news);
});

app.get('/api/news/:id', async (req, res) => {
  const newsItem = await prisma.newsItem.findUnique({ where: { id: req.params.id } });
  if (newsItem) res.json(newsItem);
  else res.status(404).json({ error: 'News not found' });
});

app.get('/api/occasions', async (req, res) => {
  const occasions = await prisma.occasion.findMany({ include: { tracks: true, poems: true, videos: true } });
  res.json(occasions);
});

app.get('/api/occasions/:id', async (req, res) => {
  const occasion = await prisma.occasion.findUnique({ 
    where: { id: req.params.id },
    include: { tracks: true, poems: true, videos: true } 
  });
  if (occasion) res.json(occasion);
  else res.status(404).json({ error: 'Occasion not found' });
});

app.get('/api/videos', async (req, res) => {
  const videos = await prisma.musicVideo.findMany({ include: { artist: true, occasion: true } });
  res.json(videos);
});

app.get('/api/videos/:id', async (req, res) => {
  const video = await prisma.musicVideo.findUnique({ 
    where: { id: req.params.id },
    include: { artist: true, occasion: true } 
  });
  if (video) res.json(video);
  else res.status(404).json({ error: 'Video not found' });
});

// Increment video views (real counter)
app.post('/api/videos/:id/play', async (req, res) => {
  try {
    const updated = await prisma.musicVideo.update({
      where: { id: req.params.id },
      data: { views: { increment: 1 } }
    });
    res.json({ success: true, views: updated.views });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record play' });
  }
});

// Old search removed - using the improved version below

// Increment View + Play history (authenticated optional)
app.post('/api/tracks/:id/play', async (req: AuthRequest, res) => {
  try {
    const trackId = req.params.id as string;
    const userId = req.user?.id;

    const updated = await prisma.track.update({
      where: { id: trackId },
      data: { views: { increment: 1 } }
    });

    // Record history if logged in
    if (userId) {
      const duration = typeof req.body.duration === 'number' ? req.body.duration : undefined;
      await prisma.playHistory.create({
        data: { userId, trackId, duration }
      }).catch(() => {}); // non-blocking
    }

    res.json({ success: true, views: updated.views });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record play' });
  }
});

// POST review (track or album)
app.post('/api/reviews', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { trackId, albumId, rating, comment } = req.body;
    const userId = req.user!.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be 1-5' });
    }

    const review = await prisma.review.upsert({
      where: trackId 
        ? { userId_trackId: { userId, trackId } } 
        : { userId_albumId: { userId, albumId } },
      update: { rating, comment },
      create: { userId, trackId, albumId, rating, comment }
    });

    res.json(review);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save review' });
  }
});

// Get reviews for a track/album
app.get('/api/reviews', async (req, res) => {
  const { trackId, albumId } = req.query;
  const where: any = {};
  if (trackId) where.trackId = trackId;
  if (albumId) where.albumId = albumId;

  const reviews = await prisma.review.findMany({
    where,
    include: { user: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
  res.json(reviews);
});

// Recommendations (simple but effective)
app.get('/api/recommendations', async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    let recommendations: any[] = [];

    if (userId) {
      // Based on liked + recently played genres + artists
      const [liked, history] = await Promise.all([
        prisma.trackLike.findMany({ where: { userId }, include: { track: { include: { artist: true } } } }),
        prisma.playHistory.findMany({ where: { userId }, include: { track: { include: { artist: true } } }, take: 30, orderBy: { playedAt: 'desc' } })
      ]);

      const artistIds = new Set([
        ...liked.map(l => l.track.artistId),
        ...history.map(h => h.track.artistId)
      ]);

      recommendations = await prisma.track.findMany({
        where: {
          OR: [
            { artistId: { in: Array.from(artistIds) } },
            { genre: { in: liked.map(l => l.track.genre).filter(Boolean) as string[] } }
          ]
        },
        include: { artist: true, album: true },
        take: 20,
        orderBy: { views: 'desc' }
      });
    }

    // Fallback to popular
    if (recommendations.length === 0) {
      recommendations = await prisma.track.findMany({
        include: { artist: true, album: true },
        orderBy: { views: 'desc' },
        take: 20
      });
    }

    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Improved search (supports type filter)
app.get('/api/search', async (req, res) => {
  const query = (req.query.q as string || '').trim();
  const type = (req.query.type as string || 'all').toLowerCase();

  if (!query) return res.json({ tracks: [], albums: [], artists: [], poets: [], playlists: [] });

  const [tracks, albums, artists, poets, playlists] = await Promise.all([
    (type === 'all' || type === 'tracks') ? prisma.track.findMany({
      where: { title: { contains: query, mode: 'insensitive' } },
      include: { artist: true, album: true },
      take: 12
    }) : [],
    (type === 'all' || type === 'albums') ? prisma.album.findMany({
      where: { title: { contains: query, mode: 'insensitive' } },
      include: { artist: true },
      take: 8
    }) : [],
    (type === 'all' || type === 'artists') ? prisma.artist.findMany({
      where: { name: { contains: query, mode: 'insensitive' } },
      take: 8
    }) : [],
    (type === 'all' || type === 'poets') ? prisma.poet.findMany({
      where: { name: { contains: query, mode: 'insensitive' } },
      take: 6
    }) : [],
    (type === 'all' || type === 'playlists') ? prisma.playlist.findMany({
      where: { name: { contains: query, mode: 'insensitive' }, isPublic: true },
      take: 6
    }) : []
  ]);

  res.json({ tracks, albums, artists, poets, playlists });
});

// Get current user liked tracks (full)
app.get('/api/me/likes', authenticateToken, async (req: AuthRequest, res) => {
  const likes = await prisma.trackLike.findMany({
    where: { userId: req.user!.id },
    include: { track: { include: { artist: true, album: true } } }
  });
  res.json(likes.map(l => l.track));
});

// SPA fallback - serve built client if available (put after all API routes)
const clientDist = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  // Serve static assets from client build
  app.use(express.static(clientDist, { index: false }));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

console.log('About to listen on port', PORT);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎵 Music API running on http://0.0.0.0:${PORT} (domain: ${DOMAIN})`);
  console.log(`Health: http://0.0.0.0:${PORT}/api/health`);
});
