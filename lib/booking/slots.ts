import {
  APPOINTMENT_DURATION_MINUTES,
  SLOT_START_INTERVAL_MINUTES,
} from "@/lib/booking/constants";

export interface BusinessHourRow {
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

export interface BlockedSlotRow {
  start_at: string;
  end_at: string;
}

export interface ExistingAppointment {
  appointment_at: string;
  duration_minutes: number;
  status?: string;
}

function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function slotToMinutes(slot: string): number {
  const match = slot.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function minutesToSlotLabel(minutes: number): string {
  const hours24 = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hour12 = hours24 % 12 || 12;
  return `${hour12}:${String(mins).padStart(2, "0")} ${period}`;
}

function startSlotsForDay(
  openMin: number,
  closeMin: number,
  durationMinutes: number,
  intervalMinutes: number,
): string[] {
  const slots: string[] = [];
  for (
    let m = openMin;
    m + durationMinutes <= closeMin;
    m += intervalMinutes
  ) {
    slots.push(minutesToSlotLabel(m));
  }
  return slots;
}

export function slotEndLabel(
  slot: string,
  durationMinutes = APPOINTMENT_DURATION_MINUTES,
): string {
  return minutesToSlotLabel(slotToMinutes(slot) + durationMinutes);
}

export function getAvailableSlots(
  dateKey: string,
  businessHours: BusinessHourRow[],
  blocked: BlockedSlotRow[],
  existing: ExistingAppointment[],
  durationMinutes = APPOINTMENT_DURATION_MINUTES,
  intervalMinutes = SLOT_START_INTERVAL_MINUTES,
): string[] {
  const date = new Date(dateKey + "T12:00:00");
  const dayOfWeek = date.getDay();
  const hours = businessHours.find((h) => h.day_of_week === dayOfWeek);

  if (!hours || hours.is_closed) return [];

  const openMin = parseTimeToMinutes(hours.open_time);
  const closeMin = parseTimeToMinutes(hours.close_time);

  const now = new Date();

  const daySlots = startSlotsForDay(
    openMin,
    closeMin,
    durationMinutes,
    intervalMinutes,
  );

  return daySlots.filter((slot) => {
    const slotMin = slotToMinutes(slot);
    const slotStart = new Date(dateKey + "T00:00:00");
    slotStart.setMinutes(slotMin);

    if (slotStart <= now) return false;

    for (const b of blocked) {
      const bs = new Date(b.start_at);
      const be = new Date(b.end_at);
      const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);
      if (slotStart < be && slotEnd > bs) return false;
    }

    for (const appt of existing) {
      const aStart = new Date(appt.appointment_at);
      const aEnd = new Date(
        aStart.getTime() + appt.duration_minutes * 60000,
      );
      const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);
      if (
        appt.status !== "cancelled" &&
        slotStart < aEnd &&
        slotEnd > aStart
      ) {
        return false;
      }
    }

    return true;
  });
}

export function slotToIso(dateKey: string, slot: string): string {
  const minutes = slotToMinutes(slot);
  const d = new Date(dateKey + "T00:00:00");
  d.setMinutes(minutes);
  return d.toISOString();
}
