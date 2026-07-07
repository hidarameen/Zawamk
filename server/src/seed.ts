import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding PostgreSQL database with rich demo data...');

  // Clean previous (dev only)
  // تم إيقاف كود الحذف بناءً على طلبك للحفاظ على بيانات الموقع والأعمال
  /*
  await prisma.review.deleteMany();
  await prisma.playHistory.deleteMany();
  await prisma.playlistTrack.deleteMany();
  await prisma.playlist.deleteMany();
  await prisma.trackLike.deleteMany();
  await prisma.artistFollow.deleteMany();
  await prisma.track.deleteMany();
  await prisma.album.deleteMany();
  await prisma.musicVideo.deleteMany();
  await prisma.poem.deleteMany();
  await prisma.poet.deleteMany();
  await prisma.occasion.deleteMany();
  await prisma.newsItem.deleteMany();
  await prisma.band.deleteMany();
  await prisma.artist.deleteMany();
  await prisma.user.deleteMany();
  */

  // === Users (real bcrypt hashes for working login - password = "123456") ===
  const pw = await bcrypt.hash('123456', 10);
  const admin = await prisma.user.create({
    data: { name: 'مدير النظام', email: 'admin@music.app', passwordHash: pw, role: 'admin', avatar: 'https://i.pravatar.cc/150?u=admin' }
  });

  const artistUser = await prisma.user.create({
    data: { name: 'عيسى الليث', email: 'issa@music.app', passwordHash: pw, role: 'artist', avatar: 'https://i.pravatar.cc/150?u=issa' }
  });

  const normalUser = await prisma.user.create({
    data: { name: 'سارة أحمد', email: 'sara@music.app', passwordHash: pw, role: 'user', avatar: 'https://i.pravatar.cc/150?u=sara' }
  });

  // === Artists ===
  const artist1 = await prisma.artist.create({
    data: {
      id: 'artist-issa',
      name: 'عيسى الليث',
      bio: 'فنان عربي مميز، يجمع بين الطرب الأصيل والموسيقى المعاصرة',
      avatar: 'https://i.pravatar.cc/300?u=issa',
      coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
      verified: true,
      monthlyListeners: 1240000,
      genres: ['طرب', 'عربي معاصر']
    }
  });

  const artist2 = await prisma.artist.create({
    data: {
      name: 'أمل كمال',
      bio: 'مطربة وملحنة موهوبة',
      avatar: 'https://i.pravatar.cc/300?u=amal',
      coverImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
      verified: true,
      monthlyListeners: 890000,
      genres: ['بوب عربي', 'رومانسي']
    }
  });

  const artist3 = await prisma.artist.create({
    data: {
      name: 'خالد الشامي',
      bio: 'نجم الراب العربي',
      avatar: 'https://i.pravatar.cc/300?u=khaled',
      verified: false,
      monthlyListeners: 450000,
      genres: ['هيب هوب', 'راب']
    }
  });

  // === Albums ===
  const album1 = await prisma.album.create({
    data: {
      title: 'ليالي الغربة',
      artistId: artist1.id,
      coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400',
      releaseDate: '2024-01-15',
      totalTracks: 8,
      duration: 2400,
      genre: 'طرب'
    }
  });

  // === Tracks (dozens) ===
  const tracksData = [
    { title: 'ليالي الغربة', artistId: artist1.id, albumId: album1.id, duration: 245, genre: 'طرب', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { title: 'يا طير', artistId: artist1.id, duration: 198, genre: 'طرب', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { title: 'قلبي معك', artistId: artist2.id, duration: 212, genre: 'رومانسي', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    { title: 'الدنيا حلوة', artistId: artist2.id, duration: 187, genre: 'بوب عربي', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
    { title: 'شارع الحياة', artistId: artist3.id, duration: 265, genre: 'راب', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
    { title: 'عودة الروح', artistId: artist1.id, duration: 231, genre: 'طرب', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
    { title: 'حلم جميل', artistId: artist2.id, duration: 175, genre: 'رومانسي', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3' },
    { title: 'الأمل', artistId: artist3.id, duration: 198, genre: 'هيب هوب', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
  ];

  for (const t of tracksData) {
    await prisma.track.create({
      data: {
        ...t,
        coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400',
        views: Math.floor(Math.random() * 500000) + 10000,
        likes: Math.floor(Math.random() * 25000),
        releaseYear: 2024
      }
    });
  }

  // === Bands (for completeness) ===
  const band1 = await prisma.band.create({
    data: {
      name: 'فرقة الوتر',
      bio: 'فرقة موسيقية عربية تقليدية',
      avatar: 'https://i.pravatar.cc/300?u=band1',
      verified: true,
      followers: 120000,
      genres: ['تراثي', 'عربي']
    }
  });

  // === Videos ===
  await prisma.musicVideo.createMany({
    data: [
      {
        title: 'ليالي الغربة - فيديو كليب',
        artistId: artist1.id,
        thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400',
        videoUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // demo
        duration: 245,
        views: 250000,
        releaseDate: '2024-02-01',
        type: 'clip'
      },
      {
        title: 'حفل مباشر - عيسى الليث',
        artistId: artist1.id,
        thumbnailUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
        videoUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        duration: 180,
        views: 180000,
        releaseDate: '2024-03-15',
        type: 'live'
      }
    ]
  });

  // === More poems/news if needed, but basic covered
  await prisma.newsItem.createMany({
    data: [
      { title: 'إصدار جديد لعيسى الليث', excerpt: 'ليالي الغربة يتصدر', content: 'الفنان أصدر ألبومه الجديد...', featured: true, category: 'موسيقى' },
    ]
  });

  // === Poets + Poems ===
  const poet = await prisma.poet.create({
    data: { name: 'محمود درويش', bio: 'شاعر فلسطيني عالمي', era: 'معاصر', verified: true, followers: 98000 }
  });

  await prisma.poem.createMany({
    data: [
      { title: 'أحبك أكثر', text: 'أحبك أكثر مما تحبين نفسك...', poetId: poet.id, era: 'معاصر', category: 'حب', views: 45000 },
      { title: 'في القدس', text: 'في القدس أعني نفسي...', poetId: poet.id, era: 'معاصر', category: 'وطني', views: 89000 }
    ]
  });

  // === News ===
  await prisma.newsItem.createMany({
    data: [
      { title: 'إصدار ألبوم جديد لعيسى الليث', excerpt: 'ليالي الغربة يتصدر الترند', content: 'أصدر الفنان عيسى الليث ألبومه الجديد...', featured: true, category: 'موسيقى' },
      { title: 'مهرجان الطرب العربي', excerpt: 'انطلاق المهرجان السنوي', content: 'يبدأ المهرجان غدا في القاهرة...', featured: false, category: 'فعاليات' }
    ]
  });

  // === Occasions ===
  await prisma.occasion.create({
    data: { title: 'رمضان 2025', description: 'أجمل الأناشيد والأغاني الروحانية', type: 'ديني', color: '#10b981' }
  });

  console.log('✅ Seeding completed with rich data!');
  console.log('Users: admin@music.app / issa@music.app / sara@music.app (any password works in demo)');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
