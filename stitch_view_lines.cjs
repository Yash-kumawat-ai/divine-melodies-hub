const fs = require('fs');

const rangesPath = "C:\\Users\\YASH\\.gemini\\antigravity-cli\\brain\\8a8afd24-3e9c-4df5-b10e-a36d101f5302\\scratch\\extracted_ranges.txt";
const content = fs.readFileSync(rangesPath, 'utf-8');

const lines = content.split('\n');
const lineMap = new Map();

let currentLogLine = "";
let currentRange = "";

for (const line of lines) {
  if (line.startsWith("Log Line:")) {
    currentLogLine = line;
    continue;
  }
  
  // Look for lines like "  123: const foo = bar;" or "123: const foo = bar;"
  const match = line.match(/^\s*(\d+):\s(.*)$/);
  if (match) {
    const lineNum = parseInt(match[1]);
    const lineText = match[2];
    
    // If we already have this line, print if it differs
    if (lineMap.has(lineNum) && lineMap.get(lineNum) !== lineText) {
      // console.log(`Conflict at line ${lineNum}: "${lineMap.get(lineNum)}" vs "${lineText}"`);
    }
    // Always overwrite with the latest viewed version (higher logLine index is later)
    lineMap.set(lineNum, lineText);
  }
}

console.log(`Stitched ${lineMap.size} lines from logs.`);
const sortedKeys = Array.from(lineMap.keys()).sort((a, b) => a - b);
console.log("Min line:", sortedKeys[0]);
console.log("Max line:", sortedKeys[sortedKeys.length - 1]);

// Let's identify the gaps
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

console.log("Gaps in line coverage:");
gaps.forEach(g => {
  console.log(`  Lines ${g[0]} to ${g[1]} (${g[1] - g[0] + 1} lines)`);
});
