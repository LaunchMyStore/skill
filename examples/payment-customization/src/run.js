/**
 * payment_customization — hide Cash-on-Delivery on high-value carts to
 * reduce fraud / RTO exposure. Also reorders cards to the top.
 */
export function run(input) {
  const subtotal = input.cart.lines.reduce((sum, line) => {
    return sum + parseFloat(line.cost.amountPerQuantity.amount) * line.quantity;
  }, 0);

  const operations = [];

  // Hide COD when subtotal > $500
  const codMethod = input.paymentMethods.find((m) => m.id === 'cod');
  if (codMethod && subtotal > 500) {
    operations.push({ hide: { paymentMethodId: codMethod.id } });
  }

  // Always show the credit-card method first
  const cardMethod = input.paymentMethods.find((m) => m.id === 'card');
  if (cardMethod) {
    operations.push({ move: { paymentMethodId: cardMethod.id, position: 0 } });
  }

  return { operations };
}
