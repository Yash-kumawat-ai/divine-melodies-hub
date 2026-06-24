const fs = require('fs');
const path = require('path');

const historyDir = "C:\\Users\\YASH\\AppData\\Roaming\\Code\\User\\History";

let found = [];

function searchDir(dir) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        searchDir(fullPath);
      } else {
        if (stat.size > 50000 && stat.size < 200000) {
          try {
            // Read first 2000 characters
            const fd = fs.openSync(fullPath, 'r');
            const buffer = Buffer.alloc(2000);
            fs.readSync(fd, buffer, 0, 2000, 0);
            fs.closeSync(fd);
            const text = buffer.toString('utf8');
            if (text.includes('LIVE_WALLPAPERS_LIST')) {
              console.log("Found LIVE_WALLPAPERS_LIST in history file: " + fullPath);
              found.push({ path: fullPath, mtime: stat.mtime });
            }
          } catch (e) {}
        }
      }
    }
  } catch (e) {}
}

searchDir(historyDir);

if (found.length > 0) {
  found.sort((a, b) => b.mtime - a.mtime);
  console.log("Found matches sorted by modification time:");
  found.forEach(f => {
    console.log(`${f.path} - Modified: ${f.mtime.toISOString()}`);
  });
  // Copy the latest one to a recovered file
  const latest = found[0].path;
  const outPath = "C:\\Users\\YASH\\.gemini\\antigravity-cli\\brain\\8a8afd24-3e9c-4df5-b10e-a36d101f5302\\scratch\\recovered_blessings_page.txt";
  fs.copyFileSync(latest, outPath);
  console.log(`Copied latest history file ${latest} to ${outPath}`);
} else {
  console.log("No matching files found in history.");
}
