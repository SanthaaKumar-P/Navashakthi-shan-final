import { createFileRoute } from "@tanstack/react-router";
import { PublicPage, PageHero } from "@/components/public-page";
import { Reveal } from "@/components/section";
import { teamMembers } from "@/lib/mock-data";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [{ title: "Team TAARANG — NAVSHAKTHI" }],
  }),

  component: () => (
    <PublicPage>
      <PageHero
        eyebrow="The people"
        title="Team TAARANG."
        subtitle="A small, senior team building for the millions of artisans India has under-served for too long."
      />

      <section className="container-x grid gap-6 py-20 sm:grid-cols-2 lg:grid-cols-3">
        {teamMembers.map((m, i) => {
          const role =
            "role" in m && typeof m.role === "string" ? m.role : "";

          return (
            <Reveal key={m.name} delay={i * 0.05}>
              <div className="rounded-3xl border border-border/60 bg-card p-8">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-primary font-display text-xl text-cream">
                  {m.init}
                </div>

                <div className="mt-4 font-display text-2xl">{m.name}</div>

                {role && (
                  <div className="text-sm text-muted-foreground">
                    {role}
                  </div>
                )}
              </div>
            </Reveal>
          );
        })}
      </section>
    </PublicPage>
  ),
});