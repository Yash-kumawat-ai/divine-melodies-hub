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
  if (index === 15) {
    try {
      const data = JSON.parse(line);
      console.log("Log Line 15 content snippet:");
      console.log(data.content);
    } catch(e) {
      console.error(e);
    }
  }
});
