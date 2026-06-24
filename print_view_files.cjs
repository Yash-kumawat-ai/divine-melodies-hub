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
  try {
    const data = JSON.parse(line);
    if (line.includes("view_file")) {
      console.log(`Line ${index} (type: ${data.type}):`);
      if (data.tool_calls) {
        console.log("  Tool Call:", JSON.stringify(data.tool_calls.map(tc => tc.function.arguments)));
      }
      if (data.content && data.content.includes("File Path")) {
        console.log("  Tool Response length:", data.content.length);
        console.log("  Snippet:", data.content.substring(0, 150));
      }
    }
  } catch (e) {}
});
