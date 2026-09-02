const fs = require('fs');

let code = fs.readFileSync('src/components/ui/AiPhysicsTutorModal.tsx', 'utf8');

const regex = /body: JSON\.stringify\(\{\n\s*question: textToSend,\n\s*conceptTitle: currentConcept\.title,\n\s*currentParams,\n\s*thinkingMode,\n\s*enableWebSearch,\n\s*isVoiceInput: wasVoiceInput,\n\s*\}\),/;
const replacement = `body: JSON.stringify({
          question: textToSend,
          conceptTitle: currentConcept.title,
          currentParams,
          thinkingMode,
          enableWebSearch,
          isVoiceInput: wasVoiceInput,
          userName: userName,
        }),`;

if (code.match(regex)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('src/components/ui/AiPhysicsTutorModal.tsx', code);
    console.log('Fixed fetch body');
} else {
    console.log('Regex did not match');
}
