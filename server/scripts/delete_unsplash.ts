import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function clean() {
  const tracks = await prisma.track.findMany({
    where: { coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400' }
  });

  let count = 0;
  for (const t of tracks) {
    if (t.audioUrl && t.audioUrl.startsWith('/uploads/')) {
       const p = path.join(__dirname, '../../client/public', t.audioUrl);
       if (fs.existsSync(p)) {
           fs.unlinkSync(p);
       }
    }
    await prisma.track.delete({ where: { id: t.id } });
    count++;
  }
  console.log(`Deleted ${count} tracks with default unsplash cover.`);
}
clean().then(() => process.exit(0));
