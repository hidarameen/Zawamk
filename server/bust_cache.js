const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const tracks = await prisma.track.findMany();
  let updated = 0;
  for (const track of tracks) {
    let newCoverUrl = track.coverUrl;
    if (newCoverUrl && !newCoverUrl.includes('?v=')) {
      newCoverUrl += '?v=2';
      await prisma.track.update({
        where: { id: track.id },
        data: { coverUrl: newCoverUrl }
      });
      updated++;
    }
  }
  console.log(`Busted cache for ${updated} tracks.`);
}
run().finally(() => prisma.$disconnect());
