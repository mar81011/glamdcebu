export const DEVELOPER_FEE_PER_BOOKING = 10;

export function isBillableBooking(status: string): boolean {
  return status !== "cancelled";
}

export function developerFeeForStatus(status: string): number {
  return isBillableBooking(status) ? DEVELOPER_FEE_PER_BOOKING : 0;
}

export function sumDeveloperFees(
  appointments: Array<{ status: string; developer_fee_paid?: boolean | null }>,
  options?: { paidOnly?: boolean; unpaidOnly?: boolean },
): number {
  return appointments.reduce((sum, appt) => {
    const fee = developerFeeForStatus(appt.status);
    if (fee === 0) return sum;
    if (options?.paidOnly && !appt.developer_fee_paid) return sum;
    if (options?.unpaidOnly && appt.developer_fee_paid) return sum;
    return sum + fee;
  }, 0);
}

export function countBillableBookings(
  appointments: Array<{ status: string }>,
): number {
  return appointments.filter((a) => isBillableBooking(a.status)).length;
}
