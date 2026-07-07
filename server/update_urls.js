const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function update() {
  const tables = ['"Track"', '"Album"', '"Playlist"', '"Poem"', '"NewsItem"', '"Occasion"'];
  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`UPDATE ${table} SET "coverUrl" = REPLACE("coverUrl", 'http://', 'https://') WHERE "coverUrl" LIKE 'http://%'`);
    } catch(e) {}
  }
  await prisma.$executeRawUnsafe(`UPDATE "Track" SET "audioUrl" = REPLACE("audioUrl", 'http://', 'https://') WHERE "audioUrl" LIKE 'http://%'`);
  await prisma.$executeRawUnsafe(`UPDATE "Poet" SET avatar = REPLACE(avatar, 'http://', 'https://') WHERE avatar LIKE 'http://%'`);
  await prisma.$executeRawUnsafe(`UPDATE "Poet" SET "coverImage" = REPLACE("coverImage", 'http://', 'https://') WHERE "coverImage" LIKE 'http://%'`);
  await prisma.$executeRawUnsafe(`UPDATE "Artist" SET avatar = REPLACE(avatar, 'http://', 'https://') WHERE avatar LIKE 'http://%'`);
  await prisma.$executeRawUnsafe(`UPDATE "Artist" SET "coverImage" = REPLACE("coverImage", 'http://', 'https://') WHERE "coverImage" LIKE 'http://%'`);
  await prisma.$executeRawUnsafe(`UPDATE "Band" SET avatar = REPLACE(avatar, 'http://', 'https://') WHERE avatar LIKE 'http://%'`);
  await prisma.$executeRawUnsafe(`UPDATE "Band" SET "coverImage" = REPLACE("coverImage", 'http://', 'https://') WHERE "coverImage" LIKE 'http://%'`);
  console.log('Done');
}
update().finally(() => prisma.$disconnect());
