import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ListMusic, Plus, Search, Edit, Trash2, X, Save, Globe, Lock } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { toast } from 'sonner';
import { Playlist } from "../../types";
import { useDataStore } from "../../../app/store/dataStore";
import { FileUpload } from '../../components/ui/FileUpload';

interface PlaylistForm {
  name: string; description: string; coverUrl: string; isPublic: boolean; createdBy: string;
}

const defaultForm: PlaylistForm = { name: '', description: '', coverUrl: '', isPublic: true, createdBy: 'المشرف' };

export default function AdminPlaylists() {
  const { playlists: storePlaylists, addEntity, updateEntity, deleteEntity } = useDataStore();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<PlaylistForm>(defaultForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() =>
    storePlaylists.filter(p => !search || p.name.includes(search) || p.description.includes(search)),
    [storePlaylists, search]);

  const openAdd = () => { setForm(defaultForm); setEditId(null); setShowModal(true); };
  const openEdit = (p: Playlist) => {
    setForm({ name: p.name, description: p.description, coverUrl: p.coverUrl, isPublic: p.isPublic, createdBy: p.createdBy });
    setEditId(p.id); setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name) { toast.error('يرجى إدخال اسم القائمة'); return; }
    if (editId) {
      const success = await updateEntity('playlists', editId, form);
      if (success) toast.success('تم تحديث القائمة');
      else toast.error('فشل التحديث');
    } else {
      const success = await addEntity('playlists', form);
      if (success) toast.success('تمت إضافة القائمة بنجاح');
      else toast.error('فشل الإضافة');
    }
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    const success = await deleteEntity('playlists', id);
    if (success) toast.success('تم حذف القائمة');
    else toast.error('فشل الحذف');
    setDeleteId(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground">إدارة قوائم التشغيل</h1>
          <p className="text-muted-foreground text-sm mt-1">{storePlaylists.length} قائمة تشغيل</p>
        </div>
        <Button onClick={openAdd} className="gap-2 bg-primary text-primary-foreground rounded-xl">
          <Plus className="w-4 h-4" /> إضافة قائمة
        </Button>
      </div>

      <Card className="p-4 bg-card border-border">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث في قوائم التشغيل..."
            className="w-full bg-background border border-border rounded-xl pr-10 pl-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50" />
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((playlist, i) => (
          <motion.div key={playlist.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="group">
            <Card className="bg-card border-border overflow-hidden hover:border-primary/30 hover:shadow-md transition-all">
              <div className="relative aspect-square">
                <img src={playlist.coverUrl} alt={playlist.name} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2">
                  {playlist.isPublic
                    ? <span className="bg-green-500/80 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1"><Globe className="w-2.5 h-2.5" />عام</span>
                    : <span className="bg-background0/80 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1"><Lock className="w-2.5 h-2.5" />خاص</span>
                  }
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-100 flex items-center justify-center gap-2">
                  <button onClick={() => openEdit(playlist)} className="w-9 h-9 bg-primary rounded-full flex items-center justify-center">
                    <Edit className="w-4 h-4 text-white" />
                  </button>
                  <button onClick={() => setDeleteId(playlist.id)} className="w-9 h-9 bg-red-500 rounded-full flex items-center justify-center">
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm text-foreground truncate">{playlist.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{playlist.description}</p>
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>{playlist.tracks.length} زامل</span>
                  <span>{playlist.followers.toLocaleString('ar')} متابع</span>
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
                <h2 className="text-foreground">{editId ? 'تعديل قائمة التشغيل' : 'إضافة قائمة تشغيل جديدة'}</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowModal(false)} className="rounded-full"><X className="w-4 h-4" /></Button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-foreground mb-1.5">اسم القائمة *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1.5">الوصف</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={3} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 resize-none" />
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1.5">رابط صورة الغلاف</label>
                  <FileUpload value={form.coverUrl} onChange={(url) => setForm(f => ({ ...f, coverUrl: url }))} accept="image/*" />
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1.5">المنشئ</label>
                  <input value={form.createdBy} onChange={e => setForm(f => ({ ...f, createdBy: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setForm(f => ({ ...f, isPublic: !f.isPublic }))}
                    className={`w-10 h-6 rounded-full transition-colors relative ${form.isPublic ? 'bg-primary' : 'bg-muted'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.isPublic ? 'right-1' : 'left-1'}`} />
                  </button>
                  <label className="text-sm text-foreground">{form.isPublic ? 'قائمة عامة' : 'قائمة خاصة'}</label>
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
              <h3 className="text-foreground text-center mb-2">حذف القائمة</h3>
              <p className="text-muted-foreground text-center text-sm mb-6">هل أنت متأكد من حذف قائمة التشغيل هذه؟</p>
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
