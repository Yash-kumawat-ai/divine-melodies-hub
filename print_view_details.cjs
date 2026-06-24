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
    
    // Check for tool calls first
    if (data.tool_calls) {
      data.tool_calls.forEach(tc => {
        if (tc.function && tc.function.name === 'view_file') {
          const args = typeof tc.function.arguments === 'string' ? JSON.parse(tc.function.arguments) : tc.function.arguments;
          console.log(`Log Line ${index} (tool call): AbsolutePath=${args.AbsolutePath}, StartLine=${args.StartLine}, EndLine=${args.EndLine}`);
        }
      });
    }

    // Check for responses
    if (data.type === 'VIEW_FILE') {
      const content = data.content || '';
      let rangeLine = "";
      const match = content.match(/Showing lines (\d+) to (\d+)/);
      if (match) {
        rangeLine = `Showing lines ${match[1]} to ${match[2]}`;
      }
      let filePathLine = "";
      const pathMatch = content.match(/File Path: `file:\/\/\/(.*)`/);
      if (pathMatch) {
        filePathLine = `Path: ${pathMatch[1]}`;
      }
      console.log(`Log Line ${index} (VIEW_FILE response): ${filePathLine} | ${rangeLine} | length: ${content.length}`);
    }
  } catch (e) {
    // console.error(e);
  }
});
