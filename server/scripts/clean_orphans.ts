import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanMore() {
  // Clean orphan bands
  const bands = await prisma.band.findMany({ include: { tracks: true, albums: true } });
  let bandsCount = 0;
  for (const b of bands) {
    if (b.tracks.length === 0 && b.albums.length === 0) {
      await prisma.band.delete({ where: { id: b.id } });
      bandsCount++;
      console.log(`Deleted orphan band: ${b.name}`);
    }
  }

  // Clean orphan poets
  const poets = await prisma.poet.findMany({ include: { tracks: true, poems: true } });
  let poetsCount = 0;
  for (const p of poets) {
    if (p.tracks.length === 0 && p.poems.length === 0) {
      await prisma.poet.delete({ where: { id: p.id } });
      poetsCount++;
      console.log(`Deleted orphan poet: ${p.name}`);
    }
  }

  console.log(`Cleanup complete: deleted ${bandsCount} orphan bands and ${poetsCount} orphan poets.`);
}

cleanMore().then(() => process.exit(0));
