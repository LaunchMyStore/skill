# MCP prompts — natural language → tool sequence

Copy-pasteable prompts that map cleanly to LaunchMyStore MCP tools. Useful
as a cheat sheet for merchants and as test inputs when validating the skill.

## Products

> Add 5 new t-shirts to my store: "Classic White" $20, "Vintage Black" $25,
> "Ocean Blue" $22, "Sunset Orange" $22, "Forest Green" $24. All cotton, M/L/XL.

→ Confirm count → loop `add_product` (with variants) 5 times.

> Generate SEO-friendly descriptions for my 10 best-selling products.

→ `get_sales_analytics` (top products) → `get_products` → loop
`rewrite_for_seo`.

> Turn this product photo into a listing.

→ `image_to_listing` with the user's image URL.

## Orders

> Refund order #1234 in full.

→ `get_orders` (search "1234") → `get_single_order` → **confirm** →
`refund_order`.

> Show me abandoned carts from the last 7 days.

→ `get_abandoned_orders` with date filter.

> Export all orders from October as CSV.

→ `export_orders` with date range.

## Customers

> Add $50 wallet credit to customer raja@yopmail.com as a goodwill gesture.

→ `get_customers` (search by email) → **confirm** → `add_wallet_credit`.

> Email the top 10% of my customers a 15% discount code.

→ `get_customers` → sort by lifetime spend → `create_coupon` → use the
notification tool to send.

## Themes

> Add a "Trending products" section to my homepage that pulls products
> tagged "trending".

→ `theme_create_section` (use `examples/theme-section/hero.liquid` as
template structure) → `theme_write_file` → `add_section` to `index`
template.

> Change my header background to dark navy.

→ `get_theme_settings` → `save_theme_settings` with the new colour.

> Show me what's in my active theme's product template.

→ `list_themes` → `theme_read_file` `templates/product.json`.

## Apps + extensions

> Install the Foundry Reviews app.

→ `list_marketplace_apps` (search "foundry") → **confirm** → `install_app`.

> Build me a function that hides Cash on Delivery when the cart total
> exceeds $500.

→ Scaffold via `lms extension generate -t function_payment_customization`
→ copy from `examples/payment-customization/` → `lms function build` →
`lms function test` → `lms function deploy`.

## Analytics

> Why are my sales down this week?

→ `get_sales_analytics` current → `get_sales_analytics` prior →
`chat_with_data` to compare.

> Give me a one-paragraph nightly summary of what happened today.

→ `nightly_briefing`.

> What products are trending in the last 14 days?

→ `get_product_analytics` with 14-day window → rank by sell-through.

## Setup

> I'm based in Bangalore and want to ship across India. Set me up.

→ `update_store_details` (currency INR) → `add_warehouse` (Bangalore) →
`add_shipping_zone` (India regions) → `add_sales_tax` (GST) →
`add_payment_provider` (Razorpay) → confirm summary.

## POS

> Open my shift for today, $200 starting float.

→ `get_current_shift` (confirm none) → `open_shift` with floatAmount.

> Show me yesterday's POS leaderboard.

→ `get_leaderboard` with date filter.
