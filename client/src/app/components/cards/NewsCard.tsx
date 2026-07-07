import { useNavigate } from 'react-router';
import { Eye, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { NewsItem } from "../../types";

type NewsCardProps = {
  news: NewsItem;
  featured?: boolean;
};

const categoryColors: Record<string, string> = {
  'خبر': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'تصريح': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  'إعلان': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  'بيان': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  'فعالية': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
};

export default function NewsCard({ news, featured = false }: NewsCardProps) {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatViews = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  if (featured) {
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="group relative rounded-2xl overflow-hidden cursor-pointer border border-border hover:border-primary/30 shadow-md hover:shadow-xl transition-all"
        onClick={() => navigate(`/news/${news.id}`)}
      >
        <div className="relative h-64 md:h-80">
          <img
            src={news.coverUrl}
            alt={news.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-black/40 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <span className={`inline-block text-xs px-2.5 py-1 rounded-full mb-3 font-medium ${categoryColors[news.category] || 'bg-secondary text-secondary-foreground'}`}>
            {news.category}
          </span>
          <h2 className="text-white font-bold mb-2 line-clamp-2 leading-snug">{news.title}</h2>
          <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{news.excerpt}</p>
          <div className="flex items-center gap-4 text-muted-foreground text-xs">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(news.publishedAt)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {formatViews(news.views)} مشاهدة
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="group flex gap-4 bg-card hover:bg-accent/30 border border-border hover:border-primary/30 rounded-xl p-4 cursor-pointer transition-all shadow-sm hover:shadow-md"
      onClick={() => navigate(`/news/${news.id}`)}
    >
      <div className="w-24 h-20 rounded-lg overflow-hidden flex-shrink-0">
        <img
          src={news.coverUrl}
          alt={news.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="flex-1 min-w-0 space-y-1.5">
        <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[news.category] || 'bg-muted text-muted-foreground'}`}>
          {news.category}
        </span>
        <h3 className="font-semibold text-foreground text-sm line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {news.title}
        </h3>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(news.publishedAt)}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {formatViews(news.views)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
