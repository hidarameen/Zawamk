import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Get current user's playlists (private + public)
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const playlists = await prisma.playlist.findMany({
      where: { ownerId: userId },
      include: {
        tracks: {
          include: { track: { include: { artist: true, album: true } } },
          orderBy: { position: 'asc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const formatted = playlists.map(p => ({
      ...p,
      tracks: p.tracks.map(pt => ({
        ...pt.track,
        position: pt.position,
        artistName: pt.track.artist?.name,
        albumName: pt.track.album?.title
      }))
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
});

// Get public playlists (for discovery)
router.get('/public', async (req, res) => {
  const playlists = await prisma.playlist.findMany({
    where: { isPublic: true },
    take: 20,
    orderBy: { followers: 'desc' },
    include: {
      tracks: { take: 3, include: { track: { include: { artist: true } } } }
    }
  });
  res.json(playlists);
});

// Create playlist (any logged in user)
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { name, description, coverUrl, isPublic = true } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const playlist = await prisma.playlist.create({
      data: {
        name,
        description,
        coverUrl,
        isPublic,
        ownerId: req.user!.id,
      }
    });
    res.status(201).json(playlist);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create playlist' });
  }
});

// Add track to playlist
router.post('/:id/tracks', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { trackId } = req.body;
    const playlistId = req.params.id as string;
    const userId = req.user!.id;

    const playlist = await prisma.playlist.findUnique({ where: { id: playlistId } });
    if (!playlist || (playlist.ownerId !== userId && playlist.isPublic === false)) {
      return res.status(403).json({ error: 'Not allowed' });
    }

    const existing = await prisma.playlistTrack.findUnique({
      where: { playlistId_trackId: { playlistId, trackId } }
    });
    if (existing) return res.json({ success: true, message: 'Already in playlist' });

    const count = await prisma.playlistTrack.count({ where: { playlistId } });

    await prisma.playlistTrack.create({
      data: { playlistId, trackId, position: count }
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add track' });
  }
});

// Remove track from playlist
router.delete('/:id/tracks/:trackId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const playlistId = req.params.id as string;
    const trackId = req.params.trackId as string;
    const userId = req.user!.id;

    const playlist = await prisma.playlist.findUnique({ where: { id: playlistId } });
    if (!playlist || playlist.ownerId !== userId) {
      return res.status(403).json({ error: 'Not allowed' });
    }

    await prisma.playlistTrack.deleteMany({
      where: { playlistId, trackId }
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove track' });
  }
});

// Update playlist
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  const playlistId = req.params.id as string;
  const userId = req.user!.id;
  const { name, description, coverUrl, isPublic } = req.body;

  const playlist = await prisma.playlist.findUnique({ where: { id: playlistId } });
  if (!playlist || playlist.ownerId !== userId) {
    return res.status(403).json({ error: 'Not allowed' });
  }

  const updated = await prisma.playlist.update({
    where: { id: playlistId },
    data: { name, description, coverUrl, isPublic }
  });
  res.json(updated);
});

// Delete playlist
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  const playlistId = req.params.id as string;
  const userId = req.user!.id;

  const playlist = await prisma.playlist.findUnique({ where: { id: playlistId } });
  if (!playlist || playlist.ownerId !== userId) {
    return res.status(403).json({ error: 'Not allowed' });
  }

  await prisma.playlist.delete({ where: { id: playlistId } });
  res.json({ success: true });
});

export default router;
