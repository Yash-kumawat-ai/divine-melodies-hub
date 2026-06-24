const fs = require('fs');
const readline = require('readline');

const logPath = "C:\\Users\\YASH\\.gemini\\antigravity-cli\\brain\\8a8afd24-3e9c-4df5-b10e-a36d101f5302\\.system_generated\\logs\\transcript_full.jsonl";

const rl = readline.createInterface({
  input: fs.createReadStream(logPath),
  crlfDelay: Infinity
});

let index = 0;
rl.on('line', (line) => {
  index++;
  if (line.includes("Total Lines: 2598")) {
    try {
      const data = JSON.parse(line);
      console.log(`Line ${index}: keys =`, Object.keys(data));
      if (data.type) console.log(`  type = ${data.type}`);
      if (data.status) console.log(`  status = ${data.status}`);
      if (data.content && data.content.length > 500) {
        console.log(`  content length = ${data.content.length}`);
        if (data.content.includes("1: import React") && !line.includes("const fs = require")) {
          console.log(`  -> Found a match in content!`);
        }
      }
      if (data.tool_calls) {
        console.log(`  tool_calls count = ${data.tool_calls.length}`);
      }
    } catch (e) {
      console.error(`Line ${index} parse error:`, e.message);
    }
  }
});
