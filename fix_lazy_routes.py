import os
import re

def lazy_load_routes(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Add React import if not there
        if 'import React, { Suspense }' not in content:
            content = 'import React, { Suspense } from "react";\n' + content

        # Create a fallback loader
        loader_code = """
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh] text-muted-foreground">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const withSuspense = (Component: React.ComponentType) => (props: any) => (
  <Suspense fallback={<PageLoader />}>
    <Component {...props} />
  </Suspense>
);
"""
        if 'const PageLoader' not in content:
            # Insert after the imports
            content = re.sub(r'(import .*?;?\n)\n*(export const router)', r'\1\n' + loader_code + r'\n\2', content)

        # Replace standard imports with React.lazy
        # Matches: import ComponentName from "./pages/ComponentPath";
        # Excludes Root, NotFound, AdminLayout because they are usually better left synchronous (or just lazy load them too).
        
        # Let's just lazy load everything except Root
        def replace_import(match):
            component_name = match.group(1)
            import_path = match.group(2)
            if component_name in ['Root', 'NotFound']:
                return match.group(0)
            return f'const {component_name} = React.lazy(() => import("{import_path}"));'

        content = re.sub(r'import\s+([A-Za-z0-9_]+)\s+from\s+"([^"]+)";', replace_import, content)

        # We also need to wrap them in withSuspense inside the router config
        # This is a bit tricky with regex, so an alternative is to just use React Router's native lazy:
        # { path: "home", lazy: () => import("./pages/Home").then(m => ({ Component: m.default })) }
        
        # Let's revert and use React Router native lazy! Much cleaner.
        
    except Exception as e:
        print(f"Error: {e}")

# The above regex approach might be brittle. Let's do it via string replacement of lines.
def lazy_load_routes_native(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    new_lines = []
    imports = {}
    
    for line in lines:
        import_match = re.match(r'import\s+([A-Za-z0-9_]+)\s+from\s+"([^"]+)";', line.strip())
        if import_match and import_match.group(1) not in ['createBrowserRouter', 'Root', 'AdminLayout']:
            comp = import_match.group(1)
            path = import_match.group(2)
            imports[comp] = path
            continue
        new_lines.append(line)
        
    content = "".join(new_lines)
    
    for comp, path in imports.items():
        # Replace `Component: CompName` with `lazy: async () => ({ Component: (await import("path")).default })`
        content = re.sub(rf'Component:\s*{comp}\b', f'lazy: async () => ({{ Component: (await import("{path}")).default }})', content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Routes native lazy loaded")

lazy_load_routes_native('/home/u0_a398/MusicApp/client/src/app/routes.ts')
