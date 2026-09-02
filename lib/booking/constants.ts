export type VisitType = "walk_in" | "home_service";

/** Each visit (lashes, nails, and add-ons together) is one 2.5-hour block. */
export const APPOINTMENT_DURATION_MINUTES = 150;

/** Start times every half hour so the next client can book as soon as a visit ends. */
export const SLOT_START_INTERVAL_MINUTES = 30;

export function formatDurationLabel(
  minutes = APPOINTMENT_DURATION_MINUTES,
): string {
  const hours = minutes / 60;
  if (Number.isInteger(hours)) {
    return hours === 1 ? "1 hour" : `${hours} hours`;
  }
  return `${parseFloat(hours.toFixed(1))} hours`;
}

export const VISIT_TYPE_OPTIONS: Array<{
  value: VisitType;
  label: string;
  description: string;
}> = [
  {
    value: "walk_in",
    label: "Walk-in",
    description: "Visit the salon at South Ridge Residences",
  },
  {
    value: "home_service",
    label: "Home service",
    description: "Christine comes to your location",
  },
];

export function visitTypeLabel(type: VisitType | string): string {
  return (
    VISIT_TYPE_OPTIONS.find((o) => o.value === type)?.label ??
    (type === "home_service" ? "Home service" : "Walk-in")
  );
}

export function formatAppointmentEnd(
  start: Date,
  durationMinutes = APPOINTMENT_DURATION_MINUTES,
): Date {
  return new Date(start.getTime() + durationMinutes * 60_000);
}

export function formatTimeRange(
  start: Date,
  durationMinutes = APPOINTMENT_DURATION_MINUTES,
): string {
  const end = formatAppointmentEnd(start, durationMinutes);
  const opts: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
  };
  return `${start.toLocaleTimeString("en-PH", opts)} – ${end.toLocaleTimeString("en-PH", opts)}`;
}
