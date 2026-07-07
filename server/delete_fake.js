"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Deleting fake data...');
        // Delete fake tracks
        const deletedTracks = yield prisma.track.deleteMany({
            where: { audioUrl: { contains: 'soundhelix.com' } }
        });
        console.log(`Deleted ${deletedTracks.count} fake tracks.`);
        // Delete fake videos
        const deletedVideos = yield prisma.musicVideo.deleteMany({
            where: { videoUrl: { contains: 'soundhelix.com' } }
        });
        console.log(`Deleted ${deletedVideos.count} fake videos.`);
        // Delete fake albums
        const deletedAlbums = yield prisma.album.deleteMany({
            where: { coverUrl: { contains: 'unsplash.com' } }
        });
        console.log(`Deleted ${deletedAlbums.count} fake albums.`);
        // Delete fake artists
        const deletedArtists = yield prisma.artist.deleteMany({
            where: { name: { in: ['أمل كمال', 'خالد الشامي'] } }
        });
        console.log(`Deleted ${deletedArtists.count} fake artists.`);
        // Delete fake bands
        const deletedBands = yield prisma.band.deleteMany({
            where: { name: 'فرقة الوتر' }
        });
        console.log(`Deleted ${deletedBands.count} fake bands.`);
        console.log('Fake data deletion complete!');
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
