"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { DbServiceRow } from "@/lib/services/catalog";

const CATEGORY_OPTIONS = [
  { slug: "lashes-brows", label: "Lashes & Brows" },
  { slug: "nails", label: "Nails" },
];

export function ProductCatalog() {
  const [services, setServices] = useState<DbServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [filterSlug, setFilterSlug] = useState("lashes-brows");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState<"main" | "addon">("main");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/services?admin=1");
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Could not load products");
      return;
    }
    setServices(data.services ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () =>
      services.filter((s) => s.service_categories?.slug === filterSlug),
    [services, filterSlug],
  );

  const mainProducts = useMemo(
    () => filtered.filter((s) => s.type === "main"),
    [filtered],
  );

  const addonProducts = useMemo(
    () => filtered.filter((s) => s.type === "addon"),
    [filtered],
  );

  async function addProduct() {
    if (!name.trim()) {
      setError("Enter a product name.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    const res = await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categorySlug: filterSlug,
        name: name.trim(),
        price: Number(price),
        type,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Could not add product");
      return;
    }
    setName("");
    setPrice("");
    setType("main");
    setMessage("Product added.");
    await load();
  }

  async function updateProduct(
    service: DbServiceRow,
    next: { name: string; price: number },
  ) {
    setError("");
    setMessage("");
    const res = await fetch("/api/services", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: service.id,
        name: next.name.trim(),
        price: next.price,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not update product");
      return false;
    }
    setServices((prev) =>
      prev.map((s) =>
        s.id === service.id
          ? { ...s, name: data.service.name, price: data.service.price }
          : s,
      ),
    );
    setMessage("Product updated.");
    return true;
  }

  async function toggleActive(service: DbServiceRow) {
    setError("");
    setMessage("");
    const res = await fetch("/api/services", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: service.id, isActive: !service.is_active }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not update product");
      return;
    }
    setServices((prev) =>
      prev.map((s) => (s.id === service.id ? { ...s, is_active: !s.is_active } : s)),
    );
  }

  async function deleteProduct(service: DbServiceRow) {
    if (!confirm(`Delete "${service.name}"?`)) return;
    setError("");
    setMessage("");
    const res = await fetch("/api/services", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: service.id }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not delete product");
      return;
    }
    setMessage("Product deleted.");
    await load();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {CATEGORY_OPTIONS.map((cat) => (
          <button
            key={cat.slug}
            type="button"
            onClick={() => setFilterSlug(cat.slug)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              filterSlug === cat.slug
                ? "btn-gradient text-white shadow-sm"
                : "border border-brand-brown/15 bg-white text-brand-muted hover:text-brand-ink"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-brand-brown/12 bg-white p-4">
        <h3 className="font-serif text-brand-ink">Add product</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Product name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl border-2 border-brand-brown/20 bg-white px-4 py-2.5 text-sm text-brand-ink focus:border-brand-brown focus:outline-none sm:col-span-2"
          />
          <input
            type="number"
            min={0}
            placeholder="Price (₱)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="rounded-xl border-2 border-brand-brown/20 bg-white px-4 py-2.5 text-sm text-brand-ink focus:border-brand-brown focus:outline-none"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "main" | "addon")}
            className="rounded-xl border-2 border-brand-brown/20 bg-white px-4 py-2.5 text-sm text-brand-ink focus:border-brand-brown focus:outline-none"
          >
            <option value="main">Main service</option>
            <option value="addon">Add-on</option>
          </select>
        </div>
        <Button onClick={addProduct} disabled={saving} className="mt-3 px-6 py-2 text-sm">
          {saving ? "Adding…" : "Add product"}
        </Button>
      </div>

      <div className="rounded-2xl border border-brand-brown/12 bg-white p-4">
        <h3 className="font-serif text-brand-ink">Products</h3>
        <p className="mt-1 text-sm text-brand-muted">
          Edit name and price, then save. Toggle off when sold out or unavailable.
        </p>

        {loading ? (
          <p className="mt-4 text-sm text-brand-muted">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="mt-4 text-sm text-brand-muted">No products in this category.</p>
        ) : (
          <div className="mt-3 space-y-5 overflow-x-auto">
            <ProductSection
              title="Main services"
              services={mainProducts}
              onSave={updateProduct}
              onToggle={toggleActive}
              onDelete={deleteProduct}
            />
            <ProductSection
              title="Add-ons"
              services={addonProducts}
              onSave={updateProduct}
              onToggle={toggleActive}
              onDelete={deleteProduct}
            />
          </div>
        )}
      </div>

      {message && <p className="text-sm font-medium text-green-800">{message}</p>}
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}

function ProductSection({
  title,
  services,
  onSave,
  onToggle,
  onDelete,
}: {
  title: string;
  services: DbServiceRow[];
  onSave: (service: DbServiceRow, next: { name: string; price: number }) => Promise<boolean>;
  onToggle: (service: DbServiceRow) => void;
  onDelete: (service: DbServiceRow) => void;
}) {
  if (services.length === 0) return null;

  return (
    <div className="min-w-[20rem]">
      <h4 className="font-serif text-sm font-semibold text-brand-ink">{title}</h4>
      <div className="mt-2 grid grid-cols-[1fr_5.5rem_4.5rem_auto] items-center gap-x-2 gap-y-1 border-b border-brand-brown/10 pb-2 text-[11px] font-semibold uppercase tracking-wide text-brand-subtle">
        <span>Name</span>
        <span>Price</span>
        <span className="text-center">On</span>
        <span />
      </div>
      <div className="divide-y divide-brand-brown/8">
        {services.map((service) => (
          <ProductRow
            key={service.id}
            service={service}
            onSave={onSave}
            onToggle={onToggle}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

function ProductRow({
  service,
  onSave,
  onToggle,
  onDelete,
}: {
  service: DbServiceRow;
  onSave: (service: DbServiceRow, next: { name: string; price: number }) => Promise<boolean>;
  onToggle: (service: DbServiceRow) => void;
  onDelete: (service: DbServiceRow) => void;
}) {
  const [editName, setEditName] = useState(service.name);
  const [editPrice, setEditPrice] = useState(String(service.price));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEditName(service.name);
    setEditPrice(String(service.price));
  }, [service.name, service.price]);

  const dirty =
    editName.trim() !== service.name || Number(editPrice) !== service.price;

  async function save() {
    if (!editName.trim()) return;
    setSaving(true);
    await onSave(service, { name: editName, price: Number(editPrice) });
    setSaving(false);
  }

  return (
    <div
      className={`grid grid-cols-[1fr_5.5rem_4.5rem_auto] items-center gap-x-2 py-2.5 ${
        !service.is_active ? "opacity-70" : ""
      }`}
    >
      <div className="min-w-0">
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="w-full min-w-0 rounded-lg border border-brand-brown/20 bg-white px-2 py-1.5 text-sm text-brand-ink"
        />
        {!service.is_active && (
          <p className="mt-0.5 text-[10px] text-brand-subtle">Unavailable</p>
        )}
      </div>

      <input
        type="number"
        min={0}
        value={editPrice}
        onChange={(e) => setEditPrice(e.target.value)}
        className="w-full min-w-0 rounded-lg border border-brand-brown/20 bg-white px-2 py-1.5 text-sm text-brand-ink"
      />

      <div className="flex justify-center">
        <input
          type="checkbox"
          checked={service.is_active}
          onChange={() => onToggle(service)}
          aria-label={`${service.name} available`}
          className="h-4 w-4 accent-brand-brown"
        />
      </div>

      <div className="flex flex-col items-end gap-1">
        {dirty && (
          <button
            type="button"
            onClick={save}
            disabled={saving || !editName.trim()}
            className="text-[11px] font-semibold text-brand-brown hover:underline disabled:opacity-50"
          >
            {saving ? "…" : "Save"}
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(service)}
          className="text-[11px] font-medium text-red-700 hover:underline"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
