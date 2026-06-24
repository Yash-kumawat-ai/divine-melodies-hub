const fs = require('fs');

const jsPath = "C:\\Users\\YASH\\Desktop\\bhajanwebsite\\divine-melodies-hub\\dist\\assets\\BlessingsPage-C6ucjB1J.js";
try {
  const content = fs.readFileSync(jsPath, 'utf8');
  const idx = content.indexOf("Te=[");
  if (idx !== -1) {
    console.log("Found Te array:");
    console.log(content.substring(idx, idx + 1000));
  } else {
    console.log("Could not find Te=[");
  }
  const idxK = content.indexOf("K=[");
  if (idxK !== -1) {
    console.log("Found K array:");
    console.log(content.substring(idxK, idxK + 1000));
  } else {
    console.log("Could not find K=[");
  }
} catch (e) {
  console.error(e.message);
}
