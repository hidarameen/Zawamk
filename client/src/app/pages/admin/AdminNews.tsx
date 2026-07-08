import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Newspaper, Plus, Search, Edit, Trash2, X, Save, Star } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { toast } from 'sonner';
import { cn } from '../../components/ui/utils';
import { NewsItem } from "../../types";
import { useDataStore } from "../../../app/store/dataStore";
import { FileUpload } from '../../components/ui/FileUpload';

interface NewsForm {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  coverUrl: string;
  featured: boolean;
  author: string;
}

const categoryOptions = ['خبر', 'تصريح', 'إعلان', 'بيان', 'فعالية'];

const defaultForm: NewsForm = {
  title: '', content: '', excerpt: '', category: '', coverUrl: '', featured: false, author: 'إدارة الاتحاد',
};

export default function AdminNews() {
  const { news: storeNews, addEntity, updateEntity, deleteEntity } = useDataStore();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<NewsForm>(defaultForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState('الكل');

  const filtered = useMemo(() => {
    return storeNews.filter(n => {
      if (search && !n.title.includes(search)) return false;
      if (filterCat !== 'الكل' && n.category !== filterCat) return false;
      return true;
    });
  }, [storeNews, search, filterCat]);

  const openAdd = () => { setForm(defaultForm); setEditId(null); setShowModal(true); };
  const openEdit = (n: NewsItem) => {
    setForm({
      title: n.title, content: n.content, excerpt: n.excerpt || '',
      category: n.category, coverUrl: n.coverUrl, featured: n.featured || false, author: n.author,
    });
    setEditId(n.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title) { toast.error('يرجى إدخال عنوان الخبر'); return; }
    if (editId) {
      const success = await updateEntity('news', editId, form);
      if (success) toast.success('تم تحديث الخبر');
      else toast.error('فشل التحديث');
    } else {
      const success = await addEntity('news', form);
      if (success) toast.success('تمت إضافة الخبر بنجاح');
      else toast.error('فشل الإضافة');
    }
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    const success = await deleteEntity('news', id);
    if (success) toast.success('تم حذف الخبر');
    else toast.error('فشل الحذف');
    setDeleteId(null);
  };

  const toggleFeatured = async (item: NewsItem) => {
    const success = await updateEntity('news', item.id, { ...item, featured: !item.featured });
    if (success) toast.success('تم تحديث حالة التميز');
    else toast.error('فشل التحديث');
  };

  const categories = ['الكل', ...Array.from(new Set(storeNews.map(n => n.category)))];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground">إدارة الأخبار والتصريحات</h1>
          <p className="text-muted-foreground text-sm mt-1">{storeNews.length} خبر وتصريح</p>
        </div>
        <Button onClick={openAdd} className="gap-2 bg-primary text-primary-foreground rounded-xl">
          <Plus className="w-4 h-4" /> إضافة خبر
        </Button>
      </div>

      <Card className="p-4 bg-card border-border">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-52 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="ابحث في الأخبار..."
              className="w-full bg-background border border-border rounded-xl pr-10 pl-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50" />
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {categories.map(c => (
              <button key={c} onClick={() => setFilterCat(c)}
                className={cn('px-3 py-1.5 rounded-lg text-xs transition-all',
                  filterCat === c ? 'bg-primary text-primary-foreground' : 'bg-background border border-border text-muted-foreground hover:text-foreground')}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item, i) => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="group">
            <Card className="bg-card border-border overflow-hidden hover:border-primary/30 hover:shadow-md transition-all">
              <div className="relative h-40">
                <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                {item.featured && (
                  <div className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Star className="w-2.5 h-2.5" /> مميز
                  </div>
                )}
                <div className="absolute top-2 left-2 flex gap-1 opacity-100">
                  <button onClick={() => openEdit(item)} className="w-7 h-7 bg-primary/90 rounded-lg flex items-center justify-center">
                    <Edit className="w-3 h-3 text-white" />
                  </button>
                  <button onClick={() => setDeleteId(item.id)} className="w-7 h-7 bg-red-500/90 rounded-lg flex items-center justify-center">
                    <Trash2 className="w-3 h-3 text-white" />
                  </button>
                </div>
                <div className="absolute bottom-2 right-2">
                  <span className="bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">{item.category}</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-sm text-foreground mb-1 line-clamp-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{item.excerpt || item.content?.slice(0, 80)}...</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{item.author}</span>
                  <button
                    onClick={() => toggleFeatured(item)}
                    className={cn('px-2 py-0.5 rounded-full text-[10px] transition-all',
                      item.featured ? 'bg-amber-500/10 text-amber-600' : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary')}
                  >
                    {item.featured ? 'مميز ★' : 'تمييز'}
                  </button>
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
              className="bg-card border border-border rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-foreground">{editId ? 'تعديل خبر' : 'إضافة خبر جديد'}</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowModal(false)} className="rounded-full"><X className="w-4 h-4" /></Button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-foreground mb-1.5">عنوان الخبر *</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1.5">المقتطف</label>
                  <input value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                    placeholder="وصف مختصر..."
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1.5">المحتوى الكامل</label>
                  <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                    rows={4} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 resize-none" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-foreground mb-1.5">التصنيف</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50">
                      <option value="">اختر التصنيف</option>
                      {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-foreground mb-1.5">الكاتب</label>
                    <input value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1.5">رابط صورة الغلاف</label>
                  <FileUpload value={form.coverUrl} onChange={(url) => setForm(f => ({ ...f, coverUrl: url }))} accept="image/*" />
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setForm(f => ({ ...f, featured: !f.featured }))}
                    className={`w-10 h-6 rounded-full transition-colors relative ${form.featured ? 'bg-amber-500' : 'bg-muted'}`}>
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.featured ? 'right-1' : 'left-1'}`} />
                  </button>
                  <label className="text-sm text-foreground">{form.featured ? 'خبر مميز ★' : 'خبر عادي'}</label>
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
              <h3 className="text-foreground text-center mb-2">حذف الخبر</h3>
              <p className="text-muted-foreground text-center text-sm mb-6">هل أنت متأكد من حذف هذا الخبر؟</p>
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