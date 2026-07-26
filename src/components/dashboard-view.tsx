"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Trash, ShieldCheck, Clock } from "@phosphor-icons/react/dist/ssr";

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
    <main className="min-h-[100dvh] bg-bg px-6 py-8 text-text-primary">
      <div className="mx-auto max-w-2xl space-y-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] text-text-tertiary transition hover:bg-bg-elevated hover:text-text-primary"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-lg font-medium text-text-primary">Data dashboard</h1>
              <p className="text-xs text-text-secondary">Everything stored about you. Yours to see, export, or delete.</p>
            </div>
          </div>
          <a
            href="/api/export"
            className="flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-border px-3.5 py-2 text-xs font-medium text-text-primary transition hover:border-border-strong"
          >
            <Download size={14} />
            Export
          </a>
        </div>

        <section className="space-y-3">
          <h2 className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
            What your companion remembers ({memories.length})
          </h2>
          {memories.length === 0 && (
            <p className="rounded-[var(--radius-md)] border border-dashed border-border px-4 py-6 text-center text-sm text-text-tertiary">
              Nothing saved yet. It'll show up here the moment something's worth remembering.
            </p>
          )}
          <div className="space-y-2">
            {memories.map((m) => (
              <div
                key={m.id}
                className="group flex items-center justify-between rounded-[var(--radius-md)] border border-border bg-bg-elevated px-4 py-3"
              >
                <div>
                  <p className="text-sm text-text-primary">{m.content}</p>
                  <p className="text-xs text-text-tertiary">
                    {m.source} · {new Date(m.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-text-tertiary opacity-0 transition hover:bg-danger-soft hover:text-danger group-hover:opacity-100"
                  title="Delete"
                >
                  <Trash size={15} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
            Permissions ({permissions.length})
          </h2>
          {permissions.length === 0 && (
            <p className="rounded-[var(--radius-md)] border border-dashed border-border px-4 py-6 text-center text-sm text-text-tertiary">
              No integrations or agent capabilities connected yet.
            </p>
          )}
          <div className="space-y-2">
            {permissions.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-[var(--radius-md)] border border-border bg-bg-elevated px-4 py-3"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={16} className="text-text-tertiary" />
                  <div>
                    <p className="text-sm text-text-primary">{p.scope}</p>
                    <p className="text-xs capitalize text-text-tertiary">{p.autonomy_tier.replace("_", " ")}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium ${p.granted ? "text-accent" : "text-text-tertiary"}`}>
                  {p.granted ? "Granted" : "Revoked"}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-medium uppercase tracking-wide text-text-tertiary">Recent activity</h2>
          {auditLog.length === 0 && (
            <p className="rounded-[var(--radius-md)] border border-dashed border-border px-4 py-6 text-center text-sm text-text-tertiary">
              No activity logged yet.
            </p>
          )}
          <div className="space-y-0.5">
            {auditLog.map((a) => (
              <div key={a.id} className="flex items-center justify-between py-1.5 text-xs text-text-tertiary">
                <span className="flex items-center gap-1.5">
                  <Clock size={12} />
                  <span className="text-text-secondary">{a.actor}</span>
                  {a.action}
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
