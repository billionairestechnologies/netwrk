"use client";

import { useState } from "react";
import Link from "next/link";

type Memory = { id: string; content: string; source: string; created_at: string };
type Permission = { id: string; scope: string; autonomy_tier: string; granted: boolean; updated_at: string };
type AuditEntry = { id: string; actor: string; action: string; scope: string | null; created_at: string };

export default function DashboardView({
  memories: initialMemories,
  permissions,
  auditLog,
}: {
  memories: Memory[];
  permissions: Permission[];
  auditLog: AuditEntry[];
}) {
  const [memories, setMemories] = useState(initialMemories);

  async function handleDelete(id: string) {
    setMemories((prev) => prev.filter((m) => m.id !== id));
    await fetch(`/api/memories/${id}`, { method: "DELETE" });
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-8 text-neutral-100">
      <div className="mx-auto max-w-3xl space-y-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Data dashboard</h1>
            <p className="text-sm text-neutral-500">Everything stored about you. Yours to see, export, or delete.</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a href="/api/export" className="rounded-lg border border-neutral-800 px-3 py-1.5 hover:border-neutral-600">
              Export all data
            </a>
            <Link href="/" className="text-neutral-400 hover:text-neutral-100">
              Back to chat
            </Link>
          </div>
        </div>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-neutral-300">What your companion remembers ({memories.length})</h2>
          {memories.length === 0 && <p className="text-sm text-neutral-500">Nothing saved yet.</p>}
          <div className="space-y-2">
            {memories.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-lg border border-neutral-900 bg-neutral-900/50 px-4 py-3"
              >
                <div>
                  <p className="text-sm text-neutral-100">{m.content}</p>
                  <p className="text-xs text-neutral-500">
                    {m.source} · {new Date(m.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-neutral-300">Permissions ({permissions.length})</h2>
          {permissions.length === 0 && (
            <p className="text-sm text-neutral-500">No integrations or agent capabilities connected yet.</p>
          )}
          <div className="space-y-2">
            {permissions.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-neutral-900 bg-neutral-900/50 px-4 py-3"
              >
                <div>
                  <p className="text-sm text-neutral-100">{p.scope}</p>
                  <p className="text-xs text-neutral-500 capitalize">{p.autonomy_tier.replace("_", " ")}</p>
                </div>
                <span className={`text-xs ${p.granted ? "text-emerald-400" : "text-neutral-500"}`}>
                  {p.granted ? "Granted" : "Revoked"}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-neutral-300">Recent activity</h2>
          {auditLog.length === 0 && <p className="text-sm text-neutral-500">No activity logged yet.</p>}
          <div className="space-y-1">
            {auditLog.map((a) => (
              <div key={a.id} className="flex items-center justify-between text-xs text-neutral-500">
                <span>
                  <span className="text-neutral-300">{a.actor}</span> · {a.action}
                  {a.scope ? ` · ${a.scope}` : ""}
                </span>
                <span>{new Date(a.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
