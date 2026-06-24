const fs = require('fs');
const path = require('path');

const projectDir = "C:\\Users\\YASH\\Desktop\\bhajanwebsite\\divine-melodies-hub";

function searchDir(dir) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file === 'node_modules' || file === '.git' || file === 'dist') continue;
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        searchDir(fullPath);
      } else {
        if (file.toLowerCase().includes('blessingspage') || file.toLowerCase().includes('blessing')) {
          console.log(`Found file: ${fullPath} (Size: ${stat.size} bytes)`);
        }
      }
    }
  } catch(e) {}
}

searchDir(projectDir);
