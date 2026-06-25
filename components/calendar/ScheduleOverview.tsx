"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MonthCalendar } from "@/components/calendar/MonthCalendar";
import { parseDateKey } from "@/lib/calendar-utils";

export function ScheduleOverview() {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState<string>();
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("public_schedule_counts")
      .select("booking_date, booking_count")
      .then(({ data }) => {
        const map: Record<string, number> = {};
        for (const row of data ?? []) {
          map[row.booking_date as string] = row.booking_count as number;
        }
        setCounts(map);
      });
  }, []);

  const selectedLabel = selectedDateKey
    ? parseDateKey(selectedDateKey).toLocaleDateString("en-PH", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "Tap a day to see availability";

  const selectedCount = selectedDateKey ? counts[selectedDateKey] ?? 0 : 0;

  return (
    <div className="space-y-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-8 lg:space-y-0">
      <MonthCalendar
        viewDate={viewDate}
        onViewDateChange={setViewDate}
        selectedDateKey={selectedDateKey}
        onSelectDate={(key) =>
          setSelectedDateKey((prev) => (prev === key ? undefined : key))
        }
        markedDates={counts}
      />

      <div className="rounded-2xl border border-brand-brown/12 bg-brand-cream/50 px-4 py-5 text-center lg:flex lg:min-h-[280px] lg:flex-col lg:justify-center lg:px-6 lg:py-8">
        <h3 className="font-serif text-sm font-semibold text-brand-ink">
          {selectedLabel}
        </h3>
        <p className="mt-2 text-sm text-brand-muted">
          {selectedDateKey
            ? selectedCount > 0
              ? `${selectedCount} appointment${selectedCount > 1 ? "s" : ""} booked`
              : "Open — book your slot!"
            : "Select a date on the calendar"}
        </p>
        {selectedDateKey && selectedCount === 0 && (
          <a
            href={`/book`}
            className="btn-gradient mt-4 inline-flex rounded-full px-6 py-2.5 text-sm font-semibold text-white"
          >
            Book this day
          </a>
        )}
      </div>
    </div>
  );
}
