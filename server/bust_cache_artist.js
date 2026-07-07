const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const artists = await prisma.artist.findMany();
  for (const artist of artists) {
    if (artist.avatar && !artist.avatar.includes('?v=')) {
      await prisma.artist.update({
        where: { id: artist.id },
        data: { 
          avatar: artist.avatar + '?v=2',
          coverImage: artist.coverImage ? artist.coverImage + '?v=2' : artist.coverImage
        }
      });
    }
  }
  console.log(`Busted cache for artists.`);
}
run().finally(() => prisma.$disconnect());
