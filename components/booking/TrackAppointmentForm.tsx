"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { normalizeOrderNumber } from "@/lib/booking/order-number";

export function TrackAppointmentForm() {
  const router = useRouter();
  const [order, setOrder] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const normalized = normalizeOrderNumber(order);
    if (!normalized) return;
    router.push(`/track?order=${encodeURIComponent(normalized)}`);
  }

  return (
    <form onSubmit={submit} className="flex flex-col items-stretch gap-2 sm:flex-row">
        <input
          type="text"
          value={order}
          onChange={(e) => setOrder(e.target.value.toUpperCase())}
          placeholder="Order number (GLAM-XXXXXX)"
          aria-label="Order number"
          className="field flex-1"
        />
        <Button type="submit" className="shrink-0 px-5 py-2.5 text-sm">
          Track my appointment
        </Button>
      </form>
  );
}
