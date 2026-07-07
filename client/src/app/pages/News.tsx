import { useState } from 'react';
import { motion } from 'motion/react';
import { Newspaper } from 'lucide-react';
import NewsCard from '../components/cards/NewsCard';
import { useDataStore } from "../../app/store/dataStore";

const categories = ['الكل', 'خبر', 'تصريح', 'إعلان', 'بيان', 'فعالية'];

export default function News() {
    const { news } = useDataStore();
  const [selectedCategory, setSelectedCategory] = useState('الكل');

  const filtered = news.filter(n =>
    selectedCategory === 'الكل' || n.category === selectedCategory
  );

  const featured = filtered.filter(n => n.featured);
  const rest = filtered.filter(n => !n.featured);

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Newspaper className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-foreground">الأخبار والتصريحات</h1>
            <p className="text-sm text-muted-foreground">آخر أخبار وبيانات اتحاد الشعراء والمنشدين</p>
          </div>
        </div>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-2"
      >
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === cat
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-card border border-border text-foreground hover:border-primary/40 hover:bg-accent/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {/* Featured News */}
      {featured.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="space-y-4"
        >
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <span className="w-1.5 h-5 bg-primary rounded-full inline-block" />
            أبرز الأخبار
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {featured.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <NewsCard news={item} featured />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* All News */}
      {rest.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <span className="w-1.5 h-5 bg-muted-foreground rounded-full inline-block" />
            جميع الأخبار
          </h2>
          <div className="space-y-3">
            {rest.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.07 }}
              >
                <NewsCard news={item} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <Newspaper className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="font-semibold mb-2">لا توجد أخبار</h2>
          <p className="text-muted-foreground text-sm">جرب تصفية مختلفة</p>
        </motion.div>
      )}
    </div>
  );
}
