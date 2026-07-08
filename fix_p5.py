import os
import re

def replace_in_file(filepath, replacements):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        original = content
        for old, new in replacements:
            content = content.replace(old, new)
            
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed: {filepath}")
    except FileNotFoundError:
        print(f"File not found: {filepath}")

# Remove the inline function EqualizerBars from all files
def remove_inline_equalizer(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Regex to match the inline function
        pattern = re.compile(r'function EqualizerBars\([^)]+\)\s*\{\s*return\s*\(\s*<div[^>]*>.*?</div>\s*\);\s*\}', re.DOTALL)
        
        if pattern.search(content):
            content = pattern.sub('', content)
            
            # Add import statement based on file path depth
            if 'components/cards' in filepath:
                import_stmt = "import { EqualizerBars } from '../ui/EqualizerBars';\n"
            else:
                import_stmt = "import { EqualizerBars } from '../components/ui/EqualizerBars';\n"
                
            # Add import after other imports
            content = re.sub(r'(import .*?;?\n)(?!import)', r'\1' + import_stmt, content, count=1)
            
            # Fix NowPlaying active prop issue
            if 'NowPlaying.tsx' in filepath:
                content = content.replace('<EqualizerBars active={isPlayingNow} />', '<EqualizerBars playing={isPlayingNow} />')
                content = content.replace('<EqualizerBars active={true} />', '<EqualizerBars playing={true} />')
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Removed inline EqualizerBars from: {filepath}")
            
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

BASE = "/home/u0_a398/MusicApp/client/src/app"
remove_inline_equalizer(f"{BASE}/components/cards/TrackCard.tsx")
remove_inline_equalizer(f"{BASE}/components/cards/SongGridCard.tsx")
remove_inline_equalizer(f"{BASE}/pages/Songs.tsx")
remove_inline_equalizer(f"{BASE}/pages/NowPlaying.tsx")

print("P5 script complete.")
