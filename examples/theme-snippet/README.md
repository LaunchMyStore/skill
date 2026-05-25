# theme-snippet example

Reusable Liquid include. Drop into a theme's `snippets/product-card.liquid`,
then render from any section / template.

## Render forms

```liquid
{# Pass a single product variable into the snippet #}
{% render 'product-card', product: my_product %}

{# Iterate a collection inside the snippet's scope #}
{% render 'product-card' for collection.products as product %}

{# Pass arbitrary keyword arguments #}
{% render 'product-card', product: my_product, size: 'large', highlight: true %}
```

Inside the snippet, `product` (or whatever name you chose after `as`) is
in scope along with anything you passed as keyword args (`size`,
`highlight`, etc.).

## Snippet vs block vs section

- **Snippet** — pure Liquid include, no settings UI. Best for repeated
  markup like product cards, breadcrumbs, social icons.
- **Block** — Liquid + JSON schema, configurable per-instance through the
  theme editor. Lives inside a section.
- **Section** — top-level template region with its own schema. Can host
  blocks.

If the merchant should configure it visually → use a block/section. If it's
just shared markup → use a snippet.
