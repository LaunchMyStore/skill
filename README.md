# LaunchMyStore — Claude Skill

A single `/launchmystore` skill that turns plain-English intent into the
right LaunchMyStore surface — the `lms` CLI, App Bridge SDK, WASM
Functions, Aqua themes, or the LaunchMyStore MCP server.

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

Pick one — they all produce the same skill at `~/.claude/skills/launchmystore/`.

### 1. Plugin marketplace (recommended)

In Claude Code:

```
/plugin marketplace add LaunchMyStore/skill
/plugin install launchmystore@launchmystore
```

### 2. npm wrapper

```bash
npm install -g @launchmystore/claude-skill
# postinstall copies SKILL.md + references/ + examples/ into ~/.claude/skills/launchmystore/
```

### 3. Manual clone

```bash
git clone https://github.com/LaunchMyStore/skill ~/.claude/skills/launchmystore
```

Restart Claude Code, then try:

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
├── references/                      # Loaded by Claude on demand
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
