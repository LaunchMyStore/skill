#!/usr/bin/env node
/**
 * Universal SKILL.md installer.
 *
 * Copies SKILL.md + references/ + examples/ from this package into every
 * supported tool's skills directory on the host machine. Always installs
 * to the canonical agentskills.io universal location, then fans out to
 * each tool dir that already exists. New tools added by simply adding
 * their dir to TOOL_DESTINATIONS below.
 *
 * Honors SKILLS_HOME env var to override the universal base dir.
 *
 * Safe to re-run: each destination is wiped + rewritten.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

const SKILL_NAME = 'launchmystore';
const home = os.homedir();

// Universal location (agentskills.io standard) — always installed.
const universalBase =
  process.env.SKILLS_HOME || path.join(home, '.skills');

// Per-tool skill dirs. Only installed if the tool's root dir (parent of
// the skills dir) exists, to avoid creating directories for tools the
// user has never used. Each entry can supply an explicit `root` for
// tools that don't follow the ~/.<tool>/skills/<name>/ convention.
const TOOL_DESTINATIONS = [
  { tool: 'Claude Code / Claude.ai', dir: path.join(home, '.claude', 'skills', SKILL_NAME),                root: path.join(home, '.claude') },
  { tool: 'OpenAI Codex',            dir: path.join(home, '.codex', 'skills', SKILL_NAME),                 root: path.join(home, '.codex') },
  { tool: 'Cursor',                  dir: path.join(home, '.cursor', 'skills', SKILL_NAME),                root: path.join(home, '.cursor') },
  { tool: 'Gemini CLI',              dir: path.join(home, '.gemini', 'skills', SKILL_NAME),                root: path.join(home, '.gemini') },
  { tool: 'Windsurf',                dir: path.join(home, '.windsurf', 'skills', SKILL_NAME),              root: path.join(home, '.windsurf') },
  { tool: 'Antigravity',             dir: path.join(home, '.antigravity', 'skills', SKILL_NAME),           root: path.join(home, '.antigravity') },
  { tool: 'Aider',                   dir: path.join(home, '.aider', 'skills', SKILL_NAME),                 root: path.join(home, '.aider') },
  { tool: 'OpenCode',                dir: path.join(home, '.opencode', 'skills', SKILL_NAME),              root: path.join(home, '.opencode') },
  { tool: 'OpenClaw',                dir: path.join(home, '.openclaw', 'workspace', 'skills', SKILL_NAME), root: path.join(home, '.openclaw') },
  { tool: 'Kilo Code',               dir: path.join(home, '.kilocode', 'skills', SKILL_NAME),              root: path.join(home, '.kilocode') },
  { tool: 'Augment',                 dir: path.join(home, '.augment', 'skills', SKILL_NAME),               root: path.join(home, '.augment') },
  { tool: 'Hermes Agent',            dir: path.join(home, '.hermes', 'skills', SKILL_NAME),                root: path.join(home, '.hermes') },
  { tool: 'Mistral Vibe',            dir: path.join(home, '.vibe', 'skills', SKILL_NAME),                  root: path.join(home, '.vibe') },
];

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

function installTo(dest, pkgRoot) {
  try {
    fs.rmSync(dest, { recursive: true, force: true });
  } catch {}
  fs.mkdirSync(dest, { recursive: true });

  const skillMd = path.join(pkgRoot, 'SKILL.md');
  if (!fs.existsSync(skillMd)) return false;
  fs.copyFileSync(skillMd, path.join(dest, 'SKILL.md'));

  for (const sub of ['references', 'examples']) {
    const src = path.join(pkgRoot, sub);
    if (fs.existsSync(src)) copyDir(src, path.join(dest, sub));
  }
  return true;
}

function main() {
  const pkgRoot = path.resolve(__dirname, '..');
  const installed = [];
  const skipped = [];

  // 1. Universal location — always.
  const universalDest = path.join(universalBase, SKILL_NAME);
  if (installTo(universalDest, pkgRoot)) installed.push({ tool: 'Universal (agentskills.io)', dir: universalDest });

  // 2. Per-tool fan-out.
  for (const { tool, dir, root } of TOOL_DESTINATIONS) {
    if (fs.existsSync(root)) {
      if (installTo(dir, pkgRoot)) installed.push({ tool, dir });
    } else {
      skipped.push({ tool, dir });
    }
  }

  console.log(`[launchmystore-skill] installed to ${installed.length} location(s):`);
  for (const { tool, dir } of installed) console.log(`  + ${tool.padEnd(28)} ${dir}`);
  if (skipped.length) {
    console.log(`[launchmystore-skill] skipped ${skipped.length} (tool not detected — clone manually if you use it):`);
    for (const { tool, dir } of skipped) console.log(`  - ${tool.padEnd(28)} ${dir}`);
  }
  console.log('[launchmystore-skill] restart your AI host, then try: /launchmystore');
}

try {
  main();
} catch (err) {
  // Never fail npm install on a postinstall hiccup
  console.error('[launchmystore-skill] install warning:', err.message);
  process.exit(0);
}
