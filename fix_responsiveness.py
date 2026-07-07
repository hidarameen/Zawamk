import os
import re

def process_class_string(class_str):
    original_str = class_str
    
    # 1. Fix grid-cols
    # If it has grid-cols-X but no md:grid-cols or sm:grid-cols
    grid_match = re.search(r'(?<![a-z0-9:-])grid-cols-([2-9]|1[0-2])(?![a-z0-9-])', class_str)
    if grid_match:
        # Check if responsive grid-cols already exist
        if not any(x in class_str for x in ['sm:grid-cols', 'md:grid-cols', 'lg:grid-cols', 'xl:grid-cols']):
            col_num = grid_match.group(1)
            class_str = re.sub(r'(?<![a-z0-9:-])grid-cols-([2-9]|1[0-2])(?![a-z0-9-])', f'grid-cols-1 md:grid-cols-{col_num}', class_str)

    # 2. Fix large widths
    # Match w-48 through w-96
    if re.search(r'(?<![a-z0-9:-])w-(48|52|56|60|64|72|80|96)(?![a-z0-9-])', class_str):
        if 'max-w-full' not in class_str and 'w-full' not in class_str:
            class_str += ' max-w-full'
            
    # Match w-[180px] and above
    if re.search(r'(?<![a-z0-9:-])w-\[([1-9][5-9]\d|[2-9]\d\d+)px\](?![a-z0-9-])', class_str):
         if 'max-w-full' not in class_str and 'w-full' not in class_str:
            class_str += ' max-w-full'

    # 3. Fix large padding p-12 -> p-6 md:p-12
    p_match = re.search(r'(?<![a-z0-9:-])p-([1-9][2-9]|[2-9]\d)(?![a-z0-9-])', class_str)
    if p_match:
        if not any(x in class_str for x in ['md:p-', 'sm:p-', 'lg:p-']):
            pad_val = p_match.group(1)
            class_str = re.sub(r'(?<![a-z0-9:-])p-([1-9][2-9]|[2-9]\d)(?![a-z0-9-])', f'p-6 md:p-{pad_val}', class_str)

    # 4. Fix large heights
    # Heights like h-72, h-80, h-96 are often too big for mobile screens if they are absolute/fixed or full containers
    # We will replace h-(64|72|80|96) with h-48 md:h-\1 or h-56 md:h-\1
    h_match = re.search(r'(?<![a-z0-9:-])h-(64|72|80|96)(?![a-z0-9-])', class_str)
    if h_match:
        if not any(x in class_str for x in ['md:h-', 'sm:h-', 'lg:h-', 'h-auto', 'max-h-']):
            h_val = h_match.group(1)
            if h_val == '64': new_h = '48'
            elif h_val == '72': new_h = '56'
            elif h_val == '80': new_h = '64'
            elif h_val == '96': new_h = '72'
            else: new_h = '64'
            class_str = re.sub(r'(?<![a-z0-9:-])h-(64|72|80|96)(?![a-z0-9-])', f'h-{new_h} md:h-{h_val}', class_str)

    # For AdminLayout sidebar width w-64, it might be fixed. 
    # w-64 max-w-full is safe, but wait, sidebar should not be 100%. 
    # Let's clean up multiple spaces
    class_str = re.sub(r'\s+', ' ', class_str).strip()
    return class_str

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # We need to find all className="..." and className={`...`}
    # This is slightly tricky because of overlapping strings, but we can use a callback in re.sub
    
    def replacer(match):
        prefix = match.group(1) # className=" or className={`
        class_content = match.group(2)
        suffix = match.group(3) # " or `}
        
        new_class_content = process_class_string(class_content)
        return f"{prefix}{new_class_content}{suffix}"

    # Match className="..."
    new_content = re.sub(r'(className=["\'])(.*?)(["\'])', replacer, content)
    # Match className={`...`}
    new_content = re.sub(r'(className=\{`)(.*?)(`\})', replacer, new_content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

def fix_all(directories):
    fixed_files = []
    for directory in directories:
        for root, _, files in os.walk(directory):
            for file in files:
                if file.endswith('.tsx') or file.endswith('.jsx'):
                    filepath = os.path.join(root, file)
                    if process_file(filepath):
                        fixed_files.append(filepath)
    return fixed_files

directories_to_fix = [
    '/home/u0_a398/MusicApp/client/src/app/pages',
    '/home/u0_a398/MusicApp/client/src/app/components'
]

fixed = fix_all(directories_to_fix)
print(f"Fixed {len(fixed)} files.")
for f in fixed:
    print(f)
