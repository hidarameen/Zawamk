import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { parseBuffer } from 'music-metadata';
import crypto from 'crypto';

const apiId = 2040;
const apiHash = 'b18441a1ff607e10a989891a5462e627';
const sessionString = '1BAAOMTQ5LjE1NC4xNjcuOTEAUF74KVQcKDYSTQYeuuoq1VXeajgZ0jltbgeklz+TUGwH1HIGjSVDq1oHc7TRWjamCK0z/6VGEP+nf1Gd97l9net6YPsu6vRiyPHGBJdb96cYKnpHEinh5+Bvm6lX6CZsroKrRpQC1QIiCvl4dqlVyjs+HNnSzMD+MeimeJqYgtKzpMotOJREMiX5JtLaLleaaR5mw3KZSs3k54KbpUO1xx0dPcQVh72fktbfZlLCu/IGkPh5/Mhh2TFfI96wasglypriVXZRUBuOUa04jzMR6DE2zUObJGUljo71EOxG13VvZebtskSWVEkIWzXy96lNOvid/RhkzYeClaEOZFx1x1s=';
const stringSession = new StringSession(sessionString); 

const prisma = new PrismaClient();

async function startAdvancedBot() {
  console.log("Starting Advanced Telegram Userbot for Issa Al-Laith...");
  
  const client = new TelegramClient(stringSession, apiId, apiHash, { connectionRetries: 5 });
  await client.connect();

  console.log("Connected using saved session!");

  const channelUsername = 'zwamlallaith';
  const limit = 20;
  
  console.log(`Fetching profile photo of ${channelUsername}...`);
  let artistAvatarUrl = '';
  try {
      const photoBuffer = await client.downloadProfilePhoto(channelUsername);
      if (photoBuffer) {
          const fileName = `artist_issa_${crypto.randomBytes(4).toString('hex')}.jpg`;
          const photoPath = path.join(__dirname, '../../client/public/uploads', fileName);
          fs.mkdirSync(path.dirname(photoPath), { recursive: true });
          fs.writeFileSync(photoPath, photoBuffer as Buffer);
          artistAvatarUrl = `/uploads/${fileName}`;
          console.log(`Saved channel profile photo to ${artistAvatarUrl}`);
      }
  } catch (e) {
      console.log('Failed to fetch profile photo', e);
  }

  const artistName = 'عيسى الليث';
  let artist = await prisma.artist.findFirst({ where: { name: artistName } });
  if (!artist) {
      artist = await prisma.artist.create({
          data: { name: artistName, bio: 'منشد وزامل يمني', avatar: artistAvatarUrl, coverImage: artistAvatarUrl }
      });
      console.log(`Created artist: ${artistName}`);
  } else {
      if (artistAvatarUrl) {
          artist = await prisma.artist.update({
              where: { id: artist.id },
              data: { avatar: artistAvatarUrl, coverImage: artistAvatarUrl }
          });
          console.log(`Updated artist profile photo: ${artistName}`);
      }
  }

  console.log(`Fetching latest messages to find ${limit} audios from ${channelUsername}...`);
  const messages = await client.getMessages(channelUsername, { limit: 300 }); 

  let processed = 0;
  for (const message of messages) {
    if (processed >= limit) break;
    
    if (message.media && (message.media as any).document && (message.media as any).document.mimeType.includes('audio')) {
      const text = message.message || '';
      console.log(`\nFound audio: ${text.substring(0, 50).replace(/\n/g, ' ')}...`);

      const poetMatch = text.match(/(?:كلمات|الشاعر|كلمات الشاعر)[:\-\|]?\s*([^\n#]+)/);
      const occasionMatch = text.match(/(?:مناسبة|المناسبة|بمناسبة)[:\-\|]?\s*([^\n#]+)/);

      const poetName = poetMatch ? poetMatch[1].trim() : null;
      const occasionName = occasionMatch ? occasionMatch[1].trim() : null;

      if (poetName) {
        let poet = await prisma.poet.findFirst({ where: { name: poetName } });
        if (!poet) {
            await prisma.poet.create({ data: { name: poetName, bio: '', avatar: '', coverImage: '' } });
        }
      }

      if (occasionName) {
        let occasion = await prisma.occasion.findFirst({ where: { title: occasionName } });
        if (!occasion) {
            await prisma.occasion.create({ data: { title: occasionName, date: new Date().toISOString(), description: '', coverUrl: '' } });
        }
      }

      let title = text.split('\n')[0].trim();
      if (!title || title.length > 100) title = 'زامل ' + artistName + ' ' + (processed + 1);
      title = title.replace(/#/g, '').trim();

      console.log(`Downloading audio...`);
      const buffer = await client.downloadMedia(message);
      
      if (buffer) {
        let duration = 0;
        let coverUrl = '';
        
        try {
          const thumbBuffer = await client.downloadMedia(message, { thumb: 0 });
          if (thumbBuffer && (thumbBuffer as Buffer).length > 0) {
            const fileName = `cover_${crypto.randomBytes(8).toString('hex')}.jpg`;
            const coverPath = path.join(__dirname, '../public/uploads', fileName);
            fs.mkdirSync(path.dirname(coverPath), { recursive: true });
            fs.writeFileSync(coverPath, thumbBuffer as Buffer);
            coverUrl = `/uploads/${fileName}`;
          }
        } catch (e) {
          // Ignore thumb error
        }

        try {
          if (!coverUrl) {
            const metadata = await parseBuffer(buffer as Buffer);
            duration = Math.floor(metadata.format.duration || 0);
            
            if (metadata.common.picture && metadata.common.picture.length > 0) {
              const picture = metadata.common.picture[0];
              const fileName = `cover_${crypto.randomBytes(8).toString('hex')}.${picture.format.split('/')[1] || 'jpg'}`;
              const coverPath = path.join(__dirname, '../public/uploads', fileName);
              fs.mkdirSync(path.dirname(coverPath), { recursive: true });
              fs.writeFileSync(coverPath, picture.data);
              coverUrl = `/uploads/${fileName}`;
            }
          } else {
             const metadata = await parseBuffer(buffer as Buffer);
             duration = Math.floor(metadata.format.duration || 0);
          }
        } catch (e) {
          console.log(`Warning: Failed to process metadata (MIME type issue), skipping ID3 tags...`);
        }

        try {
          const audioFileName = `audio_issa_${crypto.randomBytes(8).toString('hex')}.mp3`;
          const audioPath = path.join(__dirname, '../public/uploads', audioFileName);
          fs.writeFileSync(audioPath, buffer as Buffer);
          const audioUrl = `/uploads/${audioFileName}`;

          await prisma.track.create({
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
        } catch (e) {
          console.log(`Failed to save to database or file:`, e);
        }
      }
    }
  }

  console.log(`\nFinished importing ${processed} tracks for ${artistName}!`);
  process.exit(0);
}

startAdvancedBot();
