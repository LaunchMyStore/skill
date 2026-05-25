# discount example

Tiered order discount based on cart subtotal.

```bash
lms function build  -f src/run.js -o dist/run.wasm
lms function test   --wasm dist/run.wasm -t discount --input-file fixtures/input.json
lms function deploy --wasm dist/run.wasm -h tiered-discount -t discount
```

Fixture has a subtotal of `60×2 + 25×1 = $145`, so the test should output
the **10%** tier:

```json
{
  "discounts": [
    {
      "title": "10% off when you spend $100",
      "value": { "percentage": { "value": 10 } },
      "targets": [{ "orderSubtotal": {} }]
    }
  ]
}
```

## Variations

- **Target specific products** — replace `[{ orderSubtotal: {} }]` with
  `[{ productVariant: { id: <gid>, quantity: <n> } }]` per line you want
  to discount.
- **Fixed amount** instead of percentage —
  `value: { fixedAmount: { amount: '5.00', appliesToEachItem: false } }`.
- **Tag-based** — filter `input.cart.lines` to lines whose
  `merchandise.product.tags` contains a target tag, then build per-line
  `productVariant` targets.
