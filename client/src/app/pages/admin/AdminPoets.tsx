import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Feather, Plus, Search, Edit, Trash2, X, Save, Check } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { toast } from 'sonner';
import { Poet } from "../../types";
import { useDataStore } from "../../../app/store/dataStore";
import { FileUpload } from '../../components/ui/FileUpload';

interface PoetForm {
  name: string; bio: string; avatar: string; coverImage: string;
  verified: boolean;
}

const defaultForm: PoetForm = {
  name: '', bio: '', avatar: '', coverImage: '',
  verified: false,
};

export default function AdminPoets() {
  const { poets: storePoets, addEntity, updateEntity, deleteEntity } = useDataStore();
  const [search, setSearch] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<PoetForm>(defaultForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return storePoets.filter(p => {
      if (search && !p.name.includes(search)) return false;
      
      return true;
    });
  }, [storePoets, search]);

  const openAdd = () => { setForm(defaultForm); setEditId(null); setShowModal(true); };
  const openEdit = (p: Poet) => {
    setForm({
      name: p.name, bio: p.bio, avatar: p.avatar, coverImage: p.coverImage,
      verified: p.verified,
    });
    setEditId(p.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name) { toast.error('يرجى إدخال اسم الشاعر'); return; }
    const payload = { ...form };

    if (editId) {
      const success = await updateEntity('poets', editId, payload);
      if (success) toast.success('تم تحديث بيانات الشاعر');
      else toast.error('فشل التحديث');
    } else {
      const success = await addEntity('poets', payload);
      if (success) toast.success('تمت إضافة الشاعر بنجاح');
      else toast.error('فشل الإضافة');
    }
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    const success = await deleteEntity('poets', id);
    if (success) toast.success('تم حذف الشاعر');
    else toast.error('فشل الحذف');
    setDeleteId(null);
  };

  

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground">إدارة الشعراء</h1>
          <p className="text-muted-foreground text-sm mt-1">{storePoets.length} شاعر مسجل في المنصة</p>
        </div>
        <Button onClick={openAdd} className="gap-2 bg-primary text-primary-foreground rounded-xl">
          <Plus className="w-4 h-4" /> إضافة شاعر
        </Button>
      </div>

      <Card className="p-4 bg-card border-border">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-52 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="ابحث في الشعراء..."
              className="w-full bg-background border border-border rounded-xl pr-10 pl-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50" />
          </div>

        </div>
      </Card>

      <Card className="bg-card border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">الشاعر</th>
                
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">المتابعون</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((poet, i) => (
                <motion.tr key={poet.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={poet.avatar} alt={poet.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                      <div>
                        <p className="text-sm text-foreground flex items-center gap-1.5">
                          {poet.name}
                          {poet.verified && <Check className="w-3.5 h-3.5 text-primary" />}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{(poet.bio || '').substring(0, 50)}...</p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {poet.followers >= 1000000 ? `${(poet.followers / 1000000).toFixed(1)}م` : `${(poet.followers / 1000).toFixed(0)}ك`}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-100">
                      <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary" onClick={() => openEdit(poet)}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-500" onClick={() => setDeleteId(poet.id)}>
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

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-foreground">{editId ? 'تعديل شاعر' : 'إضافة شاعر جديد'}</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowModal(false)} className="rounded-full"><X className="w-4 h-4" /></Button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-foreground mb-1.5">اسم الشاعر *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="أدخل اسم الشاعر"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1.5">نبذة تعريفية</label>
                  <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    rows={3} placeholder="نبذة عن الشاعر..."
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 resize-none" />
                </div>
                
                <div>
                  <label className="block text-sm text-foreground mb-1.5">رابط الصورة الشخصية</label>
                  <FileUpload value={form.avatar} onChange={(url) => setForm(f => ({ ...f, avatar: url }))} accept="image/*" />
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1.5">رابط صورة الغلاف</label>
                  <FileUpload value={form.coverImage} onChange={(url) => setForm(f => ({ ...f, coverImage: url }))} accept="image/*" />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
                <Button variant="ghost" onClick={() => setShowModal(false)}>إلغاء</Button>
                <Button onClick={handleSave} className="gap-2 bg-primary text-primary-foreground rounded-xl">
                  <Save className="w-4 h-4" /> {editId ? 'حفظ التغييرات' : 'إضافة الشاعر'}
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
              <h3 className="text-foreground text-center mb-2">حذف الشاعر</h3>
              <p className="text-muted-foreground text-center text-sm mb-6">هل أنت متأكد من حذف هذا الشاعر؟</p>
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
