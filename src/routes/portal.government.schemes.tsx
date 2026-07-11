import { createFileRoute } from "@tanstack/react-router";
import { GenericSection, DataTable } from "@/components/portal-sections";
import { schemes } from "@/lib/mock-data";
export const Route = createFileRoute("/portal/government/schemes")({
  component: () => (
    <GenericSection title="Schemes administration" subtitle="Manage central and state schemes, application flow and eligibility rules.">
      <DataTable
        headers={["Scheme", "Type", "Applications (30d)", "Approved", "Disbursed"]}
        rows={schemes.map((s, i) => [s.name, s.tag, String(1200 - i * 87), String(920 - i * 62), `₹${(4.2 - i * 0.3).toFixed(1)}Cr`])}
      />
    </GenericSection>
  ),
});
