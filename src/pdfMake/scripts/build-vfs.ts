import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * CONFIG
 */
const sourcePath = process.argv[2] || '../fonts';
const outputFile = process.argv[3] || '../vfs_fonts.ts';
const allowedExt = /\.(ttf|otf|woff2?|png|jpg|jpeg|svg)$/i;

/**
 * VALIDATION
 */
if (!fs.existsSync(sourcePath)) {
    console.error(`❌ Source path "${sourcePath}" not found`);
    process.exit(1);
}

/**
 * RECURSIVE FILE WALK
 */
function walk(dir: string): string[] {
    let results: string[] = [];

    for (const file of fs.readdirSync(dir)) {
        const full = path.join(dir, file);
        const stat = fs.statSync(full);

        if (stat.isDirectory()) {
            results = results.concat(walk(full));
        } else {
            if (allowedExt.test(full)) {
                results.push(full);
            }
        }
    }

    return results;
}

/**
 * HASH (for caching)
 */
function hashFiles(files: string[]) {
    const hash = crypto.createHash('md5');

    for (const f of files) {
        hash.update(fs.readFileSync(f));
    }

    return hash.digest('hex');
}

/**
 * BUILD
 */
const files = walk(sourcePath).sort(); // deterministic order
const currentHash = hashFiles(files);

// cache file
const cacheFile = outputFile + '.hash';

if (fs.existsSync(cacheFile)) {
    const oldHash = fs.readFileSync(cacheFile, 'utf-8');
    if (oldHash === currentHash) {
        console.log('⚡ VFS unchanged, skipping build');
        process.exit(0);
    }
}

const vfs: Record<string, string> = {};

for (const fullPath of files) {
    const relative = path.basename(fullPath);
    const base64 = fs.readFileSync(fullPath).toString('base64');
    vfs[relative] = base64;
}

/**
 * OUTPUT (TS + ESM)
 */
const content = `/* AUTO-GENERATED FILE. DO NOT EDIT */
const vfs: Record<string, string> = ${JSON.stringify(vfs, null, 2)};

export default vfs;
`;

fs.writeFileSync(outputFile, content);
fs.writeFileSync(cacheFile, currentHash);

console.log(`✅ VFS built: ${files.length} files → ${outputFile}`);
