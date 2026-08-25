const fs = require('fs');
const path = require('path');

const curDist = path.resolve(__dirname, 'dist');
const webappDist = path.resolve(__dirname, 'webapp', 'dist');
const parentDist = path.resolve(__dirname, '..', 'dist');

console.log('[copy-dist] Syncing build output across all directories...');

let sourceDist = null;
if (fs.existsSync(path.join(curDist, 'index.html'))) {
  sourceDist = curDist;
} else if (fs.existsSync(path.join(webappDist, 'index.html'))) {
  sourceDist = webappDist;
} else if (fs.existsSync(path.join(parentDist, 'index.html'))) {
  sourceDist = parentDist;
}

if (sourceDist) {
  console.log(`[copy-dist] Found valid build in: ${sourceDist}`);
  const targets = [curDist, webappDist, parentDist];
  for (const target of targets) {
    if (target !== sourceDist) {
      try {
        fs.cpSync(sourceDist, target, { recursive: true });
        console.log(`[copy-dist] Successfully copied to: ${target}`);
      } catch (e) {
        console.log(`[copy-dist] Note: ${e.message}`);
      }
    }
  }
} else {
  console.error('[copy-dist] Warning: index.html not located');
}
