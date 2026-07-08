import os

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

BASE_DIR = "/home/u0_a398/MusicApp/client/src/app/pages"

glass_classes = 'bg-background/50 border-border/50 backdrop-blur-md'

# Fixes based on audit
replace_in_file(f"{BASE_DIR}/Register.tsx", [
    ('bg-white/10 border-white/20', glass_classes)
])

replace_in_file(f"{BASE_DIR}/Login.tsx", [
    ('bg-white/10 border-white/20', glass_classes)
])

replace_in_file(f"{BASE_DIR}/admin/AdminSettings.tsx", [
    ('bg-white/10 border-white/20', glass_classes)
])

replace_in_file(f"{BASE_DIR}/artist/ArtistUpload.tsx", [
    ('bg-white/10 border-white/20', glass_classes),
    ('bg-white/10', 'bg-background/50 backdrop-blur-md border border-border/50')
])

replace_in_file(f"{BASE_DIR}/VideoDetail.tsx", [
    ('bg-white/10', 'bg-muted/30') # for button hover
])

replace_in_file(f"{BASE_DIR}/NowPlaying.tsx", [
    ('hover:bg-white/10', 'hover:bg-muted/30')
])

print("P7 script complete.")
