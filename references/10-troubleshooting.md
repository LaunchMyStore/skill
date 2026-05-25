# 10 — Troubleshooting

Common errors + fixes. Read this when the user pastes an error or says
"it's not working".

---

## CLI

### `Error: Javy binary not found`

The Function build shells out to [Javy](https://github.com/bytecodealliance/javy).
Install it once, then either put it on `PATH` or export `JAVY_BIN_PATH`:

```bash
brew install bytecodealliance/tap/javy
# or grab the release binary from github.com/bytecodealliance/javy/releases
export JAVY_BIN_PATH=/usr/local/bin/javy
lms function build -f src/run.js -o dist/run.wasm
```

### `WASM rejected: must be dynamic-mode`

`lms function deploy` only accepts WASM compiled with `javy compile -d`
(dynamic mode), which keeps the binary small and links the shared QuickJS
provider at runtime. The CLI's `lms function build` does this automatically.

If you compiled by hand with `javy compile` (static mode), re-run with the
`-d` flag or use `lms function build`.

### `WASM exceeds maximum size`

Default cap is **256 KB** for compiled WASM. Override with
`LMS_FUNCTION_MAX_COMPILED_SIZE` (bytes). If your function is genuinely
that large, you're probably bundling third-party libraries — most Function
JS hand-written stays under 10 KB.

### `lms app dev`: tunnel won't start

Cloudflared is bundled with the CLI. If the tunnel fails to bind:

- Check nothing else is bound to the dev port (`lsof -i :<port>`).
- Restart with `lms app dev --port <other>`.
- On corporate networks, Cloudflared sometimes can't reach the edge — try
  a phone hotspot to confirm.

### `OAuth state expired`

When `lms auth login` redirects back, the state token has a 10-minute TTL.
Just re-run `lms auth login` — opens a fresh window.

---

## App Bridge

### Iframe stays at 200 px high after `Lifecycle.ready`

The host filters resize messages by `extensionId`. If your iframe's
`APP_BRIDGE_RESIZE` envelope ships the wrong `extensionId`, the host
silently drops it. Confirm the iframe's URL has `?extensionId=<handle>`
appended by the host, and that your `extensionId` matches.

### `Promise rejected after 10s` for Clipboard / Config / User / Environment

There's a latent SDK quirk where error responses from those four families
don't reject the promise — they hang for the 10s default timeout.
Workaround: wrap with your own timeout and treat hangs as cancellations.

### `navigator.clipboard.readText()` throws in admin iframe

Chrome blocks clipboard read in cross-origin iframes. Use App Bridge's
`Clipboard.read()` / `Clipboard.paste()` instead — they round-trip through
the host page where the permission applies.

### Session token verify fails on app server

The token is HS256-signed with your app's `clientSecret`. Fetch the secret
fresh at install time via `GET /apps/credentials?apiKey=&domainSlug=` —
don't hardcode it. Also verify `aud` matches your `apiKey`, not the
merchant's.

---

## Functions

### `Function timed out` in logs

Default invocation timeout is 5 ms wall-clock. If your function loops over
all cart lines + does heavy work per line, you'll hit it on large carts.
Fixes: trim per-line work, cache lookups outside the loop, fall back to
`return { discounts: [] }` (or the empty output for your type) on a
fast-path early exit.

### `Cannot find module 'fs'` at build time

Functions run in a sandboxed JS engine — there's no Node, no filesystem,
no network. If your source imports Node APIs, the Javy compile fails. Keep
the source to pure JS: control flow, math, array/object ops.

### Function deploys but isn't taking effect

Two things to check:

1. The merchant install actually has the function active. The MCP tool
   `list_app_functions` will list what's deployed against a store.
2. The function's pipeline site is firing. `cart_transform`, `discount`,
   `shipping_rate`, `payment_customization`, `delivery_customization`
   all fire during cart re-pricing; `order_validation` fires at order
   placement. Verify by triggering the relevant action and checking
   `lms function logs --handle <handle>`.

---

## MCP server

### Client connects but no tools appear

The most common misconfig is pointing `type` at `"stdio"` or `"http"`
instead of `"sse"`, or pointing the URL at `/mcp` instead of `/mcp/sse`.
The correct entry:

```json
{
  "type": "sse",
  "url": "https://api.launchmystore.io/mcp/sse",
  "headers": { "Authorization": "Bearer <token>" }
}
```

### `401 Unauthorized` on first call

Your long-lived token has expired or is bound to a different store. Mint a
new one via `POST /mcp/token` with a fresh merchant session JWT.

### Tool returns empty even though the store has data

Check which store the token is bound to. If a merchant has multiple stores,
each needs its own MCP token; the token isn't switchable in-session.

---

## Themes

### `Liquid syntax error` after editing a section

If the error references a `render` tag, it's almost always the multi-line
`render … with X as Y, key: value` clause being collapsed wrong by the
preprocessor. Keep `with X as Y, key: value` on a single line, or split
into separate `render` calls.

### Section / block doesn't appear in the editor

Confirm:

1. The section file has a valid `{% schema %}` block at the bottom.
2. The schema has at least one `presets` entry (otherwise the editor won't
   list it under "Add section").
3. `enabled_on` / `disabled_on` doesn't exclude the template you're
   editing.

### Theme settings save but don't render

Cached. Either:

- Reload the storefront page (the per-render cache is short, ~5 min).
- Or, from MCP, `save_theme_settings` which busts the per-store render
  cache server-side.

### Metafield value is set but renders blank

Three likely causes:

1. The definition exists but no value is set on that resource — check
   `list_metafield_definitions` then the resource's metafields list.
2. The owner type doesn't match (you set a `product` metafield, but the
   template is iterating `collection.products` and reading from
   `collection.metafields`).
3. The Liquid drop renders the type as an object, not a string. For
   `money`, `rating`, `weight`, `dimension`, `volume`, pipe through the
   matching filter (`| money`, etc.) or access `.value`.

---

## Multi-tenant / custom domain

### App installs on staging but breaks on production

The app's `apiKey` is the same across environments, but the tunnel URL
and `domainSlug` differ. Confirm:

- `lms app info` shows the correct tunnel URL for the environment you're
  testing against.
- The merchant install's `domainSlug` matches the store you're hitting
  (custom domains resolve via the storefront platform's domain config,
  not directly).

### Webhook delivery says 200 but my server never sees it

If you're tunneling, confirm the tunnel is up (`lms app dev` shows
"tunnel: up" in the status line). The platform retries 3× with
exponential backoff (1m / 5m / 15m), so a brief tunnel drop is recoverable
— check `lms webhook tail` for the delivery log.
