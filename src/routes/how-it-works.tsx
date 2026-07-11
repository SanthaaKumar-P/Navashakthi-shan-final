import { createFileRoute } from "@tanstack/react-router";
import { PublicPage, PageHero } from "@/components/public-page";
import { Reveal } from "@/components/section";
import { UserCircle2, Camera, Sparkles, Package, Truck, Star } from "lucide-react";

const steps = [
  { icon: UserCircle2, title: "Register", desc: "Artisans register in their village via Aadhaar or through our Smart Kiosk — in any of 12 Indian languages." },
  { icon: Camera, title: "Capture", desc: "Snap photos of crafts. Our AI writes the story, sets fair pricing, and suggests tags — in the artisan's mother tongue." },
  { icon: Sparkles, title: "Verify", desc: "Every craft gets an AI Authenticity Score, a Digital Twin, and a blockchain-anchored provenance ID." },
  { icon: Package, title: "List", desc: "Craft goes live on the global marketplace with Craftmark and (where applicable) GI certification." },
  { icon: Truck, title: "Deliver", desc: "India Post picks up from the village. Buyers track from loom to doorstep with real-time updates." },
  { icon: Star, title: "Grow", desc: "AI recommends next crafts, matches govt. schemes, and unlocks loans — reinvesting in the artisan's future." },
];

export const Route = createFileRoute("/how-it-works")({
  head: () => ({ meta: [{ title: "How it Works — NAVSHAKTHI" }, { name: "description", content: "From village loom to global doorstep, in six dignified steps." }] }),
  component: () => (
    <PublicPage>
      <PageHero eyebrow="How it works" title="From village loom to global doorstep." subtitle="A six-step journey powered by AI, verified by blockchain, and delivered by India Post — designed with 47 artisan communities in 9 states." />
      <section className="container-x py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.05}>
              <div className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card p-8 transition hover:shadow-elegant">
                <div className="text-[80px] font-display leading-none text-gold/15 absolute top-4 right-6">0{i + 1}</div>
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary"><s.icon className="h-6 w-6" /></div>
                <h3 className="mt-6 font-display text-2xl">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </PublicPage>
  ),
});
