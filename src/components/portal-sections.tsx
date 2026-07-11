import type { ReactNode } from "react";
import { PageHeader } from "./portal-shell";

export function GenericSection({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />
      {children}
    </>
  );
}

export function InfoTiles({ tiles }: { tiles: Array<{ label: string; value: string; hint?: string }> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {tiles.map((t) => (
        <div key={t.label} className="rounded-2xl border border-border/60 bg-card p-5">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t.label}</div>
          <div className="mt-2 font-display text-3xl">{t.value}</div>
          {t.hint && <div className="mt-1 text-xs text-clay">{t.hint}</div>}
        </div>
      ))}
    </div>
  );
}

export function DataTable({ headers, rows }: { headers: string[]; rows: (string | ReactNode)[][] }) {
  return (
    <div className="mt-6 overflow-x-auto rounded-2xl border border-border/60 bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase tracking-widest text-muted-foreground">
          <tr>{headers.map((h) => <th key={h} className="p-4">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-border/60">
              {r.map((c, j) => <td key={j} className="p-4">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
