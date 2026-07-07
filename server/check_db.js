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
        const artist = yield prisma.artist.findFirst({ where: { name: 'عيسى الليث' } });
        if (!artist)
            return console.log('No artist found');
        const tracks = yield prisma.track.findMany({ where: { artistId: artist.id }, take: 10, orderBy: { id: 'asc' } });
        console.log(tracks.map(t => ({ title: t.title, coverUrl: t.coverUrl })));
    });
}
main();
