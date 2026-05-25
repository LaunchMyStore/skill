# theme-block example

App-supplied storefront block. Ships as two files in the extension folder:

- **`<handle>.aqua`** — the Liquid template (this file uses the `.aqua`
  extension because LaunchMyStore reserves it for app-supplied blocks,
  but the syntax is plain Liquid).
- **`<handle>.schema.json`** — block settings declared separately so the
  editor can render the inputs.

## Scaffold

```bash
lms extension generate -t storefront_block
# handle: trending-products
# drop trending-products.aqua + trending-products.schema.json into
# extensions/trending-products/blocks/

lms extension push --type storefront_block --handle trending-products
```

After push, merchants can add the block via the theme editor to any
section whose `blocks` schema accepts `type: "@app"` (the conventional
marker for app-supplied blocks).

## Underlying `templates/<page>.json` shape

When a merchant adds your block, the template JSON gets:

```json
{
  "sections": {
    "main-apps": {
      "type": "apps",
      "blocks": {
        "trending-1": { "type": "@app", "settings": { "title": "Hot picks", "tag": "trending", "limit": 4 } }
      },
      "block_order": ["trending-1"]
    }
  },
  "order": ["main-apps"]
}
```
