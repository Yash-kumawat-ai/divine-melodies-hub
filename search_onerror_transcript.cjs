const fs = require('fs');
const readline = require('readline');

const logFile = 'C:\\Users\\YASH\\.gemini\\antigravity-cli\\brain\\a0bf0f7f-782b-44f5-b0b8-e7288530cbcb\\.system_generated\\logs\\transcript_full.jsonl';

if (!fs.existsSync(logFile)) {
  console.log('Log file does not exist:', logFile);
  process.exit(1);
}

const rl = readline.createInterface({
  input: fs.createReadStream(logFile),
  crlfDelay: Infinity
});

rl.on('line', (line) => {
  try {
    const data = JSON.parse(line);
    if (line.includes('deityImg.onerror') || line.includes('deityImg.onload') || line.includes('}).catch(reject);')) {
      console.log(`Step ${data.step_index} contains match.`);
      if (data.tool_calls) {
        data.tool_calls.forEach(tc => {
          if (tc.args.TargetContent && tc.args.TargetContent.includes('deityImg.onerror')) {
            console.log(`  Tool: ${tc.name} TargetContent: ${JSON.stringify(tc.args.TargetContent)}`);
            console.log(`  ReplacementContent: ${JSON.stringify(tc.args.ReplacementContent)}`);
          }
        });
      }
    }
  } catch (e) {
    // ignore
  }
});

rl.on('close', () => {
  console.log('Done scanning.');
});
