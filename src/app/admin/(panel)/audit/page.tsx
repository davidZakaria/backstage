"use client";

import { useEffect, useState } from "react";

type Log = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  createdAt: string;
  admin: { email: string };
};

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  useEffect(() => {
    void (async () => {
      const r = await fetch("/api/admin/audit?limit=200");
      const j = await r.json();
      setLogs(j.logs ?? []);
    })();
  }, []);
  return (
    <div className="space-y-6 p-8">
      <h1 className="font-display text-3xl">Audit log</h1>
      <table className="w-full border-collapse text-left text-xs">
        <thead>
          <tr className="border-b text-black/50">
            <th className="py-2">When</th>
            <th className="py-2">Admin</th>
            <th className="py-2">Action</th>
            <th className="py-2">Entity</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l.id} className="border-b border-black/5">
              <td className="py-2">{new Date(l.createdAt).toISOString().slice(0, 19)}</td>
              <td className="py-2">{l.admin.email}</td>
              <td className="py-2">{l.action}</td>
              <td className="py-2">
                {l.entityType} {l.entityId ? `· ${l.entityId.slice(0, 8)}` : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
