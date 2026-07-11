import { createFileRoute } from "@tanstack/react-router";
import { GenericSection, InfoTiles } from "@/components/portal-sections";
import { Reveal } from "@/components/section";
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
const data = [{s:"TN",v:12400},{s:"GJ",v:9800},{s:"KA",v:7200},{s:"RJ",v:11200},{s:"AS",v:5400},{s:"MH",v:8100},{s:"WB",v:6800}];
export const Route = createFileRoute("/portal/government/")({
  component: () => (
    <GenericSection title="Namaste, Ministry of Textiles." subtitle="Real-time view of artisan livelihoods, scheme uptake, and cluster health.">
      <InfoTiles tiles={[
        { label: "Registered artisans", value: "72,480", hint: "+1,240 this week" },
        { label: "Active schemes", value: "18", hint: "Central + State" },
        { label: "Loans disbursed", value: "₹42.6 Cr", hint: "PM Mudra + Vishwakarma" },
        { label: "Villages live", value: "1,240", hint: "9 states" },
      ]} />
      <Reveal>
        <div className="mt-8 rounded-3xl border border-border/60 bg-card p-6">
          <h3 className="font-display text-2xl">Artisan onboardings by state</h3>
          <div className="h-72 mt-6"><ResponsiveContainer>
            <BarChart data={data}><CartesianGrid strokeDasharray="3 3" opacity={0.3} /><XAxis dataKey="s" /><YAxis /><Tooltip /><Bar dataKey="v" fill="var(--forest)" radius={8} /></BarChart>
          </ResponsiveContainer></div>
        </div>
      </Reveal>
    </GenericSection>
  ),
});
