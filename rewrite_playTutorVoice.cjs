const fs = require('fs');
let code = fs.readFileSync('src/utils/audioPlayer.ts', 'utf8');

const regex = /export async function playTutorVoice[\s\S]*?\}\n\n\/\*\*/;
const replacement = `export async function playTutorVoice(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  options?: { voice?: string; pitch?: number; rate?: number }
): Promise<void> {
  unlockAudio();
  stopAllAudio();

  const spokenText = cleanTextForSpeech(text);
  if (!spokenText.trim()) {
    if (onEnd) onEnd();
    return;
  }

  const player = new StreamAudioPlayer({
    voice: options?.voice,
    rate: options?.rate,
    pitch: options?.pitch,
    onStart,
    onEnd
  });

  player.feed(spokenText);
  player.flush();
}

/**`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/utils/audioPlayer.ts', code);
console.log('Replaced successfully');
