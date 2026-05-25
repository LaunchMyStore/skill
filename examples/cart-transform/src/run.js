/**
 * cart_transform — merge two specific SKUs into a single bundle line
 * priced at $39 instead of summing the individual prices.
 *
 * Output ops: `merge`, `expand`, `update` (this example only uses merge).
 */
export function run(input) {
  const BUNDLE_SKUS = new Set(['SKU-A', 'SKU-B']);
  const bundleLines = input.cart.lines.filter((l) =>
    BUNDLE_SKUS.has(l.merchandise?.sku),
  );

  if (bundleLines.length < 2) {
    return { operations: [] };
  }

  return {
    operations: [
      {
        merge: {
          cartLines: bundleLines.map((l) => ({
            cartLineId: l.id,
            quantity: l.quantity,
          })),
          title: 'Bundle A+B',
          price: { amount: '39.00' },
        },
      },
    ],
  };
}
