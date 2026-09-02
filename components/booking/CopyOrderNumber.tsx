"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

export function CopyOrderNumber({ orderNumber }: { orderNumber: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(id);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(orderNumber);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-2xl border border-brand-brown/15 bg-brand-cream/80 px-4 py-4 text-center">
      <p className="text-[11px] font-semibold tracking-wide text-brand-subtle uppercase">
        Order number
      </p>
      <p className="mt-1 font-mono text-2xl font-bold tracking-wide text-brand-ink">
        {orderNumber}
      </p>
      <p className="mt-2 text-xs text-brand-muted">
        Save this to track your appointment on the home page.
      </p>
      <Button
        variant="outline"
        className="mt-3 px-4 py-1.5 text-xs"
        onClick={copy}
      >
        {copied ? "Copied" : "Copy order number"}
      </Button>
    </div>
  );
}
