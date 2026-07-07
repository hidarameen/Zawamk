const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function clean() {
  await prisma.poem.deleteMany(); // Delete all poems
  await prisma.poet.deleteMany({ where: { name: 'محمود درويش' } });
  await prisma.newsItem.deleteMany(); // Delete all news
  await prisma.occasion.deleteMany(); // Delete all occasions
  await prisma.playlistTrack.deleteMany();
  await prisma.playlist.deleteMany(); // Delete all playlists
  await prisma.musicVideo.deleteMany(); // Delete all videos
  await prisma.album.deleteMany({ where: { title: 'ألبوم التجربة' }});
  console.log("Cleaned fake data.");
}
clean().finally(() => prisma.$disconnect());
