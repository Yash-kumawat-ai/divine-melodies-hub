const fs = require('fs');
const path = require('path');

const filePath = "C:\\Users\\YASH\\.gemini\\antigravity-cli\\brain\\a0bf0f7f-782b-44f5-b0b8-e7288530cbcb\\scratch\\all_writes.json";
const writes = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const stepsOfInterest = [632, 636, 640, 646, 662, 666, 672, 678, 747, 755];

for (const w of writes) {
  if (stepsOfInterest.includes(w.step_index)) {
    console.log(`\n======================================================`);
    console.log(`Step ${w.step_index} (${w.name}): "${w.args.Description}"`);
    console.log(`TargetContent (first 100 chars):`);
    console.log(JSON.stringify((w.args.TargetContent || "").substring(0, 150)));
    if (w.args.ReplacementChunks) {
      console.log(`Chunks: ${w.args.ReplacementChunks.length}`);
      w.args.ReplacementChunks.forEach((c, idx) => {
        console.log(`  Chunk ${idx} Target: ${JSON.stringify(c.TargetContent.substring(0, 100))}`);
      });
    }
  }
}
