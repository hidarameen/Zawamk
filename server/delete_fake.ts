import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Deleting fake data...');

  // Delete fake tracks
  const deletedTracks = await prisma.track.deleteMany({
    where: { audioUrl: { contains: 'soundhelix.com' } }
  });
  console.log(`Deleted ${deletedTracks.count} fake tracks.`);

  // Delete fake videos
  const deletedVideos = await prisma.musicVideo.deleteMany({
    where: { videoUrl: { contains: 'soundhelix.com' } }
  });
  console.log(`Deleted ${deletedVideos.count} fake videos.`);

  // Delete fake albums
  const deletedAlbums = await prisma.album.deleteMany({
    where: { coverUrl: { contains: 'unsplash.com' } }
  });
  console.log(`Deleted ${deletedAlbums.count} fake albums.`);

  // Delete fake artists
  const deletedArtists = await prisma.artist.deleteMany({
    where: { name: { in: ['أمل كمال', 'خالد الشامي'] } }
  });
  console.log(`Deleted ${deletedArtists.count} fake artists.`);

  // Delete fake bands
  const deletedBands = await prisma.band.deleteMany({
    where: { name: 'فرقة الوتر' }
  });
  console.log(`Deleted ${deletedBands.count} fake bands.`);

  console.log('Fake data deletion complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
