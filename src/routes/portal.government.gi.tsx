import { createFileRoute } from "@tanstack/react-router";
import { GenericSection, DataTable } from "@/components/portal-sections";
export const Route = createFileRoute("/portal/government/gi")({
  component: () => (
    <GenericSection title="GI & Craftmark applications" subtitle="Track Geographical Indication and Craftmark applications end-to-end.">
      <DataTable
        headers={["Application", "Cluster", "Type", "Stage", "Filed"]}
        rows={[
          ["Kanchipuram Silk — refresh", "Kanchipuram", "GI", <span key="1" className="text-primary">Approved</span>, "12 Oct"],
          ["Warli Terracotta", "Bhuj", "Craftmark", <span key="2" className="text-clay">Field verification</span>, "04 Nov"],
          ["Majuli Bamboo", "Majuli", "GI", <span key="3" className="text-clay">Documentation</span>, "22 Nov"],
          ["Blue Pottery — export grade", "Jaipur", "Craftmark", <span key="4" className="text-primary">Approved</span>, "18 Sep"],
        ]}
      />
    </GenericSection>
  ),
});
