# delivery_customization example

```bash
lms function build  -f src/run.js -o dist/run.wasm
lms function test   --wasm dist/run.wasm -t delivery_customization --input-file fixtures/input.json
lms function deploy --wasm dist/run.wasm -h pobox-rules -t delivery_customization
```

Fixture has a PO Box address with both Standard and Overnight options.
Expected output (rename Standard, hide Overnight):

```json
{
  "operations": [
    { "rename": { "deliveryOptionHandle": "standard",  "title": "Standard (3–5 business days)" } },
    { "hide":   { "deliveryOptionHandle": "overnight" } }
  ]
}
```

## Operation reference

| Operation | Shape |
|---|---|
| `rename` | `{ rename: { deliveryOptionHandle, title } }` |
| `hide`   | `{ hide:   { deliveryOptionHandle } }` |
| `move`   | `{ move:   { deliveryOptionHandle, position } }` |
