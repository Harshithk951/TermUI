import { readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname, basename } from 'node:path';

const PACKAGES_DIR = join(import.meta.dirname, '../packages');

interface FileInfo {
    path: string;
    packageName: string;
    relativeToSrc: string;
}

function walkDir(dir: string, fileList: string[] = []): string[] {
    const files = readdirSync(dir);
    for (const file of files) {
        const filePath = join(dir, file);
        if (statSync(filePath).isDirectory()) {
            if (file !== 'node_modules' && file !== 'dist' && file !== '__snapshots__') {
                walkDir(filePath, fileList);
            }
        } else {
            fileList.push(filePath);
        }
    }
    return fileList;
}

function scanForUntestedFiles(): FileInfo[] {
    const untested: FileInfo[] = [];
    const packages = readdirSync(PACKAGES_DIR);

    for (const pkg of packages) {
        const srcPath = join(PACKAGES_DIR, pkg, 'src');
        if (!existsSync(srcPath)) continue;

        const allFiles = walkDir(srcPath);
        for (const file of allFiles) {
            const ext = extname(file);
            if (ext !== '.ts' && ext !== '.tsx') continue;

            const name = basename(file, ext);
            // Ignore tests, indexes, declarations, shims
            if (
                name.endsWith('.test') ||
                name.endsWith('.spec') ||
                name === 'index' ||
                file.endsWith('.d.ts') ||
                name.endsWith('-shim')
            ) {
                continue;
            }

            // Check if test companion exists in the same directory
            const testPathTs = join(dirName(file), `${name}.test.ts`);
            const testPathTsx = join(dirName(file), `${name}.test.tsx`);

            if (!existsSync(testPathTs) && !existsSync(testPathTsx)) {
                const repoRoot = join(PACKAGES_DIR, '..') + '/';
                untested.push({
                    path: file,
                    relativePath: file.replace(repoRoot, ''),
                    packageName: `@termuijs/${pkg}`,
                    relativeToSrc: file.replace(srcPath + '/', ''),
                });
            }
        }
    }

    return untested;
}

function dirName(path: string): string {
    return path.substring(0, path.lastIndexOf('/'));
}

// Main execution
const untestedFiles = scanForUntestedFiles();
console.log(JSON.stringify(untestedFiles.slice(0, 2), null, 2));
