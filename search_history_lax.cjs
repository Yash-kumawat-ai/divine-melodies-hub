const fs = require('fs');
const path = require('path');

const historyDir = "C:\\Users\\YASH\\AppData\\Roaming\\Code\\User\\History";
let matchCount = 0;

function searchDir(dir) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        searchDir(fullPath);
      } else {
        if (file === 'entries.json') {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const data = JSON.parse(content);
            if (data.resource && (data.resource.toLowerCase().includes('blessing') || data.resource.toLowerCase().includes('wallpaper'))) {
              console.log("Match in: " + fullPath);
              console.log("  Resource: " + data.resource);
              console.log("  Entries count: " + (data.entries ? data.entries.length : 0));
              matchCount++;
            }
          } catch (e) {}
        }
      }
    }
  } catch (e) {}
}

searchDir(historyDir);
console.log(`Total matching entries.json files found: ${matchCount}`);
