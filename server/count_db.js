const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function count() {
  const artists = await prisma.artist.findMany();
  const tracks = await prisma.track.findMany();
  const albums = await prisma.album.findMany();
  const poets = await prisma.poet.findMany();
  const news = await prisma.newsItem.findMany();
  console.log(`Artists: ${artists.map(a => a.name).join(', ')}`);
  console.log(`Tracks: ${tracks.length}`);
  console.log(`Albums: ${albums.map(a => a.title).join(', ')}`);
  console.log(`Poets: ${poets.map(p => p.name).join(', ')}`);
  console.log(`News: ${news.length}`);
}
count().finally(() => prisma.$disconnect());
