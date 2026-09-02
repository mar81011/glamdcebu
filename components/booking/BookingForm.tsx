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
import { orderMenuCategories } from "@/lib/services/catalog";
import {
  APPOINTMENT_DURATION_MINUTES,
  formatDurationLabel,
  VISIT_TYPE_OPTIONS,
  visitTypeLabel,
  type VisitType,
} from "@/lib/booking/constants";
import { slotEndLabel } from "@/lib/booking/slots";

const STEPS = ["Services", "Date & Time", "Your Info", "GCash", "Review"];

export function BookingForm({
  initialCategories = [],
}: {
  initialCategories?: ServiceCategory[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preService = searchParams.get("service") ?? "";

  const [step, setStep] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    preService ? [preService] : [],
  );
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [visitType, setVisitType] = useState<VisitType>("walk_in");
  const [homeAddress, setHomeAddress] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [durationMinutes, setDurationMinutes] = useState(
    APPOINTMENT_DURATION_MINUTES,
  );
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [homeServiceFee, setHomeServiceFee] = useState(0);
  const [categories, setCategories] = useState<ServiceCategory[]>(initialCategories);
  const [catalogLoading, setCatalogLoading] = useState(initialCategories.length === 0);
  const [catalogError, setCatalogError] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentPreview, setPaymentPreview] = useState("");
  const [gcash, setGcash] = useState({
    number: "",
    accountName: "",
    qrUrl: "",
    instructions: "",
  });

  const orderedCategories = orderMenuCategories(categories);
  const allServices = orderedCategories.flatMap((c) => [...c.mainServices, ...c.addons]);
  const selectedServices = allServices.filter((s) => selectedIds.includes(s.id));
  const selectedMains = categories.flatMap((c) =>
    c.mainServices.filter((s) => selectedIds.includes(s.id)),
  );
  const selectedAddons = categories.flatMap((c) =>
    c.addons.filter((s) => selectedIds.includes(s.id)),
  );

  const total =
    selectedServices.reduce((sum, s) => sum + s.price, 0) +
    (visitType === "home_service" ? homeServiceFee : 0);

  function toggleService(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function canNext(): boolean {
    switch (step) {
      case 0:
        return selectedMains.length > 0;
      case 1:
        return !!date && !!time;
      case 2:
        return (
          name.trim().length > 0 &&
          phone.trim().length >= 10 &&
          (visitType === "walk_in" || homeAddress.trim().length > 0)
        );
      case 3:
        return paymentReference.trim().length >= 5 && !!paymentProof;
      default:
        return true;
    }
  }

  function handleSubmit() {
    setSubmitting(true);
    setError("");
    const form = new FormData();
    form.set("customerName", name);
    form.set("phone", phone);
    form.set("notes", notes);
    form.set("date", date);
    form.set("time", time);
    form.set("visitType", visitType);
    if (visitType === "home_service") form.set("homeAddress", homeAddress);
    form.set("paymentReference", paymentReference.trim());
    selectedIds.forEach((id) => form.append("serviceIds", id));
    if (paymentProof) form.set("paymentProof", paymentProof);

    fetch("/api/bookings", {
      method: "POST",
      body: form,
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
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);

    fetch("/api/services", { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories ?? []);
        setCatalogError("");
      })
      .catch(() => {
        if (initialCategories.length === 0) {
          setCatalogError("Could not load services. Refresh the page and try again.");
        }
      })
      .finally(() => {
        window.clearTimeout(timeout);
        setCatalogLoading(false);
      });

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [initialCategories.length]);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setHomeServiceFee(data.homeServiceFee ?? 0);
        if (data.gcash) setGcash(data.gcash);
      })
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
        if (typeof data.durationMinutes === "number") {
          setDurationMinutes(data.durationMinutes);
        }
        if (time && !data.slots?.includes(time)) setTime("");
      })
      .catch(() => setAvailableSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [date, time]);

  return (
    <ContentCard>
      <p className="label-kicker mb-2 text-center">Reserve your slot</p>
      <h1 className="mb-1 text-center font-serif text-2xl italic text-brand-ink md:text-3xl">
        Book Appointment
      </h1>
      <p className="mb-6 text-center text-sm text-brand-muted">
        Step {step + 1} of {STEPS.length} — {STEPS[step]}
      </p>

      <div className="mb-7">
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all ${i <= step ? "btn-gradient-flat" : "bg-brand-beige"}`}
            />
          ))}
        </div>
        <div className="mt-2 hidden grid-cols-5 gap-1.5 md:grid">
          {STEPS.map((label, i) => (
            <p
              key={label}
              className={`text-center text-[10px] font-medium tracking-wide ${
                i === step ? "text-brand-ink" : "text-brand-subtle"
              }`}
            >
              {label}
            </p>
          ))}
        </div>
      </div>

      {step === 0 && (
        <div className="space-y-6">
          {catalogLoading ? (
            <p className="text-center text-sm text-brand-muted">Loading services…</p>
          ) : catalogError ? (
            <p className="text-center text-sm text-red-700">{catalogError}</p>
          ) : (
            <>
              <p className="text-center text-sm text-brand-muted">
                Pick lashes, nails, and add-ons together — one visit, one booking.
              </p>
              {orderedCategories.map((cat, index) => (
                <section
                  key={cat.slug}
                  className={index > 0 ? "border-t border-brand-brown/10 pt-6" : ""}
                >
                  <h2 className="text-center font-serif text-xl text-brand-ink">
                    {cat.name}
                  </h2>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {cat.mainServices.map((s) => (
                      <ServiceOption
                        key={s.id}
                        service={s}
                        selected={selectedIds.includes(s.id)}
                        onSelect={() => toggleService(s.id)}
                      />
                    ))}
                  </div>
                  {cat.addons.length > 0 && (
                    <div className="mt-4">
                      <h3 className="mb-2 text-center text-[11px] font-semibold tracking-wide text-brand-subtle uppercase">
                        Add-ons
                      </h3>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {cat.addons.map((addon) => (
                          <ServiceOption
                            key={addon.id}
                            service={addon}
                            selected={selectedIds.includes(addon.id)}
                            onSelect={() => toggleService(addon.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              ))}
            </>
          )}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-8 lg:space-y-0">
          <div className="space-y-4">
            <div>
              <label className="label-kicker mb-2 block">Pick a date</label>
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
            <label className="label-kicker mb-2 block">
              Time{" "}
              <span className="font-normal normal-case tracking-normal text-brand-muted">
                ({formatDurationLabel(durationMinutes)} each)
              </span>
            </label>
            {loadingSlots ? (
              <p className="text-sm text-brand-muted">Loading available times…</p>
            ) : availableSlots.length === 0 && date ? (
              <p className="text-sm text-brand-muted">No slots available this day.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTime(slot)}
                    className={`rounded-2xl border px-2 py-2.5 text-xs font-medium transition ${
                      time === slot
                        ? "btn-gradient border-transparent text-white"
                        : "border-brand-brown/20 bg-brand-cream/80 text-brand-ink hover:border-brand-brown/45 hover:bg-white"
                    }`}
                  >
                    <span className="block">{slot}</span>
                    <span
                      className={`mt-0.5 block text-[10px] font-normal ${
                        time === slot ? "text-white/80" : "text-brand-muted"
                      }`}
                    >
                      until {slotEndLabel(slot, durationMinutes)}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {time && (
              <p className="mt-2 text-xs text-brand-muted">
                Your visit is {formatDurationLabel(durationMinutes)} from{" "}
                {time} to {slotEndLabel(time, durationMinutes)}. The next guest
                can book at {slotEndLabel(time, durationMinutes)}.
              </p>
            )}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="label-kicker mb-2 block">Visit type</label>
            <div className="grid gap-2.5 md:grid-cols-2">
              {VISIT_TYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setVisitType(option.value);
                    if (option.value === "walk_in") setHomeAddress("");
                  }}
                  className={`choice-card flex w-full items-center justify-between gap-3 ${
                    visitType === option.value ? "is-selected" : ""
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
            <div className="rounded-2xl border border-brand-brown/15 bg-brand-cream/80 px-4 py-3">
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
              <label className="label-kicker mb-2 block">Home address</label>
              <textarea
                value={homeAddress}
                onChange={(e) => setHomeAddress(e.target.value)}
                placeholder="Street, barangay, landmark..."
                rows={3}
                className="field"
              />
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label-kicker mb-2 block">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="field"
              />
            </div>
            <div>
              <label className="label-kicker mb-2 block">Phone number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09XX XXX XXXX"
                className="field"
              />
            </div>
            <div className="md:col-span-2">
              <label className="label-kicker mb-2 block">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any requests or preferences..."
                rows={3}
                className="field"
              />
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 md:mx-auto md:max-w-xl">
          <div className="rounded-2xl border border-brand-brown/12 bg-brand-cream/70 p-4">
            <p className="text-center text-[11px] font-semibold tracking-wide text-brand-subtle uppercase">
              Pay with GCash
            </p>
            <p className="mt-1 text-center text-2xl font-bold text-brand-ink">
              {formatPrice(total)}
            </p>
            <p className="mt-1 text-center text-xs text-brand-muted">
              Send this exact amount, then upload your receipt.
            </p>
          </div>

          {gcash.qrUrl && (
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={gcash.qrUrl}
                alt="GCash QR code"
                className="h-48 w-48 rounded-2xl border border-brand-brown/15 bg-white object-contain p-2"
              />
            </div>
          )}

          {(gcash.number || gcash.accountName) && (
            <div className="rounded-2xl border border-brand-brown/12 bg-white p-4 text-center">
              {gcash.accountName && (
                <p className="text-sm font-semibold text-brand-ink">{gcash.accountName}</p>
              )}
              {gcash.number && (
                <p className="mt-1 text-lg font-bold tracking-wide text-brand-brown">
                  {gcash.number}
                </p>
              )}
            </div>
          )}

          <div className="whitespace-pre-line rounded-2xl border border-brand-brown/10 bg-white p-4 text-sm leading-relaxed text-brand-muted">
            {gcash.instructions}
          </div>

          <div>
            <label className="label-kicker mb-2 block">GCash reference number</label>
            <input
              type="text"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="e.g. 1234 5678 901"
              className="field"
            />
          </div>

          <div>
            <label className="label-kicker mb-2 block">Receipt screenshot</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="field file:mr-3 file:rounded-full file:border-0 file:bg-brand-beige file:px-3 file:py-1 file:text-xs file:font-semibold"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setPaymentProof(file);
                setPaymentPreview(file ? URL.createObjectURL(file) : "");
              }}
            />
            {paymentPreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={paymentPreview}
                alt="Receipt preview"
                className="mt-3 max-h-40 rounded-xl border border-brand-brown/15 object-contain"
              />
            )}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-3 text-sm text-brand-ink md:mx-auto md:max-w-xl">
          <ReviewRow
            label="Services"
            value={
              selectedMains.map((s) => s.name).join(", ") || "—"
            }
          />
          {selectedAddons.length > 0 && (
            <ReviewRow
              label="Add-ons"
              value={selectedAddons.map((a) => a.name).join(", ")}
            />
          )}
          <ReviewRow label="Date" value={date || "—"} />
          <ReviewRow
            label="Time"
            value={
              time
                ? `${time} – ${slotEndLabel(time, durationMinutes)} (${formatDurationLabel(durationMinutes)})`
                : "—"
            }
          />
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
          <ReviewRow label="Payment" value="GCash" />
          <ReviewRow label="Reference" value={paymentReference || "—"} />
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
      className={`choice-card flex w-full items-center justify-between ${
        selected ? "is-selected" : ""
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
    <div className="flex justify-between gap-4 border-b border-brand-brown/8 pb-2">
      <span className="text-brand-muted">{label}</span>
      <span className="text-right font-semibold text-brand-ink">{value}</span>
    </div>
  );
}
