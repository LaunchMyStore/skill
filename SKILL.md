---
name: launchmystore
description: >
  Build, run, and customize a LaunchMyStore e-commerce store from natural
  language. Use when the user wants to scaffold an app, ship a storefront /
  checkout / admin extension, build and deploy a WASM Function, configure
  App Bridge actions (Toast, Modal, ResourcePicker, SessionToken,
  TitleBar...), manage products / orders / customers / themes via the
  LaunchMyStore MCP server, or write Aqua (Liquid-dialect) theme code.
  Triggers include: "build a LaunchMyStore app", "lms cli", "add a discount
  function", "set up app bridge", "manage my store with AI", "write a theme
  block", "install an extension", "deploy a function", "use launchmystore",
  "lms", or any mention of LaunchMyStore / launchmystore.io.
metadata:
  version: 1.0.0
  author: LaunchMyStore
  homepage: https://launchmystore.io
  repository: https://github.com/LaunchMyStore/skill
tags:
  - launchmystore
  - lms
  - ecommerce
  - storefront
  - cli
  - app-bridge
  - mcp
  - aqua
  - liquid
---

# LaunchMyStore

You're helping the user work with **LaunchMyStore** — an e-commerce platform
with apps, extensions, WASM Functions, Liquid-based Aqua themes, and an MCP
server that lets an LLM run a real merchant store end-to-end.

Four developer-facing surfaces ship today:

1. **`@launchmystore/cli`** — local Javy compile, app scaffolding, extension
   push, function build/test/deploy, webhook tail.
2. **`@launchmystore/app-bridge`** + **`@launchmystore/app-bridge-react`** —
   iframe ↔ host SDK for admin / checkout / post-purchase extensions.
3. **LaunchMyStore MCP server** — 130+ tools for products, orders,
   customers, themes, billing, plus AI helpers like `chat_with_data`.
4. **Aqua theme system** — `.aqua` files using the Liquid templating
   language with sections, blocks, snippets, settings schema, and the
   `{owner}.metafields.{namespace}.{key}` access pattern.

Canonical docs live at <https://docs.launchmystore.io>.

## Step 1 — Identify the intent

Match the user's request to one of these tracks and load the matching
reference. **If the user is new or hasn't specified, always check
`references/01-quickstart.md` first.**

| User says | Track | Reference |
|---|---|---|
| "I'm new", "where do I start", no clear intent | Beginner | `references/01-quickstart.md` |
| "I want to build / scaffold an app", "new LMS app" | App dev | `references/02-building-an-app.md` |
| `lms <something>`, "deploy with the CLI" | CLI | `references/03-cli-reference.md` |
| "toast / modal / resource picker", "session token", "embed in admin", "iframe to host" | App Bridge | `references/04-app-bridge.md` |
| "theme block", "checkout extension", "admin block", "web pixel", "post-purchase" | Extensions | `references/05-extensions.md` |
| "discount function", "shipping rate", "cart transform", "delivery customization", "payment customization", "order validation", "WASM" | Functions | `references/06-functions.md` |
| "add a product", "create an order", "list customers", "manage my store with AI" | Merchant MCP | `references/07-merchant-mcp.md` |
| "Aqua", "Liquid", "section", "snippet", "block", "metafields", "settings_schema" | Themes | `references/08-aqua-themes.md` |
| "guide me", "I'm a beginner", plain-English recipes | Beginner | `references/09-beginner-walkthroughs.md` |
| Error message, "Javy not found", "tunnel won't start", "OAuth state expired" | Troubleshooting | `references/10-troubleshooting.md` |

## Step 2 — Read the matching reference

Use the Read tool on the reference file. **Do not paraphrase from memory.**
The references are the source of truth and stay in sync with the published
CLI / SDK / MCP server.

## Step 3 — Confirm the plan, then execute

For destructive or merchant-data actions (publishing a function, installing
into a live store, mutating products, refunding orders), summarise what
you're about to do and confirm with the user before running. For local
scaffolding and read-only MCP calls, proceed directly.

## Always

- Use **bash / Git Bash** on Windows for LMS commands (not PowerShell — the
  CLI outputs UTF-8 characters and chained `&&` that break on PS).
- For test emails, use `<anything>@yopmail.com` — never `@example.com` or
  `@test.com` (Yopmail is a real throwaway-inbox service, so any real-server
  send actually lands somewhere).
- For Function development: compile locally with `lms function build`, then
  ship `.wasm` via `lms function deploy --wasm <path>`. Never ask the user
  to upload raw JS — the server only accepts pre-built dynamic-mode WASM.
- When unsure, point the user to <https://docs.launchmystore.io>.
