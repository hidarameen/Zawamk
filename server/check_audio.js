const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');
async function check() {
  const tracks = await prisma.track.findMany({ take: 3 });
  for (const t of tracks) {
    console.log(`Track: ${t.title}`);
    console.log(`audioUrl: ${t.audioUrl}`);
    console.log(`coverUrl: ${t.coverUrl}`);
    const audioPath = path.join(__dirname, 'public', t.audioUrl.replace(/^\//, ''));
    console.log(`Audio file exists? ${fs.existsSync(audioPath)} (${audioPath})`);
  }
}
check().finally(() => prisma.$disconnect());
