import { readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const partsDir = '/Users/jbogaty/src/arcade-cabinet/iron-frontier/assets/models/western/parts';
const outFile = '/Users/jbogaty/src/arcade-cabinet/iron-frontier/assets/models/western/parts/manifest.json';

const files = (await readdir(partsDir))
  .filter((file) => file.endsWith('.glb'))
  .sort();

await writeFile(outFile, JSON.stringify({ files }, null, 2));
console.log(`Wrote ${files.length} entries to ${outFile}`);
