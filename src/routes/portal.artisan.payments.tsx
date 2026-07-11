import { createFileRoute } from "@tanstack/react-router";
import { GenericSection, InfoTiles, DataTable } from "@/components/portal-sections";
export const Route = createFileRoute("/portal/artisan/payments")({
  component: () => (
    <GenericSection title="Payments" subtitle="Every rupee, direct to your UPI or Jan Dhan account.">
      <InfoTiles tiles={[
        { label: "Available balance", value: "₹12,800" },
        { label: "Settled (30d)", value: "₹68,420" },
        { label: "Pending", value: "₹4,200" },
        { label: "Impact bonus", value: "₹2,140", hint: "From buyer contributions" },
      ]} />
      <DataTable
        headers={["Date", "Order", "Amount", "Method", "Status"]}
        rows={[
          ["12 Nov", "NS-84591", "₹18,999", "UPI @selviamm", <span key="1" className="text-primary">Settled</span>],
          ["10 Nov", "NS-84571", "₹2,499", "Bank transfer", <span key="2" className="text-primary">Settled</span>],
          ["08 Nov", "NS-84562", "₹3,499", "UPI @selviamm", <span key="3" className="text-clay">Pending</span>],
        ]}
      />
    </GenericSection>
  ),
});
