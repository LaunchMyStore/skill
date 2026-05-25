/**
 * delivery_customization — rename Standard with ETA + hide Overnight for
 * PO Box addresses (couriers don't deliver to PO Boxes).
 */
export function run(input) {
  const operations = [];
  const groups = input.cart.deliveryGroups || [];

  for (const group of groups) {
    const addressLine = (group.deliveryAddress?.address1 || '').toLowerCase();
    const isPoBox = /\b(p\.?o\.?\s*box|po-?box)\b/.test(addressLine);

    for (const option of group.deliveryOptions || []) {
      if (option.handle === 'standard') {
        operations.push({
          rename: {
            deliveryOptionHandle: option.handle,
            title: 'Standard (3–5 business days)',
          },
        });
      }
      if (option.handle === 'overnight' && isPoBox) {
        operations.push({
          hide: { deliveryOptionHandle: option.handle },
        });
      }
    }
  }

  return { operations };
}
