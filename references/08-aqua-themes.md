# 08 — Aqua Themes (Liquid-based)

Aqua is LaunchMyStore's theme language — a dialect of the open-source
Liquid templating language with the conventional storefront extensions for
sections, blocks, snippets, settings schema, metafields, and 90+ built-in
filters.

If you've authored Liquid themes before, everything you know transfers:
file layout, tag/filter syntax, section schema, `{% schema %}`, metafields
drops, `forloop`, `paginate`, `render`/`include`. Source of truth lives at
<https://docs.launchmystore.io/aqua>.

## File tree

```
themes/<themeId>/
├── assets/                  # CSS, JS, images, fonts (publicly served)
├── blocks/                  # Reusable blocks
├── sections/                # Page sections (.liquid + schema)
├── snippets/                # Reusable Liquid includes
├── templates/               # Page templates (index.json, product.json, ...)
├── layout/                  # theme.liquid, password.liquid, checkout.liquid
├── config/
│   ├── settings_data.json    # current values
│   ├── settings_schema.json  # editable schema for theme settings
│   └── schema-index.json
└── locales/                 # en.default.json, fr.json, ...
```

## Sections

A section is a `.liquid` file + a `{% schema %}` block:

```liquid
<!-- sections/hero.liquid -->
<section class="hero" style="background: {{ section.settings.bg_color }}">
  <h1>{{ section.settings.title }}</h1>

  {%- for block in section.blocks -%}
    {%- case block.type -%}
      {%- when 'cta' -%}
        <a href="{{ block.settings.link }}">{{ block.settings.label }}</a>
      {%- when 'image' -%}
        <img src="{{ block.settings.image | img_url: '1200x' }}" alt="">
    {%- endcase -%}
  {%- endfor -%}
</section>

{% schema %}
{
  "name": "Hero",
  "settings": [
    { "type": "text",  "id": "title",     "label": "Heading", "default": "Welcome" },
    { "type": "color", "id": "bg_color",  "label": "Background", "default": "#fff" }
  ],
  "blocks": [
    { "type": "cta",   "name": "Call to action", "settings": [
      { "type": "url",  "id": "link",  "label": "Link" },
      { "type": "text", "id": "label", "label": "Label", "default": "Shop now" }
    ]},
    { "type": "image", "name": "Image", "settings": [
      { "type": "image_picker", "id": "image", "label": "Image" }
    ]}
  ],
  "presets": [
    { "name": "Hero with CTA", "blocks": [{ "type": "cta" }] }
  ]
}
{% endschema %}
```

Schema keys:

- **`name`** — display name in the editor
- **`settings`** — section-level inputs (`text`, `textarea`, `richtext`,
  `image_picker`, `video`, `color`, `range`, `select`, `checkbox`,
  `number`, `radio`, `url`, `font_picker`, `link_list`, `product`,
  `collection`, `blog`, `article`, `page`)
- **`blocks`** — per-block schemas (each with `type`, `name`, `settings`)
- **`max_blocks`**, **`limit`** — counts
- **`presets`** — entries shown in the "Add section" menu
- **`default`** — initial settings + blocks when first added
- **`enabled_on` / `disabled_on`** — restrict to specific templates

Reference inside Liquid: `section.settings.<id>`, `section.blocks`,
`block.settings.<id>`.

## Blocks (file-level, app-supplied or theme-supplied)

Block files live in `blocks/<handle>.liquid` (and optionally with a
sidecar `blocks/<handle>.schema.json` for app extension blocks — see
`references/05-extensions.md`).

A theme template can mix theme blocks and app blocks using the conventional
`@app` type marker:

```json
{
  "sections": {
    "main": {
      "type": "apps",
      "blocks": {
        "ext-hero": { "type": "@app", "settings": { "title": "Hi" } },
        "static-cta": { "type": "cta", "settings": { "label": "Buy" } }
      },
      "block_order": ["ext-hero", "static-cta"]
    }
  },
  "order": ["main"]
}
```

## Section groups

Section groups bundle multiple sections (e.g. a header group, footer
group, overlay group). They're referenced from the layout file via the
`sections` tag:

```liquid
<!-- layout/theme.liquid -->
<!doctype html>
<html>
  <head>{{ content_for_header }}</head>
  <body>
    {%- sections 'header-group' -%}
    {{ content_for_layout }}
    {%- sections 'footer-group' -%}
    {%- sections 'overlay-group' -%}
  </body>
</html>
```

Group definition lives in `sections/header-group.json`:

```json
{
  "name": "Header",
  "type": "header",
  "sections": {
    "announcement": { "type": "announcement-bar", "settings": {} },
    "header":       { "type": "header",            "settings": {} }
  },
  "order": ["announcement", "header"]
}
```

## Snippets

```liquid
<!-- snippets/product-card.liquid -->
<a href="{{ product.url }}" class="card">
  <img src="{{ product.featured_image | img_url: '600x' }}" alt="{{ product.title }}">
  <h3>{{ product.title }}</h3>
  <p>{{ product.price | money }}</p>
</a>
```

Render:

```liquid
{% render 'product-card', product: my_product %}
```

Iteration form:

```liquid
{% render 'product-card' for collection.products as product %}
```

> **Gotcha — multi-line `render … with` clauses.** The Aqua preprocessor
> normalises whitespace, but a `render` tag that spans many lines with a
> `with X as Y` clause plus extra keyword args can confuse it. Keep the
> `with X as Y, key: value` clause on one line, or split `with` and the
> keyword args into separate `render` calls. If you see a Liquid parse
> error after generating a multi-line render, this is usually the cause.

## Metafields drops

Standard access pattern, identical across every owner type:

```liquid
{{ product.metafields.custom.badge }}
{{ product.metafields.custom.warranty_years }}
{{ collection.metafields.custom.intro_blurb }}
{{ shop.metafields.custom.support_phone }}
{{ customer.metafields.custom.loyalty_tier }}
{{ order.metafields.custom.fulfilment_priority }}
{{ page.metafields.custom.cta_text }}
{{ article.metafields.custom.reading_time }}
{{ blog.metafields.custom.feature_image }}
{{ variant.metafields.custom.ship_class }}
```

Drops auto-render based on the metafield's declared type. List metafields
iterate:

```liquid
{% for tag in product.metafields.custom.feature_tags %}
  <span class="tag">{{ tag }}</span>
{% endfor %}
```

Money metafields go through the `money` filter:

```liquid
{{ product.metafields.custom.deposit | money }}
```

Reference metafields (`product_reference`, `variant_reference`,
`collection_reference`) resolve to the referenced drop:

```liquid
{% assign related = product.metafields.custom.related_product %}
{{ related.title }} — {{ related.price | money }}
```

Full type catalogue + render rules:
<https://docs.launchmystore.io/aqua/metafields>.

## Filters worth knowing

| Filter | Use |
|---|---|
| `money` | Format money according to shop currency settings |
| `money_with_currency` | `$12.00 USD` |
| `money_without_currency` | `12.00` |
| `asset_url` | Resolve `assets/<file>` to its CDN URL |
| `asset_img_url: '1200x'` | Resized asset image |
| `img_url: '600x600_crop_center'` | Resized + cropped product image |
| `image_url: width: 600, height: 400` | Modern image-resize syntax |
| `link_to` | Anchor tag |
| `weight_with_unit` | "1.5 kg" |
| `handle` / `handleize` | Slugify string |
| `t` | Translate via `locales/<lang>.json` |
| `default` | Fallback for nil values |
| `script_tag` / `stylesheet_tag` | `<script>` / `<link rel=stylesheet>` |
| `pluralize` | "1 item" / "2 items" |

## Customizer integration

Theme files are stored against a `themeId` per store. The merchant admin
hosts a visual theme editor that reads/writes `templates/*.json` +
`config/settings_data.json` over a section-rendering API. You can also
edit any theme file via the MCP server — see `theme_write_file` and
related tools in `references/07-merchant-mcp.md`.
