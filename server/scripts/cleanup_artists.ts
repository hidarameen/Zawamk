import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function clean() {
  const artists = await prisma.artist.findMany({
    include: { tracks: true }
  });

  let count = 0;
  for (const a of artists) {
    if (a.tracks.length === 0) {
      await prisma.artist.delete({ where: { id: a.id } });
      count++;
      console.log(`Deleted orphan artist: ${a.name}`);
    }
  }
  console.log(`Deleted ${count} orphan artists`);
}
clean().then(() => process.exit(0));
