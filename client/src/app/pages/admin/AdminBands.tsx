import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UsersRound, Plus, Search, Edit, Trash2, X, Save, Check } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { toast } from 'sonner';
import { cn } from '../../components/ui/utils';
import { Band } from "../../types";
import { useDataStore } from "../../../app/store/dataStore";
import { FileUpload } from '../../components/ui/FileUpload';

const styleOptions = ['فرقة إنشاد', 'فرقة موسيقية', 'فرقة موسيقية تراثية', 'فرقة موشحات', 'فرقة إنشاد شبابية', 'فرقة مقامات'];
const countryOptions = ['السعودية', 'مصر', 'العراق', 'سوريا', 'الأردن', 'الإمارات', 'الكويت', 'المغرب', 'تونس', 'الجزائر'];

interface BandForm {
  name: string; bio: string; avatar: string; coverImage: string;
  style: string; country: string; foundedYear: string; membersCount: string;
  genres: string[]; verified: boolean;
}

const defaultForm: BandForm = {
  name: '', bio: '', avatar: '', coverImage: '',
  style: '', country: '', foundedYear: '', membersCount: '',
  genres: [], verified: false,
};

const genreOptions = ['إنشاد إسلامي', 'أناشيد وطنية', 'موسيقى تراثية', 'موشحات أندلسية', 'طرب أصيل', 'نشيد معاصر', 'مقامات'];

export default function AdminBands() {
  const { bands: storeBands, addEntity, updateEntity, deleteEntity } = useDataStore();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<BandForm>(defaultForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return storeBands.filter(b => !search || b.name.includes(search) || b.country.includes(search));
  }, [storeBands, search]);

  const openAdd = () => { setForm(defaultForm); setEditId(null); setShowModal(true); };
  const openEdit = (b: Band) => {
    setForm({
      name: b.name, bio: b.bio, avatar: b.avatar, coverImage: b.coverImage,
      style: b.style, country: b.country, foundedYear: String(b.foundedYear),
      membersCount: String(b.membersCount), genres: b.genres, verified: b.verified, followers: b.followers,
    });
    setEditId(b.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name) { toast.error('يرجى إدخال اسم الفرقة'); return; }
    if (editId) {
      const success = await updateEntity('bands', editId, {
        ...form, membersCount: Number(form.membersCount) || 0, followers: Number(form.followers) || 0
      });
      if (success) toast.success('تم تحديث بيانات الفرقة');
      else toast.error('فشل التحديث');
    } else {
      const success = await addEntity('bands', {
        ...form, membersCount: Number(form.membersCount) || 0, followers: Number(form.followers) || 0
      });
      if (success) toast.success('تمت إضافة الفرقة بنجاح');
      else toast.error('فشل الإضافة');
    }
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    const success = await deleteEntity('bands', id);
    if (success) toast.success('تم حذف الفرقة');
    else toast.error('فشل الحذف');
    setDeleteId(null);
  };

  const toggleGenre = (g: string) => {
    setForm(f => ({ ...f, genres: f.genres.includes(g) ? f.genres.filter(x => x !== g) : [...f.genres, g] }));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground">إدارة الفرق الموسيقية</h1>
          <p className="text-muted-foreground text-sm mt-1">{storeBands.length} فرقة موسيقية</p>
        </div>
        <Button onClick={openAdd} className="gap-2 bg-primary text-primary-foreground rounded-xl">
          <Plus className="w-4 h-4" /> إضافة فرقة
        </Button>
      </div>

      <Card className="p-4 bg-card border-border">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="ابحث في الفرق..."
            className="w-full bg-background border border-border rounded-xl pr-10 pl-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50" />
        </div>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map((band, i) => (
          <motion.div key={band.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="group">
            <Card className="bg-card border-border overflow-hidden hover:border-primary/30 hover:shadow-md transition-all">
              <div className="relative h-28">
                <img src={band.coverImage} alt={band.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                {band.verified && (
                  <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-2.5 h-2.5" /> موثق
                  </div>
                )}
                <div className="absolute bottom-2 right-3">
                  <span className="text-secondary-foreground text-xs">{band.country}</span>
                </div>
              </div>
              <div className="p-4 -mt-6 relative">
                <img src={band.avatar} alt={band.name} className="w-12 h-12 rounded-xl object-cover border-2 border-card shadow-lg mb-3" />
                <h3 className="text-foreground text-sm mb-0.5">{band.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">{band.style} · تأسست {band.foundedYear}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{band.bio}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1"><UsersRound className="w-3 h-3" />{band.membersCount} عضو</span>
                  <span>{band.followers >= 1000 ? `${(band.followers / 1000).toFixed(0)}ك` : band.followers} متابع</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {band.genres.slice(0, 2).map(g => (
                    <span key={g} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{g}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2 opacity-100">
                  <Button variant="outline" size="sm" className="flex-1 rounded-lg gap-1.5 text-xs" onClick={() => openEdit(band)}>
                    <Edit className="w-3.5 h-3.5" /> تعديل
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-lg hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30" onClick={() => setDeleteId(band.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-foreground">{editId ? 'تعديل فرقة' : 'إضافة فرقة جديدة'}</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowModal(false)} className="rounded-full"><X className="w-4 h-4" /></Button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-foreground mb-1.5">اسم الفرقة *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="اسم الفرقة"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1.5">نبذة تعريفية</label>
                  <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    rows={3} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 resize-none" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-foreground mb-1.5">الأسلوب</label>
                    <select value={form.style} onChange={e => setForm(f => ({ ...f, style: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50">
                      <option value="">اختر الأسلوب</option>
                      {styleOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-foreground mb-1.5">البلد</label>
                    <select value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50">
                      <option value="">اختر البلد</option>
                      {countryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-foreground mb-1.5">سنة التأسيس</label>
                    <input type="number" value={form.foundedYear} onChange={e => setForm(f => ({ ...f, foundedYear: e.target.value }))}
                      placeholder="مثل: 2005"
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50" />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground mb-1.5">عدد الأعضاء</label>
                    <input type="number" value={form.membersCount} onChange={e => setForm(f => ({ ...f, membersCount: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1.5">رابط الصورة</label>
                  <input value={form.avatar} onChange={e => setForm(f => ({ ...f, avatar: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-2">الأنواع الفنية</label>
                  <div className="flex flex-wrap gap-2">
                    {genreOptions.map(g => (
                      <button key={g} onClick={() => toggleGenre(g)}
                        className={cn('px-3 py-1.5 rounded-full text-xs transition-all border',
                          form.genres.includes(g) ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/40')}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
                <Button variant="ghost" onClick={() => setShowModal(false)}>إلغاء</Button>
                <Button onClick={handleSave} className="gap-2 bg-primary text-primary-foreground rounded-xl">
                  <Save className="w-4 h-4" /> {editId ? 'حفظ التغييرات' : 'إضافة الفرقة'}
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
              <h3 className="text-foreground text-center mb-2">حذف الفرقة</h3>
              <p className="text-muted-foreground text-center text-sm mb-6">هل أنت متأكد من حذف هذه الفرقة؟</p>
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
