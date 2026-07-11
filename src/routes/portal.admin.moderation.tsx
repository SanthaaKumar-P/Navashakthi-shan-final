import { createFileRoute } from "@tanstack/react-router";
import { GenericSection } from "@/components/portal-sections";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
const queue = [
  { id: "M-8271", type: "Listing", who: "unverified@example.com", reason: "AI authenticity < 60%", severity: "high" },
  { id: "M-8265", type: "Review", who: "Priya M", reason: "Reported as spam by 3 users", severity: "medium" },
  { id: "M-8259", type: "Profile", who: "Ramu K", reason: "Duplicate Aadhaar suspected", severity: "high" },
];
export const Route = createFileRoute("/portal/admin/moderation")({
  component: () => (
    <GenericSection title="Moderation queue" subtitle="AI-flagged content awaiting human review.">
      <div className="space-y-3">
        {queue.map((q) => (
          <div key={q.id} className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-5">
            <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${q.severity === "high" ? "bg-destructive/15 text-destructive" : "bg-gold/20 text-earth"}`}>
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-display text-lg">{q.type} · {q.id}</div>
              <div className="text-xs text-muted-foreground">{q.who} · {q.reason}</div>
            </div>
            <button className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground inline-flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5"/>Approve</button>
            <button className="rounded-full border border-border px-3 py-1.5 text-xs inline-flex items-center gap-1"><XCircle className="h-3.5 w-3.5"/>Reject</button>
          </div>
        ))}
      </div>
    </GenericSection>
  ),
});
