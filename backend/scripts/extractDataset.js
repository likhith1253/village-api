/**
 * Extract the bundled Census 2011 dataset (data/all-india-villages-master-list-excel.zip)
 * into backend/data/ so that backend/data/dataset/Rdir_2011_*.xls exist.
 *
 * Usage: npm run data:extract            (or: node scripts/extractDataset.js [outDir])
 * Uses a system unzip tool (unzip, bsdtar, or PowerShell Expand-Archive) to avoid extra dependencies.
 */
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const zipPath = path.join(here, '..', 'data', 'all-india-villages-master-list-excel.zip');
const outDir = path.resolve(process.argv[2] || path.join(here, '..', 'data'));

if (!fs.existsSync(zipPath)) {
  console.error(`Archive not found: ${zipPath}`);
  process.exit(1);
}
fs.mkdirSync(outDir, { recursive: true });

const attempts = [
  ['unzip', ['-q', '-o', zipPath, 'dataset/*', '-d', outDir]],
  ['tar', ['-xf', zipPath, '-C', outDir, 'dataset']],
  ['powershell', ['-NoProfile', '-Command', `Expand-Archive -LiteralPath '${zipPath}' -DestinationPath '${outDir}' -Force`]]
];

let ok = false;
for (const [cmd, args] of attempts) {
  const res = spawnSync(cmd, args, { stdio: 'ignore' });
  if (res.status === 0) { ok = true; break; }
}
if (!ok) {
  console.error('Could not extract the archive: install `unzip` or extract it manually into backend/data/.');
  process.exit(1);
}

fs.rmSync(path.join(outDir, '__MACOSX'), { recursive: true, force: true });
const files = fs.readdirSync(path.join(outDir, 'dataset')).filter((f) => f.endsWith('.xls'));
console.log(`Extracted ${files.length} .xls files to ${path.join(outDir, 'dataset')}`);
