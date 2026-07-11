import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/portal-shell";
import { MapPin } from "lucide-react";

export const Route = createFileRoute("/portal/customer/addresses")({
  component: () => (
    <>
      <PageHeader title="Delivery addresses" subtitle="Manage where your crafts are delivered." actions={<button className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground">+ Add address</button>} />
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { label: "Home", name: "You", line: "42 Marine Drive, Chennai 600 001", phone: "+91 98400 12345", primary: true },
          { label: "Office", name: "You", line: "SKCET, Coimbatore 641 008", phone: "+91 98400 12345" },
        ].map((a, i) => (
          <div key={i} className="rounded-2xl border border-border/60 bg-card p-6">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">{a.label}</span>
              {a.primary && <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">Default</span>}
            </div>
            <div className="mt-3 text-sm">{a.name}</div>
            <div className="text-sm text-muted-foreground">{a.line}</div>
            <div className="mt-1 text-xs text-muted-foreground">{a.phone}</div>
          </div>
        ))}
      </div>
    </>
  ),
});
