import os
import re

def fix_imports(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # The regex previously inserted `import { EqualizerBars }` after `import {`
        # We need to move it out.
        
        # Pattern to find: `import {\nimport { EqualizerBars } from ...`
        pattern = re.compile(r'(import\s+\{\s*\n)(import\s+\{\s*EqualizerBars\s*\}\s*from\s*[^\n]+;\n)')
        if pattern.search(content):
            content = pattern.sub(r'\2\1', content)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed imports in: {filepath}")
    except Exception as e:
        pass

BASE = "/home/u0_a398/MusicApp/client/src/app"
fix_imports(f"{BASE}/components/cards/TrackCard.tsx")
fix_imports(f"{BASE}/components/cards/SongGridCard.tsx")
fix_imports(f"{BASE}/pages/Songs.tsx")
fix_imports(f"{BASE}/pages/NowPlaying.tsx")

print("Imports fixed.")
