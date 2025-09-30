import fs from 'fs';

export function getFileDir(src=''){
    const files = fs.readdirSync(src, { withFileTypes: true });
    return files.filter(dir => dir.isDirectory()).map(dir => dir.name);
}