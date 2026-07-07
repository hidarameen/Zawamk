import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic2, Plus, Search, Edit, Trash2, X, Save, Check, Users, Music2, Star } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { toast } from 'sonner';
import { cn } from '../../components/ui/utils';
import { Artist } from "../../types";
import { useDataStore } from "../../../app/store/dataStore";
import { FileUpload } from '../../components/ui/FileUpload';

const genreOptions = ['إنشاد إسلامي', 'أناشيد وطنية', 'موشحات', 'موسيقى تراثية', 'مديح نبوي', 'نشيد معاصر', 'تلاوة'];

interface ArtistForm {
  name: string;
  bio: string;
  avatar: string;
  coverImage: string;
  genres: string[];
  verified: boolean;
  monthlyListeners: string;
}

const defaultForm: ArtistForm = {
  name: '', bio: '', avatar: '', coverImage: '',
  genres: [], verified: false, monthlyListeners: '0',
};

type ViewMode = 'grid' | 'table';

export default function AdminArtists() {
  const { artists: storeArtists, addEntity, updateEntity, deleteEntity } = useDataStore();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ArtistForm>(defaultForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterVerified, setFilterVerified] = useState<'all' | 'verified' | 'unverified'>('all');

  const filtered = useMemo(() => {
    return storeArtists.filter(a => {
      if (search && !a.name.includes(search)) return false;
      if (filterVerified === 'verified' && !a.verified) return false;
      if (filterVerified === 'unverified' && a.verified) return false;
      return true;
    });
  }, [storeArtists, search, filterVerified]);

  const openAdd = () => { setForm(defaultForm); setEditId(null); setShowModal(true); };
  const openEdit = (a: Artist) => {
    setForm({
      name: a.name, bio: a.bio, avatar: a.avatar, coverImage: a.coverImage,
      genres: a.genres, verified: a.verified,
      monthlyListeners: String(a.monthlyListeners),
    });
    setEditId(a.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name) { toast.error('يرجى إدخال اسم الفنان'); return; }
    if (editId) {
      const success = await updateEntity('artists', editId, {
        ...form, monthlyListeners: Number(form.monthlyListeners) || 0
      });
      if (success) toast.success('تم تحديث بيانات الفنان');
      else toast.error('فشل التحديث');
    } else {
      const success = await addEntity('artists', {
        ...form, followers: 0, monthlyListeners: Number(form.monthlyListeners) || 0
      });
      if (success) toast.success('تمت إضافة الفنان بنجاح');
      else toast.error('فشل الإضافة');
    }
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    const success = await deleteEntity('artists', id);
    if (success) toast.success('تم حذف الفنان');
    else toast.error('فشل الحذف');
    setDeleteId(null);
  };

  const toggleGenre = (g: string) =>
    setForm(f => ({ ...f, genres: f.genres.includes(g) ? f.genres.filter(x => x !== g) : [...f.genres, g] }));

  const toggleVerify = async (id: string) => {
    const artist = storeArtists.find(a => a.id === id);
    if (!artist) return;
    const success = await updateEntity('artists', id, { verified: !artist.verified });
    if (success) toast.success('تم تحديث حالة التوثيق');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground">إدارة الفنانين والمنشدين</h1>
          <p className="text-muted-foreground text-sm mt-1">{storeArtists.length} فنان ومنشد مسجل في المنصة</p>
        </div>
        <Button onClick={openAdd} className="gap-2 bg-primary text-primary-foreground rounded-xl">
          <Plus className="w-4 h-4" /> إضافة فنان
        </Button>
      </div>

      {/* Filters Bar */}
      <Card className="p-4 bg-card border-border">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-52 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ابحث في الفنانين..."
              className="w-full bg-background border border-border rounded-xl pr-10 pl-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
            />
          </div>
          <div className="flex items-center gap-1.5">
            {(['all', 'verified', 'unverified'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilterVerified(f)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs transition-all',
                  filterVerified === f ? 'bg-primary text-primary-foreground' : 'bg-background border border-border text-muted-foreground hover:text-foreground'
                )}
              >
                {f === 'all' ? 'الكل' : f === 'verified' ? 'موثق' : 'غير موثق'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={cn('px-3 py-2 text-xs transition-all', viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}
            >
              شبكة
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn('px-3 py-2 text-xs transition-all', viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}
            >
              قائمة
            </button>
          </div>
        </div>
      </Card>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 md:grid-cols-4 gap-4">
          {filtered.map((artist, i) => (
            <motion.div
              key={artist.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group"
            >
              <Card className="bg-card border-border overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all">
                {/* Cover */}
                <div className="relative h-28">
                  <img
                    src={artist.coverImage || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400'}
                    alt={artist.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  {artist.verified && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-2.5 h-2.5" /> موثق
                    </div>
                  )}
                  {/* Actions overlay */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-100">
                    <button
                      onClick={() => openEdit(artist)}
                      className="w-7 h-7 bg-primary/90 backdrop-blur-sm rounded-lg flex items-center justify-center"
                    >
                      <Edit className="w-3 h-3 text-white" />
                    </button>
                    <button
                      onClick={() => setDeleteId(artist.id)}
                      className="w-7 h-7 bg-red-500/90 backdrop-blur-sm rounded-lg flex items-center justify-center"
                    >
                      <Trash2 className="w-3 h-3 text-white" />
                    </button>
                  </div>
                </div>
                {/* Info */}
                <div className="p-4 -mt-5 relative">
                  <img
                    src={artist.avatar}
                    alt={artist.name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-card shadow-md mb-3"
                  />
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-foreground font-medium">{artist.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{artist.bio?.slice(0, 60)}...</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{artist.followers >= 1000 ? `${(artist.followers / 1000).toFixed(0)}ك` : artist.followers}</span>
                    <span className="flex items-center gap-1"><Music2 className="w-3 h-3" />{artist.monthlyListeners >= 1000 ? `${(artist.monthlyListeners / 1000).toFixed(0)}ك` : artist.monthlyListeners} مستمع</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {artist.genres?.slice(0, 2).map(g => (
                      <span key={g} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{g}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-3 opacity-100">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs rounded-lg h-7"
                      onClick={() => toggleVerify(artist.id)}
                    >
                      {artist.verified ? 'إلغاء التوثيق' : 'توثيق'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs rounded-lg h-7"
                      onClick={() => openEdit(artist)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <Card className="bg-card border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">الفنان</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">الأنواع</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">المتابعون</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">المستمعون شهرياً</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">الحالة</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((artist, i) => (
                  <motion.tr
                    key={artist.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={artist.avatar} alt={artist.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                        <div>
                          <p className="text-sm text-foreground flex items-center gap-1.5">
                            {artist.name}
                            {artist.verified && <Check className="w-3.5 h-3.5 text-primary" />}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{artist.bio?.slice(0, 40)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {artist.genres?.slice(0, 2).map(g => (
                          <span key={g} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{g}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {artist.followers >= 1000000 ? `${(artist.followers / 1000000).toFixed(1)}م` : `${(artist.followers / 1000).toFixed(0)}ك`}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {artist.monthlyListeners >= 1000000 ? `${(artist.monthlyListeners / 1000000).toFixed(1)}م` : `${(artist.monthlyListeners / 1000).toFixed(0)}ك`}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleVerify(artist.id)}
                        className={cn(
                          'text-[10px] px-2 py-1 rounded-full flex items-center gap-1 transition-all',
                          artist.verified
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20'
                            : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                        )}
                      >
                        {artist.verified ? <><Check className="w-2.5 h-2.5" />موثق</> : 'غير موثق'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-100">
                        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary" onClick={() => openEdit(artist)}>
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-500" onClick={() => setDeleteId(artist.id)}>
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
              <Mic2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">لا يوجد فنانون مطابقون للبحث</p>
            </div>
          )}
        </Card>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-foreground">{editId ? 'تعديل فنان / منشد' : 'إضافة فنان / منشد جديد'}</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowModal(false)} className="rounded-full">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-foreground mb-1.5">اسم الفنان / المنشد *</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="أدخل الاسم الكامل"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1.5">نبذة تعريفية</label>
                  <textarea
                    value={form.bio}
                    onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    rows={3}
                    placeholder="نبذة مختصرة عن الفنان..."
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 resize-none"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-foreground mb-1.5">رابط الصورة الشخصية</label>
                    <FileUpload value={form.avatar} onChange={(url) => setForm(f => ({ ...f, avatar: url }))} accept="image/*" />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground mb-1.5">رابط صورة الغلاف</label>
                    <FileUpload value={form.coverImage} onChange={(url) => setForm(f => ({ ...f, coverImage: url }))} accept="image/*" />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground mb-1.5">المستمعون الشهريون</label>
                    <input
                      type="number"
                      value={form.monthlyListeners}
                      onChange={e => setForm(f => ({ ...f, monthlyListeners: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                    <button
                      onClick={() => setForm(f => ({ ...f, verified: !f.verified }))}
                      className={`w-10 h-6 rounded-full transition-colors relative ${form.verified ? 'bg-primary' : 'bg-muted'}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.verified ? 'right-1' : 'left-1'}`} />
                    </button>
                    <label className="text-sm text-foreground">{form.verified ? 'موثق ✓' : 'غير موثق'}</label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-2">الأنواع الفنية</label>
                  <div className="flex flex-wrap gap-2">
                    {genreOptions.map(g => (
                      <button
                        key={g}
                        onClick={() => toggleGenre(g)}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-xs border transition-all',
                          form.genres.includes(g)
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-border text-muted-foreground hover:border-primary/40'
                        )}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
                <Button variant="ghost" onClick={() => setShowModal(false)}>إلغاء</Button>
                <Button onClick={handleSave} className="gap-2 bg-primary text-primary-foreground rounded-xl">
                  <Save className="w-4 h-4" /> {editId ? 'حفظ التغييرات' : 'إضافة الفنان'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-foreground text-center mb-2">حذف الفنان</h3>
              <p className="text-muted-foreground text-center text-sm mb-6">هل أنت متأكد من حذف هذا الفنان؟ لا يمكن التراجع.</p>
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
