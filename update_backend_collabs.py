import os
import re

BASE = "/home/u0_a398/MusicApp/server"

def clean_file(path, replacements):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    for old, new in replacements:
        content = content.replace(old, new)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# Update index.ts to include collaborators
index_reps = [
    ("include: { artist: true, album: true, poet: true, band: true, occasion: true }", 
     "include: { artist: true, collaborators: true, album: true, poet: true, band: true, occasion: true }"),
]
clean_file(f"{BASE}/src/index.ts", index_reps)

# Update adminRoutes.ts to parse collaboratorIds
admin_routes_reps = [
    ("""router.post('/tracks', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const data = req.body;
    if (!canManageContent(req, data.artistId)) {
      return res.status(403).json({ error: 'Not authorized to add tracks' });
    }
    const newTrack = await prisma.track.create({ data });
    res.json(newTrack);
  } catch (err) { handleError(res, err); }
});""", 
"""router.post('/tracks', authenticateToken, async (req: AuthRequest, res) => {
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
});"""),
    
    ("""router.put('/tracks/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const data = req.body;
    const updated = await prisma.track.update({ where: { id: req.params.id as string }, data });
    res.json(updated);
  } catch (err) { handleError(res, err); }
});""", 
"""router.put('/tracks/:id', authenticateToken, requireAdmin, async (req, res) => {
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
});""")
]
clean_file(f"{BASE}/src/routes/adminRoutes.ts", admin_routes_reps)

print("Backend updated for collaborators")
