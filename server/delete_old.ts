import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const res = await prisma.track.deleteMany({
        where: { coverUrl: { contains: 'artist_issa_' } }
    });
    console.log('Deleted', res.count, 'tracks with artist avatar as cover');
}
main();
