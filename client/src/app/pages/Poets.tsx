import { useState } from 'react';
import { motion } from 'motion/react';
import { User, Filter } from 'lucide-react';
import PoetCard from '../components/cards/PoetCard';
import { useDataStore } from "../../app/store/dataStore";

export default function Poets() {
    const { poets } = useDataStore();
  const [selectedEra, setSelectedEra] = useState<string>('الكل');

  const eras = ['الكل', 'جاهلي', 'إسلامي', 'أموي', 'عباسي', 'أندلسي', 'حديث', 'معاصر'];

  const filteredPoets = selectedEra === 'الكل'
    ? poets
    : poets.filter(poet => poet.era === selectedEra);

  return (
    <div className="p-6 pb-32 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3">
          <User className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">الشعراء</h1>
        </div>
        <p className="text-muted-foreground">
          تعرف على أعظم الشعراء العرب عبر التاريخ
        </p>
      </motion.div>

      {/* Era Filter */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Filter className="w-4 h-4" />
          <span>تصفية حسب العصر</span>
        </div>
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
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {filteredPoets.length} شاعر
      </div>

      {/* Poets Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredPoets.map((poet, idx) => (
          <motion.div
            key={poet.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <PoetCard poet={poet} />
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredPoets.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">لا يوجد شعراء</h2>
          <p className="text-muted-foreground">
            جرب تغيير الفلتر للعثور على شعراء آخرين
          </p>
        </motion.div>
      )}
    </div>
  );
}
