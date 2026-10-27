import fs from 'fs';
import path from 'path';

// Entry point for JEE 3D Physics Lab full-stack server
// In Dev: runs via `tsx server.ts` with Vite middleware mounted on port 3000
// In Production (Cloud Run): runs via `node server.ts` using the bundled dist/server.cjs

const isTsx = process.execArgv.some((a) => a.includes('tsx')) || Boolean(process.env.TSX);
const distServerPath = path.resolve(process.cwd(), 'dist/server.cjs');

if (!isTsx && fs.existsSync(distServerPath)) {
  // Production runtime (Cloud Run container execution)
  await import(`file://${distServerPath}`);
} else {
  // Development runtime
  await import('./server/devServer.ts');
}
