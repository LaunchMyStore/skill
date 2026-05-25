# cart-transform example

Merges two specific SKUs (`SKU-A` + `SKU-B`) into a single bundle line
priced at a fixed $39.

```bash
lms function build  -f src/run.js -o dist/run.wasm
lms function test   --wasm dist/run.wasm -t cart_transform --input-file fixtures/input.json
lms function deploy --wasm dist/run.wasm -h bundle-ab -t cart_transform
```

Expected test output (line 3 untouched, lines 1+2 merged):

```json
{
  "operations": [
    {
      "merge": {
        "cartLines": [
          { "cartLineId": "gid://Cart/Line/1", "quantity": 1 },
          { "cartLineId": "gid://Cart/Line/2", "quantity": 1 }
        ],
        "title": "Bundle A+B",
        "price": { "amount": "39.00" }
      }
    }
  ]
}
```

Other operations the type supports (not used here):

- **`expand`** — split a line into N new lines (one with optional price adjustment).
- **`update`** — rename / re-image / re-attribute a line in-place.
