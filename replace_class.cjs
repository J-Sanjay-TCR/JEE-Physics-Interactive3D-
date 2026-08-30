const fs = require('fs');
let code = fs.readFileSync('src/utils/audioPlayer.ts', 'utf8');
const classStart = code.indexOf('export class StreamAudioPlayer');
const classEnd = code.indexOf('/**\n * Returns available system English voices');
if (classStart > -1 && classEnd > -1) {
  const newClass = fs.readFileSync('patch_stream_player.ts', 'utf8');
  code = code.substring(0, classStart) + newClass + '\n' + code.substring(classEnd);
  fs.writeFileSync('src/utils/audioPlayer.ts', code);
  console.log('Replaced successfully');
} else {
  console.log('Could not find class boundaries');
}
