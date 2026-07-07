import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fix() {
  const badNames = await prisma.artist.findMany({
    where: { name: { in: ['يوسف', 'السلامي', 'قيس', 'الرصاص'] } },
    include: { tracks: true }
  });
  console.log(JSON.stringify(badNames, null, 2));
}
fix().then(() => process.exit(0));
