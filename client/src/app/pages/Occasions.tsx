import { motion } from 'motion/react';
import { CalendarDays, Music, FileText, Video } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useDataStore } from "../../app/store/dataStore";

export default function Occasions() {
    const { occasions } = useDataStore();
  const navigate = useNavigate();

  const typeColors: Record<string, string> = {
    'مناسبة دينية': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    'مناسبة ثقافية': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    'مناسبة وطنية': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  };

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
            <CalendarDays className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-foreground">المناسبات السنوية</h1>
            <p className="text-sm text-muted-foreground">أعمال فنية خاصة بالمناسبات الدينية والوطنية والثقافية</p>
          </div>
        </div>
      </motion.div>

      {/* Intro Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-l from-primary/20 via-primary/10 to-transparent border border-primary/20 rounded-2xl p-6"
      >
        <p className="text-foreground leading-relaxed">
          يُقدّم اتحاد الشعراء والمنشدين في كل مناسبة دينية أو وطنية أو ثقافية، 
          باقة متميزة من الأعمال الفنية الخاصة التي تُعبّر عن روح المناسبة وقيمها.
          استمتع بأعمال فنية استثنائية تجمع بين الشعر والإنشاد والموسيقى.
        </p>
      </motion.div>

      {/* Occasions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {occasions.map((occasion, idx) => (
          <motion.div
            key={occasion.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate(`/occasions/${occasion.id}`)}
            className="group cursor-pointer"
          >
            <div className="relative rounded-2xl overflow-hidden border border-border hover:border-primary/40 shadow-sm hover:shadow-xl transition-all">
              {/* Cover Image */}
              <div className="relative h-48">
                <img
                  src={occasion.coverUrl}
                  alt={occasion.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${occasion.color} opacity-60`} />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />

                {/* Date Badge */}
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-1.5 text-white text-xs font-medium">
                  {occasion.date}
                </div>

                {/* Type Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${typeColors[occasion.type] || 'bg-muted text-muted-foreground'}`}>
                    {occasion.type}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="bg-card p-5 space-y-3">
                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                  {occasion.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {occasion.description}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-primary" />
                    {occasion.trackIds?.length || occasion.tracks?.length || 0} أنشودة
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-primary" />
                    {occasion.poemIds?.length || occasion.poems?.length || 0} قصيدة
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-primary" />
                    {occasion.videoIds?.length || occasion.videos?.length || 0} فيديو
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
