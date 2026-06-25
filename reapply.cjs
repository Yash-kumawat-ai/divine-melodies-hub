const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, "src", "pages", "BlessingsPage.tsx");
const allWritesPath = path.join(__dirname, "..", "..", "..", "brain", "a0bf0f7f-782b-44f5-b0b8-e7288530cbcb", "scratch", "all_writes.json");

// If not found there, let's try absolute path relative to C:\Users\YASH\...
const absoluteWritesPath = "C:\\Users\\YASH\\.gemini\\antigravity-cli\\brain\\a0bf0f7f-782b-44f5-b0b8-e7288530cbcb\\scratch\\all_writes.json";

const writesPath = fs.existsSync(allWritesPath) ? allWritesPath : absoluteWritesPath;

if (!fs.existsSync(writesPath)) {
  console.error("all_writes.json not found at:", writesPath);
  process.exit(1);
}

if (!fs.existsSync(targetFile)) {
  console.error("Target file not found:", targetFile);
  process.exit(1);
}

let code = fs.readFileSync(targetFile, 'utf8');
const writes = JSON.parse(fs.readFileSync(writesPath, 'utf8'));

// Sort writes by step_index ascending
writes.sort((a, b) => a.step_index - b.step_index);

console.log(`Replaying ${writes.length} writes on BlessingsPage.tsx...`);

for (const w of writes) {
  console.log(`Applying step ${w.step_index} (${w.name}): "${w.args.Description || w.args.Instruction}"`);
  
  if (w.name === "replace_file_content") {
    const target = w.args.TargetContent;
    const replacement = w.args.ReplacementContent;
    
    const count = code.split(target).length - 1;
    if (count === 0) {
      console.warn(`[WARNING] TargetContent not found in step ${w.step_index}. Skipping.`);
    } else if (count > 1) {
      console.warn(`[WARNING] TargetContent matches ${count} times in step ${w.step_index}. Replacing first match.`);
      code = code.replace(target, replacement);
    } else {
      code = code.replace(target, replacement);
    }
  } else if (w.name === "multi_replace_file_content") {
    const chunks = w.args.ReplacementChunks || [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const target = chunk.TargetContent;
      const replacement = chunk.ReplacementContent;
      
      const count = code.split(target).length - 1;
      if (count === 0) {
        console.warn(`[WARNING] Chunk ${i} target not found in step ${w.step_index}. Skipping.`);
      } else {
        code = code.replace(target, replacement);
      }
    }
  }
}

fs.writeFileSync(targetFile, code, 'utf8');
console.log("Replay finished successfully! BlessingsPage.tsx has been reconstructed.");
