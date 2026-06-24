const fs = require('fs');
const path = require('path');

const storageDir = "C:\\Users\\YASH\\AppData\\Roaming\\Code\\User\\workspaceStorage";

function searchDir(dir) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        searchDir(fullPath);
      } else {
        if (stat.size > 20000 && stat.size < 250000) {
          try {
            const fd = fs.openSync(fullPath, 'r');
            const buffer = Buffer.alloc(Math.min(stat.size, 5000));
            fs.readSync(fd, buffer, 0, buffer.length, 0);
            fs.closeSync(fd);
            const text = buffer.toString('utf8');
            if (text.includes('BlessingsPage') || text.includes('LIVE_WALLPAPERS_LIST')) {
              console.log("Found in workspaceStorage: " + fullPath + " size = " + stat.size);
              // Read whole file
              const fullContent = fs.readFileSync(fullPath, 'utf8');
              if (fullContent.includes('1: import React') || fullContent.includes('import React, { useState')) {
                console.log("-> Appears to be the TSX file!");
                const outPath = "C:\\Users\\YASH\\.gemini\\antigravity-cli\\brain\\8a8afd24-3e9c-4df5-b10e-a36d101f5302\\scratch\\recovered_workspace_storage.txt";
                fs.writeFileSync(outPath, fullContent);
                console.log("Saved to " + outPath);
              }
            }
          } catch(e) {}
        }
      }
    }
  } catch(e) {}
}

searchDir(storageDir);
