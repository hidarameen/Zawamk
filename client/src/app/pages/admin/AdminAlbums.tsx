import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Disc, Plus, Search, Edit, Trash2, X, Save } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { toast } from 'sonner';
import { Album } from "../../types";
import { useDataStore } from "../../../app/store/dataStore";
import { FileUpload } from '../../components/ui/FileUpload';

const genreOptions = ['إنشاد إسلامي', 'أناشيد وطنية', 'موسيقى تراثية', 'موشحات', 'قرآن كريم', 'مديح نبوي'];

interface AlbumForm {
  title: string; artistId: string; bandId: string; releaseDate: string;
  genre: string; coverUrl: string; totalTracks: string; trackIds: string[];
}

const defaultForm: AlbumForm = {
  title: '', artistId: '', bandId: '', releaseDate: '', genre: '', coverUrl: '', totalTracks: '', trackIds: [],
};

export default function AdminAlbums() {
  const { albums: storeAlbums, artists, bands, tracks: storeTracks, addEntity, updateEntity, deleteEntity } = useDataStore();
  const [filterArtist, setFilterArtist] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<AlbumForm>(defaultForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return storeAlbums.filter(a => {
      if (search && !a.title.includes(search)) return false;
      if (filterArtist !== 'all' && a.artistId !== filterArtist) return false;
      return true;
    });
  }, [storeAlbums, search, filterArtist]);

  const openAdd = () => { setForm(defaultForm); setEditId(null); setShowModal(true); };
  const openEdit = (a: Album) => {
    setForm({ title: a.title, artistId: a.artistId, bandId: a.bandId || '', releaseDate: a.releaseDate, genre: a.genre, coverUrl: a.coverUrl, totalTracks: String(a.totalTracks) });
    setEditId(a.id); setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.artistId) { toast.error('يرجى ملء الحقول المطلوبة'); return; }
    if (editId) {
      const success = await updateEntity('albums', editId, {
        ...form, totalTracks: Number(form.totalTracks) || 0
      });
      if (success) toast.success('تم تحديث الألبوم');
      else toast.error('فشل التحديث');
    } else {
      const success = await addEntity('albums', {
        ...form, totalTracks: Number(form.totalTracks) || 0
      });
      if (success) toast.success('تمت إضافة الألبوم بنجاح');
      else toast.error('فشل الإضافة');
    }
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    const success = await deleteEntity('albums', id);
    if (success) toast.success('تم حذف الألبوم');
    else toast.error('فشل الحذف');
    setDeleteId(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground">إدارة الألبومات</h1>
          <p className="text-muted-foreground text-sm mt-1">{storeAlbums.length} ألبوم مسجل</p>
        </div>
        <Button onClick={openAdd} className="gap-2 bg-primary text-primary-foreground rounded-xl">
          <Plus className="w-4 h-4" /> إضافة ألبوم
        </Button>
      </div>

      <Card className="p-4 bg-card border-border">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث في الألبومات..."
            className="w-full bg-background border border-border rounded-xl pr-10 pl-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50" />
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filtered.map((album, i) => (
          <motion.div key={album.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="group">
            <Card className="bg-card border-border overflow-hidden hover:border-primary/30 hover:shadow-md transition-all">
              <div className="relative aspect-square">
                <img src={album.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400'} alt={album.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-100 flex items-center justify-center gap-2">
                  <button onClick={() => openEdit(album)} className="w-9 h-9 bg-primary rounded-full flex items-center justify-center">
                    <Edit className="w-4 h-4 text-white" />
                  </button>
                  <button onClick={() => setDeleteId(album.id)} className="w-9 h-9 bg-red-500 rounded-full flex items-center justify-center">
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm text-foreground truncate">{album.title}</p>
                <p className="text-xs text-muted-foreground truncate">{album.artistName}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{album.genre}</span>
                  <span className="text-xs text-muted-foreground">{album.totalTracks} مسار</span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-foreground">{editId ? 'تعديل ألبوم' : 'إضافة ألبوم جديد'}</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowModal(false)} className="rounded-full"><X className="w-4 h-4" /></Button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-foreground mb-1.5">عنوان الألبوم *</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-foreground mb-1.5">الفنان *</label>
                    <select value={form.artistId} onChange={e => setForm(f => ({ ...f, artistId: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50">
                      <option value="">اختر الفنان</option>
                      {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-foreground mb-1.5">الفرقة</label>
                    <select value={form.bandId} onChange={e => setForm(f => ({ ...f, bandId: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50">
                      <option value="">بدون فرقة</option>
                      {bands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-foreground mb-1.5">النوع الفني</label>
                    <select value={form.genre} onChange={e => setForm(f => ({ ...f, genre: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50">
                      <option value="">اختر النوع</option>
                      {genreOptions.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-foreground mb-1.5">تاريخ الإصدار</label>
                    <input type="date" value={form.releaseDate} onChange={e => setForm(f => ({ ...f, releaseDate: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50" />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground mb-1.5">عدد المسارات</label>
                    <input type="number" value={form.totalTracks} onChange={e => setForm(f => ({ ...f, totalTracks: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1.5">رابط صورة الغلاف</label>
                  <FileUpload value={form.coverUrl} onChange={(url) => setForm(f => ({ ...f, coverUrl: url }))} accept="image/*" />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
                <Button variant="ghost" onClick={() => setShowModal(false)}>إلغاء</Button>
                <Button onClick={handleSave} className="gap-2 bg-primary text-primary-foreground rounded-xl">
                  <Save className="w-4 h-4" /> {editId ? 'حفظ' : 'إضافة'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="w-6 h-6 text-red-500" /></div>
              <h3 className="text-foreground text-center mb-2">حذف الألبوم</h3>
              <p className="text-muted-foreground text-center text-sm mb-6">هل أنت متأكد من حذف هذا الألبوم؟</p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>إلغاء</Button>
                <Button variant="destructive" className="flex-1" onClick={() => handleDelete(deleteId!)}>حذف</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
