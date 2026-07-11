import { createFileRoute } from "@tanstack/react-router";
import { GenericSection, DataTable } from "@/components/portal-sections";
export const Route = createFileRoute("/portal/government/artisans")({
  component: () => (
    <GenericSection title="Artisans registry" subtitle="Every artisan onboarded to NAVSHAKTHI, indexed by Aadhaar & Vishwakarma ID.">
      <DataTable
        headers={["Name", "Craft", "State", "Vishwakarma ID", "Status"]}
        rows={[
          ["Lakshmi Devi", "Pottery", "Gujarat", "VW-GJ-482-1421", <span key="1" className="text-primary">Active</span>],
          ["Selvi Ammal", "Textiles", "Tamil Nadu", "VW-TN-021-8291", <span key="2" className="text-primary">Active</span>],
          ["Ramesh Sthapati", "Metal", "Tamil Nadu", "VW-TN-045-2911", <span key="3" className="text-primary">Active</span>],
          ["Meena Bora", "Bamboo", "Assam", "VW-AS-062-3401", <span key="4" className="text-clay">KYC pending</span>],
        ]}
      />
    </GenericSection>
  ),
});
