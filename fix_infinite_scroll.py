import os
import re

def add_infinite_scroll(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Add useIntersectionObserver hook if not exist or just use simple useEffect
        
        # 1. Add state for displayCount
        if 'const [displayCount, setDisplayCount] = useState(50);' not in content:
            content = content.replace(
                "const [viewType, setViewType] = useState<'list' | 'grid'>('list');",
                "const [viewType, setViewType] = useState<'list' | 'grid'>('list');\n  const [displayCount, setDisplayCount] = useState(50);\n  const observerRef = useRef<HTMLDivElement>(null);"
            )

        # 2. Add useEffect for observer
        observer_code = """
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayCount < filteredTracks.length) {
          setDisplayCount(prev => prev + 50);
        }
      },
      { threshold: 0.1 }
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [filteredTracks.length, displayCount]);

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(50);
  }, [searchQuery, filters]);
"""
        if 'const observer =' not in content:
            # Insert before return statement of the main component
            content = content.replace("  return (\n    <div className=", observer_code + "  return (\n    <div className=")

        # 3. Apply displayCount to maps
        content = content.replace("filteredTracks.map(", "filteredTracks.slice(0, displayCount).map(")
        
        # 4. Add the observer target div at the end of the lists
        observer_div = '\n      {displayCount < filteredTracks.length && (\n        <div ref={observerRef} className="h-20 flex items-center justify-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin" /></div>\n      )}'
        
        if 'ref={observerRef}' not in content:
            content = content.replace('</AnimatePresence>', '</AnimatePresence>' + observer_div)
            
        # Make sure Loader2 is imported
        if 'Loader2' not in content:
            content = content.replace('Play, Pause,', 'Play, Pause, Loader2,')

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Added infinite scroll to {filepath}")
        
    except Exception as e:
        print(f"Error: {e}")

BASE = "/home/u0_a398/MusicApp/client/src/app/pages"
add_infinite_scroll(f"{BASE}/Songs.tsx")
