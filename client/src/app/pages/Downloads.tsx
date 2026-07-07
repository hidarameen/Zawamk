import TrackCard from '../components/cards/TrackCard';
import { motion } from 'motion/react';
import { Download } from 'lucide-react';
import { useDataStore } from "../../app/store/dataStore";

import { useState, useEffect } from 'react';

export default function Downloads() {
  const { getTrackById } = useDataStore();
  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);

  useEffect(() => {
    const d = localStorage.getItem('downloads');
    if (d) setDownloadedIds(JSON.parse(d));
  }, []);

  const downloadedTracks = downloadedIds.map(id => getTrackById(id)).filter(Boolean) as any[];
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Download className="w-10 h-10 text-purple-400" />
          التنزيلات
        </h1>
        <p className="text-muted-foreground">استمع إلى موسيقاك بدون اتصال بالإنترنت</p>
      </motion.div>

      <div className="bg-secondary/50 rounded-2xl p-6">
        <div className="space-y-2">
          {downloadedTracks.length > 0 ? (
            downloadedTracks.map((track, index) => (
              <TrackCard key={track.id} track={track} index={index} showCover={true} />
            ))
          ) : (
            <div className="text-center text-muted-foreground py-10">لا توجد أغانٍ محملة بعد</div>
          )}
        </div>
      </div>
    </div>
  );
}
