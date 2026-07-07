import { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Filter } from 'lucide-react';
import PoemCard from '../components/cards/PoemCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useDataStore } from "../../app/store/dataStore";

export default function Poems() {
    const { poems } = useDataStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [selectedEra, setSelectedEra] = useState<string>('الكل');

  const categories = ['الكل', 'غزل', 'حكمة', 'مدح', 'رثاء', 'حماسة', 'وصف', 'خمريات'];
  const eras = ['الكل', 'جاهلي', 'إسلامي', 'أموي', 'عباسي', 'أندلسي', 'حديث', 'معاصر'];

  const filteredPoems = poems.filter(poem => {
    const categoryMatch = selectedCategory === 'الكل' || poem.category === selectedCategory;
    const eraMatch = selectedEra === 'الكل' || poem.era === selectedEra;
    return categoryMatch && eraMatch;
  });

  return (
    <div className="p-6 pb-32 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">القصائد</h1>
        </div>
        <p className="text-muted-foreground">
          اكتشف أجمل القصائد العربية عبر العصور
        </p>
      </motion.div>

      {/* Filters */}
      <Tabs defaultValue="category" className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 mb-4">
          <TabsTrigger value="category" className="gap-2">
            <Filter className="w-4 h-4" />
            التصنيف
          </TabsTrigger>
          <TabsTrigger value="era" className="gap-2">
            <Filter className="w-4 h-4" />
            العصر
          </TabsTrigger>
        </TabsList>

        {/* Category Filter */}
        <TabsContent value="category" className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-accent hover:bg-accent/80'
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </TabsContent>

        {/* Era Filter */}
        <TabsContent value="era" className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {eras.map((era) => (
              <motion.button
                key={era}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedEra(era)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedEra === era
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-accent hover:bg-accent/80'
                }`}
              >
                {era}
              </motion.button>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {filteredPoems.length} قصيدة
      </div>

      {/* Poems Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
      >
        {filteredPoems.map((poem, idx) => (
          <motion.div
            key={poem.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <PoemCard poem={poem} />
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredPoems.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">لا توجد قصائد</h2>
          <p className="text-muted-foreground">
            جرب تغيير الفلتر للعثور على قصائد أخرى
          </p>
        </motion.div>
      )}
    </div>
  );
}
