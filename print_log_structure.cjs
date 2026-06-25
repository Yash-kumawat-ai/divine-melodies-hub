const fs = require('fs');
const readline = require('readline');

const logPath = "C:\\Users\\YASH\\.gemini\\antigravity-cli\\brain\\a0bf0f7f-782b-44f5-b0b8-e7288530cbcb\\.system_generated\\logs\\transcript_full.jsonl";

const rl = readline.createInterface({
  input: fs.createReadStream(logPath),
  crlfDelay: Infinity
});

let count = 0;
rl.on('line', (line) => {
  if (count > 25) {
    rl.close();
    return;
  }
  try {
    const data = JSON.parse(line);
    if (line.includes("BlessingsPage.tsx")) {
      console.log(`Step ${data.step_index}: source=${data.source}, type=${data.type}, status=${data.status}, keys=${Object.keys(data)}`);
      // Let's print keys and some snippets of the content or tool_calls
      if (data.content && data.content.length > 100) {
        console.log(`  Content snippet: "${data.content.substring(0, 150)}..."`);
      }
      count++;
    }
  } catch (e) {
    // ignore
  }
});
