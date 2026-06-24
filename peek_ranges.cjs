const fs = require('fs');

const rangesPath = "C:\\Users\\YASH\\.gemini\\antigravity-cli\\brain\\8a8afd24-3e9c-4df5-b10e-a36d101f5302\\scratch\\extracted_ranges.txt";
const content = fs.readFileSync(rangesPath, 'utf-8');
const lines = content.split('\n');

for (let i = 0; i < 40; i++) {
  if (i < lines.length) {
    console.log(`[${i}] "${lines[i]}"`);
  }
}
