import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function cleanBadArtists() {
  const badNames = [
    'إبراهيم', '|', 'طلال', 'الشاعر', 'وألحان', 'ابو', 'والحان', 'الجوقة'
  ];

  const artists = await prisma.artist.findMany({
    where: { name: { in: badNames } },
    include: { tracks: true }
  });

  let trackCount = 0;
  for (const a of artists) {
    for (const t of a.tracks) {
      if (t.audioUrl && t.audioUrl.startsWith('/uploads/')) {
        const p = path.join(__dirname, '../../client/public', t.audioUrl);
        if (fs.existsSync(p)) fs.unlinkSync(p);
      }
      if (t.coverUrl && t.coverUrl.startsWith('/uploads/')) {
        const c = path.join(__dirname, '../../client/public', t.coverUrl);
        if (fs.existsSync(c)) fs.unlinkSync(c);
      }
      await prisma.track.delete({ where: { id: t.id } });
      trackCount++;
    }
    await prisma.artist.delete({ where: { id: a.id } });
    console.log(`Deleted bad artist: ${a.name} and their tracks.`);
  }

  console.log(`Done. Deleted ${trackCount} tracks and ${artists.length} bad artists.`);
}

cleanBadArtists().then(() => process.exit(0));
