"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ContentCard } from "@/components/ui/ContentCard";
import { DiamondDivider } from "@/components/ui/DiamondDivider";
import { MonthCalendar } from "@/components/calendar/MonthCalendar";
import {
  formatPrice,
  type Service,
  type ServiceCategory,
} from "@/lib/services-data";
import {
  APPOINTMENT_DURATION_MINUTES,
  VISIT_TYPE_OPTIONS,
  visitTypeLabel,
  type VisitType,
} from "@/lib/booking/constants";

const STEPS = ["Service", "Add-ons", "Date & Time", "Your Info", "Review"];

export function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preCategory = searchParams.get("category") ?? "";
  const preService = searchParams.get("service") ?? "";

  const [step, setStep] = useState(0);
  const [categorySlug, setCategorySlug] = useState(preCategory);
  const [mainServiceId, setMainServiceId] = useState(preService);
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [visitType, setVisitType] = useState<VisitType>("walk_in");
  const [homeAddress, setHomeAddress] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [homeServiceFee, setHomeServiceFee] = useState(0);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);

  const category = categories.find((c) => c.slug === categorySlug);
  const mainService = category?.mainServices.find((s) => s.id === mainServiceId);
  const selectedAddons =
    category?.addons.filter((a) => addonIds.includes(a.id)) ?? [];

  const total =
    (mainService?.price ?? 0) +
    selectedAddons.reduce((sum, a) => sum + a.price, 0) +
    (visitType === "home_service" ? homeServiceFee : 0);

  function toggleAddon(id: string) {
    setAddonIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function canNext(): boolean {
    switch (step) {
      case 0:
        return !!categorySlug && !!mainServiceId;
      case 1:
        return true;
      case 2:
        return !!date && !!time;
      case 3:
        return (
          name.trim().length > 0 &&
          phone.trim().length >= 10 &&
          (visitType === "walk_in" || homeAddress.trim().length > 0)
        );
      default:
        return true;
    }
  }

  function handleSubmit() {
    setSubmitting(true);
    setError("");
    fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: name,
        phone,
        notes,
        date,
        time,
        mainServiceId,
        addonIds,
        visitType,
        homeAddress: visitType === "home_service" ? homeAddress : undefined,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.id) router.push(`/book/confirm/${data.id}`);
        else setError(data.error ?? "Booking failed. Please try again.");
      })
      .catch(() => setError("Network error. Please try again."))
      .finally(() => setSubmitting(false));
  }

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories ?? []))
      .finally(() => setCatalogLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setHomeServiceFee(data.homeServiceFee ?? 0))
      .catch(() => setHomeServiceFee(0));
  }, []);

  useEffect(() => {
    if (!date) {
      setAvailableSlots([]);
      return;
    }
    setLoadingSlots(true);
    fetch(`/api/availability?date=${date}`)
      .then((res) => res.json())
      .then((data) => {
        setAvailableSlots(data.slots ?? []);
        if (time && !data.slots?.includes(time)) setTime("");
      })
      .finally(() => setLoadingSlots(false));
  }, [date, time]);

  return (
    <ContentCard>
      <h1 className="mb-1 text-center font-serif text-2xl text-brand-ink md:text-3xl">
        Book Appointment
      </h1>
      <p className="mb-6 text-center text-sm font-medium text-brand-muted">
        Step {step + 1} of {STEPS.length} — {STEPS[step]}
      </p>

      <div className="mb-6 flex gap-1">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full ${i <= step ? "btn-gradient-flat" : "bg-brand-beige"}`}
          />
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-4">
          {catalogLoading ? (
            <p className="text-sm text-brand-muted">Loading services…</p>
          ) : (
          <>
          <label className="block text-sm font-semibold text-brand-ink">
            Category
          </label>
          <div className="grid gap-2 md:grid-cols-2">
            {categories.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => {
                  setCategorySlug(cat.slug);
                  setMainServiceId("");
                  setAddonIds([]);
                }}
                className={`rounded-xl border-2 bg-white px-4 py-3 text-left text-sm transition ${
                  categorySlug === cat.slug
                    ? "border-brand-brown bg-brand-beige"
                    : "border-brand-brown/20 hover:border-brand-brown/40"
                }`}
              >
                <span className="font-semibold text-brand-ink">{cat.brand}</span>
                <span className="text-brand-muted"> — {cat.name}</span>
              </button>
            ))}
          </div>

          {category && (
            <>
              <label className="mt-4 block text-sm font-semibold text-brand-ink">
                Main service
              </label>
              <div className="grid gap-2 md:grid-cols-2">
                {category.mainServices.map((s) => (
                  <ServiceOption
                    key={s.id}
                    service={s}
                    selected={mainServiceId === s.id}
                    onSelect={() => setMainServiceId(s.id)}
                  />
                ))}
              </div>
            </>
          )}
          </>
          )}
        </div>
      )}

      {step === 1 && category && (
        <div className="space-y-3">
          <p className="text-sm text-brand-muted">
            Optional add-ons for your service
          </p>
          {category.addons.length === 0 ? (
            <p className="text-sm text-brand-subtle">No add-ons available.</p>
          ) : (
            <div className="grid gap-2 md:grid-cols-2 md:items-start">
              {category.addons.map((addon) => (
                <label
                  key={addon.id}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border-2 bg-white px-4 py-3 transition ${
                    addonIds.includes(addon.id)
                      ? "border-brand-brown bg-brand-beige"
                      : "border-brand-brown/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={addonIds.includes(addon.id)}
                      onChange={() => toggleAddon(addon.id)}
                      className="accent-brand-brown"
                    />
                    <span className="text-sm font-medium text-brand-ink">
                      {addon.name}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-brand-brown">
                    {formatPrice(addon.price)}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-8 lg:space-y-0">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-brand-ink">
                Pick a date
              </label>
              <MonthCalendar
                viewDate={calendarMonth}
                onViewDateChange={setCalendarMonth}
                selectedDateKey={date || undefined}
                onSelectDate={setDate}
                disablePast
                compact
              />
            </div>
            {date && (
              <p className="text-center text-sm font-medium text-brand-muted lg:text-left">
                Selected:{" "}
                <span className="text-brand-ink">
                  {new Date(date + "T12:00:00").toLocaleDateString("en-PH", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </p>
            )}
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-brand-ink">
              Time <span className="font-normal text-brand-muted">(1 hour each)</span>
            </label>
            {loadingSlots ? (
              <p className="text-sm text-brand-muted">Loading available times…</p>
            ) : availableSlots.length === 0 && date ? (
              <p className="text-sm text-brand-muted">No slots available this day.</p>
            ) : (
            <div className="grid grid-cols-3 gap-2 md:grid-cols-4 lg:grid-cols-3">
              {availableSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setTime(slot)}
                  className={`rounded-lg border px-2 py-2.5 text-xs font-medium transition ${
                    time === slot
                      ? "btn-gradient border-transparent text-white"
                      : "border-brand-brown/25 bg-brand-cream text-brand-ink hover:border-brand-brown/50 hover:bg-white"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
            )}
            {time && (
              <p className="mt-2 text-xs text-brand-muted">
                Your appointment runs for 1 hour from the selected start time.
              </p>
            )}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-brand-ink">
              Visit type
            </label>
            <div className="grid gap-2 md:grid-cols-2">
              {VISIT_TYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setVisitType(option.value);
                    if (option.value === "walk_in") setHomeAddress("");
                  }}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl border-2 bg-white px-4 py-3 text-left transition ${
                    visitType === option.value
                      ? "border-brand-brown bg-brand-beige"
                      : "border-brand-brown/20 hover:border-brand-brown/40"
                  }`}
                >
                  <div className="min-w-0">
                    <span className="block text-sm font-semibold text-brand-ink">
                      {option.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-brand-muted">
                      {option.description}
                    </span>
                  </div>
                  {option.value === "home_service" && (
                    <span className="shrink-0 text-sm font-bold text-brand-brown">
                      {homeServiceFee > 0
                        ? `+${formatPrice(homeServiceFee)}`
                        : "No extra fee"}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {visitType === "home_service" && homeServiceFee > 0 && (
            <div className="rounded-xl border border-brand-brown/20 bg-brand-cream/70 px-4 py-3">
              <p className="text-sm font-semibold text-brand-ink">
                Home service fee: {formatPrice(homeServiceFee)}
              </p>
              <p className="mt-0.5 text-xs text-brand-muted">
                Added to your service total for travel to your location.
              </p>
            </div>
          )}

          {visitType === "home_service" && (
            <div>
              <label className="mb-2 block text-sm font-semibold text-brand-ink">
                Home address
              </label>
              <textarea
                value={homeAddress}
                onChange={(e) => setHomeAddress(e.target.value)}
                placeholder="Street, barangay, landmark..."
                rows={3}
                className="w-full rounded-xl border-2 border-brand-brown/20 bg-white px-4 py-3 text-brand-ink placeholder:text-brand-subtle focus:border-brand-brown focus:outline-none"
              />
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-brand-ink">
                Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-xl border-2 border-brand-brown/20 bg-white px-4 py-3 text-brand-ink placeholder:text-brand-subtle focus:border-brand-brown focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-brand-ink">
                Phone number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09XX XXX XXXX"
                className="w-full rounded-xl border-2 border-brand-brown/20 bg-white px-4 py-3 text-brand-ink placeholder:text-brand-subtle focus:border-brand-brown focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-brand-ink">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any requests or preferences..."
                rows={3}
                className="w-full rounded-xl border-2 border-brand-brown/20 bg-white px-4 py-3 text-brand-ink placeholder:text-brand-subtle focus:border-brand-brown focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-3 text-sm text-brand-ink md:max-w-xl md:mx-auto">
          <ReviewRow label="Service" value={mainService?.name ?? "—"} />
          {selectedAddons.length > 0 && (
            <ReviewRow
              label="Add-ons"
              value={selectedAddons.map((a) => a.name).join(", ")}
            />
          )}
          <ReviewRow label="Date" value={date || "—"} />
          <ReviewRow label="Time" value={time ? `${time} (1 hour)` : "—"} />
          <ReviewRow
            label="Visit"
            value={
              visitType === "home_service" && homeServiceFee > 0
                ? `${visitTypeLabel(visitType)} (+${formatPrice(homeServiceFee)})`
                : visitTypeLabel(visitType)
            }
          />
          {visitType === "home_service" && (
            <>
              <ReviewRow label="Address" value={homeAddress || "—"} />
              {homeServiceFee > 0 && (
                <ReviewRow
                  label="Home service fee"
                  value={formatPrice(homeServiceFee)}
                />
              )}
            </>
          )}
          <ReviewRow label="Name" value={name || "—"} />
          <ReviewRow label="Phone" value={phone || "—"} />
          {notes && <ReviewRow label="Notes" value={notes} />}
          <DiamondDivider />
          <div className="flex justify-between text-base font-bold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      )}

      <div className="mt-8 flex gap-3">
        {step > 0 && (
          <Button
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            className="flex-1"
          >
            Back
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext()}
            className="flex-1"
          >
            Continue
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting} className="flex-1">
            {submitting ? "Booking…" : "Confirm Booking"}
          </Button>
        )}
      </div>

      {error && (
        <p className="mt-4 text-center text-sm text-red-700">{error}</p>
      )}

      {total > 0 && (
        <div className="mt-4 space-y-1 text-center text-sm text-brand-muted">
          {visitType === "home_service" && homeServiceFee > 0 && (
            <p>
              Services {formatPrice(total - homeServiceFee)} + home service{" "}
              {formatPrice(homeServiceFee)}
            </p>
          )}
          <p>
            Running total:{" "}
            <strong className="text-brand-ink">{formatPrice(total)}</strong>
          </p>
        </div>
      )}
    </ContentCard>
  );
}

function ServiceOption({
  service,
  selected,
  onSelect,
}: {
  service: Service;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center justify-between rounded-xl border-2 bg-white px-4 py-3 text-left transition ${
        selected
          ? "border-brand-brown bg-brand-beige"
          : "border-brand-brown/20 hover:border-brand-brown/40"
      }`}
    >
      <span className="text-sm font-medium text-brand-ink">{service.name}</span>
      <span className="text-sm font-bold text-brand-brown">
        {formatPrice(service.price)}
      </span>
    </button>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-brand-muted">{label}</span>
      <span className="text-right font-semibold text-brand-ink">{value}</span>
    </div>
  );
}
