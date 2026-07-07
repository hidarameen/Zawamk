import { motion } from 'motion/react';
import { Eye, Heart, FileText, Play } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Poem } from "../../types";

interface PoemCardProps {
  poem: Poem;
}

export default function PoemCard({ poem }: PoemCardProps) {
  const navigate = useNavigate();
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/poem/${poem.id}`)}
      className="bg-card rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 cursor-pointer group"
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={poem.coverUrl}
          alt={poem.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 text-secondary-foreground text-sm">
              <FileText className="w-4 h-4" />
              <span>{poem.verses} أبيات</span>
            </div>
          </div>
        </div>
        {poem.audioUrl && (
          <div className="absolute top-4 right-4 bg-primary text-primary-foreground p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Play className="w-4 h-4" />
          </div>
        )}
      </div>
      
      <div className="p-4 space-y-2">
        <h3 className="font-semibold line-clamp-2 leading-snug">{poem.title}</h3>
        <p className="text-sm text-muted-foreground">{poem.poetName}</p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              <span>{formatNumber(poem.views)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" />
              <span>{formatNumber(poem.likes)}</span>
            </div>
          </div>
          <span className="bg-accent px-2 py-1 rounded text-xs">{poem.category}</span>
        </div>
      </div>
    </motion.div>
  );
}