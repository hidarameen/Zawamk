import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

async function main() {
  const tracks = await prisma.track.findMany();
  let count = 0;
  for (const track of tracks) {
    // Only update if they are 0 or null
    const views = track.views === 0 ? randomInt(500, 500000) : track.views;
    const likes = track.likes === 0 ? randomInt(10, Math.floor(views * 0.1)) : track.likes;
    const duration = track.duration === 0 ? randomInt(120, 360) : track.duration;
    const releaseYear = track.releaseYear == null ? randomInt(2015, 2024) : track.releaseYear;

    await prisma.track.update({
      where: { id: track.id },
      data: { views, likes, duration, releaseYear },
    });
    count++;
  }
  console.log(`Updated ${count} tracks with random realistic data for sorting.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
