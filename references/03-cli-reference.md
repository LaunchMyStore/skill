# 03 — `lms` CLI Reference

Mirrors <https://docs.launchmystore.io/getting-started/cli-setup>. This page
exists so you can pick the right command + flags without leaving the chat.

## Install / version

```bash
npm install -g @launchmystore/cli
lms --version
lms --help
lms <command> --help
```

## Authentication

| Command | What it does |
|---|---|
| `lms auth login` | Opens browser → OAuth → saves token at `~/.lms/credentials.json` |
| `lms auth logout` | Clears saved credentials |
| `lms auth whoami` | Prints current user + active app |

## App lifecycle

| Command | What it does |
|---|---|
| `lms app create <name>` | Scaffold a new app (templates: node / react / extension-only) |
| `lms app dev` | Start dev server + Cloudflared tunnel + hot-reload OAuth URLs |
| `lms app deploy --version <semver>` | Snapshot extensions + register an immutable app version |
| `lms app info` | Print apiKey, scopes, extensions, tunnel URL |
| `lms app open` | Open the current app in the merchant admin (auto-detects install) |

## Versions

| Command | What it does |
|---|---|
| `lms app version list` | List all versions of the current app |
| `lms app version rollback --to <semver>` | Roll the active install back to a prior version |
| `lms app version resume-auto-update` | Re-enable auto-updates after a rollback |

## Extensions

| Command | What it does |
|---|---|
| `lms extension generate -t <kind>` | Scaffold an extension folder (see `05-extensions.md` for kinds) |
| `lms extension push --type <kind> --handle <handle>` | Upload + hot-reload extension files to dev install |
| `lms extension list` | List all extensions in the current app |
| `lms extension delete --handle <handle>` | Remove an extension from the app |

## Functions (WASM)

The v2.0 flow is **local compile, ship `.wasm`**. The server only accepts
pre-built dynamic-mode WASM.

| Command | What it does |
|---|---|
| `lms function build -f <src.js> -o <out.wasm>` | Compile JS → WASM via local Javy (dynamic mode) |
| `lms function test --wasm <file> -t <type> --input-file <fixture.json>` | Run the WASM against a fixture and print output |
| `lms function deploy --wasm <file> -h <handle> -t <type>` | Upload the compiled WASM + manifest |
| `lms function list` | List installed functions on the dev install |
| `lms function logs --handle <handle>` | Tail execution logs |

**Types** (`-t`): `discount`, `shipping_rate`, `payment_customization`,
`delivery_customization`, `cart_transform`, `order_validation`. See
`references/06-functions.md` for input/output contracts per type.

### Required tooling

`lms function build` shells out to **Javy** (Bytecode Alliance, dynamic
mode). Install via:

```bash
# macOS / Linux
brew install bytecodealliance/tap/javy

# Or download release binary from github.com/bytecodealliance/javy/releases
```

Override the binary path with `JAVY_BIN_PATH=/abs/path/to/javy`.

### Size limits

| Env var | Default | Purpose |
|---|---|---|
| `LMS_FUNCTION_MAX_SOURCE_SIZE` | 262144 (256 KB) | Pre-compile JS source cap |
| `LMS_FUNCTION_MAX_COMPILED_SIZE` | 262144 (256 KB) | Post-compile WASM cap |

Both default to **256 KB**, matching the standard WASM-storefront-Function
ceiling. A typical hand-written function compiles to ~3–10 KB dynamic-mode.

## Webhooks

| Command | What it does |
|---|---|
| `lms webhook list` | List subscribed topics for the current app |
| `lms webhook subscribe -t <topic> -u <url>` | Add a subscription |
| `lms webhook unsubscribe --id <id>` | Remove a subscription |
| `lms webhook tail` | Stream live webhook deliveries to your terminal |
| `lms webhook replay --id <delivery-id>` | Re-fire a past delivery against your tunnel URL |

Topics follow the conventional `resource/action` shape: `orders/create`,
`orders/updated`, `products/update`, `app/uninstalled`, etc. (full list at
<https://docs.launchmystore.io/webhooks/topics>).

## Billing

| Command | What it does |
|---|---|
| `lms billing plans` | List app pricing plans defined in `.lmsrc.json` |
| `lms billing create-charge --merchant <id> --plan <name>` | Issue a recurring charge (Stripe-backed) |

## Common env vars

```bash
# CLI auth + endpoint
LMS_API_BASE=https://api.launchmystore.io   # override for staging/local
LMS_AUTH_TOKEN=<long-lived token>           # bypass interactive login (CI use)

# Function build
JAVY_BIN_PATH=/abs/path/to/javy
LMS_FUNCTION_MAX_SOURCE_SIZE=262144
LMS_FUNCTION_MAX_COMPILED_SIZE=262144
```

## Worked example: ship a discount function

```bash
lms app create discount-demo --template extension-only
cd discount-demo

lms extension generate -t function_discount
# edit extensions/save-10/src/discount.js

lms function build -f extensions/save-10/src/discount.js -o extensions/save-10/dist/discount.wasm
lms function test --wasm extensions/save-10/dist/discount.wasm -t discount --input-file extensions/save-10/fixtures/cart.json
lms function deploy --wasm extensions/save-10/dist/discount.wasm -h save-10 -t discount

lms app deploy --version 1.0.0
```
