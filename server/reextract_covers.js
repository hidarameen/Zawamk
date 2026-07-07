const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');
const musicMetadata = require('music-metadata');

async function run() {
  const tracks = await prisma.track.findMany();
  let updated = 0;
  for (const track of tracks) {
    if (!track.audioUrl) continue;
    const audioPath = path.join(__dirname, 'public', track.audioUrl);
    if (fs.existsSync(audioPath)) {
      try {
        const metadata = await musicMetadata.parseFile(audioPath);
        if (metadata.common.picture && metadata.common.picture.length > 0) {
          const picture = metadata.common.picture[0];
          const oldCoverPath = track.coverUrl ? path.join(__dirname, 'public', track.coverUrl) : null;
          
          if (oldCoverPath && fs.existsSync(oldCoverPath)) {
            // Overwrite the existing cover image with the high-res one
            fs.writeFileSync(oldCoverPath, picture.data);
            console.log(`Updated high-res cover for: ${track.title}`);
            updated++;
          }
        }
      } catch (e) {
        console.error(`Error parsing ${track.title}:`, e.message);
      }
    }
  }
  console.log(`Successfully updated ${updated} covers to high resolution.`);
}
run().finally(() => prisma.$disconnect());
