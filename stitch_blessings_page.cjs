const fs = require('fs');

const rangesPath = "C:\\Users\\YASH\\.gemini\\antigravity-cli\\brain\\8a8afd24-3e9c-4df5-b10e-a36d101f5302\\scratch\\extracted_ranges.txt";
const content = fs.readFileSync(rangesPath, 'utf-8');

const sections = content.split('=========================================');
const lineMap = new Map();

console.log(`Found ${sections.length} potential sections.`);

sections.forEach(section => {
  if (!section.includes("File Path:")) return;
  
  // Extract path
  const pathMatch = section.match(/File Path: `file:\/\/\/(.*)`/);
  if (!pathMatch) return;
  const filePath = pathMatch[1];
  
  if (!filePath.includes("BlessingsPage.tsx")) {
    return; // skip non-BlessingsPage files
  }

  // Extract Total Bytes
  const bytesMatch = section.match(/Total Bytes: (\d+)/);
  if (!bytesMatch) return;
  const totalBytes = parseInt(bytesMatch[1]);
  if (totalBytes < 100000) {
    // Skip 1522-line version views
    return;
  }

  // Find the showing range
  const rangeMatch = section.match(/Showing lines (\d+) to (\d+)/);
  if (!rangeMatch) return;
  const start = parseInt(rangeMatch[1]);
  const end = parseInt(rangeMatch[2]);

  // Split section into lines
  const secLines = section.split('\n');
  let linesExtracted = 0;
  
  secLines.forEach(line => {
    // Strip carriage return
    const cleanLine = line.replace(/\r$/, '');
    
    // A line starting with line number, e.g. "123: text"
    const match = cleanLine.match(/^(\d+):\s?(.*)$/);
    if (match) {
      const lineNum = parseInt(match[1]);
      const lineText = match[2];
      
      if (lineNum >= start && lineNum <= end) {
        lineMap.set(lineNum, lineText);
        linesExtracted++;
      }
    }
  });
  console.log(`Parsed BlessingsPage.tsx (Total Bytes: ${totalBytes}) range ${start} to ${end}. Extracted ${linesExtracted} lines.`);
});

console.log(`Total unique BlessingsPage.tsx lines extracted from modified version: ${lineMap.size}`);

const sortedKeys = Array.from(lineMap.keys()).sort((a, b) => a - b);
console.log("Min line:", sortedKeys[0]);
console.log("Max line:", sortedKeys[sortedKeys.length - 1]);

// Let's identify the gaps up to 2598
const gaps = [];
let gapStart = null;
for (let i = 1; i <= 2598; i++) {
  if (!lineMap.has(i)) {
    if (gapStart === null) gapStart = i;
  } else {
    if (gapStart !== null) {
      gaps.push([gapStart, i - 1]);
      gapStart = null;
    }
  }
}
if (gapStart !== null) {
  gaps.push([gapStart, 2598]);
}

console.log("Gaps in BlessingsPage.tsx coverage (for modified version):");
gaps.forEach(g => {
  console.log(`  Lines ${g[0]} to ${g[1]} (${g[1] - g[0] + 1} lines)`);
});
