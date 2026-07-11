import { createFileRoute } from "@tanstack/react-router";
import { GenericSection, DataTable } from "@/components/portal-sections";
import { products } from "@/lib/mock-data";
export const Route = createFileRoute("/portal/admin/catalog")({
  component: () => (
    <GenericSection title="Catalog" subtitle="Every craft listed on NAVSHAKTHI.">
      <DataTable
        headers={["Craft", "Artisan", "Category", "AI Score", "Digital Twin", "Status"]}
        rows={products.map((p) => [
          p.name, p.artisan, p.category, `${p.authenticity}%`,
          p.digitalTwin ? <span key="d" className="text-primary">Yes</span> : <span key="d" className="text-muted-foreground">—</span>,
          <span key="s" className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">Live</span>,
        ])}
      />
    </GenericSection>
  ),
});
