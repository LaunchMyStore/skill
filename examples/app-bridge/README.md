# app-bridge example

Minimal `admin_block` extension that mounts inside the merchant admin's
**Product → Details** page and uses three App Bridge primitives:

- **`useToast`** — chrome toast notifications
- **`useResourcePicker`** — open the host's product picker, get selection
- **`useSessionToken`** — get a fresh JWT to authenticate calls to your
  app server

Files:

- `AdminBlock.tsx` — the React entry; wrap with `<AppBridgeProvider>`.
- `manifest.json` — declares target slot (`product.details.block`) + the
  iframe URL served from your app server.

## Scaffold

```bash
lms extension generate -t admin_block
# drop AdminBlock.tsx + manifest.json into extensions/<handle>/
lms extension push --type admin_block --handle product-sync
```

Open any product detail page in the merchant admin to see the iframe
injected at the `product.details.block` slot.

## What App Bridge handles for you

| You call | Host responds |
|---|---|
| `picker.open({ type: 'product' })` | Renders the picker modal; returns selected items |
| `toast.show({ message })` | Renders chrome toast at top of admin |
| `getSessionToken()` | Returns HS256-signed JWT (cached + auto-refreshed) |
| `useTitleBar().set({ title, buttons })` | Updates the page title bar |
| `useModal().open({ ... })` | Opens a host-rendered modal you can update from the iframe |

See `references/04-app-bridge.md` for the full action catalogue.
