import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/portal-shell";

export const Route = createFileRoute("/portal/customer/notifications")({
  component: () => (
    <>
      <PageHeader title="Notifications" />
      <div className="space-y-2">
        {[
          "Your order NS-84512 is out for delivery",
          "Selvi Ammal replied to your message",
          "A new Warli collection just dropped from Bhuj",
          "Your Digital Twin for the Rosewood Elephant is ready",
        ].map((n, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4 text-sm">
            <span className="h-2 w-2 rounded-full bg-primary" />
            {n}
            <span className="ml-auto text-xs text-muted-foreground">{i + 1}h ago</span>
          </div>
        ))}
      </div>
    </>
  ),
});
