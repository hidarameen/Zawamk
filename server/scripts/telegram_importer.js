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
const input_1 = __importDefault(require("input"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const client_1 = require("@prisma/client");
const music_metadata_1 = require("music-metadata");
const crypto_1 = __importDefault(require("crypto"));
const apiId = 2040; // Default Telegram API ID for testing (official apps)
const apiHash = 'b18441a1ff607e10a989891a5462e627'; // Default API Hash
const stringSession = new sessions_1.StringSession('');
const prisma = new client_1.PrismaClient();
function startBot() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Starting Telegram Userbot...");
        const client = new telegram_1.TelegramClient(stringSession, apiId, apiHash, {
            connectionRetries: 5,
        });
        yield client.start({
            phoneNumber: () => __awaiter(this, void 0, void 0, function* () { return yield input_1.default.text('Enter your phone number (e.g. +967...): '); }),
            password: () => __awaiter(this, void 0, void 0, function* () { return yield input_1.default.text('Enter your password (if 2FA enabled): '); }),
            phoneCode: () => __awaiter(this, void 0, void 0, function* () { return yield input_1.default.text('Enter the code you received on Telegram: '); }),
            onError: (err) => console.log(err),
        });
        console.log("You are now connected!");
        console.log("Session String (save this for future use):", client.session.save());
        const channelUsername = yield input_1.default.text('Enter the channel username or link to fetch from: ');
        const artistName = yield input_1.default.text('Enter the name of the Artist to assign these tracks to: ');
        // Find or create artist
        let artist = yield prisma.artist.findFirst({ where: { name: artistName } });
        if (!artist) {
            artist = yield prisma.artist.create({
                data: { name: artistName, bio: '', avatar: '', coverImage: '' }
            });
            console.log(`Created new artist: ${artist.name}`);
        }
        const limit = parseInt(yield input_1.default.text('How many audio files to fetch? (e.g. 10): '), 10) || 10;
        console.log(`Fetching latest ${limit} messages from ${channelUsername}...`);
        const messages = yield client.getMessages(channelUsername, { limit: limit * 2 }); // Get more to account for non-audio messages
        let processed = 0;
        for (const message of messages) {
            if (processed >= limit)
                break;
            if (message.media && message.media.document && message.media.document.mimeType.includes('audio')) {
                console.log(`Downloading audio: ${message.message || 'Untitled'}...`);
                const buffer = yield client.downloadMedia(message);
                if (buffer) {
                    // Parse ID3 metadata
                    try {
                        const metadata = yield (0, music_metadata_1.parseBuffer)(buffer, 'audio/mpeg');
                        const title = metadata.common.title || message.message || 'أغنية غير مسماة';
                        const duration = Math.floor(metadata.format.duration || 0);
                        let coverUrl = '';
                        // Extract cover art if exists
                        if (metadata.common.picture && metadata.common.picture.length > 0) {
                            const picture = metadata.common.picture[0];
                            const fileName = `cover_${crypto_1.default.randomBytes(8).toString('hex')}.${picture.format.split('/')[1] || 'jpg'}`;
                            const coverPath = path.join(__dirname, '../../client/public/uploads', fileName);
                            fs.mkdirSync(path.dirname(coverPath), { recursive: true });
                            fs.writeFileSync(coverPath, picture.data);
                            coverUrl = `/uploads/${fileName}`;
                            console.log(`Extracted cover art: ${fileName}`);
                        }
                        // Save audio file locally (In real app, you might upload to S3 or a specific folder)
                        const audioFileName = `audio_${crypto_1.default.randomBytes(8).toString('hex')}.mp3`;
                        const audioPath = path.join(__dirname, '../../client/public/uploads', audioFileName);
                        fs.writeFileSync(audioPath, buffer);
                        const audioUrl = `/uploads/${audioFileName}`;
                        // Add to DB
                        yield prisma.track.create({
                            data: {
                                title,
                                duration,
                                audioUrl,
                                coverUrl: coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400',
                                artistId: artist.id,
                                plays: 0,
                                genre: 'نشيد'
                            }
                        });
                        console.log(`Successfully imported: ${title}`);
                        processed++;
                    }
                    catch (e) {
                        console.log(`Failed to process metadata for a message:`, e);
                    }
                }
            }
        }
        console.log(`Finished importing ${processed} tracks!`);
        process.exit(0);
    });
}
startBot();
