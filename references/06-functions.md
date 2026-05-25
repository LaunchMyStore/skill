# 06 — Functions (WASM)

6 Function types. All ship as **pre-compiled dynamic-mode WASM** built
locally with [Javy](https://github.com/bytecodealliance/javy). The platform
links them against a shared QuickJS provider at runtime.

## Common workflow (every type)

```bash
# 1. scaffold
lms extension generate -t function_<type>

# 2. write JS — must export `run(input)` (or default-export it)
# extensions/<handle>/src/run.js

# 3. compile locally
lms function build -f extensions/<handle>/src/run.js -o extensions/<handle>/dist/run.wasm

# 4. test against a fixture
lms function test --wasm extensions/<handle>/dist/run.wasm -t <type> --input-file extensions/<handle>/fixtures/input.json

# 5. deploy
lms function deploy --wasm extensions/<handle>/dist/run.wasm -h <handle> -t <type>
```

### Source export contract

The build looks for `run` in this order:

```js
export function run(input) { ... }
// or
export default function (input) { ... }
// or
module.exports = function (input) { ... }
// or
module.exports.run = function (input) { ... }
```

### Size limits

- **Source JS**: 256 KB (env: `LMS_FUNCTION_MAX_SOURCE_SIZE`)
- **Compiled WASM**: 256 KB (env: `LMS_FUNCTION_MAX_COMPILED_SIZE`)

A hand-written function compiles to ~3–10 KB dynamic-mode (the QuickJS
provider is shared at runtime, not bundled per function).

### Execution

- **Default timeout**: 5 ms wall-clock per invocation
- **Default memory**: 10 MB
- **Active-install cap**: 50 functions per type per store

## The 6 types

Each type fires from a specific pipeline site. Output is **purely declarative**
— functions don't make network calls or mutate state directly; they emit
operations that the platform applies.

---

### 1. `cart_transform`

Fires when the cart is built / re-priced. Lets you merge / split / re-price
line items.

**Input**

```json
{
  "cart": {
    "lines": [
      { "id": "gid://Cart/Line/1", "quantity": 2, "merchandise": { "id": "gid://Variant/100", "product": { "id": "gid://Product/10", "title": "T-shirt", "tags": ["bundle-a"] } } }
    ]
  }
}
```

**Output** — array of operations:

```json
{ "operations": [
  { "merge": { "cartLines": [{ "cartLineId": "gid://Cart/Line/1", "quantity": 2 }], "title": "Bundle A", "price": { "amount": "39.00" } } },
  { "expand": { "cartLineId": "gid://Cart/Line/2", "expandedCartItems": [{ "merchandiseId": "gid://Variant/101", "quantity": 1, "price": { "adjustment": { "fixedPricePerUnit": { "amount": "0.00" } } } }] } },
  { "update": { "cartLineId": "gid://Cart/Line/3", "title": "Renamed line" } }
]}
```

See `examples/cart-transform/`.

---

### 2. `discount`

Emits per-line or order-level discount entries that join the existing
discount reducers.

**Input**

```json
{ "cart": { "lines": [ { "id": "...", "quantity": 1, "merchandise": { "product": { "tags": ["shoes"] } }, "cost": { "amountPerQuantity": { "amount": "80.00" } } } ] } }
```

**Output**

```json
{ "discounts": [
  { "title": "5% off shoes",
    "value": { "percentage": { "value": 5 } },
    "targets": [{ "productVariant": { "id": "gid://Variant/200", "quantity": 1 } }] }
] }
```

`value` shapes: `{ percentage: { value } }` or `{ fixedAmount: { amount, appliesToEachItem } }`.

`targets`: `productVariant`, `orderSubtotal`.

See `examples/discount-function/`.

---

### 3. `shipping_rate`

Adds custom shipping rates returned in the cart's shipping options.

**Input**

```json
{ "cart": { "deliverableLines": [...], "deliveryAddress": { "country": "US", "province": "CA", "zip": "94016" } } }
```

**Output**

```json
{ "rates": [
  { "name": "Same-day courier", "price": { "amount": "12.00" }, "code": "SAMEDAY" },
  { "name": "Free over $100",   "price": { "amount":  "0.00" }, "code": "FREE100" }
] }
```

See `examples/shipping-rate/`.

---

### 4. `payment_customization`

Hides, renames, or reorders payment methods at checkout.

**Input**

```json
{ "cart": { "lines": [...], "buyerIdentity": { "countryCode": "US" } },
  "paymentMethods": [ { "id": "cod", "name": "Cash on Delivery" }, { "id": "card", "name": "Credit card" } ] }
```

**Output**

```json
{ "operations": [
  { "hide":   { "paymentMethodId": "cod" } },
  { "rename": { "paymentMethodId": "card", "name": "Pay by card (3% off)" } },
  { "move":   { "paymentMethodId": "card", "position": 0 } }
]}
```

See `examples/payment-customization/`.

---

### 5. `delivery_customization`

Hides, renames, or reorders shipping / delivery options.

**Input**

```json
{ "cart": { "deliveryGroups": [ { "id": "...", "deliveryOptions": [ { "handle": "standard", "title": "Standard", "cost": { "amount": "5.00" } } ] } ] } }
```

**Output**

```json
{ "operations": [
  { "rename": { "deliveryOptionHandle": "standard", "title": "Standard (3-5 business days)" } },
  { "hide":   { "deliveryOptionHandle": "overnight" } }
]}
```

See `examples/delivery-customization/`.

---

### 6. `order_validation`

Blocks order placement based on cart contents. Runs at `addClientOrder` and
also re-runs as a final guard.

**Input**

```json
{ "cart": { "lines": [ { "quantity": 12, "merchandise": { "id": "..." } } ], "buyerIdentity": { "email": "x@y.com", "countryCode": "US" } } }
```

**Output**

```json
{ "errors": [
  { "target": "cart", "message": "Maximum 10 units per line. Please reduce the quantity." }
]}
```

`target` ∈ `cart | "$.cart.lines[N]"` (JSONPath into the input).
Empty `errors` array = order may proceed.

See `examples/order-validation/`.

---

## Worked example: discount function end-to-end

```bash
lms extension generate -t function_discount   # handle: save-10-on-shoes

# extensions/save-10-on-shoes/src/discount.js
cat > extensions/save-10-on-shoes/src/discount.js <<'JS'
export function run(input) {
  const targets = [];
  for (const line of input.cart.lines) {
    const tags = line.merchandise?.product?.tags || [];
    if (tags.includes('shoes')) {
      targets.push({ productVariant: { id: line.merchandise.id, quantity: line.quantity } });
    }
  }
  if (!targets.length) return { discounts: [] };
  return {
    discounts: [{
      title: '10% off shoes',
      value: { percentage: { value: 10 } },
      targets,
    }],
  };
}
JS

lms function build  -f extensions/save-10-on-shoes/src/discount.js -o extensions/save-10-on-shoes/dist/discount.wasm
lms function test   --wasm extensions/save-10-on-shoes/dist/discount.wasm -t discount --input-file extensions/save-10-on-shoes/fixtures/cart.json
lms function deploy --wasm extensions/save-10-on-shoes/dist/discount.wasm -h save-10-on-shoes -t discount
```
