import { useDataStore } from '../store/dataStore';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Plus, ListMusic } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export default function Playlists() {
  const navigate = useNavigate();
  const { playlists, userPlaylists, fetchUserPlaylists, createPlaylist } = useDataStore();
  const { user, isAuthenticated } = useAuth();

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [activeTab, setActiveTab] = useState<'mine' | 'public'>('mine');

  const myPlaylists = userPlaylists.length > 0 ? userPlaylists : [];
  const publicPlaylists = playlists || [];

  const displayed = activeTab === 'mine' ? myPlaylists : publicPlaylists;

  const handleCreate = async () => {
    if (!newName.trim()) return toast.error('أدخل اسم القائمة');
    const pl = await createPlaylist({ name: newName.trim(), description: newDesc.trim() || undefined });
    if (pl) {
      toast.success('تم إنشاء القائمة');
      setNewName('');
      setNewDesc('');
      setShowCreate(false);
      await fetchUserPlaylists();
    } else {
      toast.error('فشل إنشاء القائمة');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold mb-2">قوائم التشغيل</h1>
          <p className="text-muted-foreground">قوائم تشغيل مميزة لجميع الأذواق</p>
        </motion.div>

        {isAuthenticated && (
          <Button onClick={() => setShowCreate(!showCreate)} className="gap-2">
            <Plus className="w-4 h-4" /> إنشاء قائمة
          </Button>
        )}
      </div>

      {showCreate && (
        <div className="bg-secondary/50 border border-white/10 rounded-2xl p-6 max-w-md">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><ListMusic className="w-5 h-5" /> قائمة جديدة</h3>
          <Input placeholder="اسم القائمة" value={newName} onChange={e => setNewName(e.target.value)} className="mb-3" />
          <Textarea placeholder="وصف (اختياري)" value={newDesc} onChange={e => setNewDesc(e.target.value)} className="mb-4" />
          <div className="flex gap-3">
            <Button onClick={handleCreate}>إنشاء</Button>
            <Button variant="outline" onClick={() => setShowCreate(false)}>إلغاء</Button>
          </div>
        </div>
      )}

      <div className="flex gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('mine')}
          className={`px-4 py-2 rounded-full text-sm ${activeTab === 'mine' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}
        >
          قوائمي {myPlaylists.length ? `(${myPlaylists.length})` : ''}
        </button>
        <button
          onClick={() => setActiveTab('public')}
          className={`px-4 py-2 rounded-full text-sm ${activeTab === 'public' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}
        >
          عامة
        </button>
      </div>

      {displayed.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          {activeTab === 'mine' ? 'لا توجد قوائم خاصة بك بعد. أنشئ واحدة!' : 'لا توجد قوائم عامة.'}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayed.map((playlist: any) => (
          <motion.div
            key={playlist.id}
            whileHover={{ scale: 1.02 }}
            className="group bg-secondary/50 hover:bg-secondary p-4 rounded-xl cursor-pointer"
            onClick={() => navigate(`/playlists/${playlist.id}`)}
          >
            <img
              src={playlist.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400'}
              alt={playlist.name}
              className="w-full aspect-square rounded-lg mb-4 object-cover"
            />
            <h3 className="font-semibold truncate">{playlist.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{playlist.description}</p>
            {playlist.tracks && <p className="text-xs text-muted-foreground mt-1">{playlist.tracks.length || 0} زامل</p>}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
