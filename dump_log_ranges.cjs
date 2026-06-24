const fs = require('fs');
const readline = require('readline');

const logPath = "C:\\Users\\YASH\\.gemini\\antigravity-cli\\brain\\8a8afd24-3e9c-4df5-b10e-a36d101f5302\\.system_generated\\logs\\transcript_full.jsonl";
const outPath = "C:\\Users\\YASH\\.gemini\\antigravity-cli\\brain\\8a8afd24-3e9c-4df5-b10e-a36d101f5302\\scratch\\extracted_ranges.txt";

const rl = readline.createInterface({
  input: fs.createReadStream(logPath),
  crlfDelay: Infinity
});

let index = 0;
const results = [];

rl.on('line', (line) => {
  index++;
  try {
    const data = JSON.parse(line);
    if (data.type === 'VIEW_FILE' && data.content && data.content.includes('BlessingsPage.tsx')) {
      const match = data.content.match(/Showing lines (\d+) to (\d+)/);
      if (match) {
        results.push({
          logLine: index,
          start: parseInt(match[1]),
          end: parseInt(match[2]),
          content: data.content
        });
      }
    }
  } catch (e) {}
});

rl.on('close', () => {
  // Sort by start line, then by logLine descending (to get latest viewed content if multiple)
  results.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return b.logLine - a.logLine;
  });

  let output = "";
  results.forEach(res => {
    output += `\n=========================================\n`;
    output += `Log Line: ${res.logLine} | Range: ${res.start} to ${res.end}\n`;
    output += `=========================================\n`;
    output += res.content;
    output += `\n`;
  });

  fs.writeFileSync(outPath, output, 'utf-8');
  console.log(`Wrote ${results.length} ranges to ${outPath}`);
});
