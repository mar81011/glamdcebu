export const DAY_LABELS: Record<number, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

export const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export interface BusinessHour {
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

/** Default close: midnight, so the last 2.5-hour slot is 9:30 PM–12:00 AM. */
export const DEFAULT_CLOSE_TIME = "00:00:00";
export const DEFAULT_OPEN_TIME = "09:00:00";

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

/** 00:00 as a close time means end-of-day midnight (24:00), not opening midnight. */
export function closeTimeToMinutes(closeTime: string): number {
  const minutes = timeToMinutes(closeTime);
  return minutes === 0 ? 24 * 60 : minutes;
}

export function closeIsAfterOpen(openTime: string, closeTime: string): boolean {
  const open = timeToMinutes(openTime);
  const close = timeToMinutes(closeTime);
  if (close === 0) return open > 0;
  return close > open;
}

/** Postgres time → HTML time input value (HH:mm) */
export function toTimeInputValue(time: string): string {
  const [h, m] = time.split(":");
  const hour = Number(h) % 24;
  return `${String(Number.isFinite(hour) ? hour : 0).padStart(2, "0")}:${(m ?? "00").padStart(2, "0")}`;
}

/** HTML time input → Postgres time */
export function fromTimeInputValue(value: string): string {
  return value.length === 5 ? `${value}:00` : value;
}

export function formatTime12h(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}
