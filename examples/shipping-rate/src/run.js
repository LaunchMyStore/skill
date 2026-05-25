/**
 * shipping_rate — add custom rates based on destination + cart subtotal.
 *   - US address → $12 same-day courier
 *   - Subtotal ≥ $100 → free standard shipping
 */
export function run(input) {
  const country = input.cart.deliveryAddress?.country;
  const subtotal = input.cart.deliverableLines.reduce((s, l) => {
    return s + parseFloat(l.cost?.amountPerQuantity?.amount || '0') * l.quantity;
  }, 0);

  const rates = [];

  if (country === 'US') {
    rates.push({
      code: 'SAMEDAY_US',
      name: 'Same-day courier (US only)',
      price: { amount: '12.00' },
    });
  }

  if (subtotal >= 100) {
    rates.push({
      code: 'FREE_OVER_100',
      name: 'Free standard shipping (orders over $100)',
      price: { amount: '0.00' },
    });
  }

  return { rates };
}
