import os
import re

BASE = "/home/u0_a398/MusicApp/client/src"

def clean_file(path, replacements):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        for old, new in replacements:
            content = content.replace(old, new)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {path}")
    except Exception as e:
        print(f"Failed to update {path}: {e}")

# 1. Update trackTypes.ts
trackTypes_content = """export const TYPE_CONFIG: Record<string, { color: string; bg: string }> = {
  'زامل':    { color: 'text-amber-700 dark:text-amber-300',    bg: 'bg-amber-100 dark:bg-amber-900/40 border-amber-200 dark:border-amber-700/50' },
  'نشيد':    { color: 'text-violet-700 dark:text-violet-300',  bg: 'bg-violet-100 dark:bg-violet-900/40 border-violet-200 dark:border-violet-700/50' },
  'مرثية':   { color: 'text-slate-700 dark:text-slate-300',    bg: 'bg-slate-100 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700/50' },
  'أوبريت':   { color: 'text-emerald-700 dark:text-emerald-300',bg: 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-700/50' },
};

export const ALL_TYPES = Object.keys(TYPE_CONFIG);

export const getTypeConfig = (type?: string | null) => {
  if (!type) return { color: 'text-muted-foreground', bg: 'bg-muted border-border' };
  return TYPE_CONFIG[type] || { color: 'text-muted-foreground', bg: 'bg-muted border-border' };
};
"""
with open(f"{BASE}/constants/trackTypes.ts", 'w', encoding='utf-8') as f:
    f.write(trackTypes_content)

# 2. Update AdminSongs.tsx
# Replace genreOptions with typeOptions, and form.genre with form.type
admin_songs_reps = [
    ("const genreOptions = ['إنشاد إسلامي', 'نشيد وطني', 'موسيقى تراثية', 'موشحات', 'أناشيد أطفال', 'تلاوة', 'مديح نبوي'];", 
     "const typeOptions = ['زامل', 'نشيد', 'مرثية', 'أوبريت'];"),
    ("genre: string;", "type: string;"),
    ("genre: ''", "type: ''"),
    ("genre: track.genre || ''", "type: track.type || ''"),
    ("value={form.genre}", "value={form.type}"),
    ("...f, genre:", "...f, type:"),
    ("{genreOptions.map(g => <option key={g} value={g}>{g}</option>)}", 
     "{typeOptions.map(t => <option key={t} value={t}>{t}</option>)}")
]
clean_file(f"{BASE}/app/pages/admin/AdminSongs.tsx", admin_songs_reps)

# 3. Update Search.tsx
search_reps = [
    ("['all', 'نشيد', 'زامل', 'مدح', 'قصيدة', 'أنشودة']", "['all', 'زامل', 'نشيد', 'مرثية', 'أوبريت']")
]
clean_file(f"{BASE}/app/pages/Search.tsx", search_reps)

# 4. Update Songs.tsx
songs_reps = [
    ("""const TYPE_CONFIG: Record<string, { color: string; bg: string }> = {
  'نشيد':    { color: 'text-violet-700 dark:text-violet-300',  bg: 'bg-violet-100 dark:bg-violet-900/40 border-violet-200 dark:border-violet-700/50' },
  'زامل':    { color: 'text-amber-700 dark:text-amber-300',    bg: 'bg-amber-100 dark:bg-amber-900/40 border-amber-200 dark:border-amber-700/50' },
  'مدح':     { color: 'text-emerald-700 dark:text-emerald-300',bg: 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-700/50' },
  'ابتهال':  { color: 'text-sky-700 dark:text-sky-300',        bg: 'bg-sky-100 dark:bg-sky-900/40 border-sky-200 dark:border-sky-700/50' },
  'موشح':    { color: 'text-rose-700 dark:text-rose-300',      bg: 'bg-rose-100 dark:bg-rose-900/40 border-rose-200 dark:border-rose-700/50' },
  'قصيدة':   { color: 'text-orange-700 dark:text-orange-300',  bg: 'bg-orange-100 dark:bg-orange-900/40 border-orange-200 dark:border-orange-700/50' },
  'أنشودة':  { color: 'text-teal-700 dark:text-teal-300',      bg: 'bg-teal-100 dark:bg-teal-900/40 border-teal-200 dark:border-teal-700/50' },
  'تواشيح':  { color: 'text-indigo-700 dark:text-indigo-300',  bg: 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-200 dark:border-indigo-700/50' },
};

const ALL_TYPES = Object.keys(TYPE_CONFIG);""", 
"""import { TYPE_CONFIG, ALL_TYPES } from '../../../constants/trackTypes';""")
]
clean_file(f"{BASE}/app/pages/Songs.tsx", songs_reps)

# 5. Fix SongGridCard and TrackCard using old TYPE_CONFIG if any
song_grid_card_reps = [
    ("""const TYPE_CONFIG: Record<string, { color: string; bg: string }> = {
  'نشيد':    { color: 'text-violet-700 dark:text-violet-300',  bg: 'bg-violet-100 dark:bg-violet-900/40 border-violet-200 dark:border-violet-700/50' },
  'زامل':    { color: 'text-amber-700 dark:text-amber-300',    bg: 'bg-amber-100 dark:bg-amber-900/40 border-amber-200 dark:border-amber-700/50' },
  'مدح':     { color: 'text-emerald-700 dark:text-emerald-300',bg: 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-700/50' },
  'ابتهال':  { color: 'text-sky-700 dark:text-sky-300',        bg: 'bg-sky-100 dark:bg-sky-900/40 border-sky-200 dark:border-sky-700/50' },
  'موشح':    { color: 'text-rose-700 dark:text-rose-300',      bg: 'bg-rose-100 dark:bg-rose-900/40 border-rose-200 dark:border-rose-700/50' },
  'قصيدة':   { color: 'text-orange-700 dark:text-orange-300',  bg: 'bg-orange-100 dark:bg-orange-900/40 border-orange-200 dark:border-orange-700/50' },
  'أنشودة':  { color: 'text-teal-700 dark:text-teal-300',      bg: 'bg-teal-100 dark:bg-teal-900/40 border-teal-200 dark:border-teal-700/50' },
  'تواشيح':  { color: 'text-indigo-700 dark:text-indigo-300',  bg: 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-200 dark:border-indigo-700/50' },
};""", """import { TYPE_CONFIG } from '../../../../constants/trackTypes';""")
]
clean_file(f"{BASE}/app/components/cards/SongGridCard.tsx", song_grid_card_reps)

track_card_reps = [
    ("""const TYPE_COLORS: Record<string, string> = {
  'نشيد':   'text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400',
  'زامل':   'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400',
  'مدح':    'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400',
  'ابتهال': 'text-sky-600 bg-sky-50 dark:bg-sky-900/20 dark:text-sky-400',
  'موشح':   'text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400',
  'قصيدة':  'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400',
};""", 
"""import { TYPE_CONFIG } from '../../../../constants/trackTypes';"""),
    ("const typeColor = track.type ? TYPE_COLORS[track.type] : null;", 
     "const typeCfg = track.type ? TYPE_CONFIG[track.type] : null;\n  const typeColor = typeCfg ? `${typeCfg.color} ${typeCfg.bg}` : null;")
]
clean_file(f"{BASE}/app/components/cards/TrackCard.tsx", track_card_reps)

player_bar_reps = [
    ("""const TYPE_COLORS: Record<string, string> = {
  'نشيد':   'text-violet-500',
  'زامل':   'text-amber-500',
  'مدح':    'text-emerald-500',
  'ابتهال': 'text-sky-500',
  'موشح':   'text-rose-500',
  'قصيدة':  'text-orange-500',
};""",
"""import { TYPE_CONFIG } from '../../../../constants/trackTypes';"""),
    ("const typeColor = currentTrack.type ? TYPE_COLORS[currentTrack.type] : null;",
     "const typeCfg = currentTrack.type ? TYPE_CONFIG[currentTrack.type] : null;\n  const typeColor = typeCfg ? typeCfg.color : null;")
]
clean_file(f"{BASE}/app/components/player/PlayerBar.tsx", player_bar_reps)
