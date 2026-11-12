/**
 * Copy the licensed PP Model fonts into website/font/private/ before a dev or build run.
 *
 * PP Model Sans and PP Model Mono are commercial fonts and this repository is public,
 * so the files never enter git (website/font/private/ is ignored). They are read from
 * PRIVATE_FONT_DIR, or from the per-user Windows font folder FontBase installs into.
 *
 * A build without them fails here on purpose: a missing @font-face file would not
 * break the build, the site would just ship in a fallback font.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const FILES = [
    'PPModelSans-Light.otf',
    'PPModelSans-Medium.otf',
    'PPModelMono-Light.otf',
    'PPModelMono-Medium.otf'
];

const source = process.env.PRIVATE_FONT_DIR
    || path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'Microsoft', 'Windows', 'Fonts', 'FontBase');
const target = path.join(import.meta.dirname, '..', 'website', 'font', 'private');

const missing = FILES.filter((file) => !fs.existsSync(path.join(source, file)));
if (missing.length) {
    console.error(`private-fonts: missing in ${source}: ${missing.join(', ')}`);
    console.error('Set PRIVATE_FONT_DIR to a folder that holds the licensed PP Model files.');
    process.exit(1);
}

fs.mkdirSync(target, { recursive: true });
for (const file of FILES) fs.copyFileSync(path.join(source, file), path.join(target, file));
console.log(`private-fonts: ${FILES.length} files from ${source}`);
