import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

function canManageContent(req: AuthRequest, artistId?: string) {
  const role = req.user?.role;
  if (role === 'admin') return true;
  if (role === 'artist' && artistId) {
    // In a real system we'd link user to artist profile.
    // For now allow any 'artist' role user to manage content.
    return true;
  }
  return false;
}

// Secure all admin routes


const handleError = (res: any, err: any) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
};

router.post('/artists', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const data = req.body;
    const newArtist = await prisma.artist.create({ data });
    res.json(newArtist);
  } catch (err) { handleError(res, err); }
});

router.put('/artists/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const data = req.body;
    const updated = await prisma.artist.update({ where: { id: req.params.id as string }, data });
    res.json(updated);
  } catch (err) { handleError(res, err); }
});

router.delete('/artists/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await prisma.artist.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (err) { handleError(res, err); }
});

router.post('/albums', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const data = req.body;
    if (!canManageContent(req, data.artistId)) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const newAlbum = await prisma.album.create({ data });
    res.json(newAlbum);
  } catch (err) { handleError(res, err); }
});

router.put('/albums/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const data = req.body;
    const updated = await prisma.album.update({ where: { id: req.params.id as string }, data });
    res.json(updated);
  } catch (err) { handleError(res, err); }
});

router.delete('/albums/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await prisma.album.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (err) { handleError(res, err); }
});

router.post('/tracks', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { collaboratorIds, ...data } = req.body;
    if (!canManageContent(req, data.artistId)) {
      return res.status(403).json({ error: 'Not authorized to add tracks' });
    }
    
    const createData: any = { ...data };
    if (collaboratorIds && Array.isArray(collaboratorIds)) {
      createData.collaborators = {
        connect: collaboratorIds.map((id: string) => ({ id }))
      };
    }
    
    const newTrack = await prisma.track.create({ data: createData, include: { collaborators: true } });
    res.json(newTrack);
  } catch (err) { handleError(res, err); }
});

router.put('/tracks/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { collaboratorIds, ...data } = req.body;
    const updateData: any = { ...data };
    
    if (collaboratorIds && Array.isArray(collaboratorIds)) {
      updateData.collaborators = {
        set: collaboratorIds.map((id: string) => ({ id }))
      };
    } else if (collaboratorIds === null || collaboratorIds === undefined) {
       // if they explicitly passed empty or we want to clear it?
       // Usually if it's an array we set it, otherwise ignore.
    }
    
    const updated = await prisma.track.update({ where: { id: req.params.id as string }, data: updateData, include: { collaborators: true } });
    res.json(updated);
  } catch (err) { handleError(res, err); }
});

router.delete('/tracks/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await prisma.track.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (err) { handleError(res, err); }
});

router.post('/playlists', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const data = req.body;
    const newPlaylist = await prisma.playlist.create({ data });
    res.json(newPlaylist);
  } catch (err) { handleError(res, err); }
});

router.put('/playlists/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const data = req.body;
    const updated = await prisma.playlist.update({ where: { id: req.params.id as string }, data });
    res.json(updated);
  } catch (err) { handleError(res, err); }
});

router.delete('/playlists/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await prisma.playlist.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (err) { handleError(res, err); }
});

router.post('/bands', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const data = req.body;
    const newBand = await prisma.band.create({ data });
    res.json(newBand);
  } catch (err) { handleError(res, err); }
});

router.put('/bands/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const data = req.body;
    const updated = await prisma.band.update({ where: { id: req.params.id as string }, data });
    res.json(updated);
  } catch (err) { handleError(res, err); }
});

router.delete('/bands/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await prisma.band.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (err) { handleError(res, err); }
});

router.post('/poets', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const data = req.body;
    const newPoet = await prisma.poet.create({ data });
    res.json(newPoet);
  } catch (err) { handleError(res, err); }
});

router.put('/poets/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const data = req.body;
    const updated = await prisma.poet.update({ where: { id: req.params.id as string }, data });
    res.json(updated);
  } catch (err) { handleError(res, err); }
});

router.delete('/poets/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await prisma.poet.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (err) { handleError(res, err); }
});

router.post('/poems', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const data = req.body;
    const newPoem = await prisma.poem.create({ data });
    res.json(newPoem);
  } catch (err) { handleError(res, err); }
});

router.put('/poems/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const data = req.body;
    const updated = await prisma.poem.update({ where: { id: req.params.id as string }, data });
    res.json(updated);
  } catch (err) { handleError(res, err); }
});

router.delete('/poems/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await prisma.poem.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (err) { handleError(res, err); }
});

router.post('/news', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const data = req.body;
    if (data.publishedAt) data.publishedAt = new Date(data.publishedAt);
    const newNews = await prisma.newsItem.create({ data });
    res.json(newNews);
  } catch (err) { handleError(res, err); }
});

router.put('/news/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const data = req.body;
    if (data.publishedAt) data.publishedAt = new Date(data.publishedAt);
    const updated = await prisma.newsItem.update({ where: { id: req.params.id as string }, data });
    res.json(updated);
  } catch (err) { handleError(res, err); }
});

router.delete('/news/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await prisma.newsItem.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (err) { handleError(res, err); }
});

router.post('/occasions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const data = req.body;
    const newOccasion = await prisma.occasion.create({ data });
    res.json(newOccasion);
  } catch (err) { handleError(res, err); }
});

router.put('/occasions/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const data = req.body;
    const updated = await prisma.occasion.update({ where: { id: req.params.id as string }, data });
    res.json(updated);
  } catch (err) { handleError(res, err); }
});

router.delete('/occasions/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await prisma.occasion.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (err) { handleError(res, err); }
});

router.post('/videos', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const data = req.body;
    if (!canManageContent(req, data.artistId)) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const newVideo = await prisma.musicVideo.create({ data });
    res.json(newVideo);
  } catch (err) { handleError(res, err); }
});

router.put('/videos/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const data = req.body;
    const updated = await prisma.musicVideo.update({ where: { id: req.params.id as string }, data });
    res.json(updated);
  } catch (err) { handleError(res, err); }
});

router.delete('/videos/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await prisma.musicVideo.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (err) { handleError(res, err); }
});

router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
      }
    });
    res.json(users);
  } catch (err) { handleError(res, err); }
});

router.put('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const data = req.body;
    // Don't update password directly here unless we hash it
    if (data.passwordHash) delete data.passwordHash;
    const updated = await prisma.user.update({ where: { id: req.params.id as string }, data });
    res.json(updated);
  } catch (err) { handleError(res, err); }
});

router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (err) { handleError(res, err); }
});

export default router;
