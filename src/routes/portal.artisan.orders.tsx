import { createFileRoute } from "@tanstack/react-router";
import { GenericSection, DataTable, InfoTiles } from "@/components/portal-sections";
export const Route = createFileRoute("/portal/artisan/orders")({
  component: () => (
    <GenericSection title="Orders" subtitle="Every order from village workshop to global doorstep.">
      <InfoTiles tiles={[
        { label: "New orders", value: "8" },
        { label: "In production", value: "12" },
        { label: "Dispatched", value: "14" },
        { label: "Delivered (30d)", value: "62" },
      ]} />
      <DataTable
        headers={["Order", "Buyer", "Craft", "Status", "Value"]}
        rows={[
          ["NS-84591", "Priya M · Chennai", "Kanchipuram Saree", <span key="1" className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">Dispatched</span>, "₹18,999"],
          ["NS-84571", "James W · London", "Warli Vase", <span key="2" className="rounded-full bg-clay/10 px-2 py-0.5 text-xs text-clay">Packing</span>, "₹2,499"],
          ["NS-84562", "Anita R · Mumbai", "Brass Diya", <span key="3" className="rounded-full bg-gold/20 px-2 py-0.5 text-xs text-earth">New</span>, "₹3,499"],
          ["NS-84551", "Marcus K · Berlin", "Rosewood Elephant", <span key="4" className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">Delivered</span>, "₹4,200"],
        ]}
      />
    </GenericSection>
  ),
});
