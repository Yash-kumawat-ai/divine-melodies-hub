const fs = require('fs');
const path = require('path');
const readline = require('readline');

const logPath = "C:\\Users\\YASH\\.gemini\\antigravity-cli\\brain\\a0bf0f7f-782b-44f5-b0b8-e7288530cbcb\\.system_generated\\logs\\transcript_full.jsonl";
const outputDir = "C:\\Users\\YASH\\.gemini\\antigravity-cli\\brain\\a0bf0f7f-782b-44f5-b0b8-e7288530cbcb\\scratch";

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log("Scanning transcript for BlessingsPage.tsx tool calls...");

const rl = readline.createInterface({
  input: fs.createReadStream(logPath),
  crlfDelay: Infinity
});

let lastWrite = null;
let lastView = null;
let stepWrites = [];

rl.on('line', (line) => {
  try {
    const data = JSON.parse(line);
    const toolCalls = data.tool_calls || [];
    for (const call of toolCalls) {
      const name = call.name;
      const args = call.args || {};
      const targetFile = args.TargetFile || args.AbsolutePath;
      if (targetFile && targetFile.includes("BlessingsPage.tsx")) {
        if (["write_to_file", "replace_file_content", "multi_replace_file_content"].includes(name)) {
          lastWrite = { name, args, step_index: data.step_index };
          stepWrites.push({ name, args, step_index: data.step_index });
        } else if (name === "view_file") {
          lastView = { name, args, step_index: data.step_index };
        }
      }
    }
  } catch (e) {
    // ignore parse errors
  }
});

rl.on('close', () => {
  if (lastWrite) {
    console.log(`Found last write tool call at step ${lastWrite.step_index}: ${lastWrite.name}`);
    fs.writeFileSync(path.join(outputDir, "last_write.json"), JSON.stringify(lastWrite, null, 2));
    fs.writeFileSync(path.join(outputDir, "all_writes.json"), JSON.stringify(stepWrites, null, 2));
  } else {
    console.log("No write tool calls found for BlessingsPage.tsx.");
  }

  if (lastView) {
    console.log(`Found last view tool call at step ${lastView.step_index}: ${lastView.name}`);
    fs.writeFileSync(path.join(outputDir, "last_view.json"), JSON.stringify(lastView, null, 2));
  }
  console.log("Done scanning.");
});
