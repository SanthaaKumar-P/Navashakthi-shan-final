import { createFileRoute } from "@tanstack/react-router";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, Area, AreaChart } from "recharts";
import { PageHeader, Stat } from "@/components/portal-shell";
import { products } from "@/lib/mock-data";
import { Sparkles, ShieldCheck, Award, Landmark } from "lucide-react";

export const Route = createFileRoute("/portal/artisan/")({ component: ArtisanHome });

const revenue = Array.from({ length: 12 }, (_, i) => ({
  month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
  income: Math.round(15000 + Math.sin(i / 2) * 6000 + i * 2200),
  orders: Math.round(12 + Math.sin(i / 3) * 5 + i * 1.5),
}));

function ArtisanHome() {
  return (
    <>
      <PageHeader
        title="வணக்கம், Selvi Ammal."
        subtitle="Your craft, your dashboard — earnings, orders and government support in one glance."
        actions={<button className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground">+ Upload new craft</button>}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="This month income" value="₹68,420" hint="+312% since joining" />
        <Stat label="Orders" value="42" hint="12 in transit" />
        <Stat label="Wallet balance" value="₹12,800" hint="Settled via UPI" />
        <Stat label="AI authenticity avg." value="97%" hint="Craftmark eligible" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-border/60 bg-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl">Income trend</h3>
            <span className="text-xs text-muted-foreground">Last 12 months</span>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <AreaChart data={revenue}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--forest)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--forest)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="income" stroke="var(--forest)" fill="url(#g)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-mesh-forest p-6 text-cream">
            <div className="text-xs uppercase tracking-widest text-gold">AI suggestion</div>
            <div className="mt-2 font-display text-xl leading-tight">Add 3 more silk sarees before Diwali — demand up 240%.</div>
            <button className="mt-4 rounded-full bg-gold px-4 py-2 text-xs font-semibold text-earth">Apply suggestion</button>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-5">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Government schemes matched</div>
            <div className="mt-4 space-y-3">
              {[{ n: "PM Vishwakarma", s: "Approved", i: Landmark }, { n: "Craftmark", s: "In review", i: Award }, { n: "GI Certification", s: "Eligible", i: ShieldCheck }].map((s) => (
                <div key={s.n} className="flex items-center gap-3 text-sm">
                  <s.i className="h-4 w-4 text-primary" />
                  <span className="flex-1">{s.n}</span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{s.s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-end justify-between">
          <h3 className="font-display text-2xl">My listings</h3>
          <span className="text-xs text-muted-foreground">{products.slice(0, 4).length} active</span>
        </div>
        <div className="mt-5 overflow-hidden rounded-2xl border border-border/60 bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-widest text-muted-foreground">
              <tr><th className="p-4">Craft</th><th className="p-4">AI score</th><th className="p-4">Stock</th><th className="p-4">Views</th><th className="p-4 text-right">Price</th></tr>
            </thead>
            <tbody>
              {products.slice(0, 5).map((p) => (
                <tr key={p.id} className="border-t border-border/60">
                  <td className="p-4"><div className="flex items-center gap-3"><img src={p.image} alt="" className="h-10 w-10 rounded-lg object-cover" /><span className="font-medium">{p.name}</span></div></td>
                  <td className="p-4"><span className="inline-flex items-center gap-1 text-clay"><Sparkles className="h-3 w-3" />{p.authenticity}%</span></td>
                  <td className="p-4">{p.inStock}</td>
                  <td className="p-4">{Math.round(p.reviews * 4.2)}</td>
                  <td className="p-4 text-right font-semibold">₹{p.price.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
