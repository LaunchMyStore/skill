/**
 * discount — tiered order discount based on subtotal.
 *   $50+   → 5% off subtotal
 *   $100+  → 10% off subtotal
 *   $200+  → 15% off subtotal
 */
export function run(input) {
  const subtotal = input.cart.lines.reduce((sum, line) => {
    const unit = parseFloat(line.cost.amountPerQuantity.amount);
    return sum + unit * line.quantity;
  }, 0);

  let percentage = 0;
  let title = '';
  if (subtotal >= 200) {
    percentage = 15;
    title = '15% off when you spend $200';
  } else if (subtotal >= 100) {
    percentage = 10;
    title = '10% off when you spend $100';
  } else if (subtotal >= 50) {
    percentage = 5;
    title = '5% off when you spend $50';
  }

  if (!percentage) return { discounts: [] };

  return {
    discounts: [
      {
        title,
        value: { percentage: { value: percentage } },
        targets: [{ orderSubtotal: {} }],
      },
    ],
  };
}
