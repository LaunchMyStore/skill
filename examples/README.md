# Examples

Copy-pasteable starters for every LaunchMyStore primitive. Each folder
is self-contained: `src/`, `fixtures/` (when relevant), and a `README.md`
explaining the contract.

## WASM Functions (all 6 types)

| Folder | Type | What it does |
|---|---|---|
| [`cart-transform/`](cart-transform/) | `cart_transform` | Merge two SKUs into a bundle line at a fixed bundle price |
| [`discount-function/`](discount-function/) | `discount` | Tiered discount: 5% over $50, 10% over $100, 15% over $200 |
| [`shipping-rate/`](shipping-rate/) | `shipping_rate` | Same-day rate when address country == US, free over $100 |
| [`payment-customization/`](payment-customization/) | `payment_customization` | Hide Cash-on-Delivery when cart subtotal > $500 |
| [`delivery-customization/`](delivery-customization/) | `delivery_customization` | Rename "Standard" to "Standard (3–5 days)"; hide "Overnight" for PO Boxes |
| [`order-validation/`](order-validation/) | `order_validation` | Block orders with >10 of any single line item |

For each function:

```bash
lms function build  -f src/run.js -o dist/run.wasm
lms function test   --wasm dist/run.wasm -t <type> --input-file fixtures/input.json
lms function deploy --wasm dist/run.wasm -h <handle> -t <type>
```

## Theme primitives

| Folder | What it shows |
|---|---|
| [`theme-section/`](theme-section/) | A complete `sections/hero.liquid` with `{% schema %}`, settings, blocks, presets |
| [`theme-block/`](theme-block/) | App-supplied storefront block (`.aqua` + `.schema.json`) |
| [`theme-group/`](theme-group/) | `sections/header-group.json` referenced from `layout/theme.liquid` |
| [`theme-snippet/`](theme-snippet/) | A reusable `snippets/product-card.liquid` rendered from a template |

## App Bridge

| Folder | What it shows |
|---|---|
| [`app-bridge/`](app-bridge/) | Minimal React admin block: Toast + ResourcePicker + SessionToken |

## MCP prompts

[`mcp-prompts.md`](mcp-prompts.md) — natural-language prompts that map cleanly to MCP tool sequences (refund flow, bulk product creation, theme-block insertion, nightly briefing, etc.).
