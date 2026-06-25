import Link from "next/link";

export function PrototypeBanner() {
  return (
    <div className="sticky top-0 z-50 bg-amber-500 px-4 py-2 text-center text-xs font-semibold tracking-wide text-amber-950">
      PROTOTYPE — UI preview only. Bookings are not saved.
    </div>
  );
}
