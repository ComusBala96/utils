import fs from 'fs'
import path from 'path'

export function getFiles(dir, ext) {
    return fs.readdirSync(dir)
        .filter(file => file.endsWith(ext))
        .map(file => path.join(dir, file).replace(/^.*resources[\\/]/, 'resources/'))
}