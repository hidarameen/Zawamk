import { useParams, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowRight, Calendar, Eye, Share2, Bookmark } from 'lucide-react';
import { Button } from '../components/ui/button';
import NewsCard from '../components/cards/NewsCard';
import { useState } from 'react';
import { useDataStore } from "../../app/store/dataStore";

const categoryColors: Record<string, string> = {
  'خبر': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'تصريح': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  'إعلان': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  'بيان': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  'فعالية': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
};

export default function NewsDetail() {
    const { getNewsById, news } = useDataStore();
  const { id } = useParams();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const item = getNewsById(id || '');
  const related = news.filter(n => n.id !== id).slice(0, 3);

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center h-72 md:h-96 text-center">
        <h2 className="font-semibold mb-2">الخبر غير موجود</h2>
        <Button onClick={() => navigate('/news')} variant="outline">العودة للأخبار</Button>
      </div>
    );
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

  const formatViews = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-8">
      {/* Back */}
      <Button variant="ghost" onClick={() => navigate('/news')} className="gap-2">
        <ArrowRight className="w-4 h-4" />
        الأخبار والتصريحات
      </Button>

      {/* Article */}
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Cover Image */}
        <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden">
          <img
            src={item.coverUrl}
            alt={item.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
          <div className="absolute top-4 right-4">
            <span className={`inline-block text-sm px-3 py-1.5 rounded-full font-medium ${categoryColors[item.category] || 'bg-muted text-muted-foreground'}`}>
              {item.category}
            </span>
          </div>
        </div>

        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-foreground leading-relaxed">{item.title}</h1>

          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDate(item.publishedAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                {formatViews(item.views)} مشاهدة
              </span>
              <span className="font-medium text-primary">{item.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSaved(!saved)}
                className="hover:bg-accent"
              >
                <Bookmark className={saved ? 'w-5 h-5 text-primary fill-primary' : 'w-5 h-5'} />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-accent">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
          <p className="text-foreground leading-loose text-lg">{item.content}</p>
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              صادر عن: <span className="text-primary font-medium">{item.author}</span> — اتحاد الشعراء والمنشدين
            </p>
          </div>
        </div>
      </motion.article>

      {/* Related News */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <h2 className="font-semibold text-foreground">أخبار ذات صلة</h2>
        <div className="space-y-3">
          {related.map((n, idx) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <NewsCard news={n} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
