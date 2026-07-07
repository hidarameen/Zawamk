import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useDataStore } from '../../store/dataStore';
import { useAuth } from '../../contexts/AuthContext';

export default function ArtistAnalytics() {
  const { getTracksByArtistId } = useDataStore();
  const { user } = useAuth();
  const tracks = getTracksByArtistId(user?.id || 'artist-1');
  const topTracks = tracks.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5).map(t => ({ name: t.title, listeners: t.views || 0 }));
  const monthlyData = [
    { month: 'يناير', listeners: 45000 },
    { month: 'فبراير', listeners: 52000 },
    { month: 'مارس', listeners: 61000 },
    { month: 'أبريل', listeners: 58000 },
    { month: 'مايو', listeners: 70000 },
    { month: 'يونيو', listeners: 85000 },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold mb-2">الإحصائيات والتحليلات</h1>
        <p className="text-muted-foreground">تتبع أداء زواملك ونموك</p>
      </motion.div>

      <div className="bg-secondary/50 border border-white/10 rounded-3xl p-8">
        <h3 className="text-xl font-bold mb-6">المستمعون الشهريون</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="month" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
            />
            <Line type="monotone" dataKey="listeners" stroke="#a855f7" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-secondary/50 border border-white/10 rounded-3xl p-8">
        <h3 className="text-xl font-bold mb-6">الزوامل الأكثر استماعاً</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topTracks.length ? topTracks : [{ name: 'لا توجد بيانات', listeners: 0 }]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
            />
            <Bar dataKey="listeners" fill="#a855f7" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
