const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateOrderNumber(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let code = "";
  for (const byte of bytes) {
    code += ALPHABET[byte % ALPHABET.length];
  }
  return `GLAM-${code}`;
}

export function normalizeOrderNumber(raw: string): string {
  const cleaned = raw.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
  if (/^GLAM-[A-Z0-9]{6}$/.test(cleaned)) return cleaned;
  if (/^[A-Z0-9]{6}$/.test(cleaned)) return `GLAM-${cleaned}`;
  return cleaned;
}

export function guestStatusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "Waiting for approval";
    case "confirmed":
      return "Booked";
    case "cancelled":
      return "Cancelled";
    case "completed":
      return "Completed";
    default:
      return status;
  }
}

export function guestStatusHint(status: string): string {
  switch (status) {
    case "pending":
      return "Christine has your request. She will approve it after checking your GCash payment.";
    case "confirmed":
      return "Your appointment is approved. See you at the booked time.";
    case "cancelled":
      return "This appointment was cancelled. Message Christine if you need a new slot.";
    case "completed":
      return "This visit is done. Thank you!";
    default:
      return "";
  }
}
