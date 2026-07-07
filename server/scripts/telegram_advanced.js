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
// Use the session string we just obtained
const sessionString = '1BAAOMTQ5LjE1NC4xNjcuOTEAUF74KVQcKDYSTQYeuuoq1VXeajgZ0jltbgeklz+TUGwH1HIGjSVDq1oHc7TRWjamCK0z/6VGEP+nf1Gd97l9net6YPsu6vRiyPHGBJdb96cYKnpHEinh5+Bvm6lX6CZsroKrRpQC1QIiCvl4dqlVyjs+HNnSzMD+MeimeJqYgtKzpMotOJREMiX5JtLaLleaaR5mw3KZSs3k54KbpUO1xx0dPcQVh72fktbfZlLCu/IGkPh5/Mhh2TFfI96wasglypriVXZRUBuOUa04jzMR6DE2zUObJGUljo71EOxG13VvZebtskSWVEkIWzXy96lNOvid/RhkzYeClaEOZFx1x1s=';
const stringSession = new sessions_1.StringSession(sessionString);
const prisma = new client_1.PrismaClient();
function getOrCreateEntity(model, name) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!name || name.trim() === '')
            return null;
        const cleanName = name.trim().substring(0, 255);
        const isOccasion = model === prisma.occasion;
        let entity = isOccasion
            ? yield model.findFirst({ where: { title: cleanName } })
            : yield model.findFirst({ where: { name: cleanName } });
        if (!entity) {
            if (!isOccasion) {
                entity = yield model.create({ data: { name: cleanName, bio: '', avatar: '', coverImage: '' } });
            }
            else {
                entity = yield model.create({ data: { title: cleanName, date: new Date().toISOString(), description: '', coverUrl: '' } });
            }
        }
        return entity;
    });
}
function startAdvancedBot() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Starting Advanced Telegram Userbot...");
        const client = new telegram_1.TelegramClient(stringSession, apiId, apiHash, { connectionRetries: 5 });
        yield client.connect();
        console.log("Connected using saved session!");
        const channelUsername = 'zawamlansarallah';
        const limit = 100;
        console.log(`Fetching latest ${limit} messages from ${channelUsername}...`);
        // Get more messages to find 100 audios
        const messages = yield client.getMessages(channelUsername, { limit: 500 });
        let processed = 0;
        for (const message of messages) {
            if (processed >= limit)
                break;
            if (message.media && message.media.document && message.media.document.mimeType.includes('audio')) {
                const text = message.message || '';
                console.log(`\nFound audio: ${text.substring(0, 50).replace(/\n/g, ' ')}...`);
                // Regex matching for metadata
                const artistMatch = text.match(/(?:أداء|المنشد|أداء المنشد|بصوت)[:\-\|]?\s*([^\n#]+)/);
                const poetMatch = text.match(/(?:كلمات|الشاعر|كلمات الشاعر)[:\-\|]?\s*([^\n#]+)/);
                const occasionMatch = text.match(/(?:مناسبة|المناسبة|بمناسبة)[:\-\|]?\s*([^\n#]+)/);
                const bandMatch = text.match(/(?:فرقة|توزيع|أداء فرقة)[:\-\|]?\s*([^\n#]+)/);
                const artistName = artistMatch ? artistMatch[1].trim() : 'منشد غير معروف';
                const poetName = poetMatch ? poetMatch[1].trim() : null;
                const occasionName = occasionMatch ? occasionMatch[1].trim() : null;
                const bandName = bandMatch ? bandMatch[1].trim() : null;
                const artist = yield getOrCreateEntity(prisma.artist, artistName);
                const poet = yield getOrCreateEntity(prisma.poet, poetName || '');
                const occasion = yield getOrCreateEntity(prisma.occasion, occasionName || '');
                const band = yield getOrCreateEntity(prisma.band, bandName || '');
                let title = text.split('\n')[0].trim();
                if (!title || title.length > 100)
                    title = 'زامل ' + artistName;
                console.log(`Downloading audio...`);
                const buffer = yield client.downloadMedia(message);
                if (buffer) {
                    let duration = 0;
                    let coverUrl = '';
                    try {
                        // Attempt to parse metadata without forcing MIME type so it can auto-detect OGG/MP3
                        const metadata = yield (0, music_metadata_1.parseBuffer)(buffer);
                        duration = Math.floor(metadata.format.duration || 0);
                        if (metadata.common.picture && metadata.common.picture.length > 0) {
                            const picture = metadata.common.picture[0];
                            const fileName = `cover_${crypto_1.default.randomBytes(8).toString('hex')}.${picture.format.split('/')[1] || 'jpg'}`;
                            const coverPath = path.join(__dirname, '../../client/public/uploads', fileName);
                            fs.mkdirSync(path.dirname(coverPath), { recursive: true });
                            fs.writeFileSync(coverPath, picture.data);
                            coverUrl = `/uploads/${fileName}`;
                        }
                    }
                    catch (e) {
                        console.log(`Warning: Failed to process metadata (MIME type issue), skipping ID3 tags...`);
                    }
                    try {
                        const audioFileName = `audio_${crypto_1.default.randomBytes(8).toString('hex')}.mp3`; // Or determine from original message
                        const audioPath = path.join(__dirname, '../../client/public/uploads', audioFileName);
                        fs.writeFileSync(audioPath, buffer);
                        const audioUrl = `/uploads/${audioFileName}`;
                        yield prisma.track.create({
                            data: {
                                title,
                                duration,
                                audioUrl,
                                coverUrl: coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400',
                                artistId: artist.id,
                                views: 0,
                                genre: 'زامل'
                            }
                        });
                        console.log(`Successfully imported: ${title} | المنشد: ${artistName} | الشاعر: ${poetName || 'لا يوجد'}`);
                        processed++;
                    }
                    catch (e) {
                        console.log(`Failed to save to database or file:`, e);
                    }
                }
            }
        }
        console.log(`\nFinished importing ${processed} tracks with metadata from captions!`);
        process.exit(0);
    });
}
startAdvancedBot();
