# 02 — Building an App

End-to-end app lifecycle: scaffold → develop with a tunnel → add extensions
→ deploy a version.

## 1. Scaffold

```bash
lms app create my-first-app
cd my-first-app
```

The wizard prompts for a template:

- **node** — Express server + OAuth flow, no UI framework.
- **react** — Vite + React frontend wired to a Node OAuth server. Best for
  embedded admin extensions that use App Bridge.
- **extension-only** — no app server; just a manifest + extension files.
  Pick this for theme apps that ship only storefront blocks/snippets and
  declarative WASM Functions.

The wizard writes:

- `.lmsrc.json` — app metadata (apiKey, scopes, redirect URI, extension
  registry).
- `package.json` — installs `@launchmystore/app-bridge` /
  `@launchmystore/app-bridge-react` as deps when applicable.
- `extensions/` — empty, populated by `lms extension generate`.

## 2. Develop locally with a tunnel

```bash
lms app dev
```

Spawns:

- Your app server on the local port specified by your `package.json` `dev` script.
- A Cloudflared tunnel that exposes it on a stable HTTPS subdomain.
- Hot-reloads the app's tunnel URL into `.lmsrc.json` so OAuth redirects
  resolve correctly.

The terminal prints an **Install URL** — open it in the merchant admin to
install the dev build of your app into a test store.

## 3. Add an extension

```bash
lms extension generate -t <kind>
```

Pick the extension `kind` from `references/05-extensions.md`. Common ones:

```bash
lms extension generate -t storefront_block   # Aqua block + schema
lms extension generate -t admin_block        # HTML iframe for admin
lms extension generate -t checkout_ui        # React extension for checkout
lms extension generate -t function_discount  # WASM function — see references/06-functions.md
```

Each generator drops a folder under `extensions/<handle>/` with a manifest,
sample source, and a `README.md` describing the contract.

## 4. Push extensions to your dev install

```bash
lms extension push --type storefront_block --handle hero-banner
```

This:

1. Bundles the extension files.
2. Uploads to the merchant install you authenticated against.
3. Hot-reloads the storefront / admin so changes show up immediately.

For Functions, the equivalent is `lms function deploy --wasm <path>`
(see `references/06-functions.md`).

## 5. Cut a version

```bash
lms app deploy --version 1.0.0
```

Bumps `.lmsrc.json` version, snapshots all extensions, registers an
immutable app version on the LaunchMyStore registry, and rolls it out to
merchants who installed the previous version (unless they opted into manual
upgrades).

## Reference layout

```
my-first-app/
├── .lmsrc.json          # apiKey, scopes, extensions registry, tunnel URL
├── package.json
├── server/              # OAuth + API routes (node/react templates only)
├── client/              # React UI (react template only)
└── extensions/
    └── <handle>/
        ├── manifest.json
        └── ... source files per extension kind
```

## Where to go next

- Decide which extension type you need → `references/05-extensions.md`
- Building a WASM Function → `references/06-functions.md`
- Wiring App Bridge actions into your admin/checkout UI → `references/04-app-bridge.md`
- Full CLI command surface + flags → `references/03-cli-reference.md`
