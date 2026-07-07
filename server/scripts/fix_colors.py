import os
import re

directory = '/home/u0_a398/MusicApp/client/src/app'

replacements = [
    # Backgrounds
    (r'bg-zinc-900', 'bg-card'),
    (r'bg-zinc-800', 'bg-secondary'),
    (r'bg-zinc-950', 'bg-background'),
    (r'bg-gray-100', 'bg-secondary'),
    (r'bg-gray-50', 'bg-background'),
    
    # Texts
    (r'text-gray-400', 'text-muted-foreground'),
    (r'text-gray-300', 'text-muted-foreground'),
    (r'text-gray-500', 'text-muted-foreground'),
    (r'text-gray-700', 'text-secondary-foreground'),
    (r'text-gray-800', 'text-foreground'),
    (r'text-gray-900', 'text-foreground'),
    
    # White opacity backgrounds (often used for hover states on cards)
    (r'hover:bg-white/5', 'hover:bg-secondary/50'),
    (r'hover:bg-white/10', 'hover:bg-secondary'),
    (r'bg-white/5', 'bg-secondary/50'),
    
    # White opacity texts (often used for muted text)
    (r'text-white/70', 'text-muted-foreground'),
    (r'text-white/50', 'text-muted-foreground'),
    (r'text-white/80', 'text-secondary-foreground'),
    (r'text-white/60', 'text-muted-foreground'),
    
    # Specific gradients often using black
    (r'from-black/90', 'from-background/90'),
    (r'via-black/70', 'via-background/70'),
    (r'to-black/30', 'to-background/30'),
    (r'to-black/0', 'to-transparent'),
    (r'from-black/80', 'from-background/80'),
    (r'from-black/60', 'from-background/60'),
    
    # Specific hardcoded white text that should adapt
    # Note: text-white is risky to replace globally because of image overlays.
    # We will replace it only in known safe contexts or leave it if it's over an image.
]

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    for old, new in replacements:
        content = re.sub(old, new, content)
        
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))

print("Done replacing hardcoded colors.")
