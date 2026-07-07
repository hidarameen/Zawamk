import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import input from 'input';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { parseBuffer } from 'music-metadata';
import crypto from 'crypto';

const apiId = 2040; // Default Telegram API ID for testing (official apps)
const apiHash = 'b18441a1ff607e10a989891a5462e627'; // Default API Hash
const stringSession = new StringSession(''); 

const prisma = new PrismaClient();

async function startBot() {
  console.log("Starting Telegram Userbot...");
  
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => await input.text('Enter your phone number (e.g. +967...): '),
    password: async () => await input.text('Enter your password (if 2FA enabled): '),
    phoneCode: async () => await input.text('Enter the code you received on Telegram: '),
    onError: (err) => console.log(err),
  });

  console.log("You are now connected!");
  console.log("Session String (save this for future use):", client.session.save());

  const channelUsername = await input.text('Enter the channel username or link to fetch from: ');
  const artistName = await input.text('Enter the name of the Artist to assign these tracks to: ');
  
  // Find or create artist
  let artist = await prisma.artist.findFirst({ where: { name: artistName } });
  if (!artist) {
    artist = await prisma.artist.create({
      data: { name: artistName, bio: '', avatar: '', coverImage: '' }
    });
    console.log(`Created new artist: ${artist.name}`);
  }

  const limit = parseInt(await input.text('How many audio files to fetch? (e.g. 10): '), 10) || 10;
  
  console.log(`Fetching latest ${limit} messages from ${channelUsername}...`);
  const messages = await client.getMessages(channelUsername, { limit: limit * 2 }); // Get more to account for non-audio messages

  let processed = 0;
  for (const message of messages) {
    if (processed >= limit) break;
    
    if (message.media && (message.media as any).document && (message.media as any).document.mimeType.includes('audio')) {
      console.log(`Downloading audio: ${message.message || 'Untitled'}...`);
      const buffer = await client.downloadMedia(message);
      
      if (buffer) {
        // Parse ID3 metadata
        try {
          const metadata = await parseBuffer(buffer as Buffer, 'audio/mpeg');
          const title = metadata.common.title || message.message || 'أغنية غير مسماة';
          const duration = Math.floor(metadata.format.duration || 0);
          
          let coverUrl = '';
          // Extract cover art if exists
          if (metadata.common.picture && metadata.common.picture.length > 0) {
            const picture = metadata.common.picture[0];
            const fileName = `cover_${crypto.randomBytes(8).toString('hex')}.${picture.format.split('/')[1] || 'jpg'}`;
            const coverPath = path.join(__dirname, '../../client/public/uploads', fileName);
            fs.mkdirSync(path.dirname(coverPath), { recursive: true });
            fs.writeFileSync(coverPath, picture.data);
            coverUrl = `/uploads/${fileName}`;
            console.log(`Extracted cover art: ${fileName}`);
          }

          // Save audio file locally (In real app, you might upload to S3 or a specific folder)
          const audioFileName = `audio_${crypto.randomBytes(8).toString('hex')}.mp3`;
          const audioPath = path.join(__dirname, '../../client/public/uploads', audioFileName);
          fs.writeFileSync(audioPath, buffer as Buffer);
          const audioUrl = `/uploads/${audioFileName}`;

          // Add to DB
          await prisma.track.create({
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
        } catch (e) {
          console.log(`Failed to process metadata for a message:`, e);
        }
      }
    }
  }

  console.log(`Finished importing ${processed} tracks!`);
  process.exit(0);
}

startBot();
