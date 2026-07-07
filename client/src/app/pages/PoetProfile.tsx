import { useParams } from 'react-router';
import { Button } from '../components/ui/button';
import { Play, UserPlus, Share2, CheckCircle2, Calendar, MapPin, Users } from 'lucide-react';
import PoemCard from '../components/cards/PoemCard';
import { motion } from 'motion/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useDataStore } from "../../app/store/dataStore";

export default function PoetProfile() {
    const { getPoetById, getPoemsByPoetId } = useDataStore();
  const { id } = useParams();
  const poet = getPoetById(id!);
  const poems = getPoemsByPoetId(id!);

  if (!poet) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold">الشاعر غير موجود</h2>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getLifespan = () => {
    if (poet.birthYear && poet.deathYear) {
      return `${poet.birthYear} - ${poet.deathYear}`;
    }
    return 'غير محدد';
  };

  // تصنيف القصائد حسب النوع
  const poemsByCategory = poems.reduce((acc, poem) => {
    if (!acc[poem.category]) {
      acc[poem.category] = [];
    }
    acc[poem.category].push(poem);
    return acc;
  }, {} as Record<string, typeof poems>);

  // القصائد التي لها فيديو
  const poemsWithVideo = poems.filter(p => p.videoUrl);
  
  // القصائد التي لها صوت
  const poemsWithAudio = poems.filter(p => p.audioUrl);

  return (
    <div className="pb-32">
      {/* Hero Section */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img
          src={poet.coverImage}
          alt={poet.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="max-w-7xl mx-auto flex items-end gap-6">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-48 h-48 rounded-full border-4 border-background overflow-hidden shadow-2xl max-w-full"
            >
              <img
                src={poet.avatar}
                alt={poet.name}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-1 pb-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-5xl font-bold">{poet.name}</h1>
                {poet.verified && (
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                )}
              </div>
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{getLifespan()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{poet.country}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{formatNumber(poet.followers)} متابع</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium">
                  {poet.era}
                </span>
                <span className="text-sm text-muted-foreground">
                  {formatNumber(poet.monthlyListeners)} استماع شهري
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Button size="lg" className="gap-2">
                  <Play className="w-5 h-5" />
                  تشغيل
                </Button>
                <Button size="lg" variant="outline" className="gap-2">
                  <UserPlus className="w-5 h-5" />
                  متابعة
                </Button>
                <Button size="lg" variant="ghost" className="gap-2">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 mt-8">
        {/* Bio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold mb-3">نبذة</h2>
          <p className="text-muted-foreground leading-relaxed">{poet.bio}</p>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">جميع القصائد ({poems.length})</TabsTrigger>
            <TabsTrigger value="audio">مسموعة ({poemsWithAudio.length})</TabsTrigger>
            <TabsTrigger value="video">مرئية ({poemsWithVideo.length})</TabsTrigger>
            <TabsTrigger value="categories">حسب النوع</TabsTrigger>
          </TabsList>

          {/* All Poems */}
          <TabsContent value="all" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {poems.map((poem, idx) => (
                <motion.div
                  key={poem.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <PoemCard poem={poem} />
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Audio Poems */}
          <TabsContent value="audio" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {poemsWithAudio.map((poem, idx) => (
                <motion.div
                  key={poem.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <PoemCard poem={poem} />
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Video Poems */}
          <TabsContent value="video" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {poemsWithVideo.map((poem, idx) => (
                <motion.div
                  key={poem.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <PoemCard poem={poem} />
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Categories */}
          <TabsContent value="categories" className="space-y-8">
            {Object.entries(poemsByCategory).map(([category, categoryPoems]) => (
              <div key={category}>
                <h3 className="text-xl font-bold mb-4">{category}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {categoryPoems.map((poem) => (
                    <PoemCard key={poem.id} poem={poem} />
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
