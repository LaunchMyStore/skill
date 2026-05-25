# 04 — App Bridge

Iframe ↔ host SDK for admin / checkout / post-purchase extensions. Two
packages:

- **`@launchmystore/app-bridge`** — vanilla JS / TS, framework-agnostic.
- **`@launchmystore/app-bridge-react`** — React hooks + components on top.

Both communicate with the host via `postMessage` using the wire format
documented below.

## Install

```bash
npm install @launchmystore/app-bridge
# optional React layer
npm install @launchmystore/app-bridge-react
```

## Vanilla — `createApp`

```js
import { createApp, Toast, ResourcePicker } from '@launchmystore/app-bridge';

const app = createApp({
  apiKey: 'pk_live_...',                  // from .lmsrc.json
  host: new URLSearchParams(location.search).get('host'),
});

// One-shot dispatch
app.dispatch(Toast.show({ message: 'Saved', duration: 3000 }));

// Request + await response
const picked = await app.dispatchAndWait(
  ResourcePicker.open({ type: 'product', multiple: true })
);
console.log(picked.selection);

// Subscribe to host events
app.subscribe('TITLE_BAR_BUTTON_CLICK', (payload) => { /* ... */ });

// Session token for backend auth
const token = await app.getSessionToken();
fetch('/api/me', { headers: { Authorization: `Bearer ${token}` } });
```

## React — hooks

```jsx
import { AppBridgeProvider, useAppBridge, useToast, useResourcePicker, useSessionToken } from '@launchmystore/app-bridge-react';

function Root() {
  return (
    <AppBridgeProvider apiKey="pk_live_..." host={new URLSearchParams(location.search).get('host')}>
      <MyExtension />
    </AppBridgeProvider>
  );
}

function MyExtension() {
  const toast = useToast();
  const picker = useResourcePicker();
  const token = useSessionToken();

  return (
    <button onClick={async () => {
      const { selection } = await picker.open({ type: 'product' });
      toast.show({ message: `Picked ${selection.length} products` });
    }}>
      Pick products
    </button>
  );
}
```

Hooks shipped:

| Hook | Purpose |
|---|---|
| `useAppBridge()` | Returns the `app` instance |
| `useToast()` | `.show({ message, duration, isError })` |
| `useModal()` | `.open({ title, url | message, primaryAction, secondaryActions })` |
| `useResourcePicker()` | `.open({ type, multiple, query, initialSelectionIds })` |
| `useSessionToken()` | Auto-refreshing JWT for backend calls |
| `useTitleBar()` | `.set({ title, buttons, breadcrumbs })` |
| `useContextualSaveBar()` | `.show() / .hide() / .commit() / .discard()` |
| `useNavigationMenu()` | `.set({ items })` |
| `useLoading()` | `.start() / .stop()` (progress bar across host chrome) |
| `useFullscreen()` | `.enter() / .exit()` |
| `useLeaveConfirmation()` | `.enable() / .disable()` |

## Action catalogue

21 action families. Names match what host expects:

| Family | Actions |
|---|---|
| Toast | `TOAST_SHOW`, `TOAST_HIDE` |
| Modal | `MODAL_OPEN`, `MODAL_CLOSE`, `MODAL_UPDATE` |
| ResourcePicker | `RESOURCE_PICKER_OPEN`, `RESOURCE_PICKER_CLOSE` |
| TitleBar | `TITLE_BAR_UPDATE`, `TITLE_BAR_BUTTON_CLICK` (subscribe) |
| NavigationMenu | `NAVIGATION_MENU_UPDATE` |
| ContextualSaveBar | `SAVE_BAR_SHOW`, `SAVE_BAR_HIDE`, `SAVE_BAR_COMMIT`, `SAVE_BAR_DISCARD` |
| Loading | `LOADING_START`, `LOADING_STOP` |
| Fullscreen | `FULLSCREEN_ENTER`, `FULLSCREEN_EXIT` |
| LeaveConfirmation | `LEAVE_CONFIRMATION_ENABLE`, `LEAVE_CONFIRMATION_DISABLE` |
| SessionToken | `SESSION_TOKEN_REQUEST` → response with JWT |
| User | `USER_GET` |
| Config | `CONFIG_GET` |
| Environment | `ENVIRONMENT_GET` |
| Features | `FEATURES_GET` |
| Print | `PRINT_REQUEST` |
| Share | `SHARE_REQUEST` |
| Clipboard | `CLIPBOARD_WRITE`, `CLIPBOARD_READ_REQUEST`, `CLIPBOARD_PASTE_REQUEST` |
| Scanner | `SCANNER_START`, `SCANNER_STOP` |
| History | `HISTORY_PUSH`, `HISTORY_REPLACE`, `HISTORY_GO` |
| Lifecycle | `LIFECYCLE_READY`, `LIFECYCLE_VISIBLE`, `LIFECYCLE_HIDDEN` |
| Redirect | `REDIRECT_APP`, `REDIRECT_ADMIN_PATH`, `REDIRECT_REMOTE` |

### Resource picker — 11 picker types

`ResourcePicker.open({ type, multiple, query, initialSelectionIds })`

`type` ∈ `collection | product | blog | article | page | menu | customer |
order | product_variant | file | metaobject`.

Returns `{ selection: Array<{ id, title, ... }> }`.

## Wire format

The SDK encodes every dispatch as:

```js
{
  type: 'APP_BRIDGE_ACTION',
  action: 'TOAST_SHOW',                   // family-level name above
  id: '<uuid>',                           // for matching response
  payload: { message: 'Saved' }
}
```

Host responds:

```js
{
  type: 'APP_BRIDGE_RESPONSE',
  id: '<same uuid>',
  payload: { /* result */ }
}
// or
{
  type: 'APP_BRIDGE_RESPONSE',
  id: '<same uuid>',
  error: { code: 'CANCELLED', message: 'User dismissed' }
}
```

Iframe self-resize uses a separate envelope:

```js
{
  type: 'APP_BRIDGE_RESIZE',
  extensionId: '<manifest id>',           // MUST match host's filter
  height: 480
}
```

If `extensionId` doesn't match the host's filter, the iframe stays at the
default 200 px and the embed looks empty. The CLI generators wire this
correctly by default — don't hand-roll resize messages.

## Session tokens

JWT signed HS256 with the app's clientSecret. Cached client-side, refreshed
~30s before expiry. Use as Bearer on every backend call so your app server
can verify `merchantId` + `permissions` without trusting the iframe origin.

```js
const token = await app.getSessionToken();
fetch('/api/products', { headers: { Authorization: `Bearer ${token}` } });
```

On the app server, verify with the secret you got from
`GET /apps/credentials?apiKey=&domainSlug=` at install time.
