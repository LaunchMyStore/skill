# Changelog

## 1.1.0 — 2026-05-25

Universal multi-tool support — the skill now installs into every
SKILL.md-compatible AI host on the machine, not just Claude Code.

- `SKILL.md` is now host-agnostic. Removed Claude-specific phrasing;
  added a `compatibility:` block in the frontmatter listing every
  supported tool (Claude Code, Claude.ai, the Claude API, OpenAI Codex,
  Cursor, Gemini CLI, Windsurf, Antigravity, Aider, OpenCode, Kilo Code,
  Augment, Hermes Agent, Mistral Vibe).
- `bin/install.js` rewritten to fan out to every detected tool dir
  under `~/.<tool>/skills/launchmystore/`, plus the canonical
  `~/.skills/launchmystore/` universal location (agentskills.io standard).
  Honors `SKILLS_HOME` env var.
- README and package metadata reframed around the open SKILL.md
  standard. Install section now covers all 13+ supported hosts.

## 1.0.0 — 2026-05-25

Initial public release.

- `SKILL.md` intent router with 10 reference tracks
- `references/01-10` covering quickstart, app dev, CLI, App Bridge,
  extensions (14 types), WASM Functions (all 6 types), MCP server (130+
  tools), Aqua themes, beginner walkthroughs, and troubleshooting
- `examples/` with copy-pasteable starters for:
  - All 6 WASM Function types (cart_transform, discount, shipping_rate,
    payment_customization, delivery_customization, order_validation)
  - Theme primitives: section, app block, section group, snippet
  - App Bridge admin block (Toast + ResourcePicker + SessionToken)
  - MCP prompt cheat sheet
- Three install paths: plugin marketplace, npm wrapper, manual clone
