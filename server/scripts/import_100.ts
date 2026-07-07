import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { parseBuffer } from 'music-metadata';
import crypto from 'crypto';

const apiId = 2040;
const apiHash = 'b18441a1ff607e10a989891a5462e627';
const sessionString = process.env.TELEGRAM_SESSION || '1BAAOMTQ5LjE1NC4xNjcuOTEAUF74KVQcKDYSTQYeuuoq1VXeajgZ0jltbgeklz+TUGwH1HIGjSVDq1oHc7TRWjamCK0z/6VGEP+nf1Gd97l9net6YPsu6vRiyPHGBJdb96cYKnpHEinh5+Bvm6lX6CZsroKrRpQC1QIiCvl4dqlVyjs+HNnSzMD+MeimeJqYgtKzpMotOJREMiX5JtLaLleaaR5mw3KZSs3k54KbpUO1xx0dPcQVh72fktbfZlLCu/IGkPh5/Mhh2TFfI96wasglypriVXZRUBuOUa04jzMR6DE2zUObJGUljo71EOxG13VvZebtskSWVEkIWzXy96lNOvid/RhkzYeClaEOZFx1x1s=';
const stringSession = new StringSession(sessionString); 

const prisma = new PrismaClient();

async function getOrCreateEntity(model: any, name: string) {
  if (!name || name.trim() === '') return null;
  const cleanName = name.trim().substring(0, 255);
  const isOccasion = model === prisma.occasion;
  let entity = isOccasion 
      ? await model.findFirst({ where: { title: cleanName } }) 
      : await model.findFirst({ where: { name: cleanName } });
      
  if (!entity) {
    if (!isOccasion) {
        entity = await model.create({ data: { name: cleanName, bio: '', avatar: '', coverImage: '' } });
    } else {
        entity = await model.create({ data: { title: cleanName, date: new Date().toISOString(), description: '', coverUrl: '' } });
    }
  }
  return entity;
}

async function startBot() {
  console.log("Starting Telegram Userbot to fetch 100 works...");
  
  const client = new TelegramClient(stringSession, apiId, apiHash, { connectionRetries: 5 });
  await client.connect();
  console.log("Connected using saved session!");

  const channelUsername = 'zawamlansarallah';
  const targetTracks = 100;
  
  console.log(`Fetching messages from ${channelUsername} to collect ${targetTracks} tracks...`);
  const messages = await client.getMessages(channelUsername, { limit: 5000 }); 

  let processed = 0;

  for (const message of messages) {
    if (processed >= targetTracks) break;
    
    const media = (message as any).media;
    if (!media || !media.document || !media.document.mimeType || !media.document.mimeType.includes('audio')) {
      continue;
    }

    const text = (message.message || '').trim();
    if (!text) continue;

    console.log(`\n=== Inspecting audio #${processed + 1} ===`);
    console.log(`Downloading audio for analysis...`);
    const buffer = await client.downloadMedia(message as any);
    if (!buffer) continue;

    let title = text.split('\n')[0].trim().substring(0, 120);
    let duration = 0;
    let coverUrl = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400';
    let id3Artist = '';
    let id3Album = '';
    let lyrics = '';

    try {
      const metadata = await parseBuffer(buffer as Buffer);
      duration = Math.floor(metadata.format.duration || 0);
      
      if (metadata.common.title && metadata.common.title.length > 2) {
        title = metadata.common.title;
      }
      if (metadata.common.artist || metadata.common.albumartist) {
        id3Artist = (metadata.common.artist || metadata.common.albumartist || '').trim();
      }
      if (metadata.common.album) {
        id3Album = metadata.common.album.trim();
      }
      // @ts-ignore - music-metadata typing might not have lyrics openly but it often is parsed
      if (metadata.common.lyrics && metadata.common.lyrics.length > 0) {
        lyrics = metadata.common.lyrics.join('\n');
      }

      if (metadata.common.picture && metadata.common.picture.length > 0) {
        const picture = metadata.common.picture[0];
        const coverFileName = `cover_${crypto.randomBytes(8).toString('hex')}.${picture.format.split('/')[1] || 'jpg'}`;
        const coverPath = path.join(__dirname, '../public/uploads', coverFileName);
        fs.mkdirSync(path.dirname(coverPath), { recursive: true });
        fs.writeFileSync(coverPath, picture.data);
        coverUrl = `/uploads/${coverFileName}`;
        console.log(`Extracted cover art: ${coverFileName}`);
      }
    } catch (e: any) {
      // ignore metadata errors
    }

    // Determine the main artist name
    let mainArtistName = id3Artist;

    // Fallback to Telegram caption if no ID3 artist found
    if (!mainArtistName || mainArtistName.length < 2) {
      let artistRaw = 'منشد غير معروف';
      const artistPatterns = [
        /(?:أداء|المنشد|أداء المنشد|بصوت|أداء\s*[:：])\s*([^\n#|،,]+)/i,
        /ألحان وأداء\s*\|\s*([^\n#|،,]+)/i
      ];
      for (const pat of artistPatterns) {
        const m = text.match(pat);
        if (m) {
          artistRaw = m[1].trim();
          break;
        }
      }
      artistRaw = artistRaw.replace(/[#_]/g, ' ').replace(/\s+/g, ' ').trim();
      const artistNamesRaw = artistRaw
        .split(/(?:،|,|\s+و\s+|\s+مع\s+)/)
        .map(n => n.trim())
        .filter(n => n.length > 2 && n.length < 80 && !/^\d+$/.test(n));
      mainArtistName = artistNamesRaw[0] || artistRaw;
    }

    const poetMatch = text.match(/(?:كلمات|الشاعر|كلمات الشاعر)[:\-\|]?\s*([^\n#،,]+)/i);
    const poetName = poetMatch ? poetMatch[1].trim() : null;

    const occasionMatch = text.match(/(?:مناسبة|المناسبة|بمناسبة)[:\-\|]?\s*([^\n#،,]+)/i);
    const occasionName = occasionMatch ? occasionMatch[1].trim() : null;

    const bandMatch = text.match(/(?:فرقة|توزيع|أداء فرقة|الفرقة)[:\-\|]?\s*([^\n#،,]+)/i);
    const bandName = bandMatch ? bandMatch[1].trim() : null;

    const badSubstrings = ['روف','غير','منشد','وألحان','والحان','|','الجوقة'];
    const badExactNames = ['ابو', 'الشاعر', 'طلال', 'إبراهيم', 'ابراهيم'];

    if (!mainArtistName || mainArtistName.length < 2 || /\d/.test(mainArtistName) || 
        badSubstrings.some(b => mainArtistName.includes(b)) || 
        badExactNames.includes(mainArtistName.trim())) {
      console.log(`→ Skipping: bad or empty artist name: ${mainArtistName}`);
      continue;
    }

    const mainArtist = await getOrCreateEntity(prisma.artist, mainArtistName);
    if (!mainArtist) continue;

    let albumEntity = null;
    if (id3Album && id3Album.length > 1) {
      albumEntity = await prisma.album.findFirst({ where: { title: id3Album, artistId: mainArtist.id } });
      if (!albumEntity) {
         albumEntity = await prisma.album.create({
            data: { title: id3Album, artistId: mainArtist.id, coverUrl }
         });
      }
    }

    const poet = poetName ? await getOrCreateEntity(prisma.poet, poetName) : null;
    const occasion = occasionName ? await getOrCreateEntity(prisma.occasion, occasionName) : null;
    const band = bandName ? await getOrCreateEntity(prisma.band, bandName) : null;

    if (!title || title.length < 4) title = `زامل ${mainArtistName}`;

    const existing = await prisma.track.findFirst({
        where: { title, artistId: mainArtist.id }
    });
    if (existing) {
        console.log(`→ Skipping, track already exists in DB: ${title}`);
        continue;
    }

    const audioFileName = `audio_${crypto.randomBytes(8).toString('hex')}.mp3`;
    const audioPath = path.join(__dirname, '../public/uploads', audioFileName);
    fs.mkdirSync(path.dirname(audioPath), { recursive: true });
    fs.writeFileSync(audioPath, buffer as Buffer);
    const audioUrl = `/uploads/${audioFileName}`;

    await prisma.track.create({
      data: {
        title,
        duration,
        audioUrl,
        coverUrl,
        lyrics: lyrics || null,
        albumId: albumEntity?.id || null,
        artistId: mainArtist.id,
        bandId: band?.id || null,
        poetId: poet?.id || null,
        occasionId: occasion?.id || null,
        views: 0,
        genre: 'زامل',
        type: bandName ? 'فرقة' : 'منشد'
      }
    });

    processed++;
    console.log(`✅ Saved #${processed}: ${title} (Artist: ${mainArtistName}, Album: ${id3Album || 'None'})`);
  }

  console.log(`\n✅ Done! Fetched and imported ${processed} tracks.`);
  process.exit(0);
}

startBot();
