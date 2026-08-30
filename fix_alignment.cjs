const fs = require('fs');
let code = fs.readFileSync('src/utils/audioPlayer.ts', 'utf8');

code = code.replace(
  `    if (this.onChunkCallback) {
      this.onChunkCallback(chunkIdx, item.text);
    }

    const buffer = await item.audioPromise;`,
  `    const buffer = await item.audioPromise;
    if (this.isStopped) return;

    if (chunkIdx === 0 && this.onStartCallback) {
      this.onStartCallback();
    }
    if (this.onChunkCallback) {
      this.onChunkCallback(chunkIdx, item.text);
    }`
);

// We need to remove the first onStartCallback too
code = code.replace(
  `    if (chunkIdx === 0 && this.onStartCallback) {
      this.onStartCallback();
    }`,
  ``
);

fs.writeFileSync('src/utils/audioPlayer.ts', code);
console.log('Replaced successfully');
