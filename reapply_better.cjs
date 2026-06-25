const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, "src", "pages", "BlessingsPage.tsx");
const absoluteWritesPath = "C:\\Users\\YASH\\.gemini\\antigravity-cli\\brain\\a0bf0f7f-782b-44f5-b0b8-e7288530cbcb\\scratch\\all_writes.json";

if (!fs.existsSync(absoluteWritesPath)) {
  console.error("all_writes.json not found!");
  process.exit(1);
}

// Read and normalize file line endings
let code = fs.readFileSync(targetFile, 'utf8').replace(/\r\n/g, '\n');
const writes = JSON.parse(fs.readFileSync(absoluteWritesPath, 'utf8'));

// Sort writes by step_index ascending
writes.sort((a, b) => a.step_index - b.step_index);

console.log(`Replaying ${writes.length} normalized writes on BlessingsPage.tsx...`);

for (const w of writes) {
  if (w.step_index === 755) {
    console.log(`Skipping step ${w.step_index} (${w.name}): "${w.args.Description}" - Custom tab redesign will be applied.`);
    continue;
  }

  // Normalize step 293 target to end of LIVE_WALLPAPERS_LIST
  if (w.step_index === 293) {
    w.args.TargetContent = `  { id: "live-hanuman-1", deity: "Hanuman", name: "Anjaneya Shaurya Darshan", nameHindi: "आंजनेय शौर्य दर्शन सजीव", thumbnailUrl: hanumanImg, effect: "shimmer", tier: "free" }\n];`;
    w.args.ReplacementContent = `  { id: "live-hanuman-1", deity: "Hanuman", name: "Anjaneya Shaurya Darshan", nameHindi: "आंजनेय शौर्य दर्शन सजीव", thumbnailUrl: hanumanImg, effect: "shimmer", tier: "free" }\n];\n\ninterface PosterTemplate {\n  id: string;\n  title: string;\n  titleHindi: string;\n  category: "todays" | "festival" | "good_morning";\n  imageUrl: string;\n  quote: string;\n  quoteHindi: string;\n  subtitle: string;\n  subtitleHindi: string;\n  photoPosition: { x: number; y: number; radius: number };\n  namePosition: { x: number; y: number; fontSize: number };\n}\n\nconst POSTER_TEMPLATES: PosterTemplate[] = [\n  {\n    id: "poster-shyam-1",\n    title: "Khatu Shyam Blessing",\n    titleHindi: "बाबा श्याम कृपा",\n    category: "todays",\n    imageUrl: shyamMandirImg,\n    quote: "हारे का सहारा, बाबा श्याम हमारा। जय श्री श्याम।",\n    quoteHindi: "हारे का सहारा, बाबा श्याम हमारा। जय श्री श्याम।",\n    subtitle: "Khatu Shyam Darshan",\n    subtitleHindi: "जय श्री श्याम",\n    photoPosition: { x: 540, y: 1250, radius: 110 },\n    namePosition: { x: 540, y: 1460, fontSize: 36 }\n  },\n  {\n    id: "poster-hanuman-1",\n    title: "Bajrang Bali Protection",\n    titleHindi: "बजरंग बली रक्षा कवच",\n    category: "todays",\n    imageUrl: hanumanImg,\n    quote: "संकट कटै मिटै सब पीरा, जो सुमिरै हनुमत बलबीरा।",\n    quoteHindi: "संकट कटै मिटै सब पीरा, जो सुमिरै हनुमत बलबीरा।",\n    subtitle: "Jay Bajrang Bali",\n    subtitleHindi: "जय बजरंग बली",\n    photoPosition: { x: 540, y: 1250, radius: 110 },\n    namePosition: { x: 540, y: 1460, fontSize: 36 }\n  },\n  {\n    id: "poster-krishna-1",\n    title: "Radhe Radhe Bhakti",\n    titleHindi: "राधे राधे प्रेम दर्शन",\n    category: "todays",\n    imageUrl: radhaKrishnaImg,\n    quote: "राधा कृष्ण का प्रेम आपके जीवन में शांति और आनंद लाए।",\n    quoteHindi: "राधा कृष्ण का प्रेम आपके जीवन में शांति और आनंद लाए।",\n    subtitle: "Radhe Radhe",\n    subtitleHindi: "राधे राधे",\n    photoPosition: { x: 540, y: 1250, radius: 110 },\n    namePosition: { x: 540, y: 1460, fontSize: 36 }\n  },\n  {\n    id: "poster-ram-1",\n    title: "Shree Ram Blessing",\n    titleHindi: "श्री राम आशीर्वाद पत्र",\n    category: "todays",\n    imageUrl: shreeRamImg,\n    quote: "मंगल भवन अमंगल हारी, द्रबहु सुदसरथ अजर बिहारी।",\n    quoteHindi: "मंगल भवन अमंगल हारी, द्रबहु सुदसरथ अजर बिहारी।",\n    subtitle: "Shree Ram Darshan",\n    subtitleHindi: "श्री राम दर्शन",\n    photoPosition: { x: 540, y: 1250, radius: 110 },\n    namePosition: { x: 540, y: 1460, fontSize: 36 }\n  },\n  {\n    id: "poster-ganesh-1",\n    title: "Ganesh Chaturthi",\n    titleHindi: "गणेश चतुर्थी उत्सव",\n    category: "festival",\n    imageUrl: ganeshImg,\n    quote: "वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥",\n    quoteHindi: "गणेश चतुर्थी के पावन पर्व की हार्दिक शुभकामनाएं।",\n    subtitle: "Ganesh Chaturthi - 7 Sep",\n    subtitleHindi: "गणेश चतुर्थी - 7 सितंबर",\n    photoPosition: { x: 540, y: 1250, radius: 110 },\n    namePosition: { x: 540, y: 1460, fontSize: 36 }\n  },\n  {\n    id: "poster-lakshmi-1",\n    title: "Navratri Blessings",\n    titleHindi: "शुभ नवरात्रि आशीर्वाद",\n    category: "festival",\n    imageUrl: lakshmiImg,\n    quote: "सर्वमंगल मांगल्ये शिवे सर्वार्थ साधिके। शरण्ये त्र्यम्बके गौरी नारायणि नमोऽस्तु ते॥",\n    quoteHindi: "नवरात्रि के पावन पर्व की हार्दिक शुभकामनाएं।",\n    subtitle: "Navratri - 3 Oct",\n    subtitleHindi: "नवरात्रि - 3 अक्टूबर",\n    photoPosition: { x: 540, y: 1250, radius: 110 },\n    namePosition: { x: 540, y: 1460, fontSize: 36 }\n  }\n];`;
  }

  console.log(`Applying step ${w.step_index} (${w.name}): "${w.args.Description || w.args.Instruction}"`);
  
  if (w.name === "replace_file_content") {
    if (!w.args.TargetContent) {
      console.warn(`[WARNING] Step ${w.step_index} lacks TargetContent! Skipping.`);
      continue;
    }
    const target = w.args.TargetContent.replace(/\r\n/g, '\n');
    const replacement = (w.args.ReplacementContent || '').replace(/\r\n/g, '\n');
    
    const count = code.split(target).length - 1;
    if (count === 0) {
      console.warn(`[WARNING] TargetContent not found in step ${w.step_index}. Skipping.`);
    } else {
      code = code.replace(target, replacement);
    }
  } else if (w.name === "multi_replace_file_content") {
    const chunks = w.args.ReplacementChunks || [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      if (!chunk.TargetContent) {
        console.warn(`[WARNING] Step ${w.step_index} chunk ${i} lacks TargetContent! Skipping chunk.`);
        continue;
      }
      const target = chunk.TargetContent.replace(/\r\n/g, '\n');
      const replacement = (chunk.ReplacementContent || '').replace(/\r\n/g, '\n');
      
      const count = code.split(target).length - 1;
      if (count === 0) {
        console.warn(`[WARNING] Chunk ${i} target not found in step ${w.step_index}. Skipping.`);
      } else {
        code = code.replace(target, replacement);
      }
    }
  }
}

// Convert back to CRLF for Windows compatibility
fs.writeFileSync(targetFile, code.replace(/\n/g, '\r\n'), 'utf8');
console.log("Replay finished! BlessingsPage.tsx has been reconstructed with normalized line endings and parameter guards.");
