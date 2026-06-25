export interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/** Week runs Sunday → Saturday (matches site calendar). */
export function getWeekRange(anchor: Date): DateRange {
  const day = startOfDay(anchor);
  const start = new Date(day);
  start.setDate(day.getDate() - day.getDay());

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const sameMonth = start.getMonth() === end.getMonth();
  const label = sameMonth
    ? `${start.toLocaleDateString("en-PH", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-PH", { day: "numeric", year: "numeric" })}`
    : `${start.toLocaleDateString("en-PH", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}`;

  return { start: startOfDay(start), end: endOfDay(end), label };
}

export function getMonthRange(anchor: Date): DateRange {
  const start = startOfDay(new Date(anchor.getFullYear(), anchor.getMonth(), 1));
  const end = endOfDay(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0));

  return {
    start,
    end,
    label: start.toLocaleDateString("en-PH", { month: "long", year: "numeric" }),
  };
}

export function isInRange(isoDate: string, range: DateRange): boolean {
  const d = new Date(isoDate);
  return d >= range.start && d <= range.end;
}

export function shiftAnchor(anchor: Date, period: "week" | "month", delta: number): Date {
  const d = new Date(anchor);
  if (period === "week") {
    d.setDate(d.getDate() + delta * 7);
  } else {
    d.setMonth(d.getMonth() + delta);
  }
  return d;
}

export interface DayBucket {
  dateKey: string;
  label: string;
  count: number;
  revenue: number;
}

export function buildDailyBuckets(
  range: DateRange,
  appointments: Array<{ appointment_at: string; total_price: number; status: string }>,
): DayBucket[] {
  const buckets: DayBucket[] = [];
  const cursor = new Date(range.start);

  while (cursor <= range.end) {
    const dateKey = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
    buckets.push({
      dateKey,
      label: cursor.toLocaleDateString("en-PH", { weekday: "short", day: "numeric" }),
      count: 0,
      revenue: 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  for (const appt of appointments) {
    if (appt.status === "cancelled") continue;
    const key = appt.appointment_at.slice(0, 10);
    const bucket = buckets.find((b) => b.dateKey === key);
    if (bucket) {
      bucket.count += 1;
      bucket.revenue += appt.total_price;
    }
  }

  return buckets;
}
