# payment_customization example

```bash
lms function build  -f src/run.js -o dist/run.wasm
lms function test   --wasm dist/run.wasm -t payment_customization --input-file fixtures/input.json
lms function deploy --wasm dist/run.wasm -h hide-cod-high-value -t payment_customization
```

Fixture subtotal is `100×6 = $600` so COD gets hidden and card moves to position 0:

```json
{
  "operations": [
    { "hide": { "paymentMethodId": "cod"  } },
    { "move": { "paymentMethodId": "card", "position": 0 } }
  ]
}
```

## Operation reference

| Operation | Shape |
|---|---|
| `hide`   | `{ hide:   { paymentMethodId } }` |
| `rename` | `{ rename: { paymentMethodId, name } }` (sets `__renamed` flag in cart so the React Payment radio shows your override) |
| `move`   | `{ move:   { paymentMethodId, position } }` (0 = first) |
