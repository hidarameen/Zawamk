import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Video, Plus, Search, Edit, Trash2, X, Save, Eye, Clock } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { toast } from 'sonner';
import { MusicVideo } from "../../types";
import { useDataStore } from "../../../app/store/dataStore";
import { FileUpload } from '../../components/ui/FileUpload';

interface VideoForm {
  title: string; artistId: string; albumId: string; poetId: string; occasionId: string;
  thumbnailUrl: string; videoUrl: string; duration: string; type: string;
}

const defaultForm: VideoForm = {
  title: '', artistId: '', albumId: '', poetId: '', occasionId: '',
  thumbnailUrl: '', videoUrl: '', duration: '', type: '',
};

const typeOptions = ['كليب موسيقي', 'أناشيد', 'حفل مباشر', 'تلاوة', 'وثائقي'];

function formatViews(v: number) {
  return v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}م` : v >= 1000 ? `${(v / 1000).toFixed(0)}ك` : String(v);
}

function formatDuration(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}

export default function AdminVideos() {
    const { videos: storeVideos, artists, poets, occasions, addEntity, updateEntity, deleteEntity } = useDataStore();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<VideoForm>(defaultForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() =>
    storeVideos.filter(v => !search || v.title.includes(search)),
    [storeVideos, search]);

  const openAdd = () => { setForm(defaultForm); setEditId(null); setShowModal(true); };
  const openEdit = (v: MusicVideo) => {
    setForm({
      title: v.title, artistId: v.artistId, albumId: v.albumId || '',
      poetId: v.poetId || '', occasionId: v.occasionId || '',
      thumbnailUrl: v.thumbnailUrl, videoUrl: v.videoUrl,
      duration: String(v.duration), type: v.type || '',
    });
    setEditId(v.id); setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.videoUrl) { toast.error('يرجى ملء الحقول المطلوبة'); return; }
    if (editId) {
      const success = await updateEntity('videos', editId, form);
      if (success) toast.success('تم تحديث الفيديو');
      else toast.error('فشل التحديث');
    } else {
      const success = await addEntity('videos', form);
      if (success) toast.success('تمت إضافة الفيديو بنجاح');
      else toast.error('فشل الإضافة');
    }
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    const success = await deleteEntity('videos', id);
    if (success) toast.success('تم حذف الفيديو');
    else toast.error('فشل الحذف');
    setDeleteId(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground">إدارة الفيديوهات</h1>
          <p className="text-muted-foreground text-sm mt-1">{storeVideos.length} فيديو</p>
        </div>
        <Button onClick={openAdd} className="gap-2 bg-primary text-primary-foreground rounded-xl">
          <Plus className="w-4 h-4" /> إضافة فيديو
        </Button>
      </div>

      <Card className="p-4 bg-card border-border">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث في الفيديوهات..."
            className="w-full bg-background border border-border rounded-xl pr-10 pl-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50" />
        </div>
      </Card>

      <Card className="bg-card border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">الفيديو</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">الفنان</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">المشاهدات</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">المدة</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">تاريخ النشر</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((video, i) => (
                <motion.tr key={video.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-20 flex-shrink-0 rounded-lg overflow-hidden aspect-video">
                        <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Video className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-foreground line-clamp-1">{video.title}</p>
                        {video.type && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{video.type}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{video.artistName}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{formatViews(video.views)}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatDuration(video.duration)}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(video.releaseDate).toLocaleDateString('ar-SA')}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-100">
                      <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary" onClick={() => openEdit(video)}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-500" onClick={() => setDeleteId(video.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-foreground">{editId ? 'تعديل فيديو' : 'إضافة فيديو جديد'}</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowModal(false)} className="rounded-full"><X className="w-4 h-4" /></Button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-foreground mb-1.5">عنوان الفيديو *</label>
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
                    <label className="block text-sm text-foreground mb-1.5">نوع الفيديو</label>
                    <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50">
                      <option value="">اختر النوع</option>
                      {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-foreground mb-1.5">الشاعر</label>
                    <select value={form.poetId} onChange={e => setForm(f => ({ ...f, poetId: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50">
                      <option value="">غير محدد</option>
                      {poets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-foreground mb-1.5">المناسبة</label>
                    <select value={form.occasionId} onChange={e => setForm(f => ({ ...f, occasionId: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50">
                      <option value="">غير مرتبط</option>
                      {occasions.map(o => <option key={o.id} value={o.id}>{o.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-foreground mb-1.5">المدة (ثانية)</label>
                    <input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1.5">رابط الصورة المصغرة</label>
                  <input value={form.thumbnailUrl} onChange={e => setForm(f => ({ ...f, thumbnailUrl: e.target.value }))}
                    placeholder="https://..." className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1.5">رابط الفيديو</label>
                  <FileUpload value={form.videoUrl} onChange={(url) => setForm(f => ({ ...f, videoUrl: url }))} accept="video/*" />
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
              <h3 className="text-foreground text-center mb-2">حذف الفيديو</h3>
              <p className="text-muted-foreground text-center text-sm mb-6">هل أنت متأكد من حذف هذا الفيديو؟</p>
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
