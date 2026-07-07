import os
import re
import json

def check_responsiveness(directory):
    issues = {}
    
    # Regex patterns for anti-patterns in Tailwind (mobile-first)
    # 1. Grid columns > 1 without responsive prefix
    grid_cols_pattern = re.compile(r'(?<![a-z0-9:-])grid-cols-([2-9]|1[0-2])(?![a-z0-9-])')
    
    # 2. Large fixed widths without responsive prefix or max-w-full
    # We look for w-48 and above, w-[100px+], etc.
    large_w_pattern = re.compile(r'(?<![a-z0-9:-])w-(4[89]|[5-9][0-9]|[1-9][0-9]{2}|\[\d+px\])(?![a-z0-9-])')
    
    # 3. Large padding without responsive prefix
    large_p_pattern = re.compile(r'(?<![a-z0-9:-])[p|px|py|pl|pr|pt|pb]-([1-9][0-9])(?![a-z0-9-])')
    
    # 4. Flex row on mobile when it might need to be flex-col
    # flex-row is often explicitly set but might be bad on mobile, 
    # but we will just flag it if there's no md:flex-col or something, actually flex-row is default so explicitly setting flex-row without md: is suspicious.
    # We'll skip flex-row as it might be intentional (e.g. icon + text).
    
    # 5. Fixed heights that might cause overflow
    large_h_pattern = re.compile(r'(?<![a-z0-9:-])h-(4[89]|[5-9][0-9]|[1-9][0-9]{2}|\[\d+px\])(?![a-z0-9-])')

    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.jsx'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                file_issues = []
                
                # Check for grid cols
                grids = grid_cols_pattern.findall(content)
                if grids:
                    file_issues.append(f"Hardcoded grid-cols-{','.join(grids)} without responsive prefix (e.g., md:grid-cols-X). This forces multiple columns on mobile.")
                
                # Check for large widths
                # We should check if the line also contains max-w-full or md:w-
                # To be precise, we need to extract class strings.
                class_strings = re.findall(r'className=["\'](.*?)["\']|className=\{`(.*?)`\}', content)
                for class_match in class_strings:
                    class_str = class_match[0] or class_match[1]
                    # ignore conditional classes for simple check or evaluate them loosely
                    if grid_cols_pattern.search(class_str) and not any(p in class_str for p in ['md:grid-cols', 'sm:grid-cols', 'lg:grid-cols']):
                        file_issues.append(f"Non-responsive grid: '{class_str}'")
                    
                    large_w = large_w_pattern.findall(class_str)
                    if large_w and not ('max-w' in class_str or 'w-full' in class_str):
                        # check if there's no responsive prefix for it
                        file_issues.append(f"Fixed large width without responsive fallback (e.g., max-w-full): '{class_str}'")
                    
                    large_p = large_p_pattern.findall(class_str)
                    if large_p and not any(p in class_str for p in ['sm:p', 'md:p', 'lg:p']):
                        file_issues.append(f"Large fixed padding on mobile: '{class_str}'")
                        
                    large_h = large_h_pattern.findall(class_str)
                    if large_h and not any(h in class_str for h in ['sm:h', 'md:h', 'lg:h', 'h-auto']):
                        file_issues.append(f"Fixed large height that might overflow on mobile: '{class_str}'")
                        
                if file_issues:
                    # Deduplicate issues
                    issues[file] = list(set(file_issues))
                    
    return issues

pages_dir = '/home/u0_a398/MusicApp/client/src/app/pages'
components_dir = '/home/u0_a398/MusicApp/client/src/app/components'

page_issues = check_responsiveness(pages_dir)
component_issues = check_responsiveness(components_dir)

with open('responsiveness_report.json', 'w') as f:
    json.dump({"pages": page_issues, "components": component_issues}, f, indent=2)

print(f"Found issues in {len(page_issues)} pages and {len(component_issues)} components.")
