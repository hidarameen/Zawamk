const fs = require('fs');
const path = require('path');

const dir = '/home/u0_a398/MusicApp/client/src/app/pages/admin';
const files = fs.readdirSync(dir).filter(f => f.startsWith('Admin') && f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Add import if not present
  if (!content.includes("import { FileUpload }")) {
    const importStmt = "import { FileUpload } from '../../components/ui/FileUpload';\n";
    content = content.replace(/(import .*;\n)+/, match => match + importStmt);
    changed = true;
  }

  // Replace avatar input
  const avatarRegex = /<input\s+value=\{form\.avatar\}\s+onChange=\{e => setForm\(f => \(\{ \.\.\.f, avatar: e\.target\.value \}\)\)\}\s+placeholder="https:\/\/\.\.\."\s+className="[^"]+"\s+\/>/g;
  if (avatarRegex.test(content)) {
    content = content.replace(avatarRegex, `<FileUpload value={form.avatar} onChange={(url) => setForm(f => ({ ...f, avatar: url }))} accept="image/*" />`);
    changed = true;
  }

  // Replace coverImage input
  const coverImageRegex = /<input\s+value=\{form\.coverImage\}\s+onChange=\{e => setForm\(f => \(\{ \.\.\.f, coverImage: e\.target\.value \}\)\)\}\s+placeholder="https:\/\/\.\.\."\s+className="[^"]+"\s+\/>/g;
  if (coverImageRegex.test(content)) {
    content = content.replace(coverImageRegex, `<FileUpload value={form.coverImage} onChange={(url) => setForm(f => ({ ...f, coverImage: url }))} accept="image/*" />`);
    changed = true;
  }

  // Replace coverUrl input
  const coverUrlRegex = /<input\s+value=\{form\.coverUrl\}\s+onChange=\{e => setForm\(f => \(\{ \.\.\.f, coverUrl: e\.target\.value \}\)\)\}\s+placeholder="https:\/\/\.\.\."\s+className="[^"]+"\s+\/>/g;
  if (coverUrlRegex.test(content)) {
    content = content.replace(coverUrlRegex, `<FileUpload value={form.coverUrl} onChange={(url) => setForm(f => ({ ...f, coverUrl: url }))} accept="image/*" />`);
    changed = true;
  }

  // Replace audioUrl input
  const audioUrlRegex = /<input\s+value=\{form\.audioUrl\}\s+onChange=\{e => setForm\(f => \(\{ \.\.\.f, audioUrl: e\.target\.value \}\)\)\}\s+placeholder="https:\/\/\.\.\."\s+className="[^"]+"\s+\/>/g;
  if (audioUrlRegex.test(content)) {
    content = content.replace(audioUrlRegex, `<FileUpload value={form.audioUrl} onChange={(url) => setForm(f => ({ ...f, audioUrl: url }))} accept="audio/*" />`);
    changed = true;
  }

  // Replace videoUrl input
  const videoUrlRegex = /<input\s+value=\{form\.videoUrl\}\s+onChange=\{e => setForm\(f => \(\{ \.\.\.f, videoUrl: e\.target\.value \}\)\)\}\s+placeholder="https:\/\/\.\.\."\s+className="[^"]+"\s+\/>/g;
  if (videoUrlRegex.test(content)) {
    content = content.replace(videoUrlRegex, `<FileUpload value={form.videoUrl} onChange={(url) => setForm(f => ({ ...f, videoUrl: url }))} accept="video/*" />`);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated', file);
  }
}
