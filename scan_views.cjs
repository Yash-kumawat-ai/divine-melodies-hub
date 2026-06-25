const fs = require('fs');
const readline = require('readline');

const logPath = "C:\\Users\\YASH\\.gemini\\antigravity-cli\\brain\\a0bf0f7f-782b-44f5-b0b8-e7288530cbcb\\.system_generated\\logs\\transcript_full.jsonl";

const rl = readline.createInterface({
  input: fs.createReadStream(logPath),
  crlfDelay: Infinity
});

console.log("Scanning transcript for view_file responses of BlessingsPage.tsx...");

rl.on('line', (line) => {
  try {
    const data = JSON.parse(line);
    
    // Check if this step indexes a view_file call for BlessingsPage.tsx
    if (data.type === "PLANNER_RESPONSE" || data.type === "SYSTEM_RESPONSE" || data.status === "DONE") {
      const toolCalls = data.tool_calls || [];
      const isViewCall = toolCalls.some(c => c.name === "view_file" && (c.args.AbsolutePath || "").includes("BlessingsPage.tsx"));
      
      // Let's check if the content of the step (or output) contains long text
      const content = data.content || "";
      if (content.includes("export default function BlessingsPage") && content.length > 50000) {
        console.log(`Step ${data.step_index}: Found potential full view of BlessingsPage.json (length ${content.length})`);
        fs.writeFileSync(`step_${data.step_index}_view.txt`, content);
      }
    }
  } catch (e) {
    // ignore
  }
});

rl.on('close', () => {
  console.log("Done scanning views.");
});
