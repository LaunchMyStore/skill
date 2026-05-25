# 05 — Extensions

14 extension kinds. Pick by what the user describes, then scaffold + push.

## Picker logic

| User says… | Use type |
|---|---|
| "Show X on a product / collection / blog / index page" | `storefront_block` |
| "Reusable Liquid include" | `storefront_snippet` |
| "Embed a script across the whole storefront" | `storefront_embed` |
| "Custom storefront JS that runs after page load" | `storefront_app_script` |
| "Add a thank-you upsell to checkout" / "extension point" | `checkout_ui` |
| "Show an upsell after the order is placed" | `post_purchase` |
| "Embed UI inside the merchant admin product / order detail" | `admin_block` |
| "Custom button on a resource page that opens a modal" | `admin_action` |
| "Custom print template for orders / packing slips" | `admin_print_action` |
| "Show data on the customer account page" | `customer_account` |
| "Point-of-Sale tile / detail screen" | `pos_extension` |
| "Track events server-side (analytics, attribution)" | `web_pixel` |
| "Pick a fulfillment location based on cart contents" | `order_routing_rule` |
| "Customize transactional emails" | `email_template` |

Plus 6 **WASM Function** kinds — see `references/06-functions.md`:
`function_discount`, `function_shipping_rate`, `function_payment_customization`,
`function_delivery_customization`, `function_cart_transform`,
`function_order_validation`.

## Scaffold + push (same for every kind)

```bash
lms extension generate -t <type>     # asks for handle; creates extensions/<handle>/
lms extension push --type <type> --handle <handle>
```

`push` uploads to the dev install hot-reloads the storefront / admin
iframe. For Functions, replace `extension push` with `function deploy`
(see CLI reference).

## File shapes per kind

### `storefront_block` (Aqua + schema)

```
extensions/<handle>/
├── blocks/<handle>.aqua            # Liquid template
└── blocks/<handle>.schema.json     # block schema (target + settings)
```

Schema:

```json
{
  "name": "Hero banner",
  "target": "section",
  "settings": [
    { "type": "text",    "id": "title",     "label": "Heading", "default": "Welcome" },
    { "type": "image_picker", "id": "image", "label": "Background" },
    { "type": "url",     "id": "link",      "label": "CTA link" }
  ]
}
```

`target` ∈ `section | head | body | product | collection | index | cart`.

Source: `examples/theme-block/` in this skill repo.

### `storefront_snippet`

```
extensions/<handle>/
└── snippets/<handle>.aqua
```

Rendered from any theme via `{% render '<handle>' %}` with `with`/`for`
clauses for params.

### `checkout_ui`

```
extensions/<handle>/
├── manifest.json                   # extensionPoints: ["purchase.checkout.cart-line-list.render-after", ...]
├── package.json
└── src/index.tsx                   # React extension entry
```

Extension points cover cart, shipping, payment, summary, thank-you. Manifest
declares which points the extension renders into.

### `post_purchase`

```
extensions/<handle>/
├── manifest.json                   # offer rules + targeting
└── src/Post.tsx                    # React component shown post-checkout
```

### `admin_block`

```
extensions/<handle>/
├── manifest.json                   # target: "product.details.block", "order.details.block", ...
└── src/index.html                  # iframe served from your app server
```

26 verified admin extension targets, including:
`product.details.block`, `order.details.block`, `customer.details.block`,
`collection.details.block`, `discount.details.block`, `analytics`,
`sales-analytics`, `inventory`, `shipping-settings`, `payment-settings`,
`pos-settings`, `order-list`, `order-create`, `blog-list`, `contact-list`,
`gift-card-list`, `abandoned-order-list`, `account-settings`,
`collection-list`.

Wire App Bridge inside the iframe so the admin chrome (Toast / Modal /
ResourcePicker / TitleBar) responds to your dispatches — see
`references/04-app-bridge.md`.

### `admin_action` / `admin_print_action`

Same shape as `admin_block` but renders inline buttons on resource detail
pages. The action opens a modal (via App Bridge) when clicked.

### `customer_account`

Renders on the storefront customer account page (`/account`). Liquid +
optional client JS.

### `pos_extension`

Tile or detail extension for the POS app. Manifest declares the tile slot
and any required permissions.

### `web_pixel`

Server-side event tracker, runs in a sandboxed worker on every storefront
event (`page_viewed`, `cart_updated`, `checkout_completed`, etc.). Manifest:

```json
{
  "events": ["page_viewed", "product_viewed", "checkout_completed"],
  "settings": [ { "type": "text", "id": "endpoint", "label": "Your collector URL" } ]
}
```

### `order_routing_rule`

Declarative manifest with a matcher + action (route order to warehouse,
split fulfillment, etc.). No code — purely declarative.

### `email_template`

Aqua templates for transactional emails (order confirmation, shipping
update, etc.). Merchant picks which template overrides the built-in.

## Storefront block registration in a theme

Merchants add blocks to sections via the theme editor; the underlying
`templates/<page>.json` ends up shaped like:

```json
{
  "sections": {
    "main-apps": {
      "type": "apps",
      "blocks": {
        "hero": { "type": "@app", "settings": { /* per-block-schema */ } }
      },
      "block_order": ["hero"]
    }
  },
  "order": ["main-apps"]
}
```

`type: "@app"` is the conventional marker for app-supplied blocks.
