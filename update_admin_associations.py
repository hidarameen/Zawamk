import os
import re

BASE = "/home/u0_a398/MusicApp"

def clean_file(path, replacements):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    for old, new in replacements:
        content = content.replace(old, new)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# 1. Update Backend (adminRoutes.ts)
admin_routes_path = f"{BASE}/server/src/routes/adminRoutes.ts"

reps = [
    # Albums
    ("""router.post('/albums', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const data = req.body;
    const newAlbum = await prisma.album.create({ data });
    res.json(newAlbum);
  } catch (err) { handleError(res, err); }
});""", 
"""router.post('/albums', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { trackIds, ...data } = req.body;
    const createData: any = { ...data };
    if (trackIds && Array.isArray(trackIds)) {
      createData.tracks = { connect: trackIds.map((id: string) => ({ id })) };
    }
    const newAlbum = await prisma.album.create({ data: createData, include: { tracks: true } });
    res.json(newAlbum);
  } catch (err) { handleError(res, err); }
});"""),
    
    ("""router.put('/albums/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const data = req.body;
    const updated = await prisma.album.update({ where: { id: req.params.id as string }, data });
    res.json(updated);
  } catch (err) { handleError(res, err); }
});""", 
"""router.put('/albums/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { trackIds, ...data } = req.body;
    const updateData: any = { ...data };
    if (trackIds && Array.isArray(trackIds)) {
      updateData.tracks = { set: trackIds.map((id: string) => ({ id })) };
    }
    const updated = await prisma.album.update({ where: { id: req.params.id as string }, data: updateData, include: { tracks: true } });
    res.json(updated);
  } catch (err) { handleError(res, err); }
});"""),

    # Bands
    ("""router.post('/bands', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const data = req.body;
    const newBand = await prisma.band.create({ data });
    res.json(newBand);
  } catch (err) { handleError(res, err); }
});""", 
"""router.post('/bands', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { trackIds, ...data } = req.body;
    const createData: any = { ...data };
    if (trackIds && Array.isArray(trackIds)) {
      createData.tracks = { connect: trackIds.map((id: string) => ({ id })) };
    }
    const newBand = await prisma.band.create({ data: createData, include: { tracks: true } });
    res.json(newBand);
  } catch (err) { handleError(res, err); }
});"""),
    
    ("""router.put('/bands/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const data = req.body;
    const updated = await prisma.band.update({ where: { id: req.params.id as string }, data });
    res.json(updated);
  } catch (err) { handleError(res, err); }
});""", 
"""router.put('/bands/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { trackIds, ...data } = req.body;
    const updateData: any = { ...data };
    if (trackIds && Array.isArray(trackIds)) {
      updateData.tracks = { set: trackIds.map((id: string) => ({ id })) };
    }
    const updated = await prisma.band.update({ where: { id: req.params.id as string }, data: updateData, include: { tracks: true } });
    res.json(updated);
  } catch (err) { handleError(res, err); }
});"""),

    # Occasions
    ("""router.post('/occasions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const data = req.body;
    const newOccasion = await prisma.occasion.create({ data });
    res.json(newOccasion);
  } catch (err) { handleError(res, err); }
});""", 
"""router.post('/occasions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { trackIds, ...data } = req.body;
    const createData: any = { ...data };
    if (trackIds && Array.isArray(trackIds)) {
      createData.tracks = { connect: trackIds.map((id: string) => ({ id })) };
    }
    const newOccasion = await prisma.occasion.create({ data: createData, include: { tracks: true } });
    res.json(newOccasion);
  } catch (err) { handleError(res, err); }
});"""),
    
    ("""router.put('/occasions/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const data = req.body;
    const updated = await prisma.occasion.update({ where: { id: req.params.id as string }, data });
    res.json(updated);
  } catch (err) { handleError(res, err); }
});""", 
"""router.put('/occasions/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { trackIds, ...data } = req.body;
    const updateData: any = { ...data };
    if (trackIds && Array.isArray(trackIds)) {
      updateData.tracks = { set: trackIds.map((id: string) => ({ id })) };
    }
    const updated = await prisma.occasion.update({ where: { id: req.params.id as string }, data: updateData, include: { tracks: true } });
    res.json(updated);
  } catch (err) { handleError(res, err); }
});""")
]

clean_file(admin_routes_path, reps)


# 2. Update Frontend (AdminAlbums.tsx)
admin_albums_path = f"{BASE}/client/src/app/pages/admin/AdminAlbums.tsx"
with open(admin_albums_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "export default function AdminAlbums() {\n  const { albums: storeAlbums, artists, bands, addEntity, updateEntity, deleteEntity } = useDataStore();",
    "export default function AdminAlbums() {\n  const { albums: storeAlbums, artists, bands, tracks: storeTracks, addEntity, updateEntity, deleteEntity } = useDataStore();"
)

content = content.replace(
"""interface AlbumForm {
  title: string; artistId: string; bandId: string; releaseDate: string;
  genre: string; coverUrl: string; totalTracks: string;
}""",
"""interface AlbumForm {
  title: string; artistId: string; bandId: string; releaseDate: string;
  genre: string; coverUrl: string; totalTracks: string; trackIds: string[];
}""")

content = content.replace(
"""const defaultForm: AlbumForm = {
  title: '', artistId: '', bandId: '', releaseDate: '', genre: '', coverUrl: '', totalTracks: '',
};""",
"""const defaultForm: AlbumForm = {
  title: '', artistId: '', bandId: '', releaseDate: '', genre: '', coverUrl: '', totalTracks: '', trackIds: [],
};""")

content = content.replace(
"""setForm({
      title: album.title,
      artistId: album.artistId || '',
      bandId: album.bandId || '',
      releaseDate: album.releaseDate ? new Date(album.releaseDate).toISOString().split('T')[0] : '',
      genre: album.genre || '',
      coverUrl: album.coverUrl || '',
      totalTracks: album.totalTracks.toString()
    });""",
"""setForm({
      title: album.title,
      artistId: album.artistId || '',
      bandId: album.bandId || '',
      releaseDate: album.releaseDate ? new Date(album.releaseDate).toISOString().split('T')[0] : '',
      genre: album.genre || '',
      coverUrl: album.coverUrl || '',
      totalTracks: album.totalTracks.toString(),
      trackIds: storeTracks.filter(t => t.albumId === album.id).map(t => t.id)
    });""")

# Add tracks selection inside the modal
content = content.replace(
"""<div>
                  <label className="block text-sm text-foreground mb-1.5">عدد المقاطع المتوقع</label>
                  <input type="number" value={form.totalTracks} onChange={e => setForm(f => ({ ...f, totalTracks: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50" />
                </div>""",
"""<div>
                  <label className="block text-sm text-foreground mb-1.5">عدد المقاطع المتوقع</label>
                  <input type="number" value={form.totalTracks} onChange={e => setForm(f => ({ ...f, totalTracks: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-foreground mb-1.5">المقاطع الصوتية المرتبطة بالبوم</label>
                  <div className="w-full bg-background border border-border rounded-xl px-4 py-2.5 max-h-40 overflow-y-auto">
                    {storeTracks.map(t => (
                      <label key={t.id} className="flex items-center gap-2 mb-2 cursor-pointer text-sm">
                        <input 
                          type="checkbox" 
                          checked={form.trackIds.includes(t.id)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setForm(f => ({
                              ...f,
                              trackIds: checked 
                                ? [...f.trackIds, t.id] 
                                : f.trackIds.filter(id => id !== t.id)
                            }));
                          }}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                        />
                        {t.title} - {t.artistName}
                      </label>
                    ))}
                  </div>
                </div>""")

with open(admin_albums_path, 'w', encoding='utf-8') as f:
    f.write(content)

# 3. Update Frontend (AdminBands.tsx)
admin_bands_path = f"{BASE}/client/src/app/pages/admin/AdminBands.tsx"
with open(admin_bands_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "export default function AdminBands() {\n  const { bands: storeBands, addEntity, updateEntity, deleteEntity } = useDataStore();",
    "export default function AdminBands() {\n  const { bands: storeBands, tracks: storeTracks, addEntity, updateEntity, deleteEntity } = useDataStore();"
)

content = content.replace(
"""interface BandForm {
  name: string; bio: string; avatar: string; coverImage: string;
  style: string; country: string; foundedYear: string; membersCount: string;
  genres: string[]; verified: boolean;
}""",
"""interface BandForm {
  name: string; bio: string; avatar: string; coverImage: string;
  style: string; country: string; foundedYear: string; membersCount: string;
  genres: string[]; verified: boolean; trackIds: string[];
}""")

content = content.replace(
"""const defaultForm: BandForm = {
  name: '', bio: '', avatar: '', coverImage: '',
  style: '', country: '', foundedYear: '', membersCount: '',
  genres: [], verified: false,
};""",
"""const defaultForm: BandForm = {
  name: '', bio: '', avatar: '', coverImage: '',
  style: '', country: '', foundedYear: '', membersCount: '',
  genres: [], verified: false, trackIds: [],
};""")

content = content.replace(
"""setForm({
      name: band.name,
      bio: band.bio || '',
      avatar: band.avatar || '',
      coverImage: band.coverImage || '',
      style: band.style || '',
      country: band.country || '',
      foundedYear: band.foundedYear?.toString() || '',
      membersCount: band.membersCount?.toString() || '',
      genres: band.genres || [],
      verified: band.verified
    });""",
"""setForm({
      name: band.name,
      bio: band.bio || '',
      avatar: band.avatar || '',
      coverImage: band.coverImage || '',
      style: band.style || '',
      country: band.country || '',
      foundedYear: band.foundedYear?.toString() || '',
      membersCount: band.membersCount?.toString() || '',
      genres: band.genres || [],
      verified: band.verified,
      trackIds: storeTracks.filter(t => t.bandId === band.id).map(t => t.id)
    });""")

content = content.replace(
"""<div>
                    <label className="block text-sm text-foreground mb-1.5">الأنماط الموسيقية</label>
                    <div className="flex flex-wrap gap-2 mb-2">""",
"""<div className="md:col-span-2">
                  <label className="block text-sm text-foreground mb-1.5">المقاطع الصوتية التابعة للفرقة</label>
                  <div className="w-full bg-background border border-border rounded-xl px-4 py-2.5 max-h-40 overflow-y-auto">
                    {storeTracks.map(t => (
                      <label key={t.id} className="flex items-center gap-2 mb-2 cursor-pointer text-sm">
                        <input 
                          type="checkbox" 
                          checked={form.trackIds.includes(t.id)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setForm(f => ({
                              ...f,
                              trackIds: checked 
                                ? [...f.trackIds, t.id] 
                                : f.trackIds.filter(id => id !== t.id)
                            }));
                          }}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                        />
                        {t.title} - {t.artistName}
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                    <label className="block text-sm text-foreground mb-1.5">الأنماط الموسيقية</label>
                    <div className="flex flex-wrap gap-2 mb-2">""")

with open(admin_bands_path, 'w', encoding='utf-8') as f:
    f.write(content)


# 4. Update Frontend (AdminOccasions.tsx)
admin_occasions_path = f"{BASE}/client/src/app/pages/admin/AdminOccasions.tsx"
with open(admin_occasions_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "export default function AdminOccasions() {\n  const { occasions: storeOccasions, addEntity, updateEntity, deleteEntity } = useDataStore();",
    "export default function AdminOccasions() {\n  const { occasions: storeOccasions, tracks: storeTracks, addEntity, updateEntity, deleteEntity } = useDataStore();"
)

content = content.replace(
"""interface OccasionForm {
  title: string; description: string; date: string; type: string; coverUrl: string; color: string;
}""",
"""interface OccasionForm {
  title: string; description: string; date: string; type: string; coverUrl: string; color: string; trackIds: string[];
}""")

content = content.replace(
"""const defaultForm: OccasionForm = { title: '', description: '', date: '', type: '', coverUrl: '', color: colorOptions[0].value };""",
"""const defaultForm: OccasionForm = { title: '', description: '', date: '', type: '', coverUrl: '', color: colorOptions[0].value, trackIds: [] };""")

content = content.replace(
"""setForm({
      title: occ.title,
      description: occ.description || '',
      date: occ.date ? new Date(occ.date).toISOString().split('T')[0] : '',
      type: occ.type || '',
      coverUrl: occ.coverUrl || '',
      color: occ.color || colorOptions[0].value
    });""",
"""setForm({
      title: occ.title,
      description: occ.description || '',
      date: occ.date ? new Date(occ.date).toISOString().split('T')[0] : '',
      type: occ.type || '',
      coverUrl: occ.coverUrl || '',
      color: occ.color || colorOptions[0].value,
      trackIds: storeTracks.filter(t => t.occasionId === occ.id).map(t => t.id)
    });""")


content = content.replace(
"""<div>
                    <label className="block text-sm text-foreground mb-1.5">لون المناسبة (للواجهة)</label>
                    <select value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50">
                      {colorOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                </div>""",
"""<div>
                    <label className="block text-sm text-foreground mb-1.5">لون المناسبة (للواجهة)</label>
                    <select value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50">
                      {colorOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                </div>
                
                <div className="w-full">
                  <label className="block text-sm text-foreground mb-1.5">المقاطع الصوتية المرتبطة بالمناسبة</label>
                  <div className="w-full bg-background border border-border rounded-xl px-4 py-2.5 max-h-40 overflow-y-auto">
                    {storeTracks.map(t => (
                      <label key={t.id} className="flex items-center gap-2 mb-2 cursor-pointer text-sm">
                        <input 
                          type="checkbox" 
                          checked={form.trackIds.includes(t.id)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setForm(f => ({
                              ...f,
                              trackIds: checked 
                                ? [...f.trackIds, t.id] 
                                : f.trackIds.filter(id => id !== t.id)
                            }));
                          }}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                        />
                        {t.title} - {t.artistName}
                      </label>
                    ))}
                  </div>
                </div>""")

with open(admin_occasions_path, 'w', encoding='utf-8') as f:
    f.write(content)


print("Successfully added track selection to Albums, Bands, and Occasions")
