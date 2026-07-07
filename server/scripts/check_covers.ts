import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const tracks = await prisma.track.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  for (const t of tracks) {
    console.log(`${t.title} -> ${t.coverUrl}`);
  }
}
check().then(() => process.exit(0));
