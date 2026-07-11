import { createFileRoute } from "@tanstack/react-router";
import { PublicPage, PageHero } from "@/components/public-page";
import { Reveal } from "@/components/section";
import { teamMembers } from "@/lib/mock-data";

export const Route = createFileRoute("/team")({
  head: () => ({ meta: [{ title: "Team TAARANG — NAVSHAKTHI" }] }),
  component: () => (
    <PublicPage>
      <PageHero eyebrow="The people" title="Team TAARANG." subtitle="A small, senior team building for the millions of artisans India has under-served for too long." />
      <section className="container-x py-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {teamMembers.map((m, i) => (
          <Reveal key={m.name} delay={i * 0.05}>
            <div className="rounded-3xl border border-border/60 bg-card p-8">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-primary text-cream font-display text-xl">{m.init}</div>
              <div className="mt-4 font-display text-2xl">{m.name}</div>
              <div className="text-sm text-muted-foreground">{m.role}</div>
            </div>
          </Reveal>
        ))}
      </section>
    </PublicPage>
  ),
});
