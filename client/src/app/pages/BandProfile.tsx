import { useParams, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, Users, Calendar, MapPin, Music, Play, Heart } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useState } from 'react';
import { useDataStore } from "../../app/store/dataStore";

export default function BandProfile() {
    const { getBandById } = useDataStore();
  const { id } = useParams();
  const navigate = useNavigate();
  const [followed, setFollowed] = useState(false);
  const band = getBandById(id || '');

  if (!band) {
    return (
      <div className="flex flex-col items-center justify-center h-72 md:h-96 text-center">
        <Users className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="font-semibold mb-2">الفرقة غير موجودة</h2>
        <Button onClick={() => navigate('/bands')} variant="outline">
          العودة للفرق
        </Button>
      </div>
    );
  }

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate('/bands')} className="gap-2">
        <ArrowRight className="w-4 h-4" />
        الفرق الموسيقية
      </Button>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-64 md:h-80 rounded-3xl overflow-hidden"
      >
        <img
          src={band.coverImage}
          alt={band.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 flex items-end gap-6">
          <div className="relative">
            <img
              src={band.avatar}
              alt={band.name}
              className="w-24 h-24 rounded-2xl object-cover ring-4 ring-background shadow-xl"
            />
            {band.verified && (
              <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1 ring-2 ring-background">
                <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
          </div>
          <div className="text-white">
            <p className="text-sm text-muted-foreground mb-1">{band.style}</p>
            <h1 className="text-3xl font-bold mb-1">{band.name}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {band.country}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" /> منذ {band.foundedYear}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" /> {band.membersCount} عضو
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-3 flex-wrap"
      >
        <Button size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Play className="w-5 h-5" /> تشغيل الكل
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="gap-2"
          onClick={() => setFollowed(!followed)}
        >
          <Heart className={followed ? 'w-5 h-5 text-rose-500 fill-rose-500' : 'w-5 h-5'} />
          {followed ? 'تمت المتابعة' : 'متابعة'}
        </Button>
        <div className="mr-auto text-right">
          <p className="font-bold text-primary">{formatFollowers(band.followers)}</p>
          <p className="text-xs text-muted-foreground">متابع</p>
        </div>
      </motion.div>

      {/* Genres */}
      <div className="flex flex-wrap gap-2">
        {band.genres.map(genre => (
          <span key={genre} className="px-3 py-1.5 bg-accent text-accent-foreground rounded-full text-sm font-medium">
            {genre}
          </span>
        ))}
      </div>

      {/* Bio */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <Music className="w-5 h-5 text-primary" />
          عن الفرقة
        </h2>
        <p className="text-muted-foreground leading-relaxed">{band.bio}</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {[
          { label: 'المتابعون', value: formatFollowers(band.followers) },
          { label: 'الأعضاء', value: `${band.membersCount}` },
          { label: 'سنة التأسيس', value: `${band.foundedYear}` },
          { label: 'الدولة', value: band.country },
        ].map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="font-bold text-primary">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Work placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-primary/10 to-accent rounded-2xl p-8 text-center border border-primary/20"
      >
        <Music className="w-12 h-12 text-primary mx-auto mb-4" />
        <h3 className="font-semibold mb-2">أعمال الفرقة</h3>
        <p className="text-muted-foreground text-sm">سيتم إضافة أعمال الفرقة الموسيقية قريباً</p>
      </motion.div>
    </div>
  );
}
