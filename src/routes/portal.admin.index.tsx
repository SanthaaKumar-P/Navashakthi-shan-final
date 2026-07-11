import { createFileRoute } from "@tanstack/react-router";
import { GenericSection, InfoTiles } from "@/components/portal-sections";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
const data = Array.from({ length: 24 }, (_, i) => ({ h: `${i}:00`, v: 40 + Math.round(Math.sin(i / 2) * 20 + Math.random() * 15) }));
export const Route = createFileRoute("/portal/admin/")({
  component: () => (
    <GenericSection title="Command centre" subtitle="Everything happening across NAVSHAKTHI, right now.">
      <InfoTiles tiles={[
        { label: "Active users (24h)", value: "18,420" },
        { label: "New listings (24h)", value: "412" },
        { label: "Orders (24h)", value: "1,284" },
        { label: "AI verifications", value: "612" },
      ]} />
      <div className="mt-8 rounded-3xl border border-border/60 bg-card p-6">
        <h3 className="font-display text-2xl">Live traffic</h3>
        <div className="h-72 mt-4"><ResponsiveContainer>
          <AreaChart data={data}>
            <defs><linearGradient id="g" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--forest)" stopOpacity={0.35}/><stop offset="100%" stopColor="var(--forest)" stopOpacity={0}/></linearGradient></defs>
            <XAxis dataKey="h" tick={{fontSize:10}} /><YAxis tick={{fontSize:10}} /><Tooltip />
            <Area type="monotone" dataKey="v" stroke="var(--forest)" fill="url(#g)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer></div>
      </div>
    </GenericSection>
  ),
});
