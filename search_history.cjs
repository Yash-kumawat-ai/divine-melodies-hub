const fs = require('fs');
const path = require('path');

const historyDir = "C:\\Users\\YASH\\AppData\\Roaming\\Code\User\\History";
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
        if (file === 'entries.json') {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const data = JSON.parse(content);
            if (data.resource && data.resource.toLowerCase().includes('blessingspage.tsx')) {
              console.log("Found entries.json for BlessingsPage.tsx at: " + fullPath);
              if (data.entries && data.entries.length > 0) {
                data.entries.forEach(entry => {
                  const entryFile = path.join(dir, entry.id);
                  if (fs.existsSync(entryFile)) {
                    const entryStat = fs.statSync(entryFile);
                    found.push({
                      path: entryFile,
                      timestamp: entry.timestamp,
                      size: entryStat.size
                    });
                  }
                });
              }
            }
          } catch (e) {
            // ignore
          }
        }
      }
    }
  } catch (e) {}
}

searchDir(historyDir);

if (found.length > 0) {
  found.sort((a, b) => b.timestamp - a.timestamp);
  console.log(`Found ${found.length} history entries:`);
  found.forEach((f, idx) => {
    console.log(`[${idx}] File: ${f.path} - Timestamp: ${new Date(f.timestamp).toISOString()} - Size: ${f.size} bytes`);
  });

  // copy the latest one
  const latest = found[0].path;
  const outPath = path.join(__dirname, "src", "pages", "BlessingsPage.tsx");
  fs.copyFileSync(latest, outPath);
  console.log(`\nSUCCESS! Copied latest history entry (${latest}) directly to ${outPath}`);
} else {
  console.log("No history entries found.");
}
