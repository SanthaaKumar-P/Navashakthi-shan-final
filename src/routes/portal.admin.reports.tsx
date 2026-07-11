import { createFileRoute } from "@tanstack/react-router";
import { GenericSection, InfoTiles } from "@/components/portal-sections";
export const Route = createFileRoute("/portal/admin/reports")({
  component: () => (
    <GenericSection title="Reports" subtitle="User reports, disputes, and takedown requests.">
      <InfoTiles tiles={[
        { label: "Open reports", value: "12" },
        { label: "Resolved (7d)", value: "48" },
        { label: "Avg. resolution", value: "3.2h" },
        { label: "Takedowns (30d)", value: "5" },
      ]} />
    </GenericSection>
  ),
});
