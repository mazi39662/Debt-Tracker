export function calculatePaidAmount(
  originalAmount: number,
  remainingAmount: number,
) {
  return Math.max(0, originalAmount - remainingAmount);
}

export function calculateProgress(
  originalAmount: number,
  remainingAmount: number,
) {
  if (originalAmount <= 0) return 0;

  const paid = originalAmount - remainingAmount;

  return Math.min(1, Math.max(0, paid / originalAmount));
}

export function calculateRemaining(
  remainingAmount: number,
  paymentAmount: number,
) {
  return Math.max(0, remainingAmount - paymentAmount);
}
