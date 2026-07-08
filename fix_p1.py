import os
import re

TARGET_DIR = "/home/u0_a398/MusicApp/client/src/app"

def fix_grid_classes(content):
    # Fix various duplicate grid class patterns
    
    # grid-cols-1 md:grid-cols-2 md:grid-cols-3 -> grid-cols-1 md:grid-cols-2 lg:grid-cols-3
    content = re.sub(r'grid-cols-1\s+md:grid-cols-2\s+md:grid-cols-3', 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3', content)
    
    # grid-cols-2 md:grid-cols-2 md:grid-cols-4 -> grid-cols-2 md:grid-cols-3 lg:grid-cols-4
    content = re.sub(r'grid-cols-2\s+md:grid-cols-2\s+md:grid-cols-4', 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4', content)
    
    # grid-cols-2 md:grid-cols-3 lg:grid-cols-2 md:grid-cols-4 -> grid-cols-2 md:grid-cols-3 lg:grid-cols-4
    content = re.sub(r'grid-cols-2\s+md:grid-cols-3\s+lg:grid-cols-2\s+md:grid-cols-4', 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4', content)
    
    # md:grid-cols-2 lg:grid-cols-2 md:grid-cols-3 -> grid-cols-1 md:grid-cols-2 lg:grid-cols-3
    content = re.sub(r'md:grid-cols-2\s+lg:grid-cols-2\s+md:grid-cols-3', 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3', content)
    
    # grid-cols-1 md:grid-cols-2 lg:grid-cols-2 md:grid-cols-3 -> grid-cols-1 md:grid-cols-2 lg:grid-cols-3
    content = re.sub(r'grid-cols-1\s+md:grid-cols-2\s+lg:grid-cols-2\s+md:grid-cols-3', 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3', content)
    
    # grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 md:grid-cols-3 -> grid-cols-1 md:grid-cols-2 lg:grid-cols-3
    content = re.sub(r'grid-cols-1\s+lg:grid-cols-2\s+xl:grid-cols-2\s+md:grid-cols-3', 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3', content)
    
    # md:grid-cols-2 lg:grid-cols-2 md:grid-cols-4 -> grid-cols-1 md:grid-cols-2 lg:grid-cols-4
    content = re.sub(r'md:grid-cols-2\s+lg:grid-cols-2\s+md:grid-cols-4', 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4', content)
    
    # md:grid-cols-2 md:grid-cols-3 -> grid-cols-1 md:grid-cols-2 lg:grid-cols-3
    content = re.sub(r'md:grid-cols-2\s+md:grid-cols-3', 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3', content)

    # md:grid-cols-3 lg:grid-cols-4 md:grid-cols-5 -> grid-cols-2 md:grid-cols-3 lg:grid-cols-5
    content = re.sub(r'md:grid-cols-3\s+lg:grid-cols-4\s+md:grid-cols-5', 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5', content)
    
    return content

def fix_files():
    for root, _, files in os.walk(TARGET_DIR):
        for file in files:
            if not file.endswith(('.tsx', '.ts')):
                continue
            
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                
            original_content = content
            
            # Fix grids
            content = fix_grid_classes(content)
            
            # Fix duplicate imports in Songs.tsx
            if file == "Songs.tsx":
                import_pattern = r'import\s+{\s*ChevronDown,\s*ChevronUp,\s*Music2,\s*Shuffle,\s*Check,\s*Star\s*}\s*from\s*\'lucide-react\';\n'
                content = re.sub(import_pattern, '', content, count=1) # Remove one instance if duplicated

            if content != original_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Fixed: {filepath}")

if __name__ == "__main__":
    fix_files()
