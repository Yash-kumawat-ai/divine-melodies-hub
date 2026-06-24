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
  if (index === 11) {
    try {
      const data = JSON.parse(line);
      console.log("Log Line 11:");
      console.log("type:", data.type);
      console.log("content snippet (first 1000 chars):");
      console.log(data.content ? data.content.substring(0, 1000) : "no content");
    } catch(e) {
      console.error(e);
    }
  }
});
