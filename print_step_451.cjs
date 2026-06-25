const fs = require('fs');
const path = require('path');

const filePath = "C:\\Users\\YASH\\.gemini\\antigravity-cli\\brain\\a0bf0f7f-782b-44f5-b0b8-e7288530cbcb\\scratch\\all_writes.json";
const writes = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const w = writes.find(x => x.step_index === 451);
console.log("Keys of args:", Object.keys(w.args));
console.log("AllowMultiple:", w.args.AllowMultiple);
console.log("Description:", w.args.Description);
console.log("StartLine:", w.args.StartLine);
console.log("EndLine:", w.args.EndLine);
console.log("TargetContent is undefined?", w.args.TargetContent === undefined);
console.log("targetContent (lowercase t) is undefined?", w.args.targetContent === undefined);
