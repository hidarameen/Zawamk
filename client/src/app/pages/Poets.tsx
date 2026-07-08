import { motion } from 'motion/react';
import { User } from 'lucide-react';
import PoetCard from '../components/cards/PoetCard';
import { useDataStore } from "../../app/store/dataStore";

export default function Poets() {
    const { poets } = useDataStore();

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
          تعرف على أعظم الشعراء
        </p>
      </motion.div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {poets.length} شاعر
      </div>

      {/* Poets Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
      >
        {poets.map((poet, idx) => (
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
