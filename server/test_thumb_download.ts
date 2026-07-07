import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import * as fs from 'fs';

const apiId = 2040;
const apiHash = 'b18441a1ff607e10a989891a5462e627';
const sessionString = '1BAAOMTQ5LjE1NC4xNjcuOTEAUF74KVQcKDYSTQYeuuoq1VXeajgZ0jltbgeklz+TUGwH1HIGjSVDq1oHc7TRWjamCK0z/6VGEP+nf1Gd97l9net6YPsu6vRiyPHGBJdb96cYKnpHEinh5+Bvm6lX6CZsroKrRpQC1QIiCvl4dqlVyjs+HNnSzMD+MeimeJqYgtKzpMotOJREMiX5JtLaLleaaR5mw3KZSs3k54KbpUO1xx0dPcQVh72fktbfZlLCu/IGkPh5/Mhh2TFfI96wasglypriVXZRUBuOUa04jzMR6DE2zUObJGUljo71EOxG13VvZebtskSWVEkIWzXy96lNOvid/RhkzYeClaEOZFx1x1s=';
const stringSession = new StringSession(sessionString); 

async function main() {
  const client = new TelegramClient(stringSession, apiId, apiHash, { connectionRetries: 5 });
  await client.connect();
  const messages = await client.getMessages('zwamlallaith', { limit: 10 });
  for (const m of messages) {
    if (m.media && (m.media as any).document) {
       console.log('Trying to download thumb...');
       try {
         const thumbBuffer = await client.downloadMedia(m, { thumb: 'm' });
         if (thumbBuffer) {
            console.log('Success! Size:', thumbBuffer.length);
            fs.writeFileSync('thumb.jpg', thumbBuffer);
         }
       } catch(e) { console.log(e); }
       break;
    }
  }
  process.exit(0);
}
main();
