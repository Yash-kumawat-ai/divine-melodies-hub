const fs = require('fs');

const jsPath = "C:\\Users\\YASH\\Desktop\\bhajanwebsite\\divine-melodies-hub\\dist\\assets\\BlessingsPage-C6ucjB1J.js";
const outPath = "C:\\Users\\YASH\\.gemini\\antigravity-cli\\brain\\8a8afd24-3e9c-4df5-b10e-a36d101f5302\\scratch\\beautified_kt.txt";

try {
  const content = fs.readFileSync(jsPath, 'utf8');
  console.log("Read build file, length:", content.length);
  
  // Find "function kt()"
  const startIdx = content.indexOf("function kt()");
  if (startIdx === -1) {
    console.error("Could not find function kt() in build file.");
    process.exit(1);
  }
  
  // We'll extract about 50,000 characters from startIdx to see the component logic
  const snippet = content.substring(startIdx, startIdx + 60000);
  
  // A very basic formatter to put newlines and indentation for readability
  let formatted = "";
  let indent = 0;
  for (let i = 0; i < snippet.length; i++) {
    const char = snippet[i];
    if (char === '{') {
      indent++;
      formatted += " {\n" + "  ".repeat(indent);
    } else if (char === '}') {
      indent--;
      if (indent < 0) indent = 0;
      formatted += "\n" + "  ".repeat(indent) + "}";
    } else if (char === ';') {
      formatted += ";\n" + "  ".repeat(indent);
    } else {
      formatted += char;
    }
  }
  
  fs.writeFileSync(outPath, formatted, 'utf8');
  console.log("Wrote beautified component snippet to", outPath);
} catch (e) {
  console.error("Error:", e.message);
}
