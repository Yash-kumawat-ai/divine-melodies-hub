const fs = require('fs');
const path = require('path');

const filePath = "C:\\Users\\YASH\\.gemini\\antigravity-cli\\brain\\a0bf0f7f-782b-44f5-b0b8-e7288530cbcb\\scratch\\all_writes.json";
const writes = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const w = writes.find(x => x.step_index === 293);
console.log(JSON.stringify(w, null, 2));
