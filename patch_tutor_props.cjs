const fs = require('fs');

let code = fs.readFileSync('src/components/ui/AiPhysicsTutorModal.tsx', 'utf8');

const regex = /interface AiPhysicsTutorModalProps \{([\s\S]*?)\}/;
const replacement = `interface AiPhysicsTutorModalProps {$1  userName?: string;\n}`;
code = code.replace(regex, replacement);

const regex2 = /export const AiPhysicsTutorModal: React\.FC<AiPhysicsTutorModalProps> = \(\{([\s\S]*?)\}\) => \{/;
const replacement2 = `export const AiPhysicsTutorModal: React.FC<AiPhysicsTutorModalProps> = ({\n$1, userName\n}) => {`;
code = code.replace(regex2, replacement2);

fs.writeFileSync('src/components/ui/AiPhysicsTutorModal.tsx', code);
console.log('Patched AiPhysicsTutorModalProps');
