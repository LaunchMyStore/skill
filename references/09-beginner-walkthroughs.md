# 09 — Beginner Walkthroughs

Plain-English recipes for users who don't have an e-commerce background.
No code unless we're scaffolding something — most steps are MCP calls or
admin clicks.

The pattern: identify what the user wants in business terms, ask one
clarifying question if needed, then walk a short sequence with confirmation
gates on anything destructive.

---

## "I want to sell products"

1. Pick a theme:
   - `list_themes` → show the user the active and available themes.
   - If empty, recommend `install_app` with a theme template from the
     marketplace.
2. Add products:
   - For each product the user describes, call `add_product` with
     `title`, `description`, `price`, `images`, `categoryIds`.
   - Bulk path: ask for a CSV / list, parse it, **confirm count**, loop.
3. Configure the basics:
   - `update_store_details` (name, address, currency, support email).
   - `update_socials` (Instagram, X, Facebook handles).
   - `add_shipping_zone` for the regions you ship to.
   - `add_payment_provider` to connect Stripe / PayPal / etc.
4. Share the storefront URL the merchant admin shows.

---

## "I want a custom discount"

Ask **one** question:

> Should this be a discount code customers type (works on every store, no
> code) or an automatic rule based on cart contents (more flexible, ships
> as a small WASM function)?

- **Discount code** → `create_coupon` with `code`, `discountType`
  (`percentage`/`fixed`), `value`, optional `minOrderAmount`,
  `appliesToProducts` / `appliesToCategories`, `usageLimit`, `expiresAt`.
- **Automatic / cart-rule-based** → walk
  [`references/06-functions.md`](06-functions.md): `lms extension generate
  -t function_discount` → edit JS → `lms function build` → `lms function
  test` → `lms function deploy`. Copy from `examples/discount-function/`.

---

## "I want my own theme"

For someone who's never written Liquid:

1. Start from a marketplace theme: `list_marketplace_apps` → install one.
2. Make small edits via the merchant admin's theme editor — that covers
   most colour / image / text changes.
3. For deeper changes, work through MCP:
   - `list_themes` → pick the active theme.
   - `theme_list_files` → see what's there.
   - `theme_read_file` to inspect a section file.
   - `theme_create_section` + `theme_write_file` to add a new section.
   - `save_section_settings` to plug it into a template.
4. When the user asks for a layout or behaviour you need to author, load
   [`references/08-aqua-themes.md`](08-aqua-themes.md) for the Liquid /
   schema patterns, and `examples/theme-block/` as a starting point.

---

## "I want to embed my app inside the merchant admin"

For someone shipping their first admin extension:

1. `lms app create my-admin-tool --template react`
2. `lms app dev` — opens tunnel + install URL.
3. Install into a test store via the admin.
4. `lms extension generate -t admin_block`
   - Pick a target (e.g. `product.details.block`).
5. In the iframe source, use `@launchmystore/app-bridge-react`:
   - Wrap with `<AppBridgeProvider apiKey={...} host={...}>`.
   - Use `useToast`, `useResourcePicker`, `useSessionToken` for chrome.
6. `lms extension push --type admin_block --handle <handle>`.
7. Refresh the product detail page — the iframe appears in the target
   slot.

Load [`references/04-app-bridge.md`](04-app-bridge.md) before writing the
iframe code.

---

## "I want AI to manage my store for me"

For a merchant who wants to operate the store through Claude:

1. Set up the MCP server — full instructions in
   [`references/07-merchant-mcp.md`](07-merchant-mcp.md).
2. First-run smoke test: ask the LLM "list my last 5 orders". If that
   returns rows, the connection is live.
3. Set safety expectations with the merchant: read-only actions
   (`get_*`, analytics, summaries) run freely; anything that creates /
   updates / deletes / refunds / cancels requires explicit confirmation.
4. Suggest starter prompts:
   - "Give me a nightly briefing"
   - "Refund order #1234"
   - "Draft new SEO descriptions for my 10 best sellers"
   - "Which products had a sales drop this week vs. last?"
   - "Send a 10%-off coupon to customers who haven't ordered in 90 days"

---

## "I want my function to give 10% off the cart when it's over $100"

The single most common natural-language Function request — walk it as a
worked example so the user sees the whole loop:

1. `lms app create ten-off-100 --template extension-only`
2. `lms extension generate -t function_discount` (handle: `ten-off-100`)
3. Edit the generated `extensions/ten-off-100/src/discount.js`:

   ```js
   export function run(input) {
     const subtotal = input.cart.lines.reduce(
       (s, l) => s + parseFloat(l.cost.amountPerQuantity.amount) * l.quantity, 0
     );
     if (subtotal < 100) return { discounts: [] };
     return {
       discounts: [{
         title: '10% off when you spend $100',
         value: { percentage: { value: 10 } },
         targets: [{ orderSubtotal: {} }],
       }],
     };
   }
   ```

4. `lms function build  -f extensions/ten-off-100/src/discount.js -o extensions/ten-off-100/dist/discount.wasm`
5. `lms function test   --wasm extensions/ten-off-100/dist/discount.wasm -t discount --input-file extensions/ten-off-100/fixtures/cart.json`
6. `lms function deploy --wasm extensions/ten-off-100/dist/discount.wasm -h ten-off-100 -t discount`
7. `lms app deploy --version 1.0.0`

Visit the storefront with a cart over $100 and the discount line shows up
in the cart summary.
