const fs = require('fs');
try {
  const files = fs.readdirSync("C:\\Users\\YASH\\AppData\\Roaming\\Code\\User\\History");
  console.log("History dir exists and contains " + files.length + " items.");
  console.log("First 10 items:", files.slice(0, 10));
} catch (e) {
  console.log("Error reading History dir:", e.message);
}
