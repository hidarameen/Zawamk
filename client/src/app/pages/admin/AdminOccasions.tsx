import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CalendarDays, Plus, Search, Edit, Trash2, X, Save } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { toast } from 'sonner';
import { Occasion } from "../../types";
import { useDataStore } from "../../../app/store/dataStore";
import { FileUpload } from '../../components/ui/FileUpload';

const typeOptions = ['مناسبة دينية', 'مناسبة وطنية', 'مناسبة اجتماعية', 'عيد', 'ذكرى', 'احتفالية'];
const colorOptions = [
  { label: 'أخضر', value: 'from-green-500/50 to-emerald-600/50' },
  { label: 'أزرق', value: 'from-blue-500/50 to-indigo-600/50' },
  { label: 'ذهبي', value: 'from-amber-500/50 to-yellow-600/50' },
  { label: 'أحمر', value: 'from-red-500/50 to-rose-600/50' },
  { label: 'بنفسجي', value: 'from-purple-500/50 to-violet-600/50' },
];

interface OccasionForm {
  title: string; description: string; date: string; type: string; coverUrl: string; color: string; trackIds: string[];
}

const defaultForm: OccasionForm = { title: '', description: '', date: '', type: '', coverUrl: '', color: colorOptions[0].value, trackIds: [] };

export default function AdminOccasions() {
  const { occasions: storeOccasions, tracks: storeTracks, addEntity, updateEntity, deleteEntity } = useDataStore();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<OccasionForm>(defaultForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() =>
    storeOccasions.filter(o => !search || o.title.includes(search) || o.type.includes(search)),
    [storeOccasions, search]);

  const openAdd = () => { setForm(defaultForm); setEditId(null); setShowModal(true); };
  const openEdit = (o: Occasion) => {
    setForm({ title: o.title, description: o.description, date: o.date, type: o.type, coverUrl: o.coverUrl, color: o.color });
    setEditId(o.id); setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title) { toast.error('يرجى إدخال عنوان المناسبة'); return; }
    if (editId) {
      const success = await updateEntity('occasions', editId, form);
      if (success) toast.success('تم تحديث المناسبة');
      else toast.error('فشل التحديث');
    } else {
      const success = await addEntity('occasions', form);
      if (success) toast.success('تمت إضافة المناسبة بنجاح');
      else toast.error('فشل الإضافة');
    }
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    const success = await deleteEntity('occasions', id);
    if (success) toast.success('تم حذف المناسبة');
    else toast.error('فشل الحذف');
    setDeleteId(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground">إدارة المناسبات السنوية</h1>
          <p className="text-muted-foreground text-sm mt-1">{storeOccasions.length} مناسبة</p>
        </div>
        <Button onClick={openAdd} className="gap-2 bg-primary text-primary-foreground rounded-xl">
          <Plus className="w-4 h-4" /> إضافة مناسبة
        </Button>
      </div>

      <Card className="p-4 bg-card border-border">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث في المناسبات..."
            className="w-full bg-background border border-border rounded-xl pr-10 pl-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50" />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((occ, i) => (
          <motion.div key={occ.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="group">
            <Card className="bg-card border-border overflow-hidden hover:border-primary/30 hover:shadow-md transition-all">
              <div className="relative h-36">
                <img src={occ.coverUrl} alt={occ.title} className="w-full h-full object-cover" />
                <div className={`absolute inset-0 bg-gradient-to-t ${occ.color} opacity-60`} />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <div className="absolute top-3 left-3 flex gap-1 opacity-100">
                  <button onClick={() => openEdit(occ)} className="w-8 h-8 bg-primary/90 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <Edit className="w-3.5 h-3.5 text-white" />
                  </button>
                  <button onClick={() => setDeleteId(occ.id)} className="w-8 h-8 bg-red-500/90 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <Trash2 className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
                <div className="absolute bottom-3 right-3">
                  <span className="bg-black/50 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">{occ.date}</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-foreground text-sm mb-1">{occ.title}</h3>
                <p className="text-xs text-muted-foreground mb-2">{occ.type}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{occ.description}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                  <span>{occ.tracks?.length || 0} زامل</span>
                  <span>·</span>
                  <span>{occ.videos?.length || 0} فيديو</span>
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
                <h2 className="text-foreground">{editId ? 'تعديل مناسبة' : 'إضافة مناسبة جديدة'}</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowModal(false)} className="rounded-full"><X className="w-4 h-4" /></Button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-foreground mb-1.5">عنوان المناسبة *</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1.5">الوصف</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={3} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 resize-none" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-foreground mb-1.5">نوع المناسبة</label>
                    <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50">
                      <option value="">اختر النوع</option>
                      {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-foreground mb-1.5">التاريخ</label>
                    <input value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                      placeholder="مثل: 1 محرم"
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1.5">رابط الصورة</label>
                  <FileUpload value={form.coverUrl} onChange={(url) => setForm(f => ({ ...f, coverUrl: url }))} accept="image/*" />
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-2">لون الغلاف</label>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map(c => (
                      <button key={c.value} onClick={() => setForm(f => ({ ...f, color: c.value }))}
                        className={`px-3 py-1.5 rounded-full text-xs border transition-all ${form.color === c.value ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'}`}>
                        {c.label}
                      </button>
                    ))}
                  </div>
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
              <h3 className="text-foreground text-center mb-2">حذف المناسبة</h3>
              <p className="text-muted-foreground text-center text-sm mb-6">هل أنت متأكد من حذف هذه المناسبة؟</p>
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
