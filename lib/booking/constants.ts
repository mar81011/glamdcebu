export type VisitType = "walk_in" | "home_service";

export const APPOINTMENT_DURATION_MINUTES = 60;

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

export function formatAppointmentEnd(start: Date, durationMinutes = APPOINTMENT_DURATION_MINUTES): Date {
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
