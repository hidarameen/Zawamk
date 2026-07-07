import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import * as fs from 'fs';
import * as path from 'path';

const apiId = 2040;
const apiHash = 'b18441a1ff607e10a989891a5462e627';
const sessionString = '1BAAOMTQ5LjE1NC4xNjcuOTEAUF74KVQcKDYSTQYeuuoq1VXeajgZ0jltbgeklz+TUGwH1HIGjSVDq1oHc7TRWjamCK0z/6VGEP+nf1Gd97l9net6YPsu6vRiyPHGBJdb96cYKnpHEinh5+Bvm6lX6CZsroKrRpQC1QIiCvl4dqlVyjs+HNnSzMD+MeimeJqYgtKzpMotOJREMiX5JtLaLleaaR5mw3KZSs3k54KbpUO1xx0dPcQVh72fktbfZlLCu/IGkPh5/Mhh2TFfI96wasglypriVXZRUBuOUa04jzMR6DE2zUObJGUljo71EOxG13VvZebtskSWVEkIWzXy96lNOvid/RhkzYeClaEOZFx1x1s=';
const stringSession = new StringSession(sessionString);

async function fetchProfilePic() {
  console.log("Connecting to Telegram...");
  const client = new TelegramClient(stringSession, apiId, apiHash, { connectionRetries: 5 });
  await client.connect();
  console.log("Connected!");

  const channelUsername = 'zawamlansarallah';
  try {
    const buffer = await client.downloadProfilePhoto(channelUsername);
    if (buffer) {
      const destPath = path.join(__dirname, '../../client/public/uploads/zawamlansarallah_profile.jpg');
      fs.writeFileSync(destPath, buffer);
      console.log(`Saved profile picture to ${destPath}`);
    } else {
      console.log("No profile picture found or failed to download.");
    }
  } catch (err) {
    console.error("Error downloading profile picture:", err);
  }

  await client.disconnect();
}

fetchProfilePic();
