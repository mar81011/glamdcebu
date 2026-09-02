/** Guests pay half the booking total via GCash to confirm. */
export const BOOKING_DEPOSIT_RATE = 0.5;

export function bookingDepositAmount(total: number): number {
  if (!Number.isFinite(total) || total <= 0) return 0;
  return Math.round(total * BOOKING_DEPOSIT_RATE);
}

export function bookingBalanceDue(total: number): number {
  if (!Number.isFinite(total) || total <= 0) return 0;
  return Math.max(0, total - bookingDepositAmount(total));
}

export const BOOKING_DEPOSIT_PERCENT_LABEL = "50%";
