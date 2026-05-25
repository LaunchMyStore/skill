#!/usr/bin/env node
/**
 * Postinstall: copy SKILL.md + references/ + examples/ from the published
 * package into ~/.claude/skills/launchmystore/ so the skill becomes
 * available to Claude Code on the next session.
 *
 * Safe to re-run: it always replaces the destination directory.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else if (entry.isFile()) {
      fs.copyFileSync(s, d);
    }
  }
}

function main() {
  const pkgRoot = path.resolve(__dirname, '..');
  const home = os.homedir();
  const dest = path.join(home, '.claude', 'skills', 'launchmystore');

  // Wipe + recreate so removed files actually go away
  try {
    fs.rmSync(dest, { recursive: true, force: true });
  } catch {}
  fs.mkdirSync(dest, { recursive: true });

  // Copy SKILL.md
  const skillMd = path.join(pkgRoot, 'SKILL.md');
  if (fs.existsSync(skillMd)) {
    fs.copyFileSync(skillMd, path.join(dest, 'SKILL.md'));
  } else {
    console.error('[launchmystore-skill] SKILL.md not found in package — skipping');
    process.exit(0);
  }

  // Copy references/ and examples/
  for (const sub of ['references', 'examples']) {
    const src = path.join(pkgRoot, sub);
    if (fs.existsSync(src)) {
      copyDir(src, path.join(dest, sub));
    }
  }

  console.log(`[launchmystore-skill] installed to ${dest}`);
  console.log('[launchmystore-skill] restart Claude Code, then try: /launchmystore');
}

try {
  main();
} catch (err) {
  // Never fail npm install on a postinstall hiccup
  console.error('[launchmystore-skill] install warning:', err.message);
  process.exit(0);
}
