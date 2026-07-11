import { createFileRoute } from "@tanstack/react-router";
import { GenericSection, InfoTiles } from "@/components/portal-sections";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
const data = [{n:"Textiles",v:42},{n:"Pottery",v:24},{n:"Metal",v:18},{n:"Wood",v:12},{n:"Jewellery",v:32}];
const pie = [{n:"India",v:60},{n:"USA",v:18},{n:"UK",v:12},{n:"UAE",v:10}];
const COLORS = ["var(--forest)","var(--clay)","var(--gold-raw)","oklch(0.55 0.1 30)"];
export const Route = createFileRoute("/portal/artisan/analytics")({
  component: () => (
    <GenericSection title="Analytics" subtitle="Understand what sells, when and to whom.">
      <InfoTiles tiles={[
        { label: "Views (30d)", value: "12.4K", hint: "+18% MoM" },
        { label: "Conversion", value: "6.2%", hint: "Above avg" },
        { label: "Repeat buyers", value: "22" },
        { label: "Countries reached", value: "14" },
      ]} />
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card p-6">
          <h3 className="font-display text-lg">Sales by category</h3>
          <div className="h-64 mt-4"><ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="n" tick={{fontSize:11}} /><YAxis tick={{fontSize:11}} /><Tooltip />
              <Bar dataKey="v" fill="var(--clay)" radius={8} />
            </BarChart>
          </ResponsiveContainer></div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-6">
          <h3 className="font-display text-lg">Buyers by geography</h3>
          <div className="h-64 mt-4"><ResponsiveContainer>
            <PieChart><Pie data={pie} dataKey="v" nameKey="n" innerRadius={50} outerRadius={90}>{pie.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}</Pie><Legend /><Tooltip /></PieChart>
          </ResponsiveContainer></div>
        </div>
      </div>
    </GenericSection>
  ),
});
