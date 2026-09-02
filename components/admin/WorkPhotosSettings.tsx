"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

type Photo = { id: string; url: string; alt: string };

export function WorkPhotosSettings() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/work-photos");
    const data = await res.json();
    setPhotos(data.photos ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError("");
    setMessage("");

    for (const file of Array.from(files)) {
      const form = new FormData();
      form.set("file", file);
      const res = await fetch("/api/work-photos", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not upload photo");
        setUploading(false);
        return;
      }
    }

    setUploading(false);
    setMessage("Photos uploaded. They show on the home page.");
    await load();
  }

  async function remove(id: string) {
    setError("");
    setMessage("");
    const res = await fetch(`/api/work-photos?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not delete photo");
      return;
    }
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="rounded-2xl border border-brand-brown/12 bg-white p-4">
      <h3 className="font-serif text-brand-ink">Work photos</h3>
      <p className="mt-1 text-sm text-brand-muted">
        Upload pictures of her work. They appear in the Our work carousel on the
        home page.
      </p>

      <label className="mt-4 inline-flex cursor-pointer">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          disabled={uploading}
          onChange={(e) => {
            upload(e.target.files);
            e.target.value = "";
          }}
        />
        <span className="btn-gradient rounded-full px-5 py-2 text-sm font-semibold text-white">
          {uploading ? "Uploading…" : "Upload photos"}
        </span>
      </label>

      {loading ? (
        <p className="mt-4 text-sm text-brand-muted">Loading…</p>
      ) : photos.length === 0 ? (
        <p className="mt-4 text-sm text-brand-muted">No photos yet.</p>
      ) : (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <div key={photo.id} className="relative aspect-square overflow-hidden rounded-xl bg-brand-beige">
              <Image src={photo.url} alt={photo.alt || "Work photo"} fill className="object-cover" sizes="120px" />
              <Button
                variant="outline"
                className="absolute right-1 bottom-1 px-2 py-1 text-[10px]"
                onClick={() => remove(photo.id)}
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      )}

      {message && <p className="mt-3 text-sm font-medium text-green-800">{message}</p>}
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
    </div>
  );
}
