# 07 — Merchant MCP Server

LaunchMyStore ships an MCP server with **130+ tools** so an LLM can drive a
real merchant store: products, orders, customers, themes, billing,
analytics, plus higher-level helpers like `chat_with_data` and
`nightly_briefing`.

## 1. Connect

Configure Claude Code (or any MCP-aware client) by adding the server to
your `~/.claude/mcp.json` (global) or project-level `.mcp.json`:

```json
{
  "mcpServers": {
    "launchmystore": {
      "type": "sse",
      "url": "https://api.launchmystore.io/mcp/sse",
      "headers": {
        "Authorization": "Bearer <LONG_LIVED_TOKEN>"
      }
    }
  }
}
```

Get a long-lived token:

```bash
curl -X POST https://api.launchmystore.io/mcp/token \
  -H "Authorization: Bearer <merchant-session-jwt>" \
  -H "Content-Type: application/json" \
  -d '{ "name": "claude-code-laptop", "scopes": ["read", "write"] }'
```

Response: `{ "token": "lms_mcp_..." }` — paste into the `Authorization`
header above.

**Wire format note**: the server speaks the SSE flavor of MCP. The first
event on `/mcp/sse` is `event: endpoint` carrying the POST messages URL;
client posts JSON-RPC requests there, server responses come back over the
SSE stream. Set `type: "sse"` and point at `/mcp/sse` (not `/mcp`) — that's
the most common misconfiguration.

## 2. Tool catalogue (by domain)

Pick the right tool without enumerating all 130+.

### Products
`add_product`, `update_product`, `delete_product`, `get_products`,
`add_variant`, `update_variant`, `delete_variant`, `get_variant_options`,
`generate_product_description`, `rewrite_for_seo`, `image_to_listing`,
`export_products`, `set_metafield`.

### Orders
`create_manual_order`, `get_orders`, `get_single_order`, `update_order`,
`refund_order`, `get_abandoned_orders`, `export_orders`.

### Customers
`add_customer`, `update_customer`, `delete_customer`, `get_customers`,
`add_wallet_credit`, `get_credit_history`, `export_customers`,
`export_contacts`, `export_newsletter`, `get_newsletter_subscribers`.

### Catalog
Categories: `add_category`, `update_category`, `delete_category`, `get_categories`.
Blogs: `add_blog`, `update_blog`, `delete_blog`, `get_blogs`.
Pages: `add_page`, `update_page`, `delete_page`, `get_pages`.
FAQs: `add_faq`, `delete_faq`, `get_faqs`.
Policies: `add_policy`, `update_policy`, `delete_policy`, `get_policies`.
Menus: `add_menu`, `update_menu`, `delete_menu`, `get_menus`.
Snippets: `add_snippet`, `update_snippet`, `delete_snippet`, `get_snippets`.

### Themes
`list_themes`, `set_active_theme`, `get_theme_sections`,
`get_available_sections`, `get_section_schema`, `save_section_settings`,
`reorder_sections`, `save_theme_settings`, `get_theme_settings`,
`theme_list_files`, `theme_read_file`, `theme_write_file`,
`theme_create_section`, `theme_create_block`, `theme_create_snippet`,
`theme_delete_file`, `theme_rename_file`, `add_section`, `delete_section`,
`add_block`, `delete_block`.

### Apps
`list_marketplace_apps`, `list_installed_apps`, `install_app`,
`uninstall_app`, `list_developer_apps`, `create_app`,
`update_developer_app`, `regenerate_app_secret`,
`get_developer_app_installations`, `submit_app_for_review`,
`create_app_extension`, `update_app_extension`, `delete_app_extension`,
`list_app_functions`, `upload_app_function`, `get_app_function_details`,
`get_app_function_source`, `delete_app_function`, `test_app_function`.

### Analytics + AI helpers
`get_dashboard_analytics`, `get_sales_analytics`, `get_product_analytics`,
`get_traffic_analytics`, `nightly_briefing`, `dashboard_insight`,
`chat_with_data`, `summarize_reviews`.

### Settings
Shipping: `get_shipping`, `update_shipping`, `get_shipping_zones`,
`add_shipping_zone`, `update_shipping_zone`, `delete_shipping_zone`.
Taxes: `get_taxes`, `add_tax`, `delete_tax`, `get_sales_taxes`,
`add_sales_tax`, `delete_sales_tax`.
Payments: `get_payment_providers`, `add_payment_provider`,
`delete_payment_provider`, `get_checkout_settings`,
`update_checkout_settings`.
Warehouses: `get_warehouses`, `add_warehouse`, `update_warehouse`,
`delete_warehouse`.
Webhooks: `get_webhooks`, `add_webhook`, `update_webhook`, `delete_webhook`.
Metafields: `list_metafield_definitions`, `create_metafield_definition`,
`set_metafield`, `delete_metafield`.
Staff + store: `get_staff`, `remove_staff`, `get_store_details`,
`update_store_details`, `get_socials`, `update_socials`, `get_preferences`,
`update_preferences`.
Notifications: `get_notifications`, `delete_notification`,
`subscribe_to_event`.

### Reviews + media
`get_reviews`, `summarize_reviews`, `list_media`, `delete_media`.

### POS
`open_shift`, `close_shift`, `get_current_shift`, `list_shifts`,
`get_leaderboard`.

### Subscriptions / selling plans
`create_selling_plan_group`, `get_selling_plan_groups`,
`delete_selling_plan_group`, `attach_selling_plan_to_products`,
`get_active_subscription`, `get_subscription_history`, `cancel_subscription`.

### Coupons
`create_coupon`, `update_coupon`, `delete_coupon`, `get_coupons`.

### Async tooling
`schedule_task`, `approve_and_execute`, `write_content`.

## 3. Workflows (intent → tool sequence)

| User says | Call order |
|---|---|
| "Add 10 products from this CSV" | Loop `add_product` per row (parse the CSV first; confirm before bulk-creating) |
| "Run a flash sale on shoes" | `get_products` (filter by tag) → `create_coupon` → `update_product` (badge) |
| "Refund order #1234" | `get_orders` (search) → `get_single_order` → confirm with user → `refund_order` |
| "Why are sales down this week?" | `get_sales_analytics` (current week) → `get_sales_analytics` (prior week) → `chat_with_data` (compare) |
| "Make a homepage hero section" | `theme_create_section` → `theme_write_file` (Aqua) → `save_section_settings` |
| "Install the Foundry Reviews app" | `list_marketplace_apps` (search) → confirm → `install_app` |
| "Block orders with >10 of any item" | Scaffold `function_order_validation` (see references/06-functions.md) → `upload_app_function` |
| "Summarise yesterday's orders" | `get_orders` (date range) → `chat_with_data` or `nightly_briefing` |
| "What's in my cart" + product detail Q&A | `get_single_order` / `get_products` → answer inline |

## 4. Safety rules

- **Always confirm destructive actions** before calling: `delete_product`,
  `delete_customer`, `delete_app_function`, `refund_order`,
  `cancel_subscription`, anything that mutates billing or marketing
  subscribers.
- **Bulk operations**: summarise the count first ("about to create 47
  products from your CSV — proceed?") and only then loop.
- **Read-only is free**: `get_*`, `list_*`, `chat_with_data`, analytics —
  no confirmation needed.
- **For Function uploads**: build + test locally first
  (`lms function build` / `lms function test`) — `upload_app_function`
  expects a pre-compiled WASM, not raw JS.

## 5. Quick test

After connecting:

> List my last 5 orders

Should fire `get_orders` and return rows. If it returns nothing, the token
is bound to a store that has no orders yet — pick a different store or
seed one.
