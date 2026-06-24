const fs = require('fs');

const rangesPath = "C:\\Users\\YASH\\.gemini\\antigravity-cli\\brain\\8a8afd24-3e9c-4df5-b10e-a36d101f5302\\scratch\\extracted_ranges.txt";
const content = fs.readFileSync(rangesPath, 'utf-8');

const sections = content.split('=========================================');
const lineMap = new Map();

sections.forEach(section => {
  if (!section.includes("File Path:") || !section.includes("BlessingsPage.tsx")) return;
  const secLines = section.split('\n');
  secLines.forEach(line => {
    const cleanLine = line.replace(/\r$/, '');
    const match = cleanLine.match(/^(\d+):\s?(.*)$/);
    if (match) {
      lineMap.set(parseInt(match[1]), match[2]);
    }
  });
});

function printRange(start, end) {
  console.log(`\n--- Log lines ${start} to ${end} ---`);
  for (let i = start; i <= end; i++) {
    if (lineMap.has(i)) {
      console.log(`${i}: ${lineMap.get(i)}`);
    } else {
      console.log(`${i}: [MISSING]`);
    }
  }
}

printRange(235, 265);
printRange(355, 400);
printRange(505, 515);
printRange(575, 585);
printRange(2115, 2125);
