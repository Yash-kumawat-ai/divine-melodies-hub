const fs = require('fs');
const path = require('path');

const scratchDir = "C:\\Users\\YASH\\.gemini\\antigravity-cli\\brain\\8a8afd24-3e9c-4df5-b10e-a36d101f5302\\scratch";

const files = fs.readdirSync(scratchDir);
for (const file of files) {
  const fullPath = path.join(scratchDir, file);
  if (fs.statSync(fullPath).isFile()) {
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes("BlessingsPage") || content.includes("WALLPAPERS_LIST") || content.includes("LIVE_WALLPAPERS_LIST")) {
        console.log(`File ${file} contains keywords! Size = ${content.length}`);
        if (content.includes("LIVE_WALLPAPERS_LIST")) {
          console.log(`  -> Found LIVE_WALLPAPERS_LIST in ${file}!`);
        }
      }
    } catch(e) {}
  }
}
