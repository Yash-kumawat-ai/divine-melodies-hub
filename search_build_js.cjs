const fs = require('fs');

const jsPath = "C:\\Users\\YASH\\Desktop\\bhajanwebsite\\divine-melodies-hub\\dist\\assets\\BlessingsPage-C6ucjB1J.js";
try {
  const content = fs.readFileSync(jsPath, 'utf8');
  console.log("File read successfully, size = " + content.length);
  if (content.includes("Raas Leela") || content.includes("live-krishna-1")) {
    console.log("Found Live Wallpapers data inside the build file!");
    // Let's print the segment containing live-krishna-1
    const idx = content.indexOf("live-krishna-1");
    console.log("Snippet around live-krishna-1:");
    console.log(content.substring(idx - 100, idx + 1000));
  } else {
    console.log("Could not find Live Wallpapers in build JS file.");
  }
} catch (e) {
  console.error("Error reading build JS file:", e.message);
}
