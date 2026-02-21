"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function UnmappedOverrideForm({ adId, adName }: { adId?: string | null; adName: string }) {
  const [message, setMessage] = useState<string>("");

  return (
    <form
      className="grid gap-2 md:grid-cols-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setMessage("Saving...");
        const formData = new FormData(event.currentTarget);
        const payload = Object.fromEntries(formData.entries());
        const response = await fetch("/api/unmapped-ads/override", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            adId,
            adName,
            ...payload,
          }),
        });
        const json = await response.json();
        setMessage(json.ok ? "Saved override" : `Failed: ${json.error || "unknown"}`);
      }}
    >
      <Input name="funnelIdentifierOverride" placeholder="A100" />
      <Input name="creativeIdOverride" placeholder="V123 or IMG1.001" />
      <Input name="copyIdOverride" placeholder="C100" />
      <Input name="productOverride" placeholder="AP" />
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm">
          Save Override
        </Button>
        <span className="text-xs text-slate-400">{message}</span>
      </div>
    </form>
  );
}
