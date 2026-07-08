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

# Fix Songs.tsx
clean_file(f"{BASE}/app/pages/Songs.tsx", [
    ("import { TYPE_CONFIG, ALL_TYPES } from '../../../constants/trackTypes';", "import { TYPE_CONFIG, ALL_TYPES } from '../../constants/trackTypes';")
])

# Fix components
comp_reps = [
    ("import { TYPE_CONFIG } from '../../../../constants/trackTypes';", "import { TYPE_CONFIG } from '../../../constants/trackTypes';")
]
clean_file(f"{BASE}/app/components/cards/SongGridCard.tsx", comp_reps)
clean_file(f"{BASE}/app/components/cards/TrackCard.tsx", comp_reps)
clean_file(f"{BASE}/app/components/player/PlayerBar.tsx", comp_reps)

print("Paths fixed")
