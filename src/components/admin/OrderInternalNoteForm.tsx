"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function OrderInternalNoteForm({
  orderId,
  initial,
}: {
  orderId: string;
  initial: string | null;
}) {
  const router = useRouter();
  const [note, setNote] = useState(initial ?? "");
  const [err, setErr] = useState<string | null>(null);
  return (
    <form
      className="max-w-xl space-y-2 text-sm"
      onSubmit={async (e) => {
        e.preventDefault();
        setErr(null);
        const r = await fetch(`/api/admin/orders/${orderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ internalNote: note || null }),
        });
        const j = await r.json();
        if (!r.ok) setErr(j.error ?? "Failed");
        else router.refresh();
      }}
    >
      <label className="block space-y-1">
        <span className="font-medium">Internal note (staff only)</span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="w-full rounded border border-black/10 px-3 py-2"
        />
      </label>
      {err ? <p className="text-xs text-red-700">{err}</p> : null}
      <button type="submit" className="rounded-full bg-black px-4 py-1 text-xs text-[#f5e8dd]">
        Save note
      </button>
    </form>
  );
}
