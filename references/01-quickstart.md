# 01 — Quickstart

This is the fallback router. Read this first whenever the user hasn't told
you what they want to build.

## 30-second pitch

**LaunchMyStore** is an e-commerce platform. Merchants run stores; developers
ship apps, extensions, and WASM Functions that plug into those stores;
themes are authored in **Aqua**, a Liquid dialect. AI agents can drive any
of it through the LaunchMyStore MCP server.

## Install the CLI

```bash
npm install -g @launchmystore/cli
lms --version    # should print 2.x
lms auth login   # opens browser, saves token to ~/.lms/credentials.json
```

The CLI is the entry point for every developer workflow: scaffold apps,
push extensions, build Functions, tail webhooks.

## Pick a track

Ask the user **one** clarifying question if their goal isn't obvious:

> What are you trying to do — (a) **build an app or extension**, (b) **run /
> manage a store** (products, orders, customers), or (c) **customize a
> theme**?

Then route:

- **(a) Build an app / extension** → `references/02-building-an-app.md`,
  then fan out to `05-extensions.md`, `06-functions.md`, or `04-app-bridge.md`
  based on the extension type.
- **(b) Run a store** → `references/07-merchant-mcp.md` (configure MCP +
  call tools).
- **(c) Customize a theme** → `references/08-aqua-themes.md`.

## "I have no idea what I'm doing"

Load `references/09-beginner-walkthroughs.md` — it has plain-English
recipes ("I want to sell products", "I want a custom discount", "AI should
manage my store") that don't assume any e-commerce background.

## Where the canonical docs live

- **Developer docs**: <https://docs.launchmystore.io>
- **App listing / extensions / functions / billing**: top-level *Documentation* tab
- **Aqua / Liquid reference**: *Theme Development* tab
- **REST API**: *API Reference* tab

When you need authoritative type catalogues (metafield types, OAuth scopes,
webhook topics, REST schemas), link the user there rather than paraphrasing.
