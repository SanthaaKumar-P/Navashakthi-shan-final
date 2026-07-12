import { createFileRoute } from "@tanstack/react-router";
import { PublicPage, PageHero } from "@/components/public-page";
import { Reveal, Counter } from "@/components/section";
import { aiAnalytics } from "@/lib/enterprise-data";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { TrendingUp, ShieldAlert, Users, Award, Sparkles } from "lucide-react";

function Page() {
  return (
    <PublicPage>
      <PageHero eyebrow="Feature · Analytics" title="AI Analytics command centre" subtitle="Real-time signal on the health of India's largest AI-verified craft ecosystem." />

      <section className="container-x py-16">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Stat icon={Award} label="AI success rate" value={`${aiAnalytics.successRate}%`} />
          <Stat icon={ShieldAlert} label="Fake uploads detected" value={<Counter to={aiAnalytics.fakesDetected} />} />
          <Stat icon={Users} label="Active artisans" value={<Counter to={aiAnalytics.activeArtisans} />} />
          <Stat icon={Sparkles} label="Marketplace growth" value="+38% MoM" />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Reveal>
            <Card title="Top verified crafts">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={aiAnalytics.topCrafts}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" fontSize={11} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis fontSize={11} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip />
                  <Bar dataKey="verified" fill="#0B5D50" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Reveal>
          <Reveal delay={0.1}>
            <Card title="State-wise growth (%)">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={aiAnalytics.stateGrowth}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="state" fontSize={11} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis fontSize={11} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip />
                  <Bar dataKey="growth" fill="#C65D35" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Reveal>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <Info title="Craft categories" value="9" hint="Pottery, wood, metal, bamboo, jewellery, textiles, stone, handloom, instruments" />
          <Info title="Certification status" value="82,410" hint="Craftmark issued this year" />
          <Info title="Most active artisan" value="Lakshmi Devi" hint="128 verified crafts · Bhuj" />
        </div>
      </section>
    </PublicPage>
  );
}

function Stat({ icon: I, label, value }: { icon: any; label: string; value: any }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <I className="h-5 w-5 text-primary" />
      <div className="mt-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-3xl text-earth">{value}</div>
    </div>
  );
}
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-border/60 bg-card p-6">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold"><TrendingUp className="h-4 w-4 text-primary" /> {title}</div>
      {children}
    </div>
  );
}
function Info({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{title}</div>
      <div className="mt-2 font-display text-2xl">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}

export const Route = createFileRoute("/ai-analytics")({
  head: () => ({ meta: [{ title: "AI Analytics — NAVSHAKTHI" }] }),
  component: Page,
});
