import { createFileRoute } from "@tanstack/react-router";
import { GenericSection, InfoTiles } from "@/components/portal-sections";
export const Route = createFileRoute("/portal/government/training")({
  component: () => (
    <GenericSection title="Skill India — training programmes" subtitle="NSDC-affiliated modules delivered through NAVSHAKTHI kiosks.">
      <InfoTiles tiles={[
        { label: "Modules", value: "68" },
        { label: "Certifications issued", value: "14,820" },
        { label: "Placement", value: "72%" },
        { label: "Avg. wage lift", value: "3.4×" },
      ]} />
    </GenericSection>
  ),
});
