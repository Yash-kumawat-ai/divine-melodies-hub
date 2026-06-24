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
        if (file === 'entries.json') {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const data = JSON.parse(content);
            if (data.resource && data.resource.includes('BlessingsPage.tsx')) {
              console.log("Found entries.json for BlessingsPage.tsx at: " + fullPath);
              if (data.entries && data.entries.length > 0) {
                // sort entries by timestamp descending
                data.entries.sort((a, b) => b.timestamp - a.timestamp);
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
            console.error("Error reading JSON from " + fullPath + ": " + e.message);
          }
        }
      }
    }
  } catch (e) {}
}

searchDir(historyDir);

if (found.length > 0) {
  // Sort found entries by timestamp descending
  found.sort((a, b) => b.timestamp - a.timestamp);
  console.log(`Found ${found.length} history entries for BlessingsPage.tsx:`);
  found.forEach((f, idx) => {
    console.log(`[${idx}] File: ${f.path} - Timestamp: ${new Date(f.timestamp).toISOString()} - Size: ${f.size} bytes`);
  });

  // Let's copy the latest one (which is index 0)
  const latest = found[0].path;
  const outPath = "C:\\Users\\YASH\\.gemini\\antigravity-cli\\brain\\8a8afd24-3e9c-4df5-b10e-a36d101f5302\\scratch\\recovered_blessings_page.txt";
  fs.copyFileSync(latest, outPath);
  console.log(`\nSUCCESS! Copied latest history entry (${latest}) to ${outPath}`);
} else {
  console.log("No history entries found for BlessingsPage.tsx.");
}
