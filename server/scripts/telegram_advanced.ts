import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { parseBuffer } from 'music-metadata';
import crypto from 'crypto';

const apiId = 2040;
const apiHash = 'b18441a1ff607e10a989891a5462e627';
const sessionString = process.argv[2] || process.env.TELEGRAM_SESSION || '1BAAOMTQ5LjE1NC4xNjcuOTEAUF74KVQcKDYSTQYeuuoq1VXeajgZ0jltbgeklz+TUGwH1HIGjSVDq1oHc7TRWjamCK0z/6VGEP+nf1Gd97l9net6YPsu6vRiyPHGBJdb96cYKnpHEinh5+Bvm6lX6CZsroKrRpQC1QIiCvl4dqlVyjs+HNnSzMD+MeimeJqYgtKzpMotOJREMiX5JtLaLleaaR5mw3KZSs3k54KbpUO1xx0dPcQVh72fktbfZlLCu/IGkPh5/Mhh2TFfI96wasglypriVXZRUBuOUa04jzMR6DE2zUObJGUljo71EOxG13VvZebtskSWVEkIWzXy96lNOvid/RhkzYeClaEOZFx1x1s=';
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

async function startAdvancedBot() {
  console.log("Starting Advanced Telegram Userbot...");
  
  const client = new TelegramClient(stringSession, apiId, apiHash, { connectionRetries: 5 });
  await client.connect();

  console.log("Connected using saved session!");

  const channelUsername = 'zawamlansarallah';
  const targetUniqueArtists = 100;
  
  console.log(`Fetching messages from ${channelUsername} to collect ${targetUniqueArtists} tracks from different artists...`);
  const messages = await client.getMessages(channelUsername, { limit: 1000 }); 

  const usedArtistIds = new Set<string>();
  let processed = 0;

  for (const message of messages) {
    if (processed >= targetUniqueArtists) break;
    
    const media = (message as any).media;
    if (!media || !media.document || !media.document.mimeType || !media.document.mimeType.includes('audio')) {
      continue;
    }

    const text = (message.message || '').trim();
    if (!text) continue;

    console.log(`\n=== Inspecting audio #${processed + 1} ===`);
    console.log(`Raw caption: ${text.substring(0, 150).replace(/\n/g, ' ')}...`);

    // Enhanced parsing for joint works (multiple artists) - cleaned
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

    // Clean the raw name (remove # _ etc)
    artistRaw = artistRaw.replace(/[#_]/g, ' ').replace(/\s+/g, ' ').trim();

    const artistNamesRaw = artistRaw
      .split(/(?:،|,|\s+و\s+|\s+مع\s+)/)
      .map(n => n.trim())
      .filter(n => n.length > 2 && n.length < 80 && !/^\d+$/.test(n));

    const mainArtistName = artistNamesRaw[0] || artistRaw;

    const poetMatch = text.match(/(?:كلمات|الشاعر|كلمات الشاعر)[:\-\|]?\s*([^\n#،,]+)/i);
    const poetName = poetMatch ? poetMatch[1].trim() : null;

    const occasionMatch = text.match(/(?:مناسبة|المناسبة|بمناسبة)[:\-\|]?\s*([^\n#،,]+)/i);
    const occasionName = occasionMatch ? occasionMatch[1].trim() : null;

    const bandMatch = text.match(/(?:فرقة|توزيع|أداء فرقة|الفرقة)[:\-\|]?\s*([^\n#،,]+)/i);
    const bandName = bandMatch ? bandMatch[1].trim() : null;

    if (!mainArtistName || mainArtistName.length < 3 || mainArtistName === 'منشد غير معروف' || /\d/.test(mainArtistName) || ['روف','غير','منشد'].some(b => mainArtistName.includes(b))) {
      console.log('→ Skipping: bad or empty artist name');
      continue;
    }

    console.log(`Parsed main artist: ${mainArtistName}`);
    if (artistNamesRaw.length > 1) {
      console.log(`Joint work detected: ${artistNamesRaw.join(' + ')}`);
    }
    if (bandName) console.log(`Band/فرقة: ${bandName}`);
    if (poetName) console.log(`Poet: ${poetName}`);

    const mainArtist = await getOrCreateEntity(prisma.artist, mainArtistName);

    if (!mainArtist) {
      console.log(`→ Skipping, could not create artist for "${mainArtistName}"`);
      continue;
    }

    if (usedArtistIds.has(mainArtist.id)) {
      console.log(`→ Skipping duplicate artist: ${mainArtistName}`);
      continue;
    }

    // Create additional joint artists
    for (const extra of artistNamesRaw.slice(1)) {
      await getOrCreateEntity(prisma.artist, extra);
    }

    const poet = poetName ? await getOrCreateEntity(prisma.poet, poetName) : null;
    const occasion = occasionName ? await getOrCreateEntity(prisma.occasion, occasionName) : null;
    const band = bandName ? await getOrCreateEntity(prisma.band, bandName) : null;

    // Download and inspect the clip
    console.log('Downloading audio for inspection...');
    const buffer = await client.downloadMedia(message as any);
    if (!buffer) continue;

    let title = text.split('\n')[0].trim().substring(0, 120);
    let duration = 0;
    let id3Artist = '';

    try {
      const metadata = await parseBuffer(buffer as Buffer);
      duration = Math.floor(metadata.format.duration || 0);
      id3Artist = (metadata.common.artist || metadata.common.albumartist || '').trim();
      if (id3Artist && id3Artist.length > 2) {
        console.log(`ID3 embedded artist: ${id3Artist}`);
      }
      if (metadata.common.title && metadata.common.title.length > 3) {
        title = metadata.common.title;
      }
    } catch (e: any) {
      console.log('Metadata inspection note:', e.message || e);
    }

    if (!title || title.length < 4) title = `زامل ${mainArtistName}`;

    console.log(`Final: title="${title}" | duration=${duration}s | mainArtist="${mainArtistName}"`);

    // Save the audio file
    const audioFileName = `audio_${crypto.randomBytes(8).toString('hex')}.mp3`;
    const audioPath = path.join(__dirname, '../../client/public/uploads', audioFileName);
    fs.mkdirSync(path.dirname(audioPath), { recursive: true });
    fs.writeFileSync(audioPath, buffer as Buffer);
    const audioUrl = `/uploads/${audioFileName}`;

    // Save to DB
    await prisma.track.create({
      data: {
        title,
        duration,
        audioUrl,
        coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400',
        artistId: mainArtist.id,
        bandId: band?.id || null,
        poetId: poet?.id || null,
        occasionId: occasion?.id || null,
        views: 0,
        genre: 'زامل',
        type: bandName ? 'فرقة' : 'منشد'
      }
    });

    usedArtistIds.add(mainArtist.id);
    processed++;
    console.log(`✅ Saved #${processed}/${targetUniqueArtists}: ${title} — ${mainArtistName}${bandName ? ' (' + bandName + ')' : ''}`);
  }

  console.log(`\n✅ Done! Fetched and imported ${processed} tracks from ${usedArtistIds.size} different main artists.`);
  console.log('Bands, additional joint artists, poets, and occasions were also created where detected.');
  console.log('Each clip was inspected via caption + music-metadata.');
  process.exit(0);
}

startAdvancedBot();
