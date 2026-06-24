const fs = require('fs');
const readline = require('readline');

const logPath = "C:\\Users\\YASH\\.gemini\\antigravity-cli\\brain\\8a8afd24-3e9c-4df5-b10e-a36d101f5302\\.system_generated\\logs\\transcript_full.jsonl";

const rl = readline.createInterface({
  input: fs.createReadStream(logPath),
  crlfDelay: Infinity
});

let count = 0;
rl.on('line', (line) => {
  count++;
  if (count <= 10) {
    try {
      const data = JSON.parse(line);
      console.log(`Line ${count}: type = ${data.type}`);
      console.log("Keys:", Object.keys(data));
      if (data.tool_calls) {
        console.log("  tool_calls:", JSON.stringify(data.tool_calls));
      }
    } catch(e) {}
  } else {
    process.exit(0);
  }
});
