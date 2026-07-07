import { useDataStore } from '../store/dataStore';
import ArtistCard from '../components/cards/ArtistCard';
import { motion } from 'motion/react';
import { Mic2 } from 'lucide-react';

export default function Artists() {
  const { artists } = useDataStore();
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Mic2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-foreground">الفنانون والمنشدون</h1>
            <p className="text-sm text-muted-foreground">اكتشف فناني ومنشدي اتحاد الشعراء والمنشدين</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
      >
        {artists.map((artist) => (
          <ArtistCard key={artist.id} artist={artist} />
        ))}
      </motion.div>
    </div>
  );
}