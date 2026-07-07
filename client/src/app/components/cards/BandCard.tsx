import { useNavigate } from 'react-router';
import { CheckCircle2, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { Band } from "../../types";

type BandCardProps = {
  band: Band;
};

export default function BandCard({ band }: BandCardProps) {
  const navigate = useNavigate();

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="group bg-card hover:bg-accent/30 border border-border hover:border-primary/30 p-4 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-md"
      onClick={() => navigate(`/bands/${band.id}`)}
    >
      <div className="relative mb-4">
        <div className="relative w-full aspect-square rounded-xl overflow-hidden ring-2 ring-border group-hover:ring-primary/40 transition-all">
          <img
            src={band.avatar}
            alt={band.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        {band.verified && (
          <div className="absolute top-2 left-2 bg-primary rounded-full p-1 ring-2 ring-background shadow-md">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="font-semibold text-foreground truncate">{band.name}</h3>
        <p className="text-xs text-primary font-medium">{band.style}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {band.membersCount} أعضاء
          </span>
          <span>{formatFollowers(band.followers)} متابع</span>
        </div>
        <p className="text-xs text-muted-foreground">{band.country} · {band.foundedYear}</p>
      </div>
    </motion.div>
  );
}
