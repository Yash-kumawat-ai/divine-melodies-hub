import fs from 'fs';
import path from 'path';

function checkEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    console.log(`Checking keys in ${filePath}:`);
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
    console.log(`${filePath} does not exist.`);
  }
}

checkEnvFile(path.resolve(process.cwd(), 'supabase/.env.local'));
