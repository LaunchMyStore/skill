# LaunchMyStore — Universal Agent Skill

A single `/launchmystore` skill that turns plain-English intent into the
right LaunchMyStore surface — the `lms` CLI, App Bridge SDK, WASM
Functions, Aqua themes, or the LaunchMyStore MCP server.

Built on the open **`SKILL.md`** standard, so the same skill works
identically in:

> **Claude Code · Claude.ai · the Claude API · OpenAI Codex · Cursor ·
> Gemini CLI · Windsurf · Antigravity · Aider · OpenCode · OpenClaw ·
> Kilo Code · Augment · Hermes Agent · Mistral Vibe** — anywhere
> SKILL.md is supported.

Nothing in the skill is Claude-specific. If a host AI can read `SKILL.md`
and follow Markdown instructions, this skill works.

- **Build apps & extensions** → scaffold, push, deploy with `lms`
- **Embed UI in the admin** → Toast / Modal / ResourcePicker via App Bridge
- **Ship WASM Functions** → 6 types (discount, shipping, cart transform,
  payment, delivery, order validation) compiled locally with Javy
- **Author themes** → Aqua (Liquid dialect) sections, blocks, snippets,
  metafields
- **Operate a store with AI** → 130+ MCP tools (products, orders, customers,
  themes, analytics)

Canonical developer docs: **<https://docs.launchmystore.io>**

## Install

Pick the path that matches your host AI. They all end up with the same
`SKILL.md` + `references/` + `examples/` on disk.

### Claude Code

```
/plugin marketplace add LaunchMyStore/skill
/plugin install launchmystore@launchmystore
```

Or via npm:

```bash
npm install -g @launchmystore/claude-skill
```

Or manual clone:

```bash
git clone https://github.com/LaunchMyStore/skill ~/.claude/skills/launchmystore
```

### Claude.ai

Download the [latest release zip](https://github.com/LaunchMyStore/skill/archive/refs/heads/main.zip)
and upload it as a Skill in **Settings → Capabilities → Skills**.

### Anthropic Claude API

Bundle the `SKILL.md` + `references/` + `examples/` into your skill folder
when calling the Messages API with `tools: [{ type: 'skill', ... }]`. See
<https://docs.anthropic.com/en/docs/build-with-claude/skills>.

### OpenAI Codex

```bash
git clone https://github.com/LaunchMyStore/skill ~/.codex/skills/launchmystore
```

Codex reads `~/.codex/skills/<name>/SKILL.md` automatically.

### Cursor

```bash
git clone https://github.com/LaunchMyStore/skill ~/.cursor/skills/launchmystore
```

(Or drop a Cursor Rule pointing to the cloned `SKILL.md`.)

### Gemini CLI

```bash
git clone https://github.com/LaunchMyStore/skill ~/.gemini/skills/launchmystore
```

### OpenClaw

```bash
git clone https://github.com/LaunchMyStore/skill ~/.openclaw/workspace/skills/launchmystore
openclaw gateway restart
```

### Windsurf / Antigravity / Aider / OpenCode / Kilo Code / Augment / Hermes / Mistral Vibe

Each tool reads `SKILL.md` from its own skills directory (typically
`~/.<tool>/skills/<name>/` — Mistral Vibe uses `~/.vibe/skills/<name>/`).
Clone the repo into that directory.

### Universal install (every tool at once)

Set `SKILLS_HOME=~/.skills` (the agentskills.io standard) and install once:

```bash
npm install -g @launchmystore/claude-skill
```

The postinstall script copies the skill to **every** supported tool
directory it can detect on your machine, plus `~/.skills/launchmystore/` as
the canonical universal location.

Then in your AI of choice, try:

```
/launchmystore I want to build my first app
/launchmystore add a 10% discount when cart over $100
/launchmystore show me my orders from last week
/launchmystore write a theme section that shows trending products
```

## What's inside

```
skill/
├── SKILL.md                         # Intent router (~2 KB)
├── references/                      # Loaded by the host AI on demand
│   ├── 01-quickstart.md
│   ├── 02-building-an-app.md
│   ├── 03-cli-reference.md
│   ├── 04-app-bridge.md
│   ├── 05-extensions.md             # 14 extension types
│   ├── 06-functions.md              # All 6 WASM Function types
│   ├── 07-merchant-mcp.md           # 130+ MCP tools, organized by domain
│   ├── 08-aqua-themes.md            # Sections / blocks / groups / snippets / metafields
│   ├── 09-beginner-walkthroughs.md
│   └── 10-troubleshooting.md
├── examples/
│   ├── cart-transform/              # All 6 function types
│   ├── discount-function/
│   ├── shipping-rate/
│   ├── payment-customization/
│   ├── delivery-customization/
│   ├── order-validation/
│   ├── theme-section/               # Full sections/hero.liquid with schema
│   ├── theme-block/                 # App-supplied .aqua + .schema.json
│   ├── theme-group/                 # sections/header-group.json + layout hook
│   ├── theme-snippet/               # Reusable product-card snippet
│   ├── app-bridge/                  # Admin block using Toast + Picker + SessionToken
│   └── mcp-prompts.md
└── .claude-plugin/marketplace.json
```

## What the skill routes to

| You say | Skill loads | You get |
|---|---|---|
| "I want to build my first app" | `02-building-an-app.md` | `lms app create` walkthrough |
| `lms <something>` | `03-cli-reference.md` | Full CLI surface + flags |
| "toast / modal / picker / session token" | `04-app-bridge.md` | Vanilla + React SDK + 21 actions |
| "theme block / checkout extension / admin block" | `05-extensions.md` | 14 extension types + scaffold commands |
| "discount / shipping rate / cart transform / WASM" | `06-functions.md` | All 6 types + local Javy compile flow |
| "add a product / list orders / manage my store" | `07-merchant-mcp.md` | 130+ MCP tools by domain + workflows |
| "Aqua / Liquid / section / snippet / metafields" | `08-aqua-themes.md` | Theme authoring + Liquid + metafield drops |
| "I'm new" / no clear intent | `01-quickstart.md` → `09-beginner-walkthroughs.md` | Routing decision tree + plain-English recipes |

## Contributing

Issues + PRs welcome at <https://github.com/LaunchMyStore/skill>.

## License

MIT — see [LICENSE](LICENSE).
