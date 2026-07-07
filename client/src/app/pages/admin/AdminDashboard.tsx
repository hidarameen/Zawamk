import { useState } from 'react';
import { motion } from 'motion/react';
import { FileUpload } from '../../components/ui/FileUpload';
import {
  Users, Music2, Disc, Video, TrendingUp, Eye, Heart, Download,
  Mic2, UsersRound, Feather, ListMusic, CalendarDays, Newspaper,
  ArrowUpRight, ArrowDownRight, Play, Plus, Settings, BarChart2,
  Clock, Star, Zap, Activity, Globe, Flame
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router';
import { useDataStore } from "../../../app/store/dataStore";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  change: string;
  positive: boolean;
  color: string;
  bgColor: string;
  href: string;
}

function StatCard({ label, value, icon: Icon, change, positive, color, bgColor, href }: StatCardProps) {
  const navigate = useNavigate();
  return (
    <motion.div
      whileHover={{ scale: 1.02, translateY: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(href)}
      className="cursor-pointer"
    >
      <Card className="bg-card border-border p-5 hover:border-primary/30 hover:shadow-md transition-all">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-11 h-11 ${bgColor} rounded-xl flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${positive ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-500'}`}>
            {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {change}
          </div>
        </div>
        <div className="text-2xl font-bold text-foreground mb-0.5">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </Card>
    </motion.div>
  );
}

function DashboardSection({ title, icon: Icon, onShowAll, children }: any) {
  return (
    <Card className="bg-card border-border p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
            <Icon className="w-4 h-4" />
          </div>
          <h3 className="text-foreground font-bold">{title}</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onShowAll} className="text-xs text-primary">
          عرض الكل <ArrowUpRight className="w-3 h-3 mr-1" />
        </Button>
      </div>
      <div className="flex-1 space-y-3">
        {children}
      </div>
    </Card>
  );
}

export default function AdminDashboard() {
  const { tracks, artists, albums, videos, poets, bands, occasions, playlists, news, poems } = useDataStore();
  const navigate = useNavigate();

  const stats: StatCardProps[] = [
    { label: 'إجمالي المقاطع', value: tracks.length, icon: Music2, change: '+12', positive: true, color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-500/10', href: '/admin/songs' },
    { label: 'الفنانون والمنشدون', value: artists.length, icon: Mic2, change: '+2', positive: true, color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-500/10', href: '/admin/artists' },
    { label: 'مقاطع الفيديو', value: videos.length, icon: Video, change: '+5', positive: true, color: 'text-rose-600 dark:text-rose-400', bgColor: 'bg-rose-500/10', href: '/admin/videos' },
    { label: 'الشعراء', value: poets.length, icon: Feather, change: '+1', positive: true, color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-500/10', href: '/admin/poets' },
  ];

  // Prepared data lists
  const recentTracks = [...tracks].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 5);
  const mostPlayedTracks = [...tracks].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
  const featuredVideos = [...videos].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 4);
  const bestPoems = [...poems].slice(0, 4); // In a real app, sort by rating or views
  const latestNews = [...news].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 4);
  const prominentArtists = [...artists].sort((a, b) => (b.monthlyListeners || 0) - (a.monthlyListeners || 0)).slice(0, 4);
  const prominentPoets = [...poets].sort((a, b) => (b.followers || 0) - (a.followers || 0)).slice(0, 4);
  const latestOccasions = [...occasions].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()).slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-foreground text-2xl font-bold">لوحة التحكم الرئيسية</h1>
          <p className="text-muted-foreground text-sm mt-1">مراقبة سريعة لجميع محتويات المنصة</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => navigate('/admin/songs')} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="w-4 h-4 ml-2" />
            إضافة محتوى جديد
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 md:grid-cols-3 gap-6">
        
        {/* 1. أحدث المقاطع الصوتية */}
        <DashboardSection title="أحدث المقاطع الصوتية" icon={Music2} onShowAll={() => navigate('/admin/songs')}>
          {recentTracks.map((track, i) => (
            <div key={track.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/40 transition-colors">
              <img src={track.coverUrl} alt={track.title} className="w-10 h-10 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{track.title}</p>
                <p className="text-xs text-muted-foreground truncate">{artists.find(a => a.id === track.artistId)?.name || 'غير معروف'}</p>
              </div>
            </div>
          ))}
        </DashboardSection>

        {/* 2. الأكثر تشغيلاً */}
        <DashboardSection title="الأكثر تشغيلاً" icon={Flame} onShowAll={() => navigate('/admin/songs')}>
          {mostPlayedTracks.map((track, i) => (
            <div key={track.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/40 transition-colors">
              <span className="w-5 text-center text-xs font-bold text-muted-foreground">{i + 1}</span>
              <img src={track.coverUrl} alt={track.title} className="w-10 h-10 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{track.title}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Play className="w-3 h-3" /> {track.views || 0} استماع
                </div>
              </div>
            </div>
          ))}
        </DashboardSection>

        {/* 3. فيديوهات مميزة */}
        <DashboardSection title="فيديوهات مميزة" icon={Video} onShowAll={() => navigate('/admin/videos')}>
          {featuredVideos.map((video) => (
            <div key={video.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/40 transition-colors">
              <div className="relative w-16 h-10 rounded-lg overflow-hidden flex-shrink-0">
                <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Play className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{video.title}</p>
                <p className="text-xs text-muted-foreground truncate">{video.views || 0} مشاهدة</p>
              </div>
            </div>
          ))}
        </DashboardSection>

        {/* 4. أفضل القصائد */}
        <DashboardSection title="أفضل القصائد" icon={Feather} onShowAll={() => navigate('/admin/poets')}>
          {bestPoems.map((poem) => (
            <div key={poem.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/40 transition-colors">
              <img src={poem.coverUrl} alt={poem.title} className="w-10 h-10 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{poem.title}</p>
                <p className="text-xs text-muted-foreground truncate">{poets.find(p => p.id === poem.poetId)?.name || 'الشاعر'}</p>
              </div>
            </div>
          ))}
        </DashboardSection>

        {/* 5. أبرز الفنانين */}
        <DashboardSection title="أبرز الفنانين والمنشدين" icon={Mic2} onShowAll={() => navigate('/admin/artists')}>
          {prominentArtists.map((artist) => (
            <div key={artist.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/40 transition-colors">
              <img src={artist.avatar} alt={artist.name} className="w-10 h-10 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{artist.name}</p>
                <p className="text-xs text-muted-foreground truncate">{artist.followers || 0} متابع</p>
              </div>
            </div>
          ))}
        </DashboardSection>

        {/* 6. أبرز الشعراء */}
        <DashboardSection title="أبرز الشعراء" icon={Feather} onShowAll={() => navigate('/admin/poets')}>
          {prominentPoets.map((poet) => (
            <div key={poet.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/40 transition-colors">
              <img src={poet.avatar} alt={poet.name} className="w-10 h-10 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{poet.name}</p>
                <p className="text-xs text-muted-foreground truncate">{poet.followers || 0} متابع</p>
              </div>
            </div>
          ))}
        </DashboardSection>

        {/* 7. آخر الأخبار */}
        <DashboardSection title="آخر الأخبار" icon={Newspaper} onShowAll={() => navigate('/admin/news')}>
          {latestNews.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/40 transition-colors">
              <img src={item.coverUrl} alt={item.title} className="w-12 h-10 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground truncate">{item.category}</p>
              </div>
            </div>
          ))}
        </DashboardSection>

        {/* 8. المناسبات السنوية */}
        <DashboardSection title="المناسبات القادمة" icon={CalendarDays} onShowAll={() => navigate('/admin/occasions')}>
          {latestOccasions.map((occ) => (
            <div key={occ.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/40 transition-colors">
              <div className="w-10 h-10 rounded-lg flex flex-col items-center justify-center bg-primary/10 text-primary flex-shrink-0">
                <span className="text-xs font-bold">{new Date(occ.date).getDate()}</span>
                <span className="text-[10px]">{new Date(occ.date).toLocaleString('default', { month: 'short' })}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{occ.title}</p>
                <p className="text-xs text-muted-foreground truncate">{occ.type}</p>
              </div>
            </div>
          ))}
        </DashboardSection>

      </div>
    </div>
  );
}
