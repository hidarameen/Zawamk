"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const telegram_1 = require("telegram");
const sessions_1 = require("telegram/sessions");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const client_1 = require("@prisma/client");
const music_metadata_1 = require("music-metadata");
const crypto_1 = __importDefault(require("crypto"));
const apiId = 2040;
const apiHash = 'b18441a1ff607e10a989891a5462e627';
const sessionString = '1BAAOMTQ5LjE1NC4xNjcuOTEAUF74KVQcKDYSTQYeuuoq1VXeajgZ0jltbgeklz+TUGwH1HIGjSVDq1oHc7TRWjamCK0z/6VGEP+nf1Gd97l9net6YPsu6vRiyPHGBJdb96cYKnpHEinh5+Bvm6lX6CZsroKrRpQC1QIiCvl4dqlVyjs+HNnSzMD+MeimeJqYgtKzpMotOJREMiX5JtLaLleaaR5mw3KZSs3k54KbpUO1xx0dPcQVh72fktbfZlLCu/IGkPh5/Mhh2TFfI96wasglypriVXZRUBuOUa04jzMR6DE2zUObJGUljo71EOxG13VvZebtskSWVEkIWzXy96lNOvid/RhkzYeClaEOZFx1x1s=';
const stringSession = new sessions_1.StringSession(sessionString);
const prisma = new client_1.PrismaClient();
function startAdvancedBot() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Starting Advanced Telegram Userbot for Issa Al-Laith...");
        const client = new telegram_1.TelegramClient(stringSession, apiId, apiHash, { connectionRetries: 5 });
        yield client.connect();
        console.log("Connected using saved session!");
        const channelUsername = 'zwamlallaith';
        const limit = 20;
        console.log(`Fetching profile photo of ${channelUsername}...`);
        let artistAvatarUrl = '';
        try {
            const photoBuffer = yield client.downloadProfilePhoto(channelUsername);
            if (photoBuffer) {
                const fileName = `artist_issa_${crypto_1.default.randomBytes(4).toString('hex')}.jpg`;
                const photoPath = path.join(__dirname, '../../client/public/uploads', fileName);
                fs.mkdirSync(path.dirname(photoPath), { recursive: true });
                fs.writeFileSync(photoPath, photoBuffer);
                artistAvatarUrl = `/uploads/${fileName}`;
                console.log(`Saved channel profile photo to ${artistAvatarUrl}`);
            }
        }
        catch (e) {
            console.log('Failed to fetch profile photo', e);
        }
        const artistName = 'عيسى الليث';
        let artist = yield prisma.artist.findFirst({ where: { name: artistName } });
        if (!artist) {
            artist = yield prisma.artist.create({
                data: { name: artistName, bio: 'منشد وزامل يمني', avatar: artistAvatarUrl, coverImage: artistAvatarUrl }
            });
            console.log(`Created artist: ${artistName}`);
        }
        else {
            if (artistAvatarUrl) {
                artist = yield prisma.artist.update({
                    where: { id: artist.id },
                    data: { avatar: artistAvatarUrl, coverImage: artistAvatarUrl }
                });
                console.log(`Updated artist profile photo: ${artistName}`);
            }
        }
        console.log(`Fetching latest messages to find ${limit} audios from ${channelUsername}...`);
        const messages = yield client.getMessages(channelUsername, { limit: 300 });
        let processed = 0;
        for (const message of messages) {
            if (processed >= limit)
                break;
            if (message.media && message.media.document && message.media.document.mimeType.includes('audio')) {
                const text = message.message || '';
                console.log(`\nFound audio: ${text.substring(0, 50).replace(/\n/g, ' ')}...`);
                const poetMatch = text.match(/(?:كلمات|الشاعر|كلمات الشاعر)[:\-\|]?\s*([^\n#]+)/);
                const occasionMatch = text.match(/(?:مناسبة|المناسبة|بمناسبة)[:\-\|]?\s*([^\n#]+)/);
                const poetName = poetMatch ? poetMatch[1].trim() : null;
                const occasionName = occasionMatch ? occasionMatch[1].trim() : null;
                if (poetName) {
                    let poet = yield prisma.poet.findFirst({ where: { name: poetName } });
                    if (!poet) {
                        yield prisma.poet.create({ data: { name: poetName, bio: '', avatar: '', coverImage: '' } });
                    }
                }
                if (occasionName) {
                    let occasion = yield prisma.occasion.findFirst({ where: { title: occasionName } });
                    if (!occasion) {
                        yield prisma.occasion.create({ data: { title: occasionName, date: new Date().toISOString(), description: '', coverUrl: '' } });
                    }
                }
                let title = text.split('\n')[0].trim();
                if (!title || title.length > 100)
                    title = 'زامل ' + artistName + ' ' + (processed + 1);
                title = title.replace(/#/g, '').trim();
                console.log(`Downloading audio...`);
                const buffer = yield client.downloadMedia(message);
                if (buffer) {
                    let duration = 0;
                    let coverUrl = '';
                    try {
                        const thumbBuffer = yield client.downloadMedia(message, { thumb: 0 });
                        if (thumbBuffer && thumbBuffer.length > 0) {
                            const fileName = `cover_${crypto_1.default.randomBytes(8).toString('hex')}.jpg`;
                            const coverPath = path.join(__dirname, '../public/uploads', fileName);
                            fs.mkdirSync(path.dirname(coverPath), { recursive: true });
                            fs.writeFileSync(coverPath, thumbBuffer);
                            coverUrl = `/uploads/${fileName}`;
                        }
                    }
                    catch (e) {
                        // Ignore thumb error
                    }
                    try {
                        if (!coverUrl) {
                            const metadata = yield (0, music_metadata_1.parseBuffer)(buffer);
                            duration = Math.floor(metadata.format.duration || 0);
                            if (metadata.common.picture && metadata.common.picture.length > 0) {
                                const picture = metadata.common.picture[0];
                                const fileName = `cover_${crypto_1.default.randomBytes(8).toString('hex')}.${picture.format.split('/')[1] || 'jpg'}`;
                                const coverPath = path.join(__dirname, '../public/uploads', fileName);
                                fs.mkdirSync(path.dirname(coverPath), { recursive: true });
                                fs.writeFileSync(coverPath, picture.data);
                                coverUrl = `/uploads/${fileName}`;
                            }
                        }
                        else {
                            const metadata = yield (0, music_metadata_1.parseBuffer)(buffer);
                            duration = Math.floor(metadata.format.duration || 0);
                        }
                    }
                    catch (e) {
                        console.log(`Warning: Failed to process metadata (MIME type issue), skipping ID3 tags...`);
                    }
                    try {
                        const audioFileName = `audio_issa_${crypto_1.default.randomBytes(8).toString('hex')}.mp3`;
                        const audioPath = path.join(__dirname, '../public/uploads', audioFileName);
                        fs.writeFileSync(audioPath, buffer);
                        const audioUrl = `/uploads/${audioFileName}`;
                        yield prisma.track.create({
                            data: {
                                title,
                                duration,
                                audioUrl,
                                coverUrl: coverUrl || artistAvatarUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400',
                                artistId: artist.id,
                                views: 0,
                                genre: 'زامل'
                            }
                        });
                        console.log(`Successfully imported: ${title} | الشاعر: ${poetName || 'لا يوجد'}`);
                        processed++;
                    }
                    catch (e) {
                        console.log(`Failed to save to database or file:`, e);
                    }
                }
            }
        }
        console.log(`\nFinished importing ${processed} tracks for ${artistName}!`);
        process.exit(0);
    });
}
startAdvancedBot();
