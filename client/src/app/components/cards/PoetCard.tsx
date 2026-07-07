import { useNavigate } from 'react-router';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Poet } from "../../types";

type PoetCardProps = {
  poet: Poet;
};

export default function PoetCard({ poet }: PoetCardProps) {
  const navigate = useNavigate();

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="group glass-card p-4 rounded-2xl cursor-pointer focus-within:ring-2 focus-within:ring-primary/30 outline-none transition-all duration-200 h-full flex flex-col items-center"
      onClick={() => navigate(`/poet/${poet.id}`)}
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), navigate(`/poet/${poet.id}`))}
    >
      <div className="relative mb-4 w-full max-w-[140px]">
        <div className="relative w-full aspect-square rounded-full overflow-hidden ring-2 ring-border group-hover:ring-primary/40 transition-all mx-auto">
          <img
            src={poet.avatar}
            alt={poet.name}
            className="w-full h-full object-cover"
          />
        </div>
        {poet.verified && (
          <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1 ring-2 ring-background">
            <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
          </div>
        )}
      </div>

      <div className="text-center mt-auto w-full">
        <h3 className="font-semibold text-foreground mb-1 truncate">{poet.name}</h3>
        <p className="text-xs text-muted-foreground mb-1">شاعر</p>
        <p className="text-xs text-primary font-medium">
          {formatFollowers(poet.followers)} متابع
        </p>
      </div>
    </motion.div>
  );
}