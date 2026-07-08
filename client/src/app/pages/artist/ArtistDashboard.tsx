import { motion } from 'motion/react';
import { TrendingUp, Users, Music, Eye } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { useDataStore } from '../../store/dataStore';
import { useAuth } from '../../contexts/AuthContext';
import TrackCard from '../../components/cards/TrackCard';

export default function ArtistDashboard() {
  const { getTracksByArtistId, artists } = useDataStore();
  const { user } = useAuth();
  // For demo: find artist by name match or use seeded id
  const artistId = artists.find(a => a.name.includes('عيسى') || a.name.includes('issa'))?.id || 'artist-issa';
  const tracks = getTracksByArtistId(artistId);
  const totalViews = tracks.reduce((sum, t) => sum + (t.views || 0), 0);
  const totalListeners = Math.floor(totalViews * 0.4); // Mock listeners

  const stats = [
    { label: 'إجمالي المستمعين', value: totalListeners > 1000 ? `${(totalListeners/1000).toFixed(1)}K` : totalListeners, icon: Users, color: 'text-purple-400' },
    { label: 'إجمالي الزوامل', value: tracks.length, icon: Music, color: 'text-pink-400' },
    { label: 'إجمالي المشاهدات', value: totalViews > 1000 ? `${(totalViews/1000).toFixed(1)}K` : totalViews, icon: Eye, color: 'text-blue-400' },
    { label: 'معدل النمو', value: '+25%', icon: TrendingUp, color: 'text-green-400' },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold mb-2">لوحة تحكم الفنان</h1>
        <p className="text-muted-foreground">إدارة محتواك وتتبع إحصائياتك</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-secondary/50 border-border/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-secondary/50 border-border/50 p-6 max-h-[400px] overflow-y-auto">
          <h3 className="text-xl font-bold mb-4">آخر الزوامل</h3>
          <div className="space-y-2">
            {tracks.length > 0 ? tracks.map((track, i) => (
              <TrackCard key={track.id} track={track} index={i} showCover={true} />
            )) : (
              <p className="text-muted-foreground">لا توجد أغانٍ منشورة بعد</p>
            )}
          </div>
        </Card>

        <Card className="bg-secondary/50 border-border/50 p-6">
          <h3 className="text-xl font-bold mb-4">الإحصائيات الشهرية</h3>
          <p className="text-muted-foreground">تفاصيل أدائك الشهري</p>
        </Card>
      </div>
    </div>
  );
}
