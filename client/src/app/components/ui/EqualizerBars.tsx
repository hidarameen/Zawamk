import { motion } from 'framer-motion';

export interface EqualizerBarsProps {
  playing: boolean;
}

export function EqualizerBars({ playing }: EqualizerBarsProps) {
  return (
    <div className="flex items-end justify-center gap-[2px] h-3 w-4">
      {[1, 3, 2, 4].map((h, i) => (
        <motion.div
          key={i}
          animate={playing ? { height: [`${h}px`, `${h + 4}px`, `${h}px`] } : { height: '2px' }}
          transition={{ duration: 0.4 + i * 0.1, repeat: Infinity }}
          className="flex-1 bg-primary rounded-full"
        />
      ))}
    </div>
  );
}
