import { useParams, useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Play, Heart, Share2, Eye, FileText, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useDataStore } from "../../app/store/dataStore";

export default function PoemDetail() {
    const { getPoemById, getPoetById } = useDataStore();
  const { id } = useParams();
  const navigate = useNavigate();
  const poem = getPoemById(id!);
  const poet = poem ? getPoetById(poem.poetId) : null;

  if (!poem || !poet) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold">القصيدة غير موجودة</h2>
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

  return (
    <div className="pb-32">
      {/* Hero Section */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img
          src={poem.coverUrl}
          alt={poem.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        
        <div className="absolute top-6 right-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="bg-black/50 hover:bg-black/70 text-white"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium">
                  {poem.category}
                </span>
                <span className="bg-accent px-4 py-1.5 rounded-full text-sm font-medium">
                  {poem.era}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold">{poem.title}</h1>
              
              <div 
                onClick={() => navigate(`/poet/${poet.id}`)}
                className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity w-fit"
              >
                <img
                  src={poet.avatar}
                  alt={poet.name}
                  className="w-12 h-12 rounded-full border-2 border-primary"
                />
                <div>
                  <p className="text-sm text-muted-foreground">الشاعر</p>
                  <p className="font-semibold">{poem.poetName}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{formatNumber(poem.views)} مشاهدة</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  <span>{formatNumber(poem.likes)} إعجاب</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>{poem.verses} بيت</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {poem.audioUrl && (
                  <Button size="lg" className="gap-2">
                    <Play className="w-5 h-5" />
                    استماع
                  </Button>
                )}
                <Button size="lg" variant="outline" className="gap-2">
                  <Heart className="w-5 h-5" />
                  إعجاب
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
      <div className="max-w-4xl mx-auto px-6 md:px-10 mt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-8 md:p-12 border border-border"
        >
          <h2 className="text-2xl font-bold mb-8 text-center">نص القصيدة</h2>
          
          <div className="space-y-6 text-center">
            {poem.text.split('\n').map((line, idx) => (
              <motion.p
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="text-lg md:text-xl leading-loose"
              >
                {line}
              </motion.p>
            ))}
          </div>
        </motion.div>

        {/* Poet Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-card rounded-2xl p-6 border border-border"
        >
          <h3 className="text-xl font-bold mb-4">عن الشاعر</h3>
          <div className="flex items-start gap-4">
            <img
              src={poet.avatar}
              alt={poet.name}
              className="w-20 h-20 rounded-full"
            />
            <div className="flex-1">
              <h4 className="font-bold text-lg mb-2">{poet.name}</h4>
              <p className="text-muted-foreground mb-4">{poet.bio}</p>
              <Button
                variant="outline"
                onClick={() => navigate(`/poet/${poet.id}`)}
              >
                عرض الملف الشخصي
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
