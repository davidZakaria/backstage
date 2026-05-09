"use client";

import { OrderStatus } from "@prisma/client";
import { getAllowedNextStatuses } from "@/lib/orders/state-machine";
import { useState } from "react";

export function OrderTransition({
  orderId,
  current,
}: {
  orderId: string;
  current: OrderStatus;
}) {
  const next = getAllowedNextStatuses(current);
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <div className="space-y-2 rounded-xl border border-black/10 bg-white p-4 text-sm">
      <p className="font-medium">Advance status</p>
      {next.length === 0 ? (
        <p className="text-black/50">Terminal state</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {next.map((s) => (
            <button
              key={s}
              type="button"
              className="rounded-full border border-black/10 px-3 py-1 text-xs"
              onClick={async () => {
                setMsg(null);
                const r = await fetch("/api/admin/orders/transition", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ orderId, toStatus: s }),
                });
                const j = await r.json();
                if (!r.ok) setMsg(j.error ?? "Failed");
                else window.location.reload();
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
      {msg ? <p className="text-xs text-red-700">{msg}</p> : null}
    </div>
  );
}
