import { motion } from 'motion/react';
import TrackCard from '../../components/cards/TrackCard';
import { useDataStore } from "../../../app/store/dataStore";
import { FileUpload } from '../../components/ui/FileUpload';

export default function AdminContent() {
    const { tracks: tracks } = useDataStore();
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold mb-2">إدارة المحتوى</h1>
        <p className="text-muted-foreground">مراجعة وإدارة جميع الزوامل والمحتوى</p>
      </motion.div>

      <div className="bg-secondary/50 rounded-2xl p-6">
        <div className="space-y-2">
          {tracks.map((track, index) => (
            <TrackCard key={track.id} track={track} index={index} showCover={true} />
          ))}
        </div>
      </div>
    </div>
  );
}
