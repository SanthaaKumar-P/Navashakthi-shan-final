import { createFileRoute } from "@tanstack/react-router";
import { GenericSection, DataTable } from "@/components/portal-sections";
import { products } from "@/lib/mock-data";
export const Route = createFileRoute("/portal/artisan/products")({
  component: () => (
    <GenericSection title="My Products" subtitle="All the crafts you've listed on NAVSHAKTHI.">
      <DataTable
        headers={["Craft", "Category", "AI Score", "Stock", "Price", "Status"]}
        rows={products.map((p) => [
          <div className="flex items-center gap-3" key={p.id}><img src={p.image} className="h-10 w-10 rounded-lg object-cover" alt="" /><span className="font-medium">{p.name}</span></div>,
          p.category,
          `${p.authenticity}%`,
          String(p.inStock),
          `₹${p.price.toLocaleString("en-IN")}`,
          <span key="s" className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">Live</span>,
        ])}
      />
    </GenericSection>
  ),
});
