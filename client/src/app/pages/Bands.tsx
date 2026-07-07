import { useState } from 'react';
import { motion } from 'motion/react';
import { UsersRound, Search } from 'lucide-react';
import BandCard from '../components/cards/BandCard';
import { useDataStore } from "../../app/store/dataStore";

const styles = ['الكل', 'فرقة إنشاد', 'فرقة موسيقية', 'فرقة موسيقية تراثية', 'فرقة موشحات', 'فرقة إنشاد شبابية', 'فرقة مقامات'];

export default function Bands() {
    const { bands } = useDataStore();
  const [search, setSearch] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('الكل');

  const filtered = bands.filter(band => {
    const matchSearch = band.name.includes(search) || band.bio.includes(search) || band.country.includes(search);
    const matchStyle = selectedStyle === 'الكل' || band.style === selectedStyle;
    return matchSearch && matchStyle;
  });

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
            <UsersRound className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-foreground">الفرق الموسيقية</h1>
            <p className="text-sm text-muted-foreground">فرق الإنشاد والموسيقى التراثية المنضوية تحت الاتحاد</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-3 gap-4"
      >
        {[
          { label: 'فرقة موسيقية', value: bands.length },
          { label: 'دولة عربية', value: new Set(bands.map(b => b.country)).size },
          { label: 'عضو في الفرق', value: bands.reduce((s, b) => s + b.membersCount, 0) },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-primary">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="relative"
      >
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="ابحث عن فرقة موسيقية..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-card border border-border rounded-xl py-3 pr-12 pl-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
        />
      </motion.div>

      {/* Style Filter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-2"
      >
        {styles.map(style => (
          <button
            key={style}
            onClick={() => setSelectedStyle(style)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedStyle === style
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-card border border-border text-foreground hover:border-primary/40 hover:bg-accent/50'
            }`}
          >
            {style}
          </button>
        ))}
      </motion.div>

      {/* Results */}
      <div className="text-sm text-muted-foreground">
        {filtered.length} فرقة
      </div>

      {/* Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
      >
        {filtered.map((band, idx) => (
          <motion.div
            key={band.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <BandCard band={band} />
          </motion.div>
        ))}
      </motion.div>

      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <UsersRound className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="font-semibold mb-2">لا توجد نتائج</h2>
          <p className="text-muted-foreground text-sm">جرب تغيير كلمة البحث أو الفلتر</p>
        </motion.div>
      )}
    </div>
  );
}
