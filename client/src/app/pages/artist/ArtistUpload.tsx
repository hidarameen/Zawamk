import { useState, useRef } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Upload, Music } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useDataStore } from '../../store/dataStore';
import { useAuth } from '../../contexts/AuthContext';

export default function ArtistUpload() {
  const { addEntity } = useDataStore();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [album, setAlbum] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [audioUrlInput, setAudioUrlInput] = useState('');

  const [file, setFile] = useState<File | null>(null);

  const isAdmin = user?.role === 'admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return toast.error('يرجى إدخال عنوان الزامل');

    let audioUrl = audioUrlInput.trim();

    if (isAdmin && file) {
      try {
        const { url } = await (await import('../../services/api')).apiUpload(file);
        audioUrl = url;
      } catch (err) {
        console.error(err);
        toast.error('فشل رفع الملف، سيتم استخدام الرابط اليدوي أو رابط تجريبي');
      }
    }

    if (!audioUrl) {
      // Only admins upload real files. For artists use demo or manual URL.
      audioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    }

    // Use a stable artist id from seed for demo. Artists submit metadata; admin handles actual files.
    const success = await addEntity('tracks', {
      title,
      artistId: 'artist-issa', // matches seed data
      lyrics: lyrics || null,
      audioUrl,
      duration: 180,
      coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400',
      genre: 'عربي',
    });

    if (success) {
      toast.success('تم إضافة الزامل بنجاح' + (isAdmin ? '' : ' (سيقوم المدير برفع الملف النهائي إن لزم)'));
      setTitle('');
      setAlbum('');
      setLyrics('');
      setFile(null);
      setAudioUrlInput('');
    } else {
      toast.error('حدث خطأ أثناء الإضافة');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Upload className="w-10 h-10 text-purple-400" />
          رفع زامل جديدة
        </h1>
        <p className="text-muted-foreground">شارك موسيقاك مع العالم</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-secondary/50 border border-white/10 rounded-3xl p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {isAdmin ? (
            <div>
              <Label htmlFor="audio">ملف الزامل (الإدارة فقط)</Label>
              <input 
                type="file" 
                accept="audio/*" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 border-2 border-dashed border-white/20 rounded-xl p-6 md:p-12 text-center hover:border-purple-500/50 transition-colors cursor-pointer"
              >
                <Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">{file ? file.name : 'اسحب وأفلت ملف الزامل هنا'}</p>
                <p className="text-sm text-muted-foreground">أو انقر للتصفح (الإدارة فقط)</p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <p className="text-sm text-yellow-400">
                ⚠️ فقط الإدارة يمكنها رفع الملفات الصوتية. 
                يمكنك إضافة بيانات الزامل أدناه (العنوان + الكلمات). 
                أدخل رابط صوتي يدوي إن وجد، وإلا سيتم استخدام رابط تجريبي.
              </p>
              <Input
                placeholder="رابط الملف الصوتي (اختياري)"
                value={audioUrlInput}
                onChange={(e) => setAudioUrlInput(e.target.value)}
                className="mt-3 bg-white/10"
              />
            </div>
          )}

          <div>
            <Label htmlFor="title">عنوان الزامل</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2 bg-white/10 border-white/20"
              required
            />
          </div>

          <div>
            <Label htmlFor="album">الألبوم</Label>
            <Input
              id="album"
              value={album}
              onChange={(e) => setAlbum(e.target.value)}
              className="mt-2 bg-white/10 border-white/20"
            />
          </div>

          <div>
            <Label htmlFor="lyrics">كلمات الزامل</Label>
            <Textarea
              id="lyrics"
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              className="mt-2 bg-white/10 border-white/20 min-h-[200px]"
            />
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              رفع الزامل
            </Button>
            <Button type="button" variant="outline" className="px-8">
              إلغاء
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
