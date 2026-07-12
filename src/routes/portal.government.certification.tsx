import { createFileRoute } from "@tanstack/react-router";
import { GenericSection, InfoTiles, DataTable } from "@/components/portal-sections";
import { verificationTimeline } from "@/lib/enterprise-data";

function Component() {
  return (
    <GenericSection title="Certification centre" subtitle="Queue, timeline and officer assignments for physical verification.">
      <InfoTiles tiles={[
        { label: "Pending inspection", value: "127" },
        { label: "Certified today", value: "42" },
        { label: "Avg. turnaround", value: "22 hrs" },
        { label: "Craftmarks issued", value: "82,410", hint: "This year" },
      ]} />

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border/60 bg-card p-6">
          <div className="mb-4 font-display text-lg">Verification workflow</div>
          <ol className="relative border-l-2 border-dashed border-primary/30 pl-6">
            {verificationTimeline.map((s, i) => (
              <li key={s.step} className="relative mb-4 last:mb-0">
                <span className="absolute -left-[30px] grid h-6 w-6 place-items-center rounded-full border-2 border-primary bg-background text-xs font-semibold text-primary">{i + 1}</span>
                <div className="font-semibold text-sm">{s.step}</div>
                <div className="text-xs text-muted-foreground">{s.detail}</div>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <DataTable
            headers={["Craft", "Artisan", "State", "Officer", "Status"]}
            rows={[
              ["Warli Terracotta Vase", "Lakshmi Devi", "Gujarat", "Dr. Menon", "Inspecting"],
              ["Kanchipuram Silk", "Selvi Ammal", "Tamil Nadu", "Kavitha R", "AI re-scan"],
              ["Bronze Diya", "Ramesh S", "Tamil Nadu", "Rakesh S", "Approved"],
              ["Kundan Haar", "Mohan M", "Rajasthan", "Sneha R", "Booked"],
              ["Bamboo Basket", "Meena Bora", "Assam", "Kavitha R", "Approved"],
            ]}
          />
        </div>
      </div>
    </GenericSection>
  );
}

export const Route = createFileRoute("/portal/government/certification")({ component: Component });
