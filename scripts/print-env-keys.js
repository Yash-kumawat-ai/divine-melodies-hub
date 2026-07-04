import fs from 'fs';
import path from 'path';

function checkEnvFile(filename) {
  const filePath = path.resolve(process.cwd(), filename);
  if (fs.existsSync(filePath)) {
    console.log(`Checking keys in ${filename}:`);
    const content = fs.readFileSync(filePath, 'utf8');
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const parts = trimmed.split('=');
        const key = parts[0].trim();
        console.log(`- ${key}`);
      }
    });
  } else {
    console.log(`${filename} does not exist.`);
  }
}

checkEnvFile('.env');
checkEnvFile('.env.local');
