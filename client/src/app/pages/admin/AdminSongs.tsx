import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileUpload } from '../../components/ui/FileUpload';
import {
  Music2, Plus, Search, Edit, Trash2, Play, Clock, Eye,
  Filter, ChevronDown, X, Check, Upload, Save, Mic2,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { toast } from 'sonner';
import { cn } from '../../components/ui/utils';
import { Track } from "../../types";
import { useDataStore } from "../../../app/store/dataStore";

type SortField = 'title' | 'artistName' | 'duration' | 'plays';

function formatDuration(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}

function formatPlays(p?: number) {
  if (!p) return '0';
  return p >= 1000000 ? `${(p / 1000000).toFixed(1)}م` : p >= 1000 ? `${(p / 1000).toFixed(0)}ك` : String(p);
}

const typeOptions = ['زامل', 'نشيد', 'مرثية', 'أوبريت'];

interface SongFormData {
  title: string;
  artistId: string;
  albumId: string;
  poetId: string;
  bandId: string;
  occasionId: string;
  type: string;
  duration: number;
  coverUrl: string;
  audioUrl: string;
  lyrics: string;
}

const defaultForm: SongFormData = {
  title: '', artistId: '', albumId: '', poetId: '', bandId: '',
  occasionId: '', type: '', duration: 0, coverUrl: '', audioUrl: '', lyrics: '',
};

export default function AdminSongs() {
  const { tracks, artists, albums, poets, bands, occasions, addEntity, updateEntity, deleteEntity } = useDataStore();
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortAsc, setSortAsc] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<SongFormData>(defaultForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeGenre, setActiveGenre] = useState('الكل');

  const filtered = useMemo(() => {
    let list = tracks;
    if (search) list = list.filter(s => s.title.includes(search) || s.artistName.includes(search));
    if (activeGenre !== 'الكل') list = list.filter(s => s.genre === activeGenre);
    return [...list].sort((a, b) => {
      let av = a[sortField] as any, bv = b[sortField] as any;
      if (typeof av === 'string') av = av.localeCompare(bv as string, 'ar');
      else av = av - bv;
      return sortAsc ? (typeof av === 'number' ? av : av) : (typeof av === 'number' ? -av : -av);
    });
  }, [tracks, search, sortField, sortAsc, activeGenre]);

  const openAdd = () => { setForm(defaultForm); setEditId(null); setShowModal(true); };
  const openEdit = (song: Track) => {
    setForm({
      title: song.title, artistId: song.artistId, albumId: song.albumId || '',
      poetId: song.poetId || '', bandId: song.bandId || '', occasionId: song.occasionId || '',
      genre: song.genre || '', duration: song.duration, coverUrl: song.coverUrl,
      audioUrl: song.audioUrl || '', lyrics: song.lyrics || '',
    });
    setEditId(song.id);
    setShowModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'coverUrl' | 'audioUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      toast.loading('جاري الرفع...', { id: 'upload' });
      const res = await fetch('https://music.hidar.eu.cc/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setForm(f => ({ ...f, [field]: data.url }));
      toast.success('تم الرفع بنجاح', { id: 'upload' });
    } catch (err) {
      toast.error('فشل الرفع', { id: 'upload' });
      console.error(err);
    }
  };

  const handleSave = async () => {
    if (!form.title || !form.artistId) { toast.error('يرجى ملء الحقول المطلوبة'); return; }
    if (editId) {
      const success = await updateEntity('tracks', editId, {
        ...form, duration: Number(form.duration) || 0
      });
      if (success) toast.success('تم تحديث الزامل بنجاح');
      else toast.error('فشل التحديث');
    } else {
      const success = await addEntity('tracks', {
        ...form, duration: Number(form.duration) || 0, plays: 0
      });
      if (success) toast.success('تمت إضافة الزامل بنجاح');
      else toast.error('فشل الإضافة');
    }
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    const success = await deleteEntity('tracks', id);
    if (success) toast.success('تم حذف الزامل');
    else toast.error('فشل الحذف');
    setDeleteId(null);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const genres = ['الكل', ...Array.from(new Set(tracks.map(s => s.genre).filter(Boolean)))];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground">إدارة الزوامل والأناشيد</h1>
          <p className="text-muted-foreground text-sm mt-1">{tracks.length} زامل ونشيد في المنصة</p>
        </div>
        <Button onClick={openAdd} className="gap-2 bg-primary text-primary-foreground rounded-xl">
          <Plus className="w-4 h-4" /> إضافة زامل
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-card border-border">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-52 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ابحث في الزوامل..."
              className="w-full bg-background border border-border rounded-xl pr-10 pl-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
            />
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {genres.map(g => (
              <button
                key={g}
                onClick={() => setActiveGenre(g)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs transition-all',
                  activeGenre === g ? 'bg-primary text-primary-foreground' : 'bg-background border border-border text-muted-foreground hover:text-foreground'
                )}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[
                  { label: '#', field: null },
                  { label: 'الزامل', field: 'title' as SortField },
                  { label: 'الفنان', field: 'artistName' as SortField },
                  { label: 'النوع', field: null },
                  { label: 'المدة', field: 'duration' as SortField },
                  { label: 'الاستماعات', field: 'plays' as SortField },
                  { label: 'إجراءات', field: null },
                ].map(col => (
                  <th
                    key={col.label}
                    className={cn(
                      'px-4 py-3 text-right text-xs font-semibold text-muted-foreground',
                      col.field && 'cursor-pointer hover:text-foreground'
                    )}
                    onClick={() => col.field && toggleSort(col.field)}
                  >
                    {col.label}
                    {col.field && sortField === col.field && (
                      <span className="mr-1">{sortAsc ? '↑' : '↓'}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((song, i) => (
                <motion.tr
                  key={song.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors group"
                >
                  <td className="px-4 py-3 text-muted-foreground text-sm">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={song.coverUrl} alt={song.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 shadow-sm" />
                      <div>
                        <p className="text-sm text-foreground">{song.title}</p>
                        <p className="text-xs text-muted-foreground">{song.albumName || 'بدون ألبوم'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{song.artistName}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{song.genre || 'غير محدد'}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatDuration(song.duration)}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatPlays(song.plays)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-100">
                      <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary" onClick={() => openEdit(song)}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-500" onClick={() => setDeleteId(song.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Music2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">لا توجد زوامل تطابق بحثك</p>
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-foreground">{editId ? 'تعديل زامل' : 'إضافة زامل جديدة'}</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowModal(false)} className="rounded-full">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-foreground mb-1.5">اسم الزامل / النشيد *</label>
                    <input
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="أدخل اسم الزامل"
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground mb-1.5">الفنان / المنشد *</label>
                    <select
                      value={form.artistId}
                      onChange={e => setForm(f => ({ ...f, artistId: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
                    >
                      <option value="">اختر الفنان</option>
                      {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-foreground mb-1.5">الألبوم</label>
                    <select
                      value={form.albumId}
                      onChange={e => setForm(f => ({ ...f, albumId: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
                    >
                      <option value="">بدون ألبوم</option>
                      {albums.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-foreground mb-1.5">الشاعر</label>
                    <select
                      value={form.poetId}
                      onChange={e => setForm(f => ({ ...f, poetId: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
                    >
                      <option value="">غير محدد</option>
                      {poets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-foreground mb-1.5">الفرقة الموسيقية</label>
                    <select
                      value={form.bandId}
                      onChange={e => setForm(f => ({ ...f, bandId: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
                    >
                      <option value="">غير محدد</option>
                      {bands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-foreground mb-1.5">المناسبة</label>
                    <select
                      value={form.occasionId}
                      onChange={e => setForm(f => ({ ...f, occasionId: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
                    >
                      <option value="">غير مرتبط</option>
                      {occasions.map(o => <option key={o.id} value={o.id}>{o.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-foreground mb-1.5">النوع الفني</label>
                    <select
                      value={form.type}
                      onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
                    >
                      <option value="">اختر النوع</option>
                      {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-foreground mb-1.5">المدة (ثانية)</label>
                    <input
                      type="number"
                      value={form.duration}
                      onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1.5">الغلاف (صورة)</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => handleFileUpload(e, 'coverUrl')}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground file:bg-primary file:text-primary-foreground file:border-0 file:rounded-lg file:px-3 file:py-1 file:mr-2 cursor-pointer"
                    />
                    {form.coverUrl && <img src={form.coverUrl} className="w-10 h-10 rounded object-cover" alt="cover" />}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1.5">ملف الصوت</label>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={e => handleFileUpload(e, 'audioUrl')}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground file:bg-primary file:text-primary-foreground file:border-0 file:rounded-lg file:px-3 file:py-1 file:mr-2 cursor-pointer"
                  />
                  {form.audioUrl && <span className="text-xs text-green-500 mt-1 block">تم رفع الملف بنجاح ({form.audioUrl.split('/').pop()})</span>}
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1.5">كلمات الزامل</label>
                  <textarea
                    value={form.lyrics}
                    onChange={e => setForm(f => ({ ...f, lyrics: e.target.value }))}
                    rows={4}
                    placeholder="أدخل كلمات الزامل هنا..."
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
                <Button variant="ghost" onClick={() => setShowModal(false)}>إلغاء</Button>
                <Button onClick={handleSave} className="gap-2 bg-primary text-primary-foreground rounded-xl">
                  <Save className="w-4 h-4" />
                  {editId ? 'حفظ التغييرات' : 'إضافة الزامل'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl"
            >
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-foreground text-center mb-2">حذف الزامل</h3>
              <p className="text-muted-foreground text-center text-sm mb-6">هل أنت متأكد من حذف هذه الزامل؟ لا يمكن التراجع عن هذا الإجراء.</p>
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
