import { createFileRoute } from "@tanstack/react-router";
import { GenericSection, InfoTiles } from "@/components/portal-sections";
import { courses } from "@/lib/enterprise-data";
export const Route = createFileRoute("/portal/trainer/")({
  component: () => (
    <GenericSection title="Trainer overview" subtitle="Your courses, slots and learners at a glance.">
      <InfoTiles tiles={[
        { label: "Active courses", value: "4" },
        { label: "Learners", value: "128" },
        { label: "Upcoming slots", value: "16" },
        { label: "Certificates issued", value: "412" },
      ]} />
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.slice(0, 6).map((c) => (
          <div key={c.id} className="rounded-3xl border border-border/60 bg-card p-5">
            <div className="text-3xl">{c.image}</div>
            <div className="mt-2 font-display text-lg">{c.name}</div>
            <div className="text-xs text-muted-foreground">{c.duration} · {c.seats} seats · {c.level}</div>
          </div>
        ))}
      </div>
    </GenericSection>
  ),
});
