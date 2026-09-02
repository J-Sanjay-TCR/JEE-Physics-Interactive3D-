const fs = require('fs');

let code = fs.readFileSync('src/components/ui/AiPhysicsTutorModal.tsx', 'utf8');

const regex = /const initialGreeting = useMemo\(\(\) => \{([\s\S]*?)return `Oh wow, hey there!/;
const replacement = `const initialGreeting = useMemo(() => {
    const formulasList = currentConcept.formulas
      .slice(0, 2)
      .map((f) => \`$$\\mathbf{\${f.name}:} \\quad \${f.latex}$$\`)
      .join('\\n\\n');

    const greetingStr = userName ? \`Oh wow, hey there \${userName}!\` : \`Oh wow, hey there!\`;

    return \`\${greetingStr} Welcome to the deep dive on **\${currentConcept.title}**!`;
code = code.replace(regex, replacement);

const regex2 = /body: JSON\.stringify\(\{\n\s*messages: apiMessages,\n\s*conceptId: currentConcept\.id,\n\s*topic: currentConcept\.title,\n\s*params: currentParams,\n\s*tone: voiceTone,\n\s*searchEnabled: enableWebSearch,\n\s*\}\),/;
const replacement2 = `body: JSON.stringify({
          messages: apiMessages,
          conceptId: currentConcept.id,
          topic: currentConcept.title,
          params: currentParams,
          tone: voiceTone,
          searchEnabled: enableWebSearch,
          userName: userName,
        }),`;
code = code.replace(regex2, replacement2);

fs.writeFileSync('src/components/ui/AiPhysicsTutorModal.tsx', code);
console.log('Patched AiPhysicsTutorModal');
