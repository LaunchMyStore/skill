/**
 * order_validation — block orders that exceed per-line quantity limits.
 * Returns one error per offending line, addressed by JSONPath.
 *
 * Empty `errors` array = order may proceed.
 */
export function run(input) {
  const MAX_PER_LINE = 10;
  const errors = [];

  input.cart.lines.forEach((line, idx) => {
    if (line.quantity > MAX_PER_LINE) {
      errors.push({
        target: `$.cart.lines[${idx}]`,
        message: `Maximum ${MAX_PER_LINE} units per line. Please reduce the quantity.`,
      });
    }
  });

  return { errors };
}
