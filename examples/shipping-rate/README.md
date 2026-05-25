# shipping_rate example

```bash
lms function build  -f src/run.js -o dist/run.wasm
lms function test   --wasm dist/run.wasm -t shipping_rate --input-file fixtures/input.json
lms function deploy --wasm dist/run.wasm -h custom-rates -t shipping_rate
```

Expected output (US address, subtotal $120 — both rules fire):

```json
{
  "rates": [
    { "code": "SAMEDAY_US",    "name": "Same-day courier (US only)",          "price": { "amount": "12.00" } },
    { "code": "FREE_OVER_100", "name": "Free standard shipping (orders over $100)", "price": { "amount":  "0.00" } }
  ]
}
```

These appear alongside the built-in rates the merchant configured in
shipping settings; the checkout UI shows all of them grouped under the
shipping options selector.
