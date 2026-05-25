# order_validation example

Blocks order placement when any single line exceeds 10 units.

```bash
lms function build  -f src/run.js -o dist/run.wasm
lms function test   --wasm dist/run.wasm -t order_validation --input-file fixtures/input.json
lms function deploy --wasm dist/run.wasm -h max-qty-per-line -t order_validation
```

Fixture has line 2 with quantity 12 → expected output:

```json
{
  "errors": [
    {
      "target": "$.cart.lines[1]",
      "message": "Maximum 10 units per line. Please reduce the quantity."
    }
  ]
}
```

`target` is a JSONPath into the input — supported addresses:

- `"cart"` — generic cart-level error
- `"$.cart.lines[N]"` — point at a specific line
- `"$.cart.buyerIdentity.email"` — point at a specific field

The checkout UI surfaces the message at the targeted field.
