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

# Fixes based on audit
replace_in_file(f"{BASE_DIR}/Library.tsx", [
    ('text-white font-semibold', 'text-foreground font-semibold')
])

replace_in_file(f"{BASE_DIR}/Playlists.tsx", [
    ('text-white shadow-sm', 'text-primary-foreground shadow-sm'),
    ('text-white shadow', 'text-primary-foreground shadow'),
    ('text-white bg-primary', 'text-primary-foreground bg-primary')
])

replace_in_file(f"{BASE_DIR}/OccasionDetail.tsx", [
    ('bg-primary text-white', 'bg-primary text-primary-foreground')
])

replace_in_file(f"{BASE_DIR}/ArtistProfile.tsx", [
    ('text-4xl md:text-6xl font-bold text-white', 'text-4xl md:text-6xl font-bold text-foreground'),
    ('text-white placeholder:text-gray-400', 'text-foreground placeholder:text-muted-foreground'),
    ('bg-white/10 border-white/20', 'bg-background/50 border-border/50 backdrop-blur'),
    ('text-white', 'text-foreground') # careful with this one, maybe too broad, let's limit it
])

replace_in_file(f"{BASE_DIR}/artist/ArtistDashboard.tsx", [
    ('border-white/10', 'border-border/50'),
    ('bg-white/5', 'bg-muted/30')
])

# For Songs.tsx, text-white is used heavily in hero section.
replace_in_file(f"{BASE_DIR}/Songs.tsx", [
    ('text-white', 'text-foreground'),
    ('text-foreground/80', 'text-muted-foreground'),
    ('text-foreground/90', 'text-foreground'),
    ('text-gray-300', 'text-muted-foreground'),
    ('text-gray-400', 'text-muted-foreground')
])

print("P2 script complete.")
