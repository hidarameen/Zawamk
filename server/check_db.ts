import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const artist = await prisma.artist.findFirst({ where: { name: 'عيسى الليث' } });
    if (!artist) return console.log('No artist found');
    const tracks = await prisma.track.findMany({ where: { artistId: artist.id }, take: 10, orderBy: { id: 'asc' } });
    console.log(tracks.map(t => ({ title: t.title, coverUrl: t.coverUrl })));
}
main();
