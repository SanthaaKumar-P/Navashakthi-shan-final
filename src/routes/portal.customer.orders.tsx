import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Stat } from "@/components/portal-shell";
import { Package, Truck, CheckCircle2, Clock } from "lucide-react";

export const Route = createFileRoute("/portal/customer/orders")({
  component: Orders,
});

const mockOrders = [
  { id: "NS-84591", item: "Kanchipuram Silk Saree", date: "12 Nov 2026", status: "Delivered", amount: 18999, icon: CheckCircle2 },
  { id: "NS-84512", item: "Peacock Brass Diya", date: "08 Nov 2026", status: "In transit", amount: 3499, icon: Truck },
  { id: "NS-84487", item: "Warli Terracotta Vase", date: "05 Nov 2026", status: "Packed", amount: 2499, icon: Package },
  { id: "NS-84412", item: "Rosewood Elephant", date: "01 Nov 2026", status: "Processing", amount: 4200, icon: Clock },
];

function Orders() {
  return (
    <>
      <PageHeader title="My orders" subtitle="Track every craft — from village workshop to your doorstep." />
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Delivered" value="8" />
        <Stat label="In transit" value="2" />
        <Stat label="Processing" value="2" />
        <Stat label="Lifetime spend" value="₹1.2L" />
      </div>
      <div className="mt-10 overflow-hidden rounded-2xl border border-border/60 bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="p-4">Order</th><th className="p-4">Craft</th><th className="p-4">Date</th><th className="p-4">Status</th><th className="p-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {mockOrders.map((o) => (
              <tr key={o.id} className="border-t border-border/60">
                <td className="p-4 font-mono text-xs">{o.id}</td>
                <td className="p-4 font-medium">{o.item}</td>
                <td className="p-4 text-muted-foreground">{o.date}</td>
                <td className="p-4"><span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"><o.icon className="h-3 w-3" />{o.status}</span></td>
                <td className="p-4 text-right font-semibold">₹{o.amount.toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
