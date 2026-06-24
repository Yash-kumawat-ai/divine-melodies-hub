const fs = require('fs');

const rangesPath = "C:\\Users\\YASH\\.gemini\\antigravity-cli\\brain\\8a8afd24-3e9c-4df5-b10e-a36d101f5302\\scratch\\extracted_ranges.txt";
const content = fs.readFileSync(rangesPath, 'utf-8');

const sections = content.split('=========================================');
for (const section of sections) {
  if (section.includes("BlessingsPage.tsx") && section.includes("Showing lines 2120 to 2323")) {
    const lines = section.split('\n');
    console.log("Found section!");
    const targetLine = lines[8];
    console.log(`targetLine: "${targetLine}"`);
    console.log("Char codes:", Array.from(targetLine).map(c => c.charCodeAt(0)));
    break;
  }
}
