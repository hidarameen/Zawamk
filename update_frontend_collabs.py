import os
import re

BASE = "/home/u0_a398/MusicApp/client/src"

def clean_file(path, replacements):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    for old, new in replacements:
        content = content.replace(old, new)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# Update AdminSongs.tsx
admin_songs_reps = [
    ("""interface SongFormData {
  title: string;
  artistId: string;
  albumId: string;
  poetId: string;
  bandId: string;
  occasionId: string;
  type: string;
  duration: number;
  coverUrl: string;
  audioUrl: string;
}""",
"""interface SongFormData {
  title: string;
  artistId: string;
  collaboratorIds: string[];
  albumId: string;
  poetId: string;
  bandId: string;
  occasionId: string;
  type: string;
  duration: number;
  coverUrl: string;
  audioUrl: string;
}"""),
    
    ("""const initialForm: SongFormData = {
  title: '', artistId: '', albumId: '', poetId: '', bandId: '', occasionId: '',
  type: '', duration: 0, coverUrl: '', audioUrl: ''
};""",
"""const initialForm: SongFormData = {
  title: '', artistId: '', collaboratorIds: [], albumId: '', poetId: '', bandId: '', occasionId: '',
  type: '', duration: 0, coverUrl: '', audioUrl: ''
};"""),
    
    ("""const openEdit = (track: Track) => {
    setEditId(track.id);
    setForm({
      title: track.title,
      artistId: track.artistId || '',
      albumId: track.albumId || '',
      poetId: track.poetId || '',
      bandId: track.bandId || '',
      occasionId: track.occasionId || '',
      type: track.type || '',
      duration: track.duration,
      coverUrl: track.coverUrl,
      audioUrl: track.audioUrl || ''
    });
    setShowModal(true);
  };""",
"""const openEdit = (track: Track) => {
    setEditId(track.id);
    setForm({
      title: track.title,
      artistId: track.artistId || '',
      collaboratorIds: track.collaborators?.map(c => c.id) || [],
      albumId: track.albumId || '',
      poetId: track.poetId || '',
      bandId: track.bandId || '',
      occasionId: track.occasionId || '',
      type: track.type || '',
      duration: track.duration,
      coverUrl: track.coverUrl,
      audioUrl: track.audioUrl || ''
    });
    setShowModal(true);
  };"""),

    ("""<label className="block text-sm text-foreground mb-1.5">الفنان (المنشد) *</label>
                    <select
                      value={form.artistId}
                      onChange={e => setForm(f => ({ ...f, artistId: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
                    >
                      <option value="">اختر الفنان</option>
                      {storeArtists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div>""",
"""<label className="block text-sm text-foreground mb-1.5">الفنان (المنشد) *</label>
                    <select
                      value={form.artistId}
                      onChange={e => setForm(f => ({ ...f, artistId: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
                    >
                      <option value="">اختر الفنان</option>
                      {storeArtists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-foreground mb-1.5">فنانون مشاركون (عمل مشترك)</label>
                    <div className="w-full bg-background border border-border rounded-xl px-4 py-2.5 max-h-32 overflow-y-auto">
                      {storeArtists.map(a => {
                        if (a.id === form.artistId) return null; // Don't show primary artist
                        return (
                          <label key={a.id} className="flex items-center gap-2 mb-2 cursor-pointer text-sm">
                            <input 
                              type="checkbox" 
                              checked={form.collaboratorIds.includes(a.id)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setForm(f => ({
                                  ...f,
                                  collaboratorIds: checked 
                                    ? [...f.collaboratorIds, a.id] 
                                    : f.collaboratorIds.filter(id => id !== a.id)
                                }));
                              }}
                              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                            />
                            {a.name}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div>""")
]
clean_file(f"{BASE}/app/pages/admin/AdminSongs.tsx", admin_songs_reps)

# Update dataStore.ts mappedTracks to combine collaborators? Actually dataStore just keeps them
# We should update components to render collaborators.

# 1. TrackCard.tsx
track_card_reps = [
    ("track.artistName", "track.collaborators?.length ? `${track.artistName} بمشاركة ${track.collaborators.map(c => c.name).join(' و ')}` : track.artistName"),
]
clean_file(f"{BASE}/app/components/cards/TrackCard.tsx", track_card_reps)

# 2. SongGridCard.tsx
song_grid_card_reps = [
    ("track.artistName", "track.collaborators?.length ? `${track.artistName}، ${track.collaborators.map(c => c.name).join('، ')}` : track.artistName"),
]
clean_file(f"{BASE}/app/components/cards/SongGridCard.tsx", song_grid_card_reps)

# 3. PlayerBar.tsx
player_bar_reps = [
    ("currentTrack.artistName", "currentTrack.collaborators?.length ? `${currentTrack.artistName}، ${currentTrack.collaborators.map(c => c.name).join('، ')}` : currentTrack.artistName"),
]
clean_file(f"{BASE}/app/components/player/PlayerBar.tsx", player_bar_reps)


print("Frontend updated for collaborators")
