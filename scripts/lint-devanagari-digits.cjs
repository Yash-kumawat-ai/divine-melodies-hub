const fs = require('fs');
const path = require('path');

const SRC_DIR = path.resolve(__dirname, '../src');
const DEVANAGARI_DIGIT_REGEX = /[०-९]/;

// Explicit allowlist for legitimate scriptural citation files (if needed in the future)
const ALLOWLIST_FILES = new Set([
  // Any files specifically permitted can be registered here
]);

let violations = 0;

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (/\.(tsx|ts|jsx|js)$/.test(entry.name)) {
      const relPath = path.relative(SRC_DIR, fullPath).replace(/\\/g, '/');
      if (ALLOWLIST_FILES.has(relPath)) continue;
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        // Exclude the formatNumber.ts mapping dictionary itself
        if (relPath === 'lib/formatNumber.ts') return;

        if (DEVANAGARI_DIGIT_REGEX.test(line)) {
          console.error(`[Devanagari Numeral] src/${relPath}:${index + 1}: ${line.trim()}`);
          violations++;
        }
      });
    }
  }
}

scanDir(SRC_DIR);

if (violations > 0) {
  console.error(`\n❌ Found ${violations} unauthorized Devanagari numeral(s) in src/. Please use standard Latin digits (0-9) instead.`);
  process.exit(1);
} else {
  console.log('✅ CI Quality Gate: Zero unauthorized Devanagari numerals found in src/.');
  process.exit(0);
}
