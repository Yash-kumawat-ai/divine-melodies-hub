const fs = require('fs');

const jsPath = "C:\\Users\\YASH\\Desktop\\bhajanwebsite\\divine-melodies-hub\\dist\\assets\\BlessingsPage-C6ucjB1J.js";
try {
  const content = fs.readFileSync(jsPath, 'utf8');
  console.log("Build JS read, searching for SVG/phone content...");
  if (content.includes("<svg") || content.includes("svg") || content.includes("path")) {
    console.log("Found references to svg/path!");
    // Check if there is a phone SVG match
    const matches = content.match(/viewBox="[^"]*"[^>]*>/gi);
    if (matches) {
      console.log(`Found ${matches.length} viewBox tags:`);
      matches.slice(0, 10).forEach(m => console.log("  " + m));
    }
  }
} catch (e) {
  console.error(e.message);
}
