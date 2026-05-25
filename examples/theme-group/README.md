# theme-group example

A **section group** bundles multiple sections together so the layout file
renders them all with one tag. Files in this example:

- `header-group.json` — drop into `sections/header-group.json`. Declares 2
  sections (`announcement-bar`, `header`) with per-section settings + a
  child blocks array.
- `layout-theme.liquid` — excerpt of `layout/theme.liquid` showing how
  groups hook into the document via `{%- sections 'header-group' -%}`.

## Common groups

- `header-group.json` — announcement bar, top nav, mega menus.
- `footer-group.json` — link columns, newsletter, social row, copyright.
- `overlay-group.json` — modals, drawers, cart drawer, search overlay,
  age-gate.

The merchant editor lets shoppers reorder the sections inside a group via
the same drag-handle UI used for in-template sections.
