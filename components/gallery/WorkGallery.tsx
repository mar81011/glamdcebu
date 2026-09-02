"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { WorkPhoto } from "@/lib/gallery/types";

export function WorkGallery({ photos }: { photos: WorkPhoto[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  function go(next: number) {
    const i = (next + photos.length) % photos.length;
    setIndex(i);
    const node = scrollerRef.current;
    if (node) node.scrollTo({ left: i * node.clientWidth, behavior: "smooth" });
  }

  return (
    <section id="work" className="mt-8">
      <h2 className="mb-3 text-center font-serif text-2xl text-brand-ink">My Craft</h2>
      {photos.length === 0 ? (
        <div className="flex aspect-[4/3] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-brand-brown/20 bg-brand-beige/70 px-6 text-center">
          <p className="max-w-xs text-sm text-brand-muted">
            Photos of her work will appear here.
          </p>
        </div>
      ) : (
        <>
          <div
            ref={scrollerRef}
            className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto rounded-2xl"
            onScroll={(e) => {
              const el = e.currentTarget;
              if (!el.clientWidth) return;
              setIndex(Math.round(el.scrollLeft / el.clientWidth));
            }}
          >
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-square w-full shrink-0 snap-center overflow-hidden bg-brand-beige"
              >
                <Image
                  src={photo.url}
                  alt={photo.alt}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 42rem, 100vw"
                />
              </div>
            ))}
          </div>
          {photos.length > 1 && (
            <div className="mt-3 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => go(index - 1)}
                className="rounded-full border border-brand-brown/20 px-3 py-1 text-sm text-brand-ink"
                aria-label="Previous photo"
              >
                ←
              </button>
              <div className="flex gap-1.5">
                {photos.map((photo, i) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => go(i)}
                    aria-label={`Photo ${i + 1}`}
                    className={`h-2 w-2 rounded-full ${
                      i === index ? "bg-brand-brown" : "bg-brand-beige"
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => go(index + 1)}
                className="rounded-full border border-brand-brown/20 px-3 py-1 text-sm text-brand-ink"
                aria-label="Next photo"
              >
                →
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
