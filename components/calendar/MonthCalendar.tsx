"use client";

import {
  formatMonthYear,
  getMonthGrid,
  type CalendarDay,
} from "@/lib/calendar-utils";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface MonthCalendarProps {
  viewDate: Date;
  onViewDateChange: (date: Date) => void;
  selectedDateKey?: string;
  onSelectDate?: (dateKey: string) => void;
  markedDates?: Record<string, number>;
  disablePast?: boolean;
  compact?: boolean;
}

export function MonthCalendar({
  viewDate,
  onViewDateChange,
  selectedDateKey,
  onSelectDate,
  markedDates = {},
  disablePast = false,
  compact = false,
}: MonthCalendarProps) {
  const days = getMonthGrid(viewDate);

  function prevMonth() {
    const d = new Date(viewDate);
    d.setMonth(d.getMonth() - 1);
    onViewDateChange(d);
  }

  function nextMonth() {
    const d = new Date(viewDate);
    d.setMonth(d.getMonth() + 1);
    onViewDateChange(d);
  }

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-brown/15 bg-white text-brand-ink hover:border-brand-brown/30"
          aria-label="Previous month"
        >
          ←
        </button>
        <span className="font-serif text-brand-ink">
          {formatMonthYear(viewDate)}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-brown/15 bg-white text-brand-ink hover:border-brand-brown/30"
          aria-label="Next month"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-1 text-center text-[10px] font-bold tracking-wide text-brand-muted uppercase"
          >
            {compact ? day.charAt(0) : day}
          </div>
        ))}

        {days.map((day) => (
          <DayCell
            key={day.dateKey}
            day={day}
            selected={selectedDateKey === day.dateKey}
            count={markedDates[day.dateKey] ?? 0}
            disabled={disablePast && day.isPast}
            onSelect={onSelectDate}
          />
        ))}
      </div>

      {Object.keys(markedDates).length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] text-brand-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-brand-brown" />
            Has bookings
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-4 w-4 rounded-lg border-2 border-brand-brown bg-brand-brown" />
            Selected
          </span>
        </div>
      )}
    </div>
  );
}

function DayCell({
  day,
  selected,
  count,
  disabled,
  onSelect,
}: {
  day: CalendarDay;
  selected: boolean;
  count: number;
  disabled: boolean;
  onSelect?: (dateKey: string) => void;
}) {
  const isInteractive = !!onSelect && !disabled && day.isCurrentMonth;

  const base =
    "relative flex aspect-square flex-col items-center justify-center rounded-xl border text-center transition";

  let classes = `${base} `;
  if (selected) {
    classes += "btn-gradient-flat border-transparent text-white shadow-sm";
  } else if (day.isToday) {
    classes += "border-brand-brown bg-brand-beige text-brand-ink";
  } else if (!day.isCurrentMonth) {
    classes += "border-transparent bg-transparent text-brand-subtle/40";
  } else if (disabled) {
    classes += "border-brand-brown/8 bg-stone-100 text-brand-subtle/50";
  } else {
    classes += "border-brand-brown/12 bg-white text-brand-ink hover:border-brand-brown/30";
  }

  const inner = (
    <>
      <span className="text-sm font-bold">{day.date.getDate()}</span>
      {count > 0 && day.isCurrentMonth && (
        <span
          className={`absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold ${
            selected ? "bg-white text-brand-brown" : "bg-brand-brown text-white"
          }`}
        >
          {count}
        </span>
      )}
    </>
  );

  if (isInteractive) {
    return (
      <button type="button" onClick={() => onSelect(day.dateKey)} className={classes}>
        {inner}
      </button>
    );
  }

  return <div className={classes}>{inner}</div>;
}
