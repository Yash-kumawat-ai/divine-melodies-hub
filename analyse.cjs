const fs = require('fs');
const path = require('path');

const filePath = "C:\\Users\\YASH\\.gemini\\antigravity-cli\\brain\\a0bf0f7f-782b-44f5-b0b8-e7288530cbcb\\scratch\\all_writes.json";
if (!fs.existsSync(filePath)) {
  console.log("all_writes.json does not exist.");
  process.exit(1);
}

const writes = JSON.parse(fs.readFileSync(filePath, 'utf8'));
console.log(`Total writes logged: ${writes.length}`);

for (const w of writes) {
  console.log(`Step ${w.step_index}: [${w.name}] Description: "${w.args.Description || w.args.Instruction}"`);
}
