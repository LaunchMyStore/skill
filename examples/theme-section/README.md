# theme-section example

A complete `sections/hero.liquid` with:

- 4 section-level settings (text, textarea, color, select).
- 2 block types (CTA + Image) with per-block settings.
- 2 presets so the editor's "Add section" menu offers two starting points.
- `enabled_on` restricting where the section can be added.
- Block-level settings exposed via the conventional `block.settings.<id>` accessor.

## Add to a theme

Drop `hero.liquid` into `sections/` of any theme, then either:

- Edit `templates/index.json` to reference it:

  ```json
  {
    "sections": { "hero": { "type": "hero", "settings": { "title": "Hi!" }, "blocks": { "cta-1": { "type": "cta", "settings": { "label": "Shop", "link": "/collections/all" } } }, "block_order": ["cta-1"] } },
    "order": ["hero"]
  }
  ```

- Or use the MCP server: `theme_write_file` (write the .liquid file) →
  `add_section` (insert into a template).
