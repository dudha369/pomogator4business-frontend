// Один стиль импортов: всё внутри src/ — через алиас `@/`.
// Относительные пути (`./x`, `../x`) и голый `src/...` запрещены.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const IMPORT = /(?:from|import)\s*\(?\s*['"]((?:\.{1,2}\/|src\/)[^'"]*)['"]/g;
const bad = [];

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'generated') walk(path);
    } else if (/\.(ts|tsx|css)$/.test(entry.name)) {
      for (const match of readFileSync(path, 'utf8').matchAll(IMPORT)) {
        bad.push(`${path}: ${match[1]}`);
      }
    }
  }
}

walk('src');
if (bad.length > 0) {
  console.error(`Используйте '@/' вместо относительных путей:\n${bad.join('\n')}`);
  process.exit(1);
}
